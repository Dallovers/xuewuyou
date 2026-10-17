'use strict';
/* 个人自习统计的上报边界（A06）
 * 个人自习计时天然发生在客户端，服务器无法逐秒验证，只能设边界并保持单调。
 * 这组测试锁定「客户端不能凭空上报任意时长」这件事实。
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-study-stats-'));
let server, integrations, base, a, b;
const DAY = '2026-10-17';

async function call(token, method, body) {
  const r = await fetch(base + '/api/study/stats', {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  return { status: r.status, ...(await r.json()) };
}

before(async () => {
  process.env.DATA_DIR = temp;
  process.env.JWT_SECRET = 'study-stats-test-secret';
  ({ server, integrations } = require('../server'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  const register = async (username) => (await (await fetch(base + '/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'test123456' })
  })).json()).token;
  a = await register('统计测试甲');
  b = await register('统计测试乙');
});

after(async () => {
  await integrations.close();
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(temp, { recursive: true, force: true });
});

test('未登录不能写入自习统计', async () => {
  assert.equal((await call(null, 'PUT', { day: DAY, focusMinutes: 10 })).status, 401);
  assert.equal((await call(null, 'GET')).status, 401);
});

test('正常上报可保存，且只升不降（避免回退已累计的专注时间）', async () => {
  assert.equal((await call(a, 'PUT', { day: DAY, focusMinutes: 25, completed: 1 })).stats.focusMinutes, 25);
  assert.equal((await call(a, 'GET')).stats[DAY].focusMinutes, 25);

  /* 再报一个更小的值不应把已有时长抹掉 */
  const lower = await call(a, 'PUT', { day: DAY, focusMinutes: 10 });
  assert.equal(lower.status, 200);
  assert.equal(lower.stats.focusMinutes, 25, '已累计的专注时长不得被下调');
  assert.equal(lower.stats.completed, 1, '已记录的完成数不得被下调');
});

test('单日专注时长有上限：1440 允许，1441 拒绝', async () => {
  const ok = await call(a, 'PUT', { day: '2026-10-18', focusMinutes: 1440 });
  assert.equal(ok.status, 200);
  assert.equal(ok.stats.focusMinutes, 1440);

  const over = await call(a, 'PUT', { day: '2026-10-18', focusMinutes: 1441 });
  assert.equal(over.status, 400);
  assert.match(over.error, /1440/);
});

test('离谱的上报被拒绝，而不是写进统计', async () => {
  for (const value of [1e308, 100000, 999999]) {
    const r = await call(a, 'PUT', { day: '2026-10-19', focusMinutes: value });
    assert.equal(r.status, 400, '值 ' + value + ' 应被拒绝');
  }
  const stored = (await call(a, 'GET')).stats['2026-10-19'];
  assert.equal(stored, undefined, '被拒绝的上报不得留下任何记录');
});

test('负数与非数字被拒绝', async () => {
  assert.equal((await call(a, 'PUT', { day: '2026-10-20', focusMinutes: -5 })).status, 400);
  assert.equal((await call(a, 'PUT', { day: '2026-10-20', focusMinutes: 'abc' })).status, 400);
  assert.equal((await call(a, 'PUT', { day: '2026-10-20', completed: 1e9 })).status, 400);
});

test('日期格式非法被拒绝', async () => {
  assert.equal((await call(a, 'PUT', { day: '2026/10/20', focusMinutes: 10 })).status, 400);
  assert.equal((await call(a, 'PUT', { focusMinutes: 10 })).status, 400);
});

test('统计按账号隔离', async () => {
  const mine = (await call(a, 'GET')).stats;
  const other = (await call(b, 'GET')).stats;
  assert.equal(mine[DAY].focusMinutes, 25);
  assert.equal(other[DAY], undefined, '另一个账号不应看到我的统计');
});
