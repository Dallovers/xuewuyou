'use strict';
/* ============ 学无忧 · 断点续学（A02） ============
 * 契约见 docs/team/practice-session-contract.md。
 *
 * 会话保存在当前用户自己的私有学习记录（store 'learning'）里，不新建公开社区记录
 * 来保存个人草稿。并发写由 store 的单进程模型串行化；本模块只读写自己的 practice 键，
 * 不动 boards / experiments / plan。
 *
 * 三条硬约束：
 *   1. 一切身份取自登录态，绝不相信请求体里的用户 ID。
 *   2. 保存草稿不触发判分、FSRS 或专注统计——只写 practice，不碰 userData。
 *   3. submittedQids 一律与真实作答记录核对后才接受，防止客户端自行加分。
 */
const crypto = require('node:crypto');
const { questions } = require('../integrations/questions');

const MAX_QIDS = 500;            // 单次练习最多题数；超出报错而不是静默截断
const MAX_DRAFTS_BYTES = 64 * 1024;
const MAX_SESSIONS = 20;         // 每人保留的会话上限，超出丢弃最旧的已结束会话
const MAX_ID_LEN = 100;
const MAX_LABEL_LEN = 80;

const fail = (message, status = 400, code = 'BAD_REQUEST') => {
  throw Object.assign(new Error(message), { status, code });
};
const clone = (x) => JSON.parse(JSON.stringify(x));

module.exports = function ({ route, authUser, sendJson, readBody, store }) {
  function record(uid) {
    return clone(store.get('learning', uid, { boards: {}, experiments: [], plan: null }));
  }

  function practiceOf(rec) {
    if (!rec.practice || typeof rec.practice !== 'object') rec.practice = { sessions: {}, byRequest: {} };
    if (!rec.practice.sessions) rec.practice.sessions = {};
    if (!rec.practice.byRequest) rec.practice.byRequest = {};
    return rec.practice;
  }

  /* 对外视图：题号失效时保留可用部分并说明，不静默清空整组进度，也不假报完成 */
  function view(sess) {
    const valid = sess.qids.filter((q) => questions.has(q));
    const dropped = sess.qids.filter((q) => !questions.has(q));
    const currentIndex = Math.min(Math.max(0, sess.currentIndex || 0), Math.max(0, valid.length - 1));
    const drafts = {};
    for (const q of valid) if (sess.drafts && sess.drafts[q] !== undefined) drafts[q] = sess.drafts[q];
    const out = {
      id: sess.id,
      moduleId: sess.moduleId || null,
      topic: sess.topic || null,
      qids: valid,
      currentIndex,
      drafts,
      submittedQids: (sess.submittedQids || []).filter((q) => valid.includes(q)),
      status: sess.status,
      version: sess.version,
      createdAt: sess.createdAt,
      updatedAt: sess.updatedAt
    };
    if (dropped.length) {
      out.droppedQids = dropped;
      out.note = '部分题目已不在题库中，已保留其余进度，未自动标记完成';
    }
    return out;
  }

  function text(value, max, field, required) {
    if (value === undefined || value === null || value === '') {
      if (required) fail('缺少 ' + field, 400, 'BAD_REQUEST');
      return null;
    }
    if (typeof value !== 'string') fail(field + ' 必须是字符串', 400, 'BAD_REQUEST');
    const v = value.trim();
    if (!v) { if (required) fail('缺少 ' + field, 400, 'BAD_REQUEST'); return null; }
    if (v.length > max) fail(field + ' 超过 ' + max + ' 字符', 400, 'BAD_REQUEST');
    return v;
  }

  /* 题号必须真实存在于题库；数量超限直接报错，不做静默截断 */
  function qidList(value) {
    if (!Array.isArray(value) || !value.length) fail('qids 必须是非空数组', 400, 'BAD_QIDS');
    if (value.length > MAX_QIDS) fail('一次练习最多 ' + MAX_QIDS + ' 题（未做截断）', 400, 'TOO_MANY_QIDS');
    const out = [], seen = new Set();
    for (const raw of value) {
      if (typeof raw !== 'string' || !raw.trim()) fail('题号格式错误', 400, 'BAD_QIDS');
      const id = raw.trim();
      if (seen.has(id)) continue;
      if (!questions.has(id)) fail('题号不在题库中：' + id, 400, 'UNKNOWN_QID');
      seen.add(id);
      out.push(id);
    }
    if (!out.length) fail('qids 必须是非空数组', 400, 'BAD_QIDS');
    return out;
  }

  function draftsOf(value, qids) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail('drafts 必须是对象', 400, 'BAD_DRAFTS');
    const out = {};
    for (const [qid, draft] of Object.entries(value)) {
      if (!qids.includes(qid)) fail('草稿题号不属于本次练习：' + qid, 400, 'BAD_DRAFTS');
      if (!draft || typeof draft !== 'object' || Array.isArray(draft)) fail('草稿格式错误', 400, 'BAD_DRAFTS');
      const item = {};
      if (draft.choice !== undefined) {
        if (typeof draft.choice !== 'string' || draft.choice.length > 40) fail('草稿选项格式错误', 400, 'BAD_DRAFTS');
        item.choice = draft.choice;
      }
      if (draft.text !== undefined) {
        if (typeof draft.text !== 'string' || draft.text.length > 4000) fail('草稿文本过长', 400, 'BAD_DRAFTS');
        item.text = draft.text;
      }
      if (draft.marked !== undefined) item.marked = !!draft.marked;
      out[qid] = item;
    }
    if (Buffer.byteLength(JSON.stringify(out)) > MAX_DRAFTS_BYTES) fail('草稿超过 64 KB', 400, 'DRAFTS_TOO_LARGE');
    return out;
  }

  /* 真实作答记录里的题号集合——submittedQids 只允许从这里取 */
  function verifiedQids(uid) {
    const payload = store.get('userData', uid, {}).payload || {};
    const set = new Set();
    for (const a of payload.answers || []) if (a && a.qid != null) set.add(String(a.qid));
    return set;
  }

  function prune(p) {
    if (Object.keys(p.sessions).length <= MAX_SESSIONS) return;
    const finished = Object.values(p.sessions)
      .filter((s) => s.status !== 'active')
      .sort((a, b) => (a.updatedAt < b.updatedAt ? -1 : 1));
    while (Object.keys(p.sessions).length > MAX_SESSIONS && finished.length) {
      const s = finished.shift();
      delete p.sessions[s.id];
      delete p.byRequest[s.clientRequestId];
    }
  }

  function own(method, endpoint, handler) {
    route(method, '/api/practice' + endpoint, async (req, res) => {
      const user = authUser(req);
      if (!user) return sendJson(res, 401, { ok: false, error: '请先登录云端账号', code: 'UNAUTHORIZED' });
      try {
        const body = method === 'GET' ? {} : JSON.parse((await readBody(req, 2)) || '{}');
        const query = new URL(req.url, 'http://localhost').searchParams;
        const result = await handler(user.id, body, query);
        sendJson(res, 200, { ok: true, ...result });
      } catch (e) {
        const status = e.status || (e instanceof SyntaxError ? 400 : 500);
        sendJson(res, status, {
          ok: false,
          error: e.status ? e.message : (e instanceof SyntaxError ? '请求格式错误' : '断点续学处理失败'),
          code: e.code || (e instanceof SyntaxError ? 'BAD_REQUEST' : 'INTERNAL')
        });
      }
    });
  }

  /* 创建：同一用户 + 同一 clientRequestId 的重试直接返回原会话，避免重复建档 */
  own('POST', '/session', (uid, body) => {
    const clientRequestId = text(body.clientRequestId, MAX_ID_LEN, 'clientRequestId', true);
    const rec = record(uid);
    const p = practiceOf(rec);
    const existingId = p.byRequest[clientRequestId];
    if (existingId && p.sessions[existingId]) {
      return { session: view(p.sessions[existingId]), replayed: true };
    }
    const qids = qidList(body.qids);
    const now = new Date().toISOString();
    const session = {
      id: crypto.randomUUID(),
      clientRequestId,
      moduleId: text(body.moduleId, MAX_LABEL_LEN, 'moduleId', false),
      topic: text(body.topic, MAX_LABEL_LEN, 'topic', false),
      qids,
      currentIndex: 0,
      drafts: {},
      submittedQids: [],
      status: 'active',
      version: 1,
      createdAt: now,
      updatedAt: now
    };
    p.sessions[session.id] = session;
    p.byRequest[clientRequestId] = session.id;
    prune(p);
    store.set('learning', uid, rec);
    return { session: view(session), replayed: false };
  });

  /* 读取：不带 id 时返回最近更新的进行中会话，没有则 session: null */
  own('GET', '/session', (uid, _body, query) => {
    const id = query.get('id');
    const p = practiceOf(record(uid));
    if (id) {
      const s = p.sessions[id];
      if (!s) fail('会话不存在', 404, 'NOT_FOUND');
      return { session: view(s) };
    }
    const active = Object.values(p.sessions)
      .filter((s) => s.status === 'active')
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))[0];
    return { session: active ? view(active) : null };
  });

  /* 保存位置与草稿：只写 practice，不写 userData，因此不会产生判分或 FSRS 记录 */
  own('PUT', '/session', (uid, body) => {
    const id = text(body.id, MAX_ID_LEN, 'id', true);
    const rec = record(uid);
    const p = practiceOf(rec);
    const s = p.sessions[id];
    if (!s) fail('会话不存在', 404, 'NOT_FOUND');
    if (s.status !== 'active') fail('会话已结束，不能继续保存', 409, 'SESSION_CLOSED');
    if (typeof body.expectedVersion !== 'number' || body.expectedVersion !== s.version) {
      fail('会话已在其他窗口更新，请重新读取最新进度', 409, 'VERSION_CONFLICT');
    }
    if (body.currentIndex !== undefined) {
      if (!Number.isInteger(body.currentIndex) || body.currentIndex < 0 || body.currentIndex >= s.qids.length) {
        fail('currentIndex 超出题目范围', 400, 'BAD_INDEX');
      }
      s.currentIndex = body.currentIndex;
    }
    if (body.drafts !== undefined) s.drafts = draftsOf(body.drafts, s.qids);
    if (body.submittedQids !== undefined) {
      if (!Array.isArray(body.submittedQids)) fail('submittedQids 必须是数组', 400, 'BAD_SUBMITTED');
      const real = verifiedQids(uid);
      const next = new Set(s.submittedQids);
      for (const q of body.submittedQids) {
        const v = String(q);
        if (real.has(v) && s.qids.includes(v)) next.add(v);
      }
      s.submittedQids = [...next];
    }
    s.version += 1;
    s.updatedAt = new Date().toISOString();
    store.set('learning', uid, rec);
    return { session: view(s) };
  });

  /* 结束：只改状态。请求体里的分数 / 时长一律忽略，不作为可信统计 */
  own('POST', '/session/finish', (uid, body) => {
    const id = text(body.id, MAX_ID_LEN, 'id', true);
    const status = body.status === 'abandoned' ? 'abandoned' : 'finished';
    const rec = record(uid);
    const p = practiceOf(rec);
    const s = p.sessions[id];
    if (!s) fail('会话不存在', 404, 'NOT_FOUND');
    if (body.expectedVersion !== undefined && body.expectedVersion !== s.version) {
      fail('会话已在其他窗口更新，请重新读取最新进度', 409, 'VERSION_CONFLICT');
    }
    if (s.status !== 'active') return { session: view(s), replayed: true };
    s.status = status;
    s.version += 1;
    s.updatedAt = new Date().toISOString();
    store.set('learning', uid, rec);
    return { session: view(s), replayed: false };
  });
};
