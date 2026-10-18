'use strict';
/* 登录与注册的失败限流
 *
 * 之前这两条公开路由完全没有计数：密码最短只要 6 位，可以对着任意账号无限试。
 * 管理员登录反而有 5 次/10 分钟的锁——权限最高的入口被保护了，几万个普通账号没有。
 *
 * 这里要钉死三件事，少一件都会出事故：
 *   1. 连续失败到上限真的会锁（不是只多一句提示）；
 *   2. **锁的粒度必须带账号名**。线上走反向代理，所有请求看起来来自同一个 IP，
 *      只按 IP 计数，一个人输错就能把全校锁死；
 *   3. 输对一次要把之前的失败清掉，不能让人背着旧账继续被算。
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-ratelimit-'));
process.env.DATA_DIR = temp;
process.env.JWT_SECRET = 'ratelimit-test-secret';
/* 把上限调小，才能在几条请求里验完机制；生产默认值是 5 次 / 60 个。 */
process.env.AUTH_LOGIN_MAX_FAILS = '5';
process.env.AUTH_REGISTER_MAX = '5';
process.env.AUTH_WINDOW_MS = '600000';

let server, base;

const call = (p, method, body, extraHeaders) => fetch(base + p, {
  method,
  headers: Object.assign({ 'Content-Type': 'application/json' }, extraHeaders || {}),
  ...(body === undefined ? {} : { body: JSON.stringify(body) })
}).then(async (r) => ({ status: r.status, body: await r.json() }));

const register = (username, headers) => call('/api/auth/register', 'POST', { username, password: 'test123456' }, headers);
const login = (username, password, headers) => call('/api/auth/login', 'POST', { username, password }, headers);

before(async () => {
  ({ server } = require('../server'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  /* 先用掉 3 个注册额度，给下面的登录用 */
  for (const name of ['限流甲', '限流乙', '限流丙']) {
    assert.equal((await register(name)).status, 200, name + ' 注册失败');
  }
});

after(() => { server.close(); });

test('连续 5 次密码错误后锁定，锁定期间即使密码正确也进不去', async () => {
  for (let i = 1; i <= 5; i++) {
    const r = await login('限流甲', 'wrong-password-' + i);
    assert.equal(r.status, 401, '第 ' + i + ' 次应为 401，实际 ' + r.status);
  }
  const locked = await login('限流甲', 'wrong-password-6');
  assert.equal(locked.status, 429, '第 6 次应被限流');
  assert.match(locked.body.error, /过多/);

  /* 锁就是锁：这段时间里密码对了也不放行，否则爆破者只要蒙中就能进来。 */
  const correct = await login('限流甲', 'test123456');
  assert.equal(correct.status, 429, '锁定期间正确密码也应被挡住');
});

test('锁按账号隔离：一个账号被锁不影响别人', async () => {
  const other = await login('限流乙', 'test123456');
  assert.equal(other.status, 200, '另一个账号不该被牵连');
  assert.ok(other.body.token);
});

test('输对一次会清空之前的失败记录', async () => {
  for (let i = 1; i <= 4; i++) {
    assert.equal((await login('限流丙', 'wrong-' + i)).status, 401);
  }
  assert.equal((await login('限流丙', 'test123456')).status, 200, '第 5 次输对应当成功');
  /* 记录已清零，再错 4 次仍然只是 401，不该直接跳到 429 */
  for (let i = 1; i <= 4; i++) {
    const r = await login('限流丙', 'wrong-again-' + i);
    assert.equal(r.status, 401, '清零后再错第 ' + i + ' 次应为 401，实际 ' + r.status);
  }
});

test('来自不同来源的尝试分开计数（反向代理下不会互相牵连）', async () => {
  /* 限流甲在 127.0.0.1 上已经被锁；换一个 X-Forwarded-For 就是另一个桶 */
  const fromElsewhere = await login('限流甲', 'wrong-from-elsewhere', { 'X-Forwarded-For': '9.9.9.9' });
  assert.equal(fromElsewhere.status, 401, '换了来源应重新计数（401 而不是 429），实际 ' + fromElsewhere.status);
});

test('注册按来源限流：超过上限后 429，换个来源又能继续', async () => {
  assert.equal((await register('限流丁')).status, 200, '第 4 个');
  assert.equal((await register('限流戊')).status, 200, '第 5 个');

  const blocked = await register('限流己');
  assert.equal(blocked.status, 429, '第 6 个应被限流');
  assert.match(blocked.body.error, /频繁/);

  /* 校园网整栋楼一个出口 IP 是常态，所以限额只在同一个来源上生效 */
  const otherNet = await register('限流庚', { 'X-Forwarded-For': '7.7.7.7' });
  assert.equal(otherNet.status, 200, '换来源应能继续注册');
});

test('注册被限流时不会写出半个账号', async () => {
  const r = await register('限流辛');
  assert.equal(r.status, 429);
  /* 用被挡住的那个名字登录，应该是「用户名或密码错误」而不是登录成功 */
  const attempt = await login('限流辛', 'test123456', { 'X-Forwarded-For': '7.7.7.8' });
  assert.equal(attempt.status, 401, '被限流的注册不能留下账号');
});
