'use strict';
/* ============ 学无忧 · 题目分发与组卷（A04） ============
 * 目标：正常浏览不再整包下载 3.68 MB 的 gaoshu_bank.js。
 *
 *   GET  /api/questions/meta   版本号 + 科目/章节/难度/题型分布（不含题目内容）
 *   GET  /api/questions        分页 + 按科目/章节/难度/题型/关键词筛选，默认**不含答案**
 *   POST /api/questions/paper  按条件组卷，返回题号列表（不含答案）
 *
 * 答案与解析只在显式 `include=answer` 且已登录时下发——练习需要本地判分，
 * 但默认响应里不携带，避免顺手把整库答案一起发出去。竞技由服务器判分（A06 范围）。
 */
const crypto = require('node:crypto');
const { questions } = require('../integrations/questions');
const { detailOf } = require('../integrations/question-detail');

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;
const MAX_PAPER = 50;

/* 题库版本：题号 + 主题 + 答案 的摘要。题目集合或答案变化都会换版本，
 * 便于前端缓存失效与「统一题号/版本」的对齐。 */
const BANK_VERSION = (() => {
  const rows = [...questions.values()].map((q) => q.id + '|' + q.topic + '|' + q.answer).sort();
  return crypto.createHash('sha256').update(rows.join('\n')).digest('hex').slice(0, 12);
})();

const fail = (message, status = 400, code = 'BAD_REQUEST') => {
  throw Object.assign(new Error(message), { status, code });
};

function distribution() {
  const subjects = new Map();
  const topics = new Map();
  const difficulties = new Map();
  const types = new Map();
  for (const q of questions.values()) {
    const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);
    const d = detailOf(q.id);
    bump(subjects, q.subject || '未分科');
    bump(topics, q.topic);
    bump(difficulties, d.difficulty || '未标难度');
    bump(types, d.type || '未标题型');
  }
  const toList = (m) => [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  return {
    subjects: toList(subjects),
    topics: toList(topics),
    difficulties: toList(difficulties),
    types: toList(types)
  };
}

/* 注意：questions.js 里的对象没有 difficulty / type 字段，这里按需从原始记录补 */
function view(q, withAnswer) {
  const d = detailOf(q.id);
  const out = {
    id: q.id,
    subject: q.subject,
    topic: q.topic,
    difficulty: d.difficulty || null,
    type: d.type || null,
    question: q.question,
    options: q.options,
    selfAssessed: q.selfAssessed
  };
  if (withAnswer) {
    out.answer = q.answer;
    out.analysis = q.analysis;
  }
  return out;
}

module.exports = function ({ route, authUser, sendJson, readBody }) {
  const all = [...questions.values()];
  const stats = distribution();

  function own(method, path, handler, { publicRoute = false } = {}) {
    route(method, path, async (req, res) => {
      const user = authUser(req);
      if (!user && !publicRoute) {
        return sendJson(res, 401, { ok: false, error: '请先登录云端账号', code: 'UNAUTHORIZED' });
      }
      try {
        const body = method === 'GET' ? {} : JSON.parse((await readBody(req, 1)) || '{}');
        const query = new URL(req.url, 'http://localhost').searchParams;
        const result = await handler(user, body, query);
        sendJson(res, 200, { ok: true, version: BANK_VERSION, ...result });
      } catch (e) {
        const status = e.status || (e instanceof SyntaxError ? 400 : 500);
        sendJson(res, status, {
          ok: false,
          error: e.status ? e.message : (e instanceof SyntaxError ? '请求格式错误' : '题目分发失败'),
          code: e.code || (e instanceof SyntaxError ? 'BAD_REQUEST' : 'INTERNAL')
        });
      }
    });
  }

  /* 元信息：只有统计量，不含任何题目内容或答案 */
  own('GET', '/api/questions/meta', () => ({
    total: questions.size,
    ...stats
  }), { publicRoute: true });

  /* 分页与筛选。默认不含答案；include=answer 需要登录。 */
  own('GET', '/api/questions', (user, _body, query) => {
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.get('limit')) || DEFAULT_LIMIT));
    const offset = Math.max(0, Number(query.get('offset')) || 0);
    const topic = query.get('topic');
    const subject = query.get('subject');
    const difficulty = query.get('difficulty');
    const type = query.get('type');
    const kw = (query.get('q') || '').trim().toLowerCase();
    const includeAnswer = query.get('include') === 'answer';
    if (includeAnswer && !user) fail('读取答案需要登录', 401, 'UNAUTHORIZED');

    let rows = all;
    if (topic) rows = rows.filter((q) => q.topic === topic);
    if (subject) rows = rows.filter((q) => q.subject === subject);
    if (difficulty) rows = rows.filter((q) => detailOf(q.id).difficulty === difficulty);
    if (type) rows = rows.filter((q) => detailOf(q.id).type === type);
    if (kw) rows = rows.filter((q) => String(q.question || '').toLowerCase().includes(kw));

    /* 稳定排序：按题号，分页才不会抖动 */
    rows = rows.slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

    return {
      total: rows.length,
      offset,
      limit,
      includeAnswer,
      items: rows.slice(offset, offset + limit).map((q) => view(q, includeAnswer))
    };
  });

  /* 组卷：按条件挑出固定数量的题号，不含答案。
   * 同一批次内题号不重复；条件无法满足时按实际数量返回并说明。 */
  own('POST', '/api/questions/paper', (_user, body) => {
    const count = Math.min(MAX_PAPER, Math.max(1, Number(body.count) || 10));
    const topic = body.topic || null;
    const subject = body.subject || null;
    const prefer = body.preferTopic ? String(body.preferTopic) : null;

    let rows = all;
    if (topic) rows = rows.filter((q) => q.topic === topic);
    if (subject) rows = rows.filter((q) => q.subject === subject);
    if (!rows.length) fail('筛选条件下没有题目', 404, 'EMPTY_POOL');

    const picked = [];
    const used = new Set();
    const take = (pool) => {
      for (let i = pool.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
      }
      for (const q of pool) {
        if (picked.length >= count) break;
        if (used.has(q.id)) continue;
        used.add(q.id);
        picked.push(q);
      }
    };

    /* 先满足偏好章节，再用其余题目补足 */
    if (prefer) {
      const preferred = rows.filter((q) => q.topic === prefer);
      const rest = rows.filter((q) => q.topic !== prefer);
      take(preferred);
      take(rest);
    } else {
      take(rows.slice());
    }

    return {
      total: rows.length,
      requested: count,
      shortfall: Math.max(0, count - picked.length),
      qids: picked.map((q) => q.id),
      breakdown: picked.reduce((acc, q) => {
        acc[q.topic] = (acc[q.topic] || 0) + 1;
        return acc;
      }, {})
    };
  });
};
