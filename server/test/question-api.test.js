'use strict';
/* 题目分发与组卷（A04）接口测试
 * 覆盖：元信息不泄露内容、列表分页与筛选稳定、默认不下发答案、
 * 组卷去重与不足量说明、版本号稳定。
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-question-api-'));
let server, integrations, base, token;

async function call(endpoint, method = 'GET', body, useAuth = true) {
  const r = await fetch(base + endpoint, {
    method,
    headers: { 'Content-Type': 'application/json', ...(useAuth && token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  return { status: r.status, ...(await r.json()) };
}

before(async () => {
  process.env.DATA_DIR = temp;
  process.env.JWT_SECRET = 'question-api-test-secret';
  ({ server, integrations } = require('../server'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  token = (await (await fetch(base + '/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '题目分发甲', password: 'test123456' })
  })).json()).token;
});

after(async () => {
  await integrations.close();
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(temp, { recursive: true, force: true });
});

test('元信息可匿名读取，只有统计量，不含题目内容或答案', async () => {
  const r = await call('/api/questions/meta', 'GET', undefined, false);
  assert.equal(r.status, 200);
  assert.ok(r.total > 1000);
  assert.match(r.version, /^[0-9a-f]{12}$/);
  for (const key of ['subjects', 'topics', 'difficulties', 'types']) {
    assert.ok(Array.isArray(r[key]) && r[key].length > 0, key + ' 应为非空数组');
    assert.equal(typeof r[key][0].name, 'string');
    assert.equal(typeof r[key][0].count, 'number');
  }
  const text = JSON.stringify(r);
  assert.ok(!/answer|analysis|question"/.test(text), '元信息不应包含题目内容或答案字段');
});

test('题目列表需要登录，且默认不下发答案与解析', async () => {
  assert.equal((await call('/api/questions', 'GET', undefined, false)).status, 401);

  const r = await call('/api/questions?limit=5');
  assert.equal(r.status, 200);
  assert.equal(r.items.length, 5);
  assert.equal(r.limit, 5);
  for (const item of r.items) {
    assert.ok(item.id && item.topic && typeof item.question === 'string');
    assert.equal(item.answer, undefined, '默认不得下发答案');
    assert.equal(item.analysis, undefined, '默认不得下发解析');
  }
});

test('分页稳定且不重复：同一偏移两次请求结果一致', async () => {
  const a = await call('/api/questions?limit=10&offset=20');
  const b = await call('/api/questions?limit=10&offset=20');
  const idsA = a.items.map((x) => x.id);
  const idsB = b.items.map((x) => x.id);
  assert.deepEqual(idsA, idsB, '分页顺序必须稳定');
  assert.equal(new Set(idsA).size, idsA.length, '同一页不得重复');

  const page1 = await call('/api/questions?limit=10&offset=0');
  const overlap = page1.items.map((x) => x.id).filter((id) => idsA.includes(id));
  assert.deepEqual(overlap, [], '相邻页不应重叠');
});

test('limit 上限生效，超限被压到 50', async () => {
  const r = await call('/api/questions?limit=999');
  assert.equal(r.limit, 50);
  assert.equal(r.items.length, 50);
});

test('include=answer 需要登录，登录后可取到答案与解析', async () => {
  const r = await call('/api/questions?limit=3&include=answer');
  assert.equal(r.status, 200);
  assert.equal(r.includeAnswer, true);
  for (const item of r.items) {
    assert.equal(typeof item.answer, 'string');
    assert.equal(typeof item.analysis, 'string');
  }
});

test('按章节与难度筛选，结果都符合条件', async () => {
  const meta = await call('/api/questions/meta', 'GET', undefined, false);
  const topic = meta.topics[0].name;
  const byTopic = await call('/api/questions?limit=10&topic=' + encodeURIComponent(topic));
  assert.ok(byTopic.items.length > 0);
  assert.ok(byTopic.items.every((q) => q.topic === topic));
  assert.equal(byTopic.total, meta.topics[0].count, '该章节总数应与元信息一致');

  const diff = meta.difficulties.find((d) => d.name && d.name !== '未标难度');
  if (diff) {
    const byDiff = await call('/api/questions?limit=10&difficulty=' + encodeURIComponent(diff.name));
    assert.ok(byDiff.items.every((q) => q.difficulty === diff.name));
    assert.equal(byDiff.total, diff.count, '该难度总数应与元信息一致');
  }
});

test('关键词搜索只命中题干包含该词的题目', async () => {
  const sample = (await call('/api/questions?limit=1&include=answer')).items[0];
  const kw = String(sample.question).slice(0, 6);
  const r = await call('/api/questions?limit=10&q=' + encodeURIComponent(kw));
  assert.equal(r.status, 200);
  assert.ok(r.total > 0, '关键词 ' + kw + ' 应有命中');
  assert.ok(r.items.every((q) => String(q.question).toLowerCase().includes(kw.toLowerCase())));
});

test('组卷：返回指定数量、题号不重复、且不含答案', async () => {
  const r = await call('/api/questions/paper', 'POST', { count: 8 });
  assert.equal(r.status, 200);
  assert.equal(r.qids.length, 8);
  assert.equal(new Set(r.qids).size, 8, '同卷不得重复题号');
  assert.equal(r.shortfall, 0);
  assert.equal(r.qids.length, Object.values(r.breakdown).reduce((n, v) => n + v, 0));
  assert.ok(!JSON.stringify(r).includes('answer'));
});

test('组卷：数量超过可用题量时，shortfall 说明差多少而不是报错', async () => {
  const meta = await call('/api/questions/meta', 'GET', undefined, false);
  /* 找一个小章节来触发不足量 */
  const small = meta.topics[meta.topics.length - 1];
  const r = await call('/api/questions/paper', 'POST', { topic: small.name, count: 50, preferTopic: small.name });
  assert.equal(r.status, 200);
  assert.equal(r.total, small.count);
  assert.equal(r.qids.length, Math.min(50, small.count));
  assert.equal(r.shortfall, Math.max(0, 50 - small.count));
});

test('组卷：筛选无结果时返回 404 而不是空卷', async () => {
  const r = await call('/api/questions/paper', 'POST', { topic: '不存在的章节' });
  assert.equal(r.status, 404);
  assert.equal(r.code, 'EMPTY_POOL');
});

test('版本号在多次请求间保持一致', async () => {
  const a = await call('/api/questions?limit=1');
  const b = await call('/api/questions/meta', 'GET', undefined, false);
  assert.equal(a.version, b.version);
});
