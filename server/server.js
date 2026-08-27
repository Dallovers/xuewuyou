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

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, '..'); // wenguo 前端目录

/* ---------------- AI 平台配置（Key 只存在服务端） ---------------- */
const AI_PROVIDERS = {
  zhipu: { name: '智谱 GLM', base: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash', vision: 'glm-4v-flash' },
  deepseek: { name: 'DeepSeek', base: 'https://api.deepseek.com', model: 'deepseek-chat', vision: null },
  kimi: { name: 'Kimi', base: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k', vision: 'moonshot-v1-8k-vision-preview' },
  doubao: { name: '豆包', base: 'https://ark.cn-beijing.volces.com/api/v3', model: 'doubao-pro-32k', vision: 'doubao-vision-pro-32k' }
};

/* 初始服务端 Key：从环境变量读取，否则用内置默认（智谱免费额度）。
 * 生产环境务必用环境变量 AI_API_KEY 覆盖，不要依赖内置默认值。 */
const AI_DEFAULT_KEY = process.env.AI_API_KEY || '12b55751eeba4f13b28d1cf5e9463c57.tF2TBMfVLVCukBAR';
const AI_DEFAULT_PROVIDER = process.env.AI_PROVIDER || 'zhipu';

function getAiConfig() {
  const c = store.get('aiConfig', 'main') || {};
  return {
    provider: c.provider || AI_DEFAULT_PROVIDER,
    apiKey: c.apiKey || AI_DEFAULT_KEY,
    base: c.base || '',
    model: c.model || ''
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
  return users[payload.uid] || null;
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

/* ===== 认证 ===== */
route('POST', '/api/auth/register', async (req, res) => {
  const body = JSON.parse(await readBody(req, 1) || '{}');
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const nick = String(body.nick || '').trim() || username;
  if (!/^[A-Za-z0-9_\u4e00-\u9fa5]{2,20}$/.test(username)) {
    return sendError(res, 400, '用户名需为 2-20 位字母/数字/下划线/中文');
  }
  if (password.length < 6) return sendError(res, 400, '密码至少 6 位');
  const users = store.get('users') || {};
  const exists = Object.values(users).some((u) => u.username === username);
  if (exists) return sendError(res, 409, '该用户名已被注册');

  const id = uid();
  users[id] = { id, username, passHash: auth.hashPassword(password), nick, createdAt: Date.now() };
  store.set('users', users);
  const token = auth.sign({ uid: id });
  sendJson(res, 200, { ok: true, token, user: { id, username, nick } });
});

route('POST', '/api/auth/login', async (req, res) => {
  const body = JSON.parse(await readBody(req, 1) || '{}');
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const users = store.get('users') || {};
  const user = Object.values(users).find((u) => u.username === username);
  if (!user || !auth.verifyPassword(password, user.passHash)) {
    return sendError(res, 401, '用户名或密码错误');
  }
  const token = auth.sign({ uid: user.id });
  sendJson(res, 200, { ok: true, token, user: { id: user.id, username: user.username, nick: user.nick } });
});

route('GET', '/api/auth/me', (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  sendJson(res, 200, { ok: true, user: { id: user.id, username: user.username, nick: user.nick } });
});

route('PUT', '/api/auth/profile', async (req, res) => {
  const user = authUser(req);
  if (!user) return sendError(res, 401, '未登录');
  const body = JSON.parse(await readBody(req, 1) || '{}');
  if (body.nick && typeof body.nick === 'string') {
    user.nick = body.nick.trim().slice(0, 20) || user.nick;
    const users = store.get('users') || {};
    users[user.id] = user;
    store.set('users', users);
  }
  sendJson(res, 200, { ok: true, user: { id: user.id, username: user.username, nick: user.nick } });
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
  const all = store.get('studyDaily', user.id) || {};
  const cur = all[day] || { focusMinutes: 0, completed: 0 };
  cur.focusMinutes = Math.max(0, Math.round(Number(body.focusMinutes != null ? body.focusMinutes : cur.focusMinutes)));
  cur.completed = Math.max(0, Math.round(Number(body.completed != null ? body.completed : cur.completed)));
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
  const provider = AI_PROVIDERS[options.provider || cfg.provider] || AI_PROVIDERS.zhipu;
  const model = options.model || cfg.model || provider.model;
  const base = cfg.base || provider.base;
  try {
    const upstream = await fetch(base + '/chat/completions', {
      method: 'POST',
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

/* ===== 静态文件（伺服 wenguo 前端） ===== */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.wav': 'audio/wav', '.mp3': 'audio/mpeg',
  '.pdf': 'application/pdf', '.woff': 'font/woff', '.woff2': 'font/woff2'
};

function serveStatic(req, res) {
  let urlPath = decodeURIComponent((req.url.split('?')[0] || '/'));
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) return sendError(res, 403, '禁止访问');
  fs.readFile(filePath, (err, buf) => {
    if (err) return sendError(res, 404, '文件不存在');
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
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
        await r.handler(req, res);
      } catch (e) {
        if (!res.headersSent) sendError(res, 500, '服务器内部错误: ' + (e.message || e));
      }
      return;
    }
  }
  if (urlPath.startsWith('/api/')) return sendError(res, 404, '接口不存在');
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log('学无忧后端已启动: http://localhost:' + PORT);
  console.log('  - AI Key 代理:  /api/ai/chat, /api/ai/vision');
  console.log('  - 用户认证:     /api/auth/register, /api/auth/login, /api/auth/me');
  console.log('  - 数据同步:     /api/data, /api/study/stats, /api/study/setup');
  console.log('  - 前端页面:     http://localhost:' + PORT + '/');
});


