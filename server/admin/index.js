'use strict';
/* ============ 管理员后台接口 ============
 *
 * 定位：给站点维护者用的最小管理面 —— 看账号、看在在线人数、看留言、禁言、封号。
 * 不做「万能后台」：没有删账号、没有改密码、没有直接读别人学习数据。
 *
 * 安全边界（每条都对应下面的实现，改代码时别破坏）：
 *   1. 每个接口都先 guard()：未登录 401，不是管理员 403。没有例外，也不靠前端隐藏入口。
 *   2. 返回的用户对象一律经过 publicUser()，passHash 永不出现在响应里。
 *   3. 不能封/禁自己；不能封/禁另一个管理员（要先取消其管理员身份）；不能取消最后一个管理员。
 *   4. 每次处罚都写审计（adminAudit），记录谁在什么时候对谁做了什么——没有留痕的后台等于没有约束。
 *   5. 封号立即生效：authUser 每次请求都回查 users，banned 直接当未登录处理。
 */
const crypto = require('crypto');
const auth = require('../lib/auth');
const { ADMIN_ROLE, isAdmin, isMuted } = require('../lib/moderation');
const { clientKey } = require('../lib/rate-limit');

const AUDIT_LIMIT = 500;      // 审计日志最多留这么多条
const PAGE_LIMIT = 50;
const PAGE_MAX = 200;
const MUTE_MAX_MINUTES = 60 * 24 * 30;   // 单次禁言上限 30 天
const LOGIN_WINDOW = 10 * 60 * 1000;     // 登录失败计数窗口
const LOGIN_MAX_FAILS = 5;               // 窗口内允许的失败次数

module.exports = function createAdmin({ route, authUser, sendJson, readBody, store, cleanPresence }) {
  const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };

  const usersTable = () => store.get('users') || {};
  const saveUsers = (all) => store.set('users', all);
  const communityState = () => store.get('community', 'main', null) || { profiles: {}, posts: [] };
  const auditTable = () => {
    const v = store.get('adminAudit', 'log', []);
    return Array.isArray(v) ? v : [];
  };

  /* 写一条审计。detail 里不要放密码类内容。 */
  function record(actor, action, target, detail) {
    const log = auditTable();
    log.unshift({
      id: crypto.randomUUID(),
      at: Date.now(),
      actor: { id: actor.id, username: actor.username },
      action,
      target: target ? { id: target.id, username: target.username } : null,
      detail: detail == null ? null : String(detail).slice(0, 300)
    });
    store.set('adminAudit', 'log', log.slice(0, AUDIT_LIMIT));
  }

  /* 对外表示：白名单字段，绝不带 passHash */
  function publicUser(u, extra) {
    const out = {
      id: u.id,
      username: u.username,
      nick: u.nick || u.username,
      createdAt: u.createdAt || null,
      role: u.role === ADMIN_ROLE ? ADMIN_ROLE : null,
      banned: !!u.banned,
      banReason: u.banReason || null,
      bannedAt: u.bannedAt || null,
      muted: isMuted(u),
      mutedUntil: Number(u.mutedUntil) || 0,
      muteReason: u.muteReason || null
    };
    return extra ? Object.assign(out, extra) : out;
  }

  function guard(req) {
    const actor = authUser(req);
    if (!actor) fail(401, '请先登录云端账号');
    if (!isAdmin(actor)) fail(403, '需要管理员权限');
    return actor;
  }

  function onlineIds() {
    /* 复用自习室那套心跳表（5 分钟内有心跳算在线），它自己会顺手清过期条目 */
    const table = cleanPresence ? cleanPresence() : {};
    const now = Date.now();
    return new Set(Object.keys(table).filter((id) => now - (Number(table[id].lastSeen) || 0) <= 5 * 60 * 1000));
  }

  function own(method, path, fn) {
    route(method, '/api/admin/' + path, async (req, res) => {
      try {
        const actor = guard(req);
        const query = new URL(req.url, 'http://localhost').searchParams;
        const body = method === 'GET' ? {} : JSON.parse(await readBody(req, 0.2) || '{}');
        if (method !== 'GET' && (!body || typeof body !== 'object' || Array.isArray(body))) fail(400, '请求格式错误');
        const result = await fn(actor, query, body);
        sendJson(res, 200, Object.assign({ ok: true }, result));
      } catch (e) {
        const status = e.status || (e instanceof SyntaxError ? 400 : 500);
        sendJson(res, status, { ok: false, error: e.status ? e.message : '管理操作失败：' + e.message });
      }
    });
  }

  /* ---------- 登录（后台自己的入口，不走 guard） ----------
   * 为什么单独开一个而不是复用 /api/auth/login：
   *   1. 只有管理员才配拿到 token，普通账号在这里被拒，不把「登录成功但进不去」的半成品状态留给前端；
   *   2. 需要独立的失败限流——这是全站权限最高的入口，不能让人无成本地试密码。
   * 失败计数只放在内存里：单进程够用，多进程部署时各自计数（已在文档里写明）。
   */
  const loginFails = new Map();

  /* 与登录接口共用同一套取 IP 的逻辑：线上前面有反向代理，
   * 直接读 socket 拿到的是代理地址，所有人会挤进同一个计数桶。 */
  const clientIp = (req) => clientKey(req);

  route('POST', '/api/admin/login', async (req, res) => {
    try {
      const body = JSON.parse(await readBody(req, 0.05) || '{}');
      const username = String(body.username || '').trim();
      const password = String(body.password || '');
      const now = Date.now();
      /* 缺参数是「请求不对」（400），不是「凭据不对」（401）。
       * 分清楚这两件事，公开路由的检查才有意义：登录入口不该在没给凭据时就回 401。 */
      if (!username || !password) {
        return sendJson(res, 400, { ok: false, error: '请输入管理员账号和密码' });
      }
      const key = username.toLowerCase() + '|' + clientIp(req);
      const rec = loginFails.get(key);
      const active = rec && now - rec.firstAt < LOGIN_WINDOW;

      if (active && rec.count >= LOGIN_MAX_FAILS) {
        const waitMin = Math.ceil((LOGIN_WINDOW - (now - rec.firstAt)) / 60000);
        return sendJson(res, 429, { ok: false, error: '尝试次数过多，请 ' + waitMin + ' 分钟后再试' });
      }

      const user = Object.values(usersTable()).find((u) => u.username === username);
      const passOk = !!user && auth.verifyPassword(password, user.passHash);

      /* 密码错、账号不存在、不是管理员、已被封禁 —— 一律同一个 401，
       * 不告诉对方走到了哪一步，避免被拿来枚举账号或探测谁是管理员。 */
      if (!passOk || !isAdmin(user) || user.banned) {
        const next = active ? rec : { count: 0, firstAt: now };
        next.count += 1;
        loginFails.set(key, next);
        await new Promise((r) => setTimeout(r, 200));   // 压一下批量爆破
        return sendJson(res, 401, { ok: false, error: '账号或密码错误，或该账号没有管理员权限' });
      }

      loginFails.delete(key);
      const token = auth.sign({ uid: user.id });
      record(user, 'login', null, '管理员登录');
      sendJson(res, 200, { ok: true, token, user: publicUser(user) });
    } catch (e) {
      const status = e instanceof SyntaxError ? 400 : 500;
      sendJson(res, status, { ok: false, error: status === 400 ? '请求格式错误' : '登录失败：' + e.message });
    }
  });

  /* ---------- 总览 ---------- */
  own('GET', 'overview', (actor) => {
    const all = Object.values(usersTable());
    const now = Date.now();
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const online = onlineIds();
    const posts = communityState().posts || [];
    return {
      users: {
        total: all.length,
        today: all.filter((u) => (Number(u.createdAt) || 0) >= dayStart.getTime()).length,
        banned: all.filter((u) => u.banned).length,
        muted: all.filter((u) => isMuted(u, now)).length,
        admins: all.filter((u) => u.role === ADMIN_ROLE).length
      },
      online: online.size,
      posts: { total: posts.length, removed: posts.filter((p) => p.deleted).length },
      recentActions: auditTable().slice(0, 10)
    };
  });

  /* ---------- 账号列表 ---------- */
  own('GET', 'users', (actor, query) => {
    const q = (query.get('q') || '').trim().toLowerCase();
    const filter = query.get('filter') || 'all';
    const limit = Math.min(PAGE_MAX, Math.max(1, Number(query.get('limit')) || PAGE_LIMIT));
    const offset = Math.max(0, Number(query.get('offset')) || 0);
    const online = onlineIds();
    const posts = communityState().posts || [];

    let list = Object.values(usersTable());
    if (filter === 'banned') list = list.filter((u) => u.banned);
    else if (filter === 'muted') list = list.filter((u) => isMuted(u));
    else if (filter === 'admin') list = list.filter((u) => u.role === ADMIN_ROLE);
    if (q) {
      list = list.filter((u) => String(u.username || '').toLowerCase().includes(q)
        || String(u.nick || '').toLowerCase().includes(q));
    }
    list.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));

    return {
      total: list.length,
      offset,
      limit,
      items: list.slice(offset, offset + limit).map((u) => publicUser(u, {
        online: online.has(u.id),
        postCount: posts.filter((p) => p.author === u.id && !p.deleted).length
      }))
    };
  });

  /* ---------- 处罚与角色 ---------- */
  own('POST', 'user-action', (actor, _query, body) => {
    const action = String(body.action || '');
    const all = usersTable();
    const target = all[String(body.uid || '')];
    if (!target) fail(404, '账号不存在');
    if (target.id === actor.id && (action === 'ban' || action === 'mute' || action === 'demote' || action === 'reset-password')) {
      fail(400, '不能对自己执行这个操作');
    }
    if ((action === 'ban' || action === 'mute') && target.role === ADMIN_ROLE) {
      fail(400, '不能处罚另一个管理员，请先取消其管理员身份');
    }

    const now = Date.now();
    const reason = String(body.reason || '').slice(0, 200) || null;
    let detail = null;

    if (action === 'ban') {
      if (target.banned) fail(409, '该账号已经处于封禁状态');
      target.banned = true;
      target.banReason = reason;
      target.bannedAt = now;
      target.bannedBy = actor.id;
      detail = reason;
    } else if (action === 'unban') {
      if (!target.banned) fail(409, '该账号当前没有被封禁');
      delete target.banned;
      delete target.banReason;
      delete target.bannedAt;
      delete target.bannedBy;
    } else if (action === 'mute') {
      const minutes = Math.round(Number(body.minutes));
      if (!Number.isFinite(minutes) || minutes < 1 || minutes > MUTE_MAX_MINUTES) {
        fail(400, '禁言时长需在 1 到 ' + MUTE_MAX_MINUTES + ' 分钟之间');
      }
      target.mutedUntil = now + minutes * 60000;
      target.muteReason = reason;
      target.mutedBy = actor.id;
      detail = minutes + ' 分钟' + (reason ? '（' + reason + '）' : '');
    } else if (action === 'unmute') {
      if (!isMuted(target, now)) fail(409, '该账号当前没有被禁言');
      target.mutedUntil = 0;
      delete target.muteReason;
      delete target.mutedBy;
    } else if (action === 'promote') {
      if (target.role === ADMIN_ROLE) fail(409, '该账号已经是管理员');
      target.role = ADMIN_ROLE;
    } else if (action === 'demote') {
      if (target.role !== ADMIN_ROLE) fail(409, '该账号不是管理员');
      const admins = Object.values(all).filter((u) => u.role === ADMIN_ROLE);
      if (admins.length <= 1) fail(400, '至少要保留一个管理员，不能全部取消');
      delete target.role;
    } else if (action === 'reset-password') {
      /* 用户忘记密码时的兜底。密码由管理员直接指定，不生成随机串——
       * 随机串要额外想办法交给用户，反而更容易被截图乱传。
       * 审计里只记「重置过」，绝不记密码本身。 */
      const next = String(body.password || '');
      if (next.length < 6) fail(400, '新密码至少 6 位');
      if (target.nick && next === target.nick) fail(400, '新密码不能和昵称相同');
      target.passHash = auth.hashPassword(next);
      target.pwdAt = Date.now();   // 让这名用户手上的旧 token 立刻失效
      detail = '重置为管理员指定的新密码';
    } else {
      fail(400, '未知操作：' + action);
    }

    saveUsers(all);
    record(actor, action, target, detail);
    return { user: publicUser(target) };
  });

  /* ---------- 批量把显示名统一成用户名 ----------
   * 「显示名直接用用户名」是产品规则，但存量账号是历史数据：
   * 这件事必须由管理员显式点一次，不能藏在登录路径里偷偷改——
   * 登录时顺手重命名会误伤正常用户（有专门的用例守着这条）。
   * 动的是公开显示名（留言板、学习搭子、自习室都会跟着变），所以留审计。 */
  own('POST', 'unify-nicks', (actor) => {
    const all = usersTable();
    const changed = [];
    Object.values(all).forEach((u) => {
      if (u.nick !== u.username) { u.nick = u.username; changed.push(u.username); }
    });
    if (changed.length) saveUsers(all);
    record(actor, 'unify-nicks', null, changed.length ? '统一 ' + changed.length + ' 个账号的显示名' : '无需变更');
    return { changed: changed.length, usernames: changed.slice(0, 50) };
  });

  /* ---------- 留言列表 ---------- */
  own('GET', 'posts', (actor, query) => {
    const q = (query.get('q') || '').trim();
    const limit = Math.min(PAGE_MAX, Math.max(1, Number(query.get('limit')) || PAGE_LIMIT));
    const offset = Math.max(0, Number(query.get('offset')) || 0);
    const all = usersTable();
    let list = (communityState().posts || []).slice().sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
    if (query.get('filter') === 'removed') list = list.filter((p) => p.deleted);
    if (q) {
      list = list.filter((p) => String(p.text || '').includes(q)
        || String((all[p.author] || {}).username || '').includes(q));
    }
    const name = (id) => (all[id] && (all[id].nick || all[id].username)) || '同学';
    return {
      total: list.length,
      offset,
      limit,
      items: list.slice(offset, offset + limit).map((p) => ({
        id: p.id,
        qid: p.qid || null,
        text: p.text || '',
        deleted: !!p.deleted,
        createdAt: p.createdAt || null,
        parent: p.parent || null,
        author: { id: p.author, username: (all[p.author] || {}).username || '(账号已不存在)', nick: name(p.author) }
      }))
    };
  });

  /* ---------- 留言处理 ---------- */
  own('POST', 'post-action', (actor, _query, body) => {
    const id = String(body.id || '');
    const action = String(body.action || '');
    /* 注意：community 的 state() 会返回深拷贝，改完必须整表写回 */
    const s = communityState();
    const post = (s.posts || []).find((p) => p.id === id);
    if (!post) fail(404, '留言不存在');

    if (action === 'delete') {
      if (post.deleted) fail(409, '这条留言已经被删除');
      post.moderatedText = post.text;   // 留底，恢复和事后核对都要用
      post.text = '';
      post.deleted = true;
      post.deletedBy = actor.id;
      post.deletedAt = Date.now();
    } else if (action === 'restore') {
      if (!post.deleted) fail(409, '这条留言没有被删除');
      if (typeof post.moderatedText !== 'string') {
        fail(409, '这条是作者自己删的，原文已清空，无法恢复');
      }
      post.text = post.moderatedText;
      post.deleted = false;
      delete post.moderatedText;
      delete post.deletedBy;
      delete post.deletedAt;
    } else {
      fail(400, '未知操作：' + action);
    }

    store.set('community', 'main', s);
    record(actor, 'post-' + action, null, id);
    return { post: { id: post.id, deleted: !!post.deleted, text: post.text } };
  });

  /* ---------- 审计日志 ---------- */
  own('GET', 'audit', (actor, query) => {
    const limit = Math.min(AUDIT_LIMIT, Math.max(1, Number(query.get('limit')) || 100));
    return { items: auditTable().slice(0, limit), limit, max: AUDIT_LIMIT };
  });

  /* 给 server.js 启动时用：按 ADMIN_USERNAMES 把已存在的账号提升为管理员（幂等） */
  function promoteByUsername(names) {
    const wanted = (names || []).map((n) => String(n || '').trim()).filter(Boolean);
    if (!wanted.length) return [];
    const all = usersTable();
    const promoted = [];
    Object.values(all).forEach((u) => {
      if (wanted.includes(u.username) && u.role !== ADMIN_ROLE) {
        u.role = ADMIN_ROLE;
        promoted.push(u.username);
      }
    });
    if (promoted.length) {
      saveUsers(all);
      store.set('adminAudit', 'log', [{
        id: crypto.randomUUID(),
        at: Date.now(),
        actor: { id: 'system', username: '启动引导' },
        action: 'promote',
        target: null,
        detail: 'ADMIN_USERNAMES 引导：' + promoted.join(', ')
      }].concat(auditTable()).slice(0, AUDIT_LIMIT));
    }
    return promoted;
  }

  return { promoteByUsername };
};
