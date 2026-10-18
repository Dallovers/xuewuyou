'use strict';
/* ============ 学无忧 · 校园状态与世界存档（A05） ============
 * 契约见 docs/team/world-3d-contract.md 的「A 提供的建议接口」。
 *
 * 三个接口：
 *   GET /api/campus/state    —— 当前用户八地点的真实学习/可用状态
 *   GET /api/world/progress  —— 当前用户的位置存档，没有则 null
 *   PUT /api/world/progress  —— 带 expectedVersion 保存，冲突 409
 *
 * 边界：
 *   1. 身份只取自登录态，存档按 uid 隔离，不公开给其他用户。
 *   2. 位置只做存档，**不参与**答题判定、积分、自习时长统计。
 *   3. 只做基本边界校验；能否真正站立由 C 用导航网格二次验证。
 *   4. 换 worldVersion 视为新世界：旧位置失效，客户端应回安全出生点，
 *      但学习记录不受影响。
 */
const clone = (x) => JSON.parse(JSON.stringify(x));
const fail = (message, status = 400, code = 'BAD_REQUEST') => {
  throw Object.assign(new Error(message), { status, code });
};

const MAX_LABEL = 40;
const MAX_COORD = 10000;      // 米；超出视为异常坐标
const MIN_HEIGHT = -1000;
const MAX_HEIGHT = 10000;
const MAX_BODY_BYTES = 4096;

/* 八地点定义。ID 必须与 js/campus-registry.js 的 WG_CampusDistricts 保持一致，
   改一处必须同步改另一处（前端那份负责展示文案，这里负责服务端状态）。 */
const LOCATIONS = [
  { id: 'bank', label: '课程学院', metric: 'topicsPracticed', unit: '个已练章节' },
  { id: 'wenku', label: '知识图书馆', metric: 'documents', unit: '份私有资料' },
  { id: 'lab', label: '随机训练场', metric: 'boards', unit: '份题目草稿' },
  { id: 'social', label: '社交广场', metric: 'friends', unit: '位学习搭子' },
  { id: 'arena', label: '好友竞技场', metric: 'challenges', unit: '项待完成挑战' },
  { id: 'study', label: '专注营地', metric: 'studyingNow', unit: '人正在共同专注' },
  { id: 'mistakes', label: '错题修复工坊', metric: 'mistakes', unit: '道待巩固' },
  { id: 'report', label: '成长中心', metric: 'answers', unit: '次作答记录' }
];

module.exports = function ({ route, authUser, sendJson, readBody, store, studyRooms }) {
  function learning(uid) {
    return clone(store.get('learning', uid, { boards: {}, experiments: [], plan: null }));
  }

  function world(uid, rec) {
    const r = rec || learning(uid);
    return r.world && typeof r.world === 'object' ? r.world : null;
  }

  function finite(v) {
    return typeof v === 'number' && Number.isFinite(v);
  }

  function label(value, field) {
    if (typeof value !== 'string') fail(field + ' 必须是字符串', 400);
    const v = value.trim();
    if (!v) fail('缺少 ' + field, 400);
    if (v.length > MAX_LABEL) fail(field + ' 超过 ' + MAX_LABEL + ' 字符', 400);
    return v;
  }

  function own(method, path, handler) {
    route(method, path, async (req, res) => {
      const user = authUser(req);
      if (!user) return sendJson(res, 401, { ok: false, error: '请先登录云端账号', code: 'UNAUTHORIZED' });
      try {
        const body = method === 'GET' ? {} : JSON.parse((await readBody(req, 1)) || '{}');
        const result = await handler(user.id, body);
        sendJson(res, 200, { ok: true, ...result });
      } catch (e) {
        const status = e.status || (e instanceof SyntaxError ? 400 : 500);
        sendJson(res, status, {
          ok: false,
          error: e.status ? e.message : (e instanceof SyntaxError ? '请求格式错误' : '校园状态处理失败'),
          code: e.code || (e instanceof SyntaxError ? 'BAD_REQUEST' : 'INTERNAL')
        });
      }
    });
  }

  /* 八地点的真实数值。只统计「确定的计数」，掌握概率属模型估计，不在这里返回，
     避免把估计值当成既成事实展示。 */
  function metrics(uid) {
    const local = store.get('userData', uid, {}).payload || {};
    const rec = learning(uid);
    const integrated = store.get('integrations', uid, {});
    const social = store.get('community', 'main', { friends: {}, requests: [], posts: [], challenges: [] });
    const now = Date.now();

    const answers = (local.answers || []).length;
    const mistakes = (local.mistakes || []).length;
    const documents = (integrated.documents || []).length;
    const boards = Object.keys(rec.boards || {}).length;

    const friends = Object.values(social.friends || {}).filter((f) => f && (f.members || []).includes(uid)).length;
    const challenges = (social.challenges || []).filter((c) =>
      c && (c.members || []).includes(uid) && c.status === 'active' &&
      (!c.expiresAt || c.expiresAt > now) && !(c.sessions && c.sessions[uid] && c.sessions[uid].finishedAt)).length;

    let studyingNow = 0;
    try { studyingNow = (studyRooms && studyRooms.snapshot) ? (studyRooms.snapshot(uid).online || 0) : 0; } catch (e) { studyingNow = 0; }

    /* 已练章节数：按题库 topic 归并作答记录，避免把同一题反复答算成多个章节 */
    const { questions } = require('../integrations/questions');
    const topics = new Set();
    for (const a of local.answers || []) {
      const q = questions.get(String(a && a.qid));
      if (q) topics.add(q.topic);
    }

    return { answers, mistakes, documents, boards, friends, challenges, studyingNow, topicsPracticed: topics.size };
  }

  own('GET', '/api/campus/state', (uid) => {
    const values = metrics(uid);
    const rec = learning(uid);
    const now = new Date().toISOString();
    const locations = LOCATIONS.map((l) => {
      const value = Number(values[l.metric] || 0);
      return {
        id: l.id,
        label: l.label,
        metric: l.metric,
        unit: l.unit,
        value,
        hasData: value > 0,
        estimated: false,          // 这里全部是确定计数；模型估计不混进来
        updatedAt: (rec.world && rec.world.updatedAt) || null
      };
    });
    return {
      worldVersion: (rec.world && rec.world.worldVersion) || null,
      fetchedAt: now,
      locations
    };
  });

  own('GET', '/api/world/progress', (uid) => {
    const w = world(uid);
    return { progress: w ? (w.progress || null) : null };
  });

  own('PUT', '/api/world/progress', (uid, body) => {
    if (Buffer.byteLength(JSON.stringify(body)) > MAX_BODY_BYTES) fail('请求体过大', 400, 'BODY_TOO_LARGE');

    const worldVersion = label(body.worldVersion, 'worldVersion');
    const sceneId = label(body.sceneId, 'sceneId');
    const pos = body.position;
    if (!pos || typeof pos !== 'object') fail('position 格式错误', 400);
    ['x', 'y', 'z'].forEach((k) => {
      if (!finite(pos[k])) fail('position.' + k + ' 必须是有限数字', 400);
    });
    if (Math.abs(pos.x) > MAX_COORD || Math.abs(pos.z) > MAX_COORD) fail('position 超出世界范围', 400);
    if (pos.y < MIN_HEIGHT || pos.y > MAX_HEIGHT) fail('position.y 超出高度范围', 400);
    const heading = body.heading === undefined ? 0 : body.heading;
    if (!finite(heading)) fail('heading 必须是有限数字', 400);

    const rec = learning(uid);
    const prev = world(uid, rec);

    /* 换版：旧位置失效。不沿用任何旧进度，版本从 1 重新计。 */
    const versionMismatch = !!(prev && prev.worldVersion && prev.worldVersion !== worldVersion);
    if (prev && snapshot_version(prev) && !versionMismatch) {
      const expected = body.expectedVersion;
      if (typeof expected !== 'number' || expected !== prev.version) {
        fail('位置存档已在其他窗口更新，请重新读取', 409, 'VERSION_CONFLICT');
      }
    }

    const nextVersion = versionMismatch || !prev ? 1 : (prev.version || 0) + 1;
    rec.world = {
      worldVersion,
      version: nextVersion,
      updatedAt: new Date().toISOString(),
      progress: {
        worldVersion,
        sceneId,
        position: { x: pos.x, y: pos.y, z: pos.z },
        heading,
        version: nextVersion,
        updatedAt: new Date().toISOString()
      }
    };
    store.set('learning', uid, rec);

    return { progress: rec.world.progress, reset: versionMismatch };
  });

  function snapshot_version(w) { return typeof w.version === 'number'; }
};
