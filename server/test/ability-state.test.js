'use strict';
/* 能力状态：掌握度口径（A06）
 *
 * 掌握概率是 pyBKT 的模型估计，不是实测分数。这组测试锁定三件事：
 *   1. 接口显式标明 estimated / method / note，前端无法把它当事实展示；
 *   2. 样本量不足时给出 confidence 与提示，而不是给一个看起来很确定的百分比；
 *   3. 没有作答记录的章节**不出现在结果里**（缺数据就缺席，不补 0）。
 *
 * 需要 Python 学习引擎（services/Setup-Learning.ps1）；CI 会安装。
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-ability-'));
let server, integrations, base, token;

async function req(endpoint) {
  const r = await fetch(base + '/api/learning/' + endpoint, {
    headers: { Authorization: 'Bearer ' + token }
  });
  return { status: r.status, ...(await r.json()) };
}

async function putData(data) {
  return fetch(base + '/api/data', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ data })
  });
}

before(async () => {
  process.env.DATA_DIR = temp;
  process.env.JWT_SECRET = 'ability-state-test-secret';
  ({ server, integrations } = require('../server'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  token = (await (await fetch(base + '/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '能力状态甲', password: 'test123456' })
  })).json()).token;
});

after(async () => {
  await integrations.close();
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(temp, { recursive: true, force: true });
});

test('掌握度接口显式标明这是模型估计', async () => {
  await putData({ answers: [{ qid: '7036', topic: '函数与极限', correct: true, timeMs: Date.now() }] });
  const m = await req('mastery');
  assert.equal(m.status, 200);
  assert.equal(m.estimated, true, '必须显式标明 estimated');
  assert.equal(m.method, 'pyBKT');
  assert.match(m.note, /模型估计/, '需要有一句说明这是估计而非实测');
});

test('样本不足时降级置信度并给出提示，而不是给一个看起来很确定的百分比', async () => {
  const m = await req('mastery');
  const t = m.topics['函数与极限'];
  assert.ok(t, '有作答记录的章节应当出现');
  assert.equal(t.estimated, true);
  assert.equal(typeof t.mastery, 'number');
  assert.equal(t.sampleSize, 1);
  assert.equal(t.confidence, 'low');
  assert.match(t.note, /样本不足/);
});

test('没有作答记录的章节不出现在结果里，而不是显示成 0 掌握度', async () => {
  const m = await req('mastery');
  assert.equal(Object.keys(m.topics).length, 1, '只应有唯一一个有数据的章节');
  for (const ghost of ['无穷级数', '行列式', '二次型']) {
    assert.equal(m.topics[ghost], undefined, ghost + ' 没有作答记录，不应出现（更不能是 0）');
  }
});

test('样本累积后置信度随之提升', async () => {
  /* 同一道题重复答只算一次观测（掌握模型按题去重），所以要用同章节的不同题目 */
  const { questions } = require('../integrations/questions');
  const qids = [...questions.values()]
    .filter((q) => q.topic === '函数与极限' && !q.selfAssessed && q.id !== '7036')
    .slice(0, 3)
    .map((q) => q.id);
  assert.equal(qids.length, 3, '该章节应有足够的客观题');

  const answers = qids.map((qid, i) => ({ qid, topic: '函数与极限', correct: true, timeMs: Date.now() + i }));
  await putData({ answers });
  const m = await req('mastery');
  const t = m.topics['函数与极限'];
  assert.ok(t.sampleSize >= 3, '样本数应随不同题目累加，实际 ' + t.sampleSize);
  assert.notEqual(t.confidence, 'low', '样本达到 3 次后不应再是最低置信度');
});

test('学习孪生里的掌握度同样带估计标识', async () => {
  const twin = await req('twin');
  assert.equal(twin.status, 200);
  assert.ok(twin.mastery, '孪生应携带掌握度');
  assert.equal(twin.mastery.estimated, true);
  assert.match(twin.mastery.note, /模型估计/);
});
