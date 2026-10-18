'use strict';
/* 限流的两个绕过面
 *
 * 1. 来源可以被伪造。X-Forwarded-For 是「逗号分隔的一串」，最左边那一段是客户端
 *    自己写进去的，代理只会把自己的观察追加在后面。所以取最左段等于把限流的 key
 *    交给攻击者：他每次请求换一个值，每次都是新桶，永远触发不了上限。
 *    正确做法是取最右一跳，并且只有在「前面确实有代理」时才采信这个头。
 *
 * 2. 就算来源不可伪造，攻击者手里有几个 IP，也能把「每来源 5 次」摊成任意多次。
 *    所以还需要一条不看来源的兜底：同一账号在窗口内的总失败次数也封顶。
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-rl-source-'));
process.env.DATA_DIR = temp;
process.env.JWT_SECRET = 'rl-source-test-secret';
process.env.AUTH_LOGIN_MAX_FAILS = '5';
process.env.AUTH_LOGIN_NAME_MAX = '8';   // 账号维度上限，调小才测得动
process.env.AUTH_REGISTER_MAX = '10';

let server, base;

const call = (p, method, body, headers) => fetch(base + p, {
  method,
  headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}),
  ...(body === undefined ? {} : { body: JSON.stringify(body) })
}).then(async (r) => ({ status: r.status, body: await r.json() }));

const register = (username) => call('/api/auth/register', 'POST', { username, password: 'test123456' });
const login = (username, password, xff) => call('/api/auth/login', 'POST', { username, password },
  xff ? { 'X-Forwarded-For': xff } : undefined);

before(async () => {
  ({ server } = require('../server'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  assert.equal((await register('伪造来源甲')).status, 200);
  assert.equal((await register('换源乙')).status, 200);
});

after(() => { server.close(); });

test('伪造 X-Forwarded-For 的最左段，换不掉限流的桶', async () => {
  /* 每次只改最左段（客户端可写），最右一跳始终是 127.0.0.1。
   * 如果实现取最左段，这里 6 次都会是 401；取最右一跳就会在第 6 次拦住。 */
  for (let i = 1; i <= 5; i++) {
    const r = await login('伪造来源甲', 'wrong-' + i, '10.0.0.' + i + ', 127.0.0.1');
    assert.equal(r.status, 401, '第 ' + i + ' 次应为 401，实际 ' + r.status);
  }
  const blocked = await login('伪造来源甲', 'wrong-6', '10.0.0.99, 127.0.0.1');
  assert.equal(blocked.status, 429, '换最左段不该换到新桶——这说明取的是最左一跳');
});

test('换来源也不能让同一账号无限试：账号维度有兜底上限', async () => {
  /* 每个来源只错一次，所以「每来源 5 次」那条永远不触发；靠账号维度兜底。 */
  for (let i = 1; i <= 8; i++) {
    const r = await login('换源乙', 'wrong-' + i, '203.0.113.' + i);
    assert.equal(r.status, 401, '第 ' + i + ' 个来源应为 401，实际 ' + r.status);
  }
  const blocked = await login('换源乙', 'wrong-9', '203.0.113.99');
  assert.equal(blocked.status, 429, '换到第 9 个来源也该被账号维度拦住');
});

test('换到未用过的来源时，正确密码仍然放行（不冤枉人）', async () => {
  /* 伪造来源甲的「来源维度」已到 5 次，但换个新来源就是新桶；
   * 「账号维度」才 5 次，没到 8，所以应当放行并清零。 */
  const other = await login('伪造来源甲', 'test123456', '203.0.113.200');
  assert.equal(other.status, 200, '未超账号维度上限时，正确密码应放行');
});
