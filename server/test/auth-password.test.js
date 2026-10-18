'use strict';
/* 改密码 / 管理员重置密码
 *
 * 之前这两条路都不存在：密码泄露了用户没救，用户忘了密码管理员也没救
 * （后台只有封禁和禁言）。补上之后必须守住一件事——
 * **改完密码，之前签发的 token 立刻失效**。否则密码泄露的人改完，
 * 攻击者那台设备还能拿旧 token 用满 7 天，等于白改。
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-password-'));
process.env.DATA_DIR = temp;
process.env.JWT_SECRET = 'password-test-secret';
delete process.env.ADMIN_USERNAMES;

let server, base, store;

const call = (p, method, body, token) => fetch(base + p, {
  method,
  headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}),
  ...(body === undefined ? {} : { body: JSON.stringify(body) })
}).then(async (r) => ({ status: r.status, body: await r.json() }));

const register = async (username, password) => {
  const r = await call('/api/auth/register', 'POST', { username, password: password || 'test123456' });
  assert.equal(r.status, 200, username + ' 注册失败：' + JSON.stringify(r.body));
  return r.body;
};

let adminToken, adminId, userToken, userId;

before(async () => {
  ({ server } = require('../server'));
  store = require('../lib/store');
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;

  const a = await register('密码管理员');
  adminToken = a.token;
  adminId = a.user.id;
  const users = store.get('users') || {};
  users[adminId].role = 'admin';
  store.set('users', users);

  const u = await register('改密同学');
  userToken = u.token;
  userId = u.user.id;
});

after(() => { server.close(); });

test('改密码：成功后旧 token 立刻失效，新密码可用、旧密码不可用', async () => {
  const r = await call('/api/auth/password', 'PUT', { oldPassword: 'test123456', newPassword: 'new-pass-2026' }, userToken);
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.ok(r.body.token, '应换发一张新 token，否则用户改完密码自己就被踢下线');

  /* 旧 token 必须作废——这是这个功能存在的意义 */
  const old = await call('/api/auth/me', 'GET', undefined, userToken);
  assert.equal(old.status, 401, '改密后旧 token 应当立刻失效');

  const fresh = await call('/api/auth/me', 'GET', undefined, r.body.token);
  assert.equal(fresh.status, 200, '新 token 应可用');

  const byNew = await call('/api/auth/login', 'POST', { username: '改密同学', password: 'new-pass-2026' });
  assert.equal(byNew.status, 200, '新密码应能登录');
  const byOld = await call('/api/auth/login', 'POST', { username: '改密同学', password: 'test123456' });
  assert.equal(byOld.status, 401, '旧密码应失效');

  userToken = r.body.token;  // 后面的用例用新 token
});

test('当前密码不对时拒绝，且原密码仍然有效', async () => {
  const r = await call('/api/auth/password', 'PUT', { oldPassword: 'wrong-old', newPassword: 'another-pass' }, userToken);
  assert.equal(r.status, 401);
  assert.match(r.body.error, /当前密码/);

  const still = await call('/api/auth/login', 'POST', { username: '改密同学', password: 'new-pass-2026' });
  assert.equal(still.status, 200, '被拒绝的请求不能改动任何东西');
});

test('新密码的合法性：太短、与原密码相同、与昵称相同都拒绝', async () => {
  const short = await call('/api/auth/password', 'PUT', { oldPassword: 'new-pass-2026', newPassword: '123' }, userToken);
  assert.equal(short.status, 400);
  assert.match(short.body.error, /至少 6 位/);

  const same = await call('/api/auth/password', 'PUT', { oldPassword: 'new-pass-2026', newPassword: 'new-pass-2026' }, userToken);
  assert.equal(same.status, 400);

  /* 昵称是公开渲染的，密码等于昵称就是把它贴到公屏上。
   * 这里特意用 6 个字的昵称——昵称太短会先被「至少 6 位」拦下，测不到这条规则。 */
  const nickUser = await register('长昵称的同学');
  const asNick = await call('/api/auth/password', 'PUT', { oldPassword: 'test123456', newPassword: '长昵称的同学' }, nickUser.token);
  assert.equal(asNick.status, 400, JSON.stringify(asNick.body));
  assert.match(asNick.body.error, /昵称/);
});

test('未登录不能改密码', async () => {
  const r = await call('/api/auth/password', 'PUT', { oldPassword: 'x', newPassword: 'yyyyyy' });
  assert.equal(r.status, 401);
});

test('管理员重置：用户旧 token 失效，新密码可登录，审计里不出现密码', async () => {
  const r = await call('/api/admin/user-action', 'POST', { uid: userId, action: 'reset-password', password: 'admin-set-888' }, adminToken);
  assert.equal(r.status, 200, JSON.stringify(r.body));

  const old = await call('/api/auth/me', 'GET', undefined, userToken);
  assert.equal(old.status, 401, '被重置的人手上的 token 应当立刻失效');

  const login = await call('/api/auth/login', 'POST', { username: '改密同学', password: 'admin-set-888' });
  assert.equal(login.status, 200, '管理员设的新密码应能登录');

  const audit = await call('/api/admin/audit', 'GET', undefined, adminToken);
  const text = JSON.stringify(audit.body);
  assert.match(text, /reset-password/, '审计里要留痕');
  assert.ok(!text.includes('admin-set-888'), '审计绝不能记录密码明文');
});

test('管理员重置密码也要校验长度，且不能重置自己', async () => {
  const short = await call('/api/admin/user-action', 'POST', { uid: userId, action: 'reset-password', password: '123' }, adminToken);
  assert.equal(short.status, 400);

  const self = await call('/api/admin/user-action', 'POST', { uid: adminId, action: 'reset-password', password: 'whatever-123' }, adminToken);
  assert.equal(self.status, 400, '重置自己会把自己的登录作废，挡掉');
  assert.match(self.body.error, /自己/);
});
