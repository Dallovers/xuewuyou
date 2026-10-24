/* ============ 学无忧学习平台 · 后端服务（零依赖） ============
 * 层0：AI Key 代理 —— 大模型 API Key 只存在服务端，前端不再接触 Key
 * 层1：用户数据上云 —— 注册/登录(JWT) + 做题数据/错题/自习统计/设置云端存储
 *
 * 运行：node server.js   （默认端口 3000，可用 PORT 环境变量覆盖）
 * 静态文件：自动伺服 ../ （即 wenguo 前端目录），访问 http://localhost:3000 即可
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const store = require('./lib/store');
const auth = require('./lib/auth');
const { isAdmin } = require('./lib/moderation');
const { createLimiter, clientKey, waitText } = require('./lib/rate-limit');

/* 登录失败与注册的频率上限。数值走环境变量，方便线上按情况调，
 * 也方便测试用很小的数去验机制本身。 */
const AUTH_WINDOW_MS = Number(process.env.AUTH_WINDOW_MS) || 10 * 60 * 1000;
const LOGIN_MAX_FAILS = Number(process.env.AUTH_LOGIN_MAX_FAILS) || 5;
/* 账号维度的兜底上限，不看来源。原因：来源这一维再怎么修都可能被绕过，
 * 只要攻击者手里有几个 IP，就能把「每来源 5 次」摊成任意多次。
 * 这条把同一账号的总尝试次数按住，代价是它不看 IP，所以阈值必须比主闸门宽得多。 */
const LOGIN_NAME_MAX = Number(process.env.AUTH_LOGIN_NAME_MAX) || 60;
const REGISTER_WINDOW_MS = Number(process.env.AUTH_REGISTER_WINDOW_MS) || 60 * 60 * 1000;
const REGISTER_MAX = Number(process.env.AUTH_REGISTER_MAX) || 60;
const loginFails = createLimiter({ windowMs: AUTH_WINDOW_MS, max: LOGIN_MAX_FAILS });
const loginNameFails = createLimiter({ windowMs: AUTH_WINDOW_MS, max: LOGIN_NAME_MAX });
const registerHits = createLimiter({ windowMs: REGISTER_WINDOW_MS, max: REGISTER_MAX });

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..'); // wenguo 前端目录

/* ---------------- AI 平台配置（Key 只存在服务端） ---------------- */
const AI_PROVIDERS = {
  zhipu: { name: '智谱 GLM', base: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash', vision: 'glm-4v-flash' },
  deepseek: { name: 'DeepSeek', base: 'https://api.deepseek.com', model: 'deepseek-chat', vision: null },
  kimi: { name: 'Kimi', base: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k', vision: 'moonshot-v1-8k-vision-preview' },
  doubao: { name: '豆包', base: 'https://ark.cn-beijing.volces.com/api/v3', model: 'doubao-pro-32k', vision: 'doubao-vision-pro-32k' }
};

/* AI 密钥仅从环境变量或已有服务端配置读取。 */
const AI_DEFAULT_KEY = process.env.AI_API_KEY || '';

const AI_DEFAULT_PROVIDER = process.env.AI_PROVIDER || 'zhipu';

function getAiConfig() {
  const c = store.get('aiConfig', 'main') || {};
  return {
    provider: c.provider || AI_DEFAULT_PROVIDER,
    apiKey: c.apiKey || AI_DEFAULT_KEY,
    base: c.base || process.env.AI_BASE_URL || '',
    model: c.model || process.env.AI_MODEL || ''
  };
}

/* ---------------- 工具函数 ---------------- */
function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(body);
}

function sendError(res, status, msg) {
  sendJson(res, status, { ok: false, error: msg });
}

function readBody(req, limitMB) {
  return new Promise((resolve, reject) => {
    const limit = (limitMB || 20) * 1024 * 1024;
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('请求体过大')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function getToken(req) {
  const h = req.headers['authorization'] || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  return null;
}

function authUser(req) {
  const payload = auth.verify(getToken(req));
  if (!payload || !payload.uid) return null;
  const users = store.get('users') || {};
  const user = users[payload.uid];
  /* 封号立即生效：JWT 是无状态的，签发后没法撤回，所以每次请求都回查账号状态。
   * 返回 null 等价于「未登录」，所有受保护接口自然 401，不用逐个改。 */
  if (!user || user.banned) return null;
  /* 改过密码之后，之前签发的 token 一律作废。JWT 是无状态的，撤回不了，
   * 只能拿签发时间和改密时间比：早于 pwdAt 的都算旧会话。
   * 没有这一条，密码泄露的人改完密码，攻击者那台设备还能继续用满 7 天。 */
  if (user.pwdAt && (payload.iat || 0) < user.pwdAt) return null;
  return user;
}

function uid() {
  return crypto.randomBytes(8).toString('hex');
}

/* ---------------- 数据合并（前端本地数据 <-> 云端数据） ---------------- */
function mergeData(cloud, local) {
  cloud = cloud && typeof cloud === 'object' ? cloud : {};
  local = local && typeof local === 'object' ? local : {};

  const out = {};

  /* levels: levelId -> {stars, bestTime, at}，取星星多、时间短的 */
  const levels = {};
  [local.levels || {}, cloud.levels || {}].forEach((src) => {
    Object.keys(src).forEach((k) => {
      const cur = src[k];
      const old = levels[k];
      if (!old || cur.stars > old.stars || (cur.stars === old.stars && cur.bestTime < old.bestTime)) {
        levels[k] = cur;
      }
    });
  });
  out.levels = levels;

  /* marks: 标记并集 */
  out.marks = Object.assign({}, cloud.marks || {}, local.marks || {});

  /* answers: 按 (timeMs + qid) 去重，保持时间顺序，上限 5000 */
  const seen = new Set();
  const answers = [];
  [cloud.answers || [], local.answers || []].forEach((arr) => {
    arr.forEach((a) => {
      const key = (a.qid || '') + '@' + (a.timeMs || 0);
      if (seen.has(key)) return;
      seen.add(key);
      answers.push(a);
    });
  });
  answers.sort((a, b) => (a.timeMs || 0) - (b.timeMs || 0));
  out.answers = answers.slice(-5000);

  /* mistakes: 按 qid 合并，wrongCount 累加取大、lastAt 取新 */
  const misMap = new Map();
  [cloud.mistakes || [], local.mistakes || []].forEach((arr) => {
    arr.forEach((m) => {
      const k = String(m.qid || m.topic || Math.random());
      const old = misMap.get(k);
      if (!old) { misMap.set(k, Object.assign({}, m)); return; }
      old.wrongCount = Math.max(old.wrongCount || 1, m.wrongCount || 1);
      if ((m.lastAt || 0) > (old.lastAt || 0)) old.lastAt = m.lastAt;
      if (m.markedWeak) old.markedWeak = true;
      if (!old.question && m.question) Object.assign(old, m);
    });
  });
  let mistakes = Array.from(misMap.values());
  mistakes.sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0));
  out.mistakes = mistakes.slice(0, 500);

  /* cleared: 按 qid 去重 */
  const clSeen = new Set();
  out.cleared = (cloud.cleared || []).concat(local.cleared || []).filter((c) => {
    const k = String(c.qid);
    if (clSeen.has(k)) return false;
    clSeen.add(k);
    return true;
  }).slice(0, 800);

  /* checkin: 日期去重 */
  out.checkin = Array.from(new Set((cloud.checkin || []).concat(local.checkin || [])));

  /* nick / profile：云端优先（云端是最近同步结果），云端空则取本地 */
  out.nick = (cloud.nick || local.nick || '同学');
  out.profile = cloud.profile || local.profile || null;

  return out;
}

/* ---------------- 路由 ---------------- */
const routes = [];

function route(method, pattern, handler) {
  routes.push({ method, pattern, handler });
}

route('GET', '/api/health', async (req, res) => sendJson(res, 200, { ok: true }));

/* ===== 认证 ===== */
route('POST', '/api/auth/register', async (req, res) => {
  const body = JSON.parse(await readBody(req, 1) || '{}');
  /* 刷号防护：按来源计数。别把上限设太小——校园网常常整栋楼共用一个出口 IP，
   * 一个班同时注册是正常现象，不是攻击。 */
  const client = clientKey(req);
  const registerWait = registerHits.blocked(client);
  if (registerWait > 0) {
    return sendError(res, 429, '注册过于频繁，请 ' + waitText(registerWait) + '后再试');
  }
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const rawNick = String(body.nick || '').trim();
  if (!/^[A-Za-z0-9_\u4e00-\u9fa5]{2,20}$/.test(username)) {
    return sendError(res, 400, '用户名需为 2-20 位字母/数字/下划线/中文');
  }
  if (password.length < 6) return sendError(res, 400, '密码至少 6 位');
  /* 昵称是公开显示的（留言板、学习搭子、自习室都直接渲染），一旦等于密码，
   * 等于把密码贴在公屏上。浏览器密码管理器会把密码自动填进紧挨着的文本框，
   * 昵称框首当其冲——前端已加 autocomplete 提示，这里是最后一道闸，不能省。
   * 比较必须在截断到 20 字之前：超长密码若先截断，前缀会漏过这道检查。 */
  if (rawNick && rawNick === password) return sendError(res, 400, '昵称不能与密码相同');
  const nick = rawNick.slice(0, 20);
  const users = store.get('users') || {};
  const exists = Object.values(users).some((u) => u.username === username);
  if (exists) return sendError(res, 409, '该用户名已被注册');

  const id = uid();
  users[id] = { id, username, passHash: auth.hashPassword(password), nick: nick || username, createdAt: Date.now() };
  store.set('users', users);
  registerHits.fail(client);
  const token = auth.sign({ uid: id });
  sendJson(res, 200, { ok: true, token, user: { id, username, nick: users[id].nick, role: isAdmin(users[id]) ? 'admin' : null } });
});

route('POST', '/api/auth/login', async (req, res) => {
  const body = JSON.parse(await readBody(req, 1) || '{}');
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  /* 爆破防护：按「账号 + 来源」计数，连续失败到上限就锁一个窗口。
   * key 里一定要带账号名——线上走反向代理时所有请求看起来都来自同一个 IP，
   * 只按 IP 计数，一个人试错就能把全校锁死。 */
  const attemptKey = username.toLowerCase() + '|' + clientKey(req);
  const nameKey = 'name:' + username.toLowerCase();
  const loginWait = Math.max(loginFails.blocked(attemptKey), loginNameFails.blocked(nameKey));
  if (loginWait > 0) {
    return sendError(res, 429, '密码错误次数过多，请 ' + waitText(loginWait) + '后再试');
  }
  const users = store.get('users') || {};
  const user = Object.values(users).find((u) => u.username === username);
  if (!user || !auth.verifyPassword(password, user.passHash)) {
    loginFails.fail(attemptKey);
    loginNameFails.fail(nameKey);
    return sendError(res, 401, '用户名或密码错误');
  }
  /* 输对了就把失败记录清掉，不让人背着之前的错误继续被算账。 */
  loginFails.clear(attemptKey);
  loginNameFails.clear(nameKey);
  /* 封禁在登录这一步就挡住，并说明原因——密码验证之后才判，避免用封禁状态探测账号是否存在 */
  if (user.banned) {
    return sendError(res, 403, '该账号已被封禁' + (user.banReason ? '：' + user.banReason : '，请联系站点维护者'));
  }
  const token = auth.sign({ uid: user.id });
  /* 存量脏数据修复：早期没有拦「昵称=密码」，被密码管理器自动填过一次的账号，
   * 密码已经明文存在 nick 里并公开显示。登录时手上正好有明文密码可用来判定，
   * 命中就改回用户名，并告诉前端提示用户自己去改。只在完全相等时触发。 */
  let nick = user.nick;
  let nickReset = false;
  /* 存量脏数据：早期没有拦「昵称=密码」，被密码管理器自动填过一次的账号，
   * 密码已经明文存在 nick 里并公开显示。登录时手上正好有明文密码可用来判定，
   * 命中就改回用户名，并告诉前端提示用户自己去改。只在完全相等时触发。 */
  if (nick && nick === password) {
    nick = user.username;
    nickReset = true;
    user.nick = nick;
    const all = store.get('users') || {};
    all[user.id] = user;
    store.set('users', all);
  }
  /* 注意：这里**不**顺手把昵称改成用户名。
   * 「正常登录不能被误伤」是一条既有约定（test/auth-nick.test.js 有专门的用例），
   * 把存量昵称统一成用户名属于批量数据变更，交给管理员在后台显式触发，
   * 不要藏在登录路径里偷偷发生。 */

  sendJson(res, 200, { ok: true, token, user: { id: user.id, username: user.username, nick, role: isAdmin(user) ? 'admin' : null }, nickReset });
});

route('GET', '/api/auth/me', (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  sendJson(res, 200, { ok: true, user: { id: user.id, username: user.username, nick: user.nick, role: isAdmin(user) ? 'admin' : null } });
});

route('PUT', '/api/auth/profile', async (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  const body = JSON.parse(await readBody(req, 1) || '{}');
  if (body.nick && typeof body.nick === 'string') {
    const rawNext = body.nick.trim();
    /* 改昵称这条路同样要挡住「把密码设成昵称」。同样先比较原文再截断，
     * 否则超长密码被截成 20 字前缀后校验不到。 */
    if (rawNext && auth.verifyPassword(rawNext, user.passHash)) {
      return sendError(res, 400, '昵称不能与密码相同');
    }
    const next = rawNext.slice(0, 20);
    if (next) {
      user.nick = next;
      const users = store.get('users') || {};
      users[user.id] = user;
      store.set('users', users);
    }
  }
  sendJson(res, 200, { ok: true, user: { id: user.id, username: user.username, nick: user.nick, role: isAdmin(user) ? 'admin' : null } });
});

/* 改密码：必须验证当前密码，改完换发新 token。
 * 换 token 不是礼貌，是安全要求：pwdAt 一更新，旧 token 立刻失效，
 * 所以本机必须拿到一张新的，否则用户改完密码自己就被踢下线了。 */
route('PUT', '/api/auth/password', async (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  const body = JSON.parse(await readBody(req, 1) || '{}');
  const oldPassword = String(body.oldPassword || '');
  const newPassword = String(body.newPassword || '');
  if (!oldPassword || !newPassword) return sendError(res, 400, '请填写当前密码和新密码');
  if (!auth.verifyPassword(oldPassword, user.passHash)) return sendError(res, 401, '当前密码不正确');
  if (newPassword.length < 6) return sendError(res, 400, '新密码至少 6 位');
  if (newPassword === oldPassword) return sendError(res, 400, '新密码不能和当前密码相同');
  /* 昵称是公开渲染的，新密码要是跟昵称一样，等于又把它贴到公屏上了。 */
  if (user.nick && newPassword === user.nick) return sendError(res, 400, '新密码不能和昵称相同');

  const users = store.get('users') || {};
  user.passHash = auth.hashPassword(newPassword);
  user.pwdAt = Date.now();
  users[user.id] = user;
  store.set('users', users);

  const token = auth.sign({ uid: user.id });
  sendJson(res, 200, {
    ok: true,
    token,
    user: { id: user.id, username: user.username, nick: user.nick, role: isAdmin(user) ? 'admin' : null }
  });
});

/* ===== 学习数据整包（wenguo_v1） ===== */
route('GET', '/api/data', (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  const rec = store.get('userData', user.id) || {};
  sendJson(res, 200, { ok: true, data: rec.payload || {}, updatedAt: rec.updatedAt || 0 });
});

route('PUT', '/api/data', async (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  const body = JSON.parse(await readBody(req, 10) || '{}');
  const local = body.data || {};
  const rec = store.get('userData', user.id) || {};
  const merged = mergeData(rec.payload || {}, local);
  store.set('userData', user.id, { payload: merged, updatedAt: Date.now() });
  sendJson(res, 200, { ok: true, data: merged, updatedAt: Date.now() });
});

/* ===== 自习室：每日统计 ===== */
/* 客户端可上报的自习统计上限。个人自习计时天然在客户端，服务器只能设边界；
 * 共同自习的计时是服务器权威的（study-rooms 用 runSince + now() 推算），不经过这里。 */
const MAX_FOCUS_MINUTES_PER_DAY = 1440;   // 一天最多 24 小时
const MAX_COMPLETED_PER_DAY = 500;
route('GET', '/api/study/stats', (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  const all = store.get('studyDaily', user.id) || {};
  sendJson(res, 200, { ok: true, stats: all });
});

route('PUT', '/api/study/stats', async (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  const body = JSON.parse(await readBody(req, 1) || '{}');
  const day = String(body.day || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return sendError(res, 400, '日期格式应为 YYYY-MM-DD');
  if (['focusMinutes','completed'].some(key=>body[key]!==undefined&&!Number.isFinite(Number(body[key])))) return sendError(res,400,'自习统计须为有效数字');
  const all = store.get('studyDaily', user.id) || {};
  const cur = all[day] || { focusMinutes: 0, completed: 0 };
  /* 单日上限：个人自习计时由客户端上报，服务器只能设边界。
     没有上限时客户端可以写任意大的值，而且 Math.max 只升不降，一旦写进去就无法纠正。 */
  const focus = Math.round(Number(body.focusMinutes != null ? body.focusMinutes : cur.focusMinutes));
  const done = Math.round(Number(body.completed != null ? body.completed : cur.completed));
  if (!Number.isFinite(focus) || focus < 0 || focus > MAX_FOCUS_MINUTES_PER_DAY) return sendError(res, 400, '单日专注时长应在 0–' + MAX_FOCUS_MINUTES_PER_DAY + ' 分钟之间');
  if (!Number.isFinite(done) || done < 0 || done > MAX_COMPLETED_PER_DAY) return sendError(res, 400, '单日完成次数应在 0–' + MAX_COMPLETED_PER_DAY + ' 之间');
  cur.focusMinutes = Math.max(cur.focusMinutes || 0, focus);
  cur.completed = Math.max(cur.completed || 0, done);
  all[day] = cur;
  store.set('studyDaily', user.id, all);
  sendJson(res, 200, { ok: true, day, stats: cur });
});

/* ===== 自习室：设置 ===== */
route('GET', '/api/study/setup', (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  const rec = store.get('studySetup', user.id) || {};
  sendJson(res, 200, { ok: true, setup: rec.payload || {}, updatedAt: rec.updatedAt || 0 });
});

route('PUT', '/api/study/setup', async (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  const body = JSON.parse(await readBody(req, 1) || '{}');
  const rec = store.get('studySetup', user.id) || {};
  const merged = Object.assign({}, rec.payload || {}, body.setup || {});
  store.set('studySetup', user.id, { payload: merged, updatedAt: Date.now() });
  sendJson(res, 200, { ok: true, setup: merged, updatedAt: Date.now() });
});

/* ===== 自习室：在线同桌（presence） =====
 * 数据：data/presence.json = { "<uid>": {nick, avatar, subject, motto, startAt, lastSeen} }
 * 活跃判定：5 分钟内有心跳；GET 时自动清理过期条目
 */
const PRESENCE_TTL = 5 * 60 * 1000;
const AVATARS = ['🦊', '🌱', '🌙', '⭐', '🦉', '🌻', '🐳', '🦋', '🐼', '🦄'];

function presenceKey(nick) {
  let h = 0;
  for (let i = 0; i < String(nick).length; i++) h = (h * 31 + String(nick).charCodeAt(i)) >>> 0;
  return AVATARS[h % AVATARS.length];
}

function cleanPresence() {
  const now = Date.now();
  const all = store.get('presence') || {};
  let dirty = false;
  Object.keys(all).forEach((uid) => {
    if (now - (all[uid].lastSeen || 0) > PRESENCE_TTL) { delete all[uid]; dirty = true; }
  });
  if (dirty) store.set('presence', all);
  return all;
}

route('PUT', '/api/study/presence', async (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  const body = JSON.parse(await readBody(req, 1) || '{}');
  const all = cleanPresence();
  const now = Date.now();
  const prev = all[user.id];
  all[user.id] = {
    nick: user.nick || user.username,
    avatar: presenceKey(user.nick || user.username),
    subject: String(body.subject || (prev && prev.subject) || '自习中'),
    motto: String(body.motto || (prev && prev.motto) || '保持专注！'),
    startAt: prev && prev.startAt || now,
    lastSeen: now
  };
  store.set('presence', all);
  sendJson(res, 200, { ok: true });
});

route('DELETE', '/api/study/presence', (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  const all = cleanPresence();
  if (all[user.id]) { delete all[user.id]; store.set('presence', all); }
  sendJson(res, 200, { ok: true });
});

route('GET', '/api/study/presence', (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  const all = cleanPresence();
  const now = Date.now();
  const peers = Object.keys(all)
    .filter((uid) => uid !== user.id)
    .map((uid) => {
      const p = all[uid];
      return {
        name: p.nick, avatar: p.avatar, subject: p.subject, motto: p.motto,
        minutes: Math.max(1, Math.round((now - (p.startAt || now)) / 60000))
      };
    })
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 20);
  sendJson(res, 200, { ok: true, peers: peers });
});

/* ===== AI Key 代理（层0） ===== */
async function proxyAI(res, options) {
  const cfg = getAiConfig();
  if (!cfg.apiKey) return sendError(res, 503, '请在 server/.env 配置 AI_API_KEY');
  const provider = AI_PROVIDERS[options.provider || cfg.provider] || AI_PROVIDERS.zhipu;
  const model = options.model || cfg.model || provider.model;
  const base = cfg.base || provider.base;
  try {
    const upstream = await fetch(base + '/chat/completions', {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(45000),
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + cfg.apiKey },
      body: JSON.stringify(options.body(model))
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      return sendError(res, 502, 'AI 服务返回错误: ' + ((data.error && data.error.message) || upstream.status));
    }
    const content = data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content : '';
    sendJson(res, 200, { ok: true, content });
  } catch (e) {
    sendError(res, 502, 'AI 请求失败: ' + (e.message || '网络异常'));
  }
}

route('POST', '/api/ai/chat', async (req, res) => {
  if (!authUser(req)) return sendError(res, 401, '请先登录云端账号');
  const body = JSON.parse(await readBody(req, 2) || '{}');
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return sendError(res, 400, 'messages 不能为空');
  }
  await proxyAI(res, {
    provider: body.provider,
    model: body.model,
    body: (model) => ({
      model,
      messages: body.messages,
      temperature: body.temperature != null ? body.temperature : 0.6,
      max_tokens: body.maxTokens || 500,
      stream: false
    })
  });
});

route('POST', '/api/ai/vision', async (req, res) => {
  if (!authUser(req)) return sendError(res, 401, '请先登录云端账号');
  const body = JSON.parse(await readBody(req, 20) || '{}');
  if (!body.imageDataUrl) return sendError(res, 400, '缺少图片');
  const cfg = getAiConfig();
  const provider = AI_PROVIDERS[body.provider || cfg.provider] || AI_PROVIDERS.zhipu;
  const visionModel = provider.vision;
  if (!visionModel) return sendError(res, 400, '当前平台不支持图片识别，请切换智谱');
  await proxyAI(res, {
    provider: body.provider,
    model: visionModel,
    body: (model) => ({
      model,
      temperature: 0.5,
      max_tokens: 600,
      messages: [
        { role: 'system', content: '你是「学无忧」的 AI 助教。用户会发来一道题的图片，请读出题目并给出清晰、简短的解题思路（150 字以内）。如果图片不是题目，就说明一下。' },
        { role: 'user', content: [{ type: 'text', text: body.userNote || '帮我看看这道题怎么做？' }, { type: 'image_url', image_url: { url: body.imageDataUrl } }] }
      ]
    })
  });
});

/* ===== AI 配置管理（可选，管理员改服务端 Key） ===== */
route('GET', '/api/ai/config', (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  const cfg = getAiConfig();
  sendJson(res, 200, { ok: true, provider: cfg.provider, model: cfg.model, hasKey: !!cfg.apiKey });
});

const integrations = require('./integrations')( { route, authUser, sendJson, readBody, store, getAiConfig, providers: AI_PROVIDERS } );
const studyRooms = require('./study-rooms')({route,authUser,sendJson,readBody,store});
require('./learning')({ route, authUser, sendJson, readBody, store, syncReviews:integrations.syncReviews,studyRooms });
require('./practice')({ route, authUser, sendJson, readBody, store });
require('./campus')({ route, authUser, sendJson, readBody, store, studyRooms });
const community = require('./community')({route,authUser,sendJson,readBody,store,syncReviews:integrations.syncReviews});
/* 同场在线状态与好友挑战共用一个 namespace（/community）：挑战的开始/交卷也走
 * community:changed，同场只加 campus:* 与 duel:* 这几个事件名，两边互不覆盖。 */
const campusLive = require('./campus/presence')({authUser,store,namespace:community.namespace});
require('./questions')({ route, authUser, sendJson, readBody });

/* 管理员后台最后挂载：它要用到 cleanPresence，也要保证 authUser 已带上封号判定 */
const admin = require('./admin')({ route, authUser, sendJson, readBody, store, cleanPresence });
/* 可选引导：ADMIN_USERNAMES="张三,李四" 时，启动就把这些已存在的账号提升为管理员。
 * 幂等，且只对「启动时已存在的账号」生效——不会因为后来有人抢注同名账号就变成管理员。
 *
 * 必须放在 start() 里跑，不能像最初那样写在模块顶层：
 * 配了 DATABASE_URL 时存储层切到 store-postgres，它的每次读写都要求处在 store.run()
 * 的事务里，否则抛「数据库操作必须在活动事务内执行」。模块顶层调用会让进程在
 * require 阶段就退出——而这一步又恰恰只在「DATABASE_URL + ADMIN_USERNAMES 都配了」
 * 的生产环境才触发，本地走 JSON 文件存储永远复现不出来。
 * 后果极具迷惑性：进程起不来 → 健康检查不过 → Render 保留旧版本继续服务
 * → 看起来就是「部署了但没生效」。 */
async function bootstrapAdmins() {
  if (!process.env.ADMIN_USERNAMES) return [];
  let promoted = [];
  await store.run(() => { promoted = admin.promoteByUsername(process.env.ADMIN_USERNAMES.split(',')); });
  if (promoted.length) console.log('  - 管理员引导:  已提升 ' + promoted.join(', '));
  return promoted;
}

/* ===== 静态文件（伺服 wenguo 前端） ===== */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.wav': 'audio/wav', '.mp3': 'audio/mpeg',
  '.pdf': 'application/pdf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.wasm': 'application/wasm', '.mjs': 'application/javascript', '.ttf': 'font/ttf',
  '.hdr': 'application/octet-stream', '.exr': 'application/octet-stream', '.glb': 'model/gltf-binary'
};

function serveStatic(req, res) {
  let urlPath;
  try { urlPath = decodeURIComponent((req.url.split('?')[0] || '/')); } catch { return sendError(res, 400, '路径格式错误'); }
  if (urlPath === '/') urlPath = '/index.html';
  if (urlPath === '/examples/library-3d/') urlPath += 'index.html';
  const filePath = path.normalize(path.join(ROOT, urlPath));
  const relative = path.relative(ROOT, filePath);
  const parts = relative.split(path.sep);
  /* 顶层白名单：只伺服这些入口。admin.html 显式列入——
   * 页面本身是静态的（里面没有任何数据，数据全部走 /api/admin/* 鉴权），
   * 但仍然不放进目录里扩散，避免以后有人把备份、日志之类的东西丢进来就被伺服出去。 */
  const ALLOWED_ROOTS = ['index.html', 'admin.html', 'js', 'css', 'audio', 'data', 'vendor'];
  const publicPath = parts.join('/');
  const libraryAsset = /^examples\/library-3d\/(?:index\.html|library\.css|app\.bundle\.js|assets\/(?:catalog-availability\.json|wenku-library\.glb|r1-lighting\/(?:r1-bake\.json|r1-receivers-[a-f0-9]{8}\.glb|r1-indirect-[a-f0-9]{8}\.exr))|vendor\/pdfjs\/(?:pdf\.min\.js|pdf\.worker\.min\.js))$/.test(publicPath);
  const libraryMaterial = /^examples\/campus-3d-v5\/assets\/(?:[a-z]+-(?:color|normal|roughness)\.jpg|sky\.hdr)$/.test(publicPath);
  const academyAsset = /^examples\/campus-3d-v5\/(?:index\.html|style\.css|app\.bundle\.js|assets\/(?:classroom-baked\.glb|lightmaps\/(?:day-open|day-closed|led)\.hdr|characters\/student-(?:anime\.vrm|anime-motion\.json|robot\.glb|formal\.glb|hoodie\.glb)))$/.test(publicPath);
  if (relative.startsWith('..') || path.isAbsolute(relative) || parts.some(p => p.startsWith('.')) || !(ALLOWED_ROOTS.includes(parts[0]) || libraryAsset || libraryMaterial || academyAsset)) return sendError(res, 403, '禁止访问');
  fs.readFile(filePath, (err, buf) => {
    if (err) return sendError(res, 404, '文件不存在');
    const ext = path.extname(filePath).toLowerCase();
    /* 静态资源带版本号（?v=）由前端控制刷新，可放心长缓存；HTML 不缓存保证即时更新 */
    const cc = ext === '.html' ? 'no-cache' : 'public, max-age=86400';
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': cc
    });
    res.end(buf);
  });
}

/* ---------------- HTTP 服务 ---------------- */
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' });
    return res.end();
  }
  const urlPath = req.url.split('?')[0];
  for (const r of routes) {
    if (r.method === req.method && urlPath === r.pattern) {
      try {
        if (!store.database || urlPath === '/api/health') await r.handler(req, res);
        else {
          // Do not acknowledge a write until COMMIT has completed successfully.
          let status=200, headers={}, body='';
          const reply={headersSent:false, writeHead(code,value){status=code;headers=value;this.headersSent=true;}, end(value){body=value;}};
          await store.run(() => r.handler(req,reply), {
            readOnly:urlPath.startsWith('/api/ai/'), commit:()=>status<400
          });
          res.writeHead(status,headers); res.end(body);
        }
      } catch (e) {
        if (!res.headersSent) sendError(res, e instanceof SyntaxError ? 400 : 500, e instanceof SyntaxError ? '请求格式错误' : '服务器内部错误');
      }
      return;
    }
  }
  if (urlPath.startsWith('/api/')) return sendError(res, 404, '接口不存在');
  serveStatic(req, res);
});

studyRooms.attach(campusLive.attach(community.attach(server)));
/* 挑战开始时要把双方拉进同一间「擂台房」——3D 侧就位后靠这间房互相看见对方的动作。
 * 房间的生命周期归 presence 管（有人就位才建，人走光就散），这里只把「挑战变了」告诉它：
 * 挑战与同场用的是同一个登录态，uid 就是两边的公共键。 */
community.onChallengeEvent((challenge) => campusLive.duel(challenge));
server.requestTimeout = 30000;
async function start(port=PORT,host=process.env.HOST || '127.0.0.1') {
  await store.init();
  /* 先做引导再监听：引导失败就不要假装启动成功，否则健康检查会通过，
   * 平台把流量切到一个没管理员、状态不完整的实例上。 */
  await bootstrapAdmins();
  if (store.database) await store.run(community.recover);
  await store.run(studyRooms.recover);
  await new Promise((resolve,reject) => {server.once('error',reject);server.listen(port,host,()=>{server.removeListener('error',reject);resolve();});});
  return server;
}
if (require.main === module) start().then(() => {
  console.log('学无忧后端已启动: http://localhost:' + PORT);
  console.log('  - AI Key 代理:  /api/ai/chat, /api/ai/vision');
  console.log('  - 用户认证:     /api/auth/register, /api/auth/login, /api/auth/me');
  console.log('  - 数据同步:     /api/data, /api/study/stats, /api/study/setup');
  console.log('  - 前端页面:     http://localhost:' + PORT + '/');
}).catch(async () => { console.error('启动失败：请检查 DATABASE_URL、数据库连接权限和 JWT_SECRET'); await store.close(); process.exit(1); });



if (require.main === module) process.on('SIGTERM', async () => { server.close(); campusLive.close(); studyRooms.close(); await integrations.close(); await community.close(); await store.close(); process.exit(0); });
module.exports = { server, integrations, community,studyRooms,campusLive, admin, start, routes };
