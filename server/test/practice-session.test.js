'use strict';
/* 断点续学（A02）接口测试
 * 覆盖契约要求的关键行为：身份校验、题号校验不静默截断、幂等创建、用户隔离、
 * 版本冲突 409、草稿保存不产生判分、submittedQids 防伪造、结束状态幂等。
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-practice-test-'));
let server, integrations, base, tokenA, tokenB, QIDS;

async function R(method, endpoint, body, token = tokenA) {
  const r = await fetch(base + '/api/practice/session' + endpoint, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  return { status: r.status, ...(await r.json()) };
}

async function getData(token = tokenA) {
  return (await (await fetch(base + '/api/data', { headers: { Authorization: 'Bearer ' + token } })).json()).data || {};
}

before(async () => {
  process.env.DATA_DIR = temp;
  process.env.JWT_SECRET = 'practice-test-secret';
  ({ server, integrations } = require('../server'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  const register = async (username) => (await (await fetch(base + '/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'test123456' })
  })).json()).token;
  tokenA = await register('续学测试甲');
  tokenB = await register('续学测试乙');
  QIDS = [...require('../integrations/questions').questions.keys()].slice(0, 3);
});

after(async () => {
  await integrations.close();
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(temp, { recursive: true, force: true });
});

test('未登录不能创建会话', async () => {
  const r = await R('POST', '', { clientRequestId: 'req-anon-0001', qids: QIDS }, '');
  assert.equal(r.status, 401);
  assert.equal(r.code, 'UNAUTHORIZED');
});

test('题号必须真实存在；超量报错而不是静默截断', async () => {
  const unknown = await R('POST', '', { clientRequestId: 'req-unknown-01', qids: [QIDS[0], 'no-such-qid'] });
  assert.equal(unknown.status, 400);
  assert.equal(unknown.code, 'UNKNOWN_QID');

  const tooMany = await R('POST', '', { clientRequestId: 'req-many-0001', qids: Array(501).fill(QIDS[0]) });
  assert.equal(tooMany.status, 400);
  assert.equal(tooMany.code, 'TOO_MANY_QIDS');
});

test('创建会话返回固定题序与初始进度', async () => {
  const r = await R('POST', '', { clientRequestId: 'req-create-001', qids: QIDS, topic: '函数与极限' });
  assert.equal(r.status, 200);
  assert.equal(r.replayed, false);
  assert.deepEqual(r.session.qids, QIDS);
  assert.equal(r.session.currentIndex, 0);
  assert.equal(r.session.version, 1);
  assert.equal(r.session.status, 'active');
  assert.equal(r.session.topic, '函数与极限');
});

test('同一 clientRequestId 重试返回原会话，不重复建档', async () => {
  const a = await R('POST', '', { clientRequestId: 'req-idem-00001', qids: QIDS });
  const b = await R('POST', '', { clientRequestId: 'req-idem-00001', qids: [QIDS[2]] });
  assert.equal(a.replayed, false);
  assert.equal(b.replayed, true);
  assert.equal(b.session.id, a.session.id);
  assert.deepEqual(b.session.qids, QIDS, '重试不应改写已有题序');
});

test('会话按用户隔离：他人既读不到指定会话，也看不到进行中会话', async () => {
  const own = await R('POST', '', { clientRequestId: 'req-iso-000001', qids: QIDS });
  const id = own.session.id;
  assert.equal((await R('GET', '?id=' + id)).session.id, id);
  assert.equal((await R('GET', '?id=' + id, undefined, tokenB)).status, 404);
  assert.equal((await R('GET', '', undefined, tokenB)).session, null);
});

test('版本不一致返回 409，且不覆盖已有进度', async () => {
  const s = (await R('POST', '', { clientRequestId: 'req-conf-00001', qids: QIDS })).session;
  const ok = await R('PUT', '', { id: s.id, expectedVersion: s.version, currentIndex: 1 });
  assert.equal(ok.status, 200);
  assert.equal(ok.session.currentIndex, 1);
  assert.equal(ok.session.version, s.version + 1);

  const stale = await R('PUT', '', { id: s.id, expectedVersion: s.version, currentIndex: 2 });
  assert.equal(stale.status, 409);
  assert.equal(stale.code, 'VERSION_CONFLICT');

  const kept = await R('GET', '?id=' + s.id);
  assert.equal(kept.session.currentIndex, 1, '冲突不应改动已有进度');
});

test('保存草稿不产生作答记录、错题或复习卡片', async () => {
  const beforeData = await getData();
  const s = (await R('POST', '', { clientRequestId: 'req-draft-00001', qids: QIDS })).session;
  const saved = await R('PUT', '', {
    id: s.id, expectedVersion: s.version, currentIndex: 1,
    drafts: { [QIDS[0]]: { choice: 'A', text: '先配方再求导' } }
  });
  assert.equal(saved.status, 200);
  assert.equal(saved.session.drafts[QIDS[0]].text, '先配方再求导');

  const afterData = await getData();
  assert.equal((afterData.answers || []).length, (beforeData.answers || []).length, '保存草稿不得写入作答记录');
  assert.equal((afterData.mistakes || []).length, (beforeData.mistakes || []).length, '保存草稿不得写入错题');
});

test('submittedQids 只接受真实作答过的题号，伪造被过滤', async () => {
  const s = (await R('POST', '', { clientRequestId: 'req-sub-000001', qids: QIDS })).session;
  const forged = await R('PUT', '', { id: s.id, expectedVersion: s.version, submittedQids: QIDS });
  assert.equal(forged.status, 200);
  assert.deepEqual(forged.session.submittedQids, [], '未作答过的题号必须被丢弃');

  await fetch(base + '/api/data', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tokenA },
    body: JSON.stringify({ data: { answers: [{ qid: QIDS[0], topic: '函数与极限', correct: true, timeMs: Date.now() }] } })
  });
  const real = await R('PUT', '', { id: s.id, expectedVersion: forged.session.version, submittedQids: [QIDS[0], QIDS[1]] });
  assert.deepEqual(real.session.submittedQids, [QIDS[0]], '只保留核对通过的题号');
});

test('currentIndex 越界与草稿越界题号被拒绝', async () => {
  const s = (await R('POST', '', { clientRequestId: 'req-edge-00001', qids: [QIDS[0]] })).session;
  const badIndex = await R('PUT', '', { id: s.id, expectedVersion: s.version, currentIndex: 99 });
  assert.equal(badIndex.status, 400);
  assert.equal(badIndex.code, 'BAD_INDEX');

  const badDraft = await R('PUT', '', { id: s.id, expectedVersion: s.version, drafts: { [QIDS[1]]: { choice: 'A' } } });
  assert.equal(badDraft.status, 400);
  assert.equal(badDraft.code, 'BAD_DRAFTS');
});

test('结束会话只改状态，请求体里的分数不被接受', async () => {
  const s = (await R('POST', '', { clientRequestId: 'req-fin-000001', qids: QIDS })).session;
  const finished = await R('POST', '/finish', { id: s.id, status: 'finished', score: 999, focusMinutes: 999 });
  assert.equal(finished.session.status, 'finished');
  assert.equal(finished.session.score, undefined);
  assert.equal(finished.session.focusMinutes, undefined);

  const again = await R('POST', '/finish', { id: s.id });
  assert.equal(again.replayed, true, '重复结束应幂等');

  const lateSave = await R('PUT', '', { id: s.id, expectedVersion: finished.session.version });
  assert.equal(lateSave.status, 409);
  assert.equal(lateSave.code, 'SESSION_CLOSED');
});
