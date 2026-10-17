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
const { ADMIN_ROLE, isAdmin, isMuted } = require('../lib/moderation');

const AUDIT_LIMIT = 500;      // 审计日志最多留这么多条
const PAGE_LIMIT = 50;
const PAGE_MAX = 200;
const MUTE_MAX_MINUTES = 60 * 24 * 30;   // 单次禁言上限 30 天

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
    if (target.id === actor.id && (action === 'ban' || action === 'mute' || action === 'demote')) {
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
    } else {
      fail(400, '未知操作：' + action);
    }

    saveUsers(all);
    record(actor, action, target, detail);
    return { user: publicUser(target) };
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
