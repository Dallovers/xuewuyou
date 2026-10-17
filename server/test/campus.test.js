'use strict';
/* 校园状态与世界存档（A05）接口测试
 * 覆盖：身份校验、八地点真实计数、跨用户隔离、位置存档版本冲突、
 * 换版重置、坐标边界，以及「位置不参与任何学习统计」这一硬约束。
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-campus-test-'));
let server, integrations, base, a, b, QID;

async function call(token, endpoint, method = 'GET', body) {
  const r = await fetch(base + endpoint, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  return { status: r.status, ...(await r.json()) };
}

before(async () => {
  process.env.DATA_DIR = temp;
  process.env.JWT_SECRET = 'campus-test-secret';
  ({ server, integrations } = require('../server'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  const register = async (username) => (await (await fetch(base + '/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'test123456' })
  })).json()).token;
  a = await register('校园测试甲');
  b = await register('校园测试乙');
  QID = [...require('../integrations/questions').questions.keys()][0];
});

after(async () => {
  await integrations.close();
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(temp, { recursive: true, force: true });
});

test('未登录不能读取校园状态或位置存档', async () => {
  assert.equal((await call(null, '/api/campus/state')).status, 401);
  assert.equal((await call(null, '/api/world/progress')).status, 401);
  assert.equal((await call(null, '/api/world/progress', 'PUT', {
    worldVersion: 'w1', sceneId: 'campus', position: { x: 0, y: 0, z: 0 }, heading: 0
  })).status, 401);
});

test('校园状态覆盖八个地点，初始为空状态', async () => {
  const r = await call(a, '/api/campus/state');
  assert.equal(r.status, 200);
  assert.equal(r.locations.length, 8);
  assert.deepEqual(r.locations.map((l) => l.id),
    ['bank', 'wenku', 'lab', 'social', 'arena', 'study', 'mistakes', 'report']);
  for (const l of r.locations) {
    assert.equal(typeof l.value, 'number');
    assert.equal(l.hasData, false, l.id + ' 初始应为空状态');
    assert.equal(l.estimated, false);
    assert.ok(l.unit);
  }
  assert.equal(r.worldVersion, null);
});

test('校园状态是当前用户的真实计数，且不跨账号串数据', async () => {
  await call(a, '/api/data', 'PUT', { data: { answers: [{ qid: QID, correct: true, timeMs: Date.now() }], mistakes: [{ qid: QID, question: 'x' }] } });
  await call(a, '/api/learning/board', 'PUT', { qid: QID, version: 0, elements: [], appState: {}, files: {} });

  const mine = await call(a, '/api/campus/state');
  const byId = Object.fromEntries(mine.locations.map((l) => [l.id, l]));
  assert.equal(byId.report.value, 1, '作答数应为 1');
  assert.equal(byId.mistakes.value, 1, '错题数应为 1');
  assert.equal(byId.lab.value, 1, '白板数应为 1');
  assert.equal(byId.bank.value, 1, '已练章节应为 1');
  assert.equal(byId.report.hasData, true);

  const other = await call(b, '/api/campus/state');
  const otherById = Object.fromEntries(other.locations.map((l) => [l.id, l]));
  assert.equal(otherById.report.value, 0, '另一账号不应看到别人的作答');
  assert.equal(otherById.lab.value, 0);
  assert.equal(otherById.bank.value, 0);
});

test('位置存档：初次为 null，保存后可读回', async () => {
  assert.equal((await call(a, '/api/world/progress')).progress, null);

  const saved = await call(a, '/api/world/progress', 'PUT', {
    worldVersion: 'w2026-10', sceneId: 'campus', position: { x: 12.5, y: 0, z: -3.25 }, heading: 1.57
  });
  assert.equal(saved.status, 200);
  assert.equal(saved.progress.version, 1);
  assert.equal(saved.reset, false);
  assert.equal(saved.progress.position.x, 12.5);

  const read = await call(a, '/api/world/progress');
  assert.equal(read.progress.sceneId, 'campus');
  assert.equal(read.progress.heading, 1.57);
  assert.equal(read.progress.version, 1);
});

test('位置存档：版本不一致返回 409 且不覆盖', async () => {
  const ok = await call(a, '/api/world/progress', 'PUT', {
    worldVersion: 'w2026-10', sceneId: 'campus', position: { x: 1, y: 0, z: 1 }, heading: 0, expectedVersion: 1
  });
  assert.equal(ok.status, 200);
  assert.equal(ok.progress.version, 2);

  const stale = await call(a, '/api/world/progress', 'PUT', {
    worldVersion: 'w2026-10', sceneId: 'campus', position: { x: 9, y: 0, z: 9 }, heading: 0, expectedVersion: 1
  });
  assert.equal(stale.status, 409);
  assert.equal(stale.code, 'VERSION_CONFLICT');

  const kept = await call(a, '/api/world/progress');
  assert.equal(kept.progress.position.x, 1, '冲突不应覆盖已有位置');
  assert.equal(kept.progress.version, 2);
});

test('换 worldVersion 视为新世界：旧位置失效并返回 reset', async () => {
  const reset = await call(a, '/api/world/progress', 'PUT', {
    worldVersion: 'w2026-11', sceneId: 'campus', position: { x: 0, y: 0, z: 0 }, heading: 0
  });
  assert.equal(reset.status, 200);
  assert.equal(reset.reset, true);
  assert.equal(reset.progress.version, 1, '新世界版本从 1 重新计');
  assert.equal(reset.progress.worldVersion, 'w2026-11');
});

test('位置存档：非法坐标被拒绝', async () => {
  const bad = [
    { worldVersion: 'w2026-11', sceneId: 'campus', position: { x: NaN, y: 0, z: 0 } },
    { worldVersion: 'w2026-11', sceneId: 'campus', position: { x: 0, y: 0 } },
    { worldVersion: 'w2026-11', sceneId: 'campus', position: { x: 999999, y: 0, z: 0 } },
    { worldVersion: 'w2026-11', sceneId: 'campus', position: { x: 0, y: 99999, z: 0 } },
    { worldVersion: 'w2026-11', sceneId: 'campus', position: { x: 0, y: 0, z: 0 }, heading: 'len' },
    { sceneId: 'campus', position: { x: 0, y: 0, z: 0 } }
  ];
  for (const body of bad) {
    const r = await call(a, '/api/world/progress', 'PUT', body);
    assert.equal(r.status, 400, JSON.stringify(body).slice(0, 60));
  }
});

test('位置存档不公开给其他用户，也不影响学习统计', async () => {
  const beforeData = (await call(a, '/api/data')).data || {};
  const beforeCount = (beforeData.answers || []).length;

  await call(a, '/api/world/progress', 'PUT', {
    worldVersion: 'w2026-11', sceneId: 'campus', position: { x: 2, y: 0, z: 2 }, heading: 0, expectedVersion: 1
  });

  const afterData = (await call(a, '/api/data')).data || {};
  assert.equal((afterData.answers || []).length, beforeCount, '位置存档不得写入作答记录');
  assert.equal((afterData.mistakes || []).length, (beforeData.mistakes || []).length, '位置存档不得写入错题');

  assert.equal((await call(b, '/api/world/progress')).progress, null, '他人读不到我的位置');
});
