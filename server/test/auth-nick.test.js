'use strict';
/* 昵称不得等于密码（A01 认证面）
 *
 * 起因：有用户反馈「登录后名字不是自己设的，而是密码」。查下来代码没有把密码写进
 * 昵称的地方，真正的原因是昵称输入框没有 autocomplete 提示，浏览器密码管理器把密码
 * 自动填了进去；而服务端当时来者不拒，把密码明文存成了 nick。昵称在留言板、学习
 * 搭子、自习室里都是直接渲染的，等于把密码贴在公屏上。
 *
 * 所以这里锁三件事：
 *   1. 注册时昵称等于密码 → 拒绝
 *   2. 改昵称时设成密码 → 拒绝
 *   3. 已经存成密码的脏数据 → 登录时自动改回用户名，并回传 nickReset
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-auth-nick-'));
process.env.DATA_DIR = temp;
process.env.JWT_SECRET = 'auth-nick-test-secret';

let server, integrations, base, store, auth;
const PASSWORD = 'Secret123';

const post = (p, body, token) => fetch(base + p, {
  method: 'POST',
  headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}),
  body: JSON.stringify(body)
}).then(async (r) => ({ status: r.status, body: await r.json() }));

const put = (p, body, token) => fetch(base + p, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
  body: JSON.stringify(body)
}).then(async (r) => ({ status: r.status, body: await r.json() }));

before(async () => {
  ({ server, integrations } = require('../server'));
  store = require('../lib/store');
  auth = require('../lib/auth');
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});

after(async () => {
  await integrations.close();
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(temp, { recursive: true, force: true });
});

test('注册时昵称等于密码被拒绝，且不会建出账号', async () => {
  const r = await post('/api/auth/register', { username: '昵称即密码', password: PASSWORD, nick: PASSWORD });
  assert.equal(r.status, 400);
  assert.match(r.body.error, /昵称不能与密码相同/);

  /* 确定没建成：用同样的用户名再注一次，应是「可注册」而不是「已存在」 */
  const again = await post('/api/auth/register', { username: '昵称即密码', password: PASSWORD, nick: '正常的昵称' });
  assert.equal(again.status, 200, '第一次被拒后不应留下半成品账号');
  assert.equal(again.body.user.nick, '正常的昵称');
});

test('昵称留空时回落为用户名，正常昵称原样保存', async () => {
  const empty = await post('/api/auth/register', { username: '昵称留空丙', password: PASSWORD });
  assert.equal(empty.status, 200);
  assert.equal(empty.body.user.nick, '昵称留空丙', '昵称留空必须回落为用户名，绝不能是密码');

  const named = await post('/api/auth/register', { username: '有昵称丁', password: PASSWORD, nick: '  阿丁  ' });
  assert.equal(named.body.user.nick, '阿丁', '昵称应去掉首尾空格');
});

test('改昵称时设成密码被拒绝，正常昵称可以改', async () => {
  const reg = await post('/api/auth/register', { username: '改昵称戊', password: PASSWORD, nick: '小戊' });
  const token = reg.body.token;

  const bad = await put('/api/auth/profile', { nick: PASSWORD }, token);
  assert.equal(bad.status, 400);
  assert.match(bad.body.error, /昵称不能与密码相同/);

  const me1 = await fetch(base + '/api/auth/me', { headers: { Authorization: 'Bearer ' + token } }).then((r) => r.json());
  assert.equal(me1.user.nick, '小戊', '被拒绝后昵称不能变');

  const ok = await put('/api/auth/profile', { nick: '新昵称' }, token);
  assert.equal(ok.status, 200);
  assert.equal(ok.body.user.nick, '新昵称');
});

test('已存成密码的脏数据：登录时自动改回用户名并回传 nickReset', async () => {
  /* 直接写库，模拟修复前注册出来的账号 */
  const id = 'dirty-nick-user';
  const users = store.get('users') || {};
  users[id] = {
    id, username: '历史脏数据', passHash: auth.hashPassword(PASSWORD), nick: PASSWORD, createdAt: Date.now()
  };
  store.set('users', users);

  const login = await post('/api/auth/login', { username: '历史脏数据', password: PASSWORD });
  assert.equal(login.status, 200);
  assert.equal(login.body.nickReset, true, '应告诉前端昵称被修正过');
  assert.equal(login.body.user.nick, '历史脏数据', '昵称应改回用户名，不能继续是密码');

  /* 落库了：/me 也要读到修好的昵称 */
  const me = await fetch(base + '/api/auth/me', { headers: { Authorization: 'Bearer ' + login.body.token } }).then((r) => r.json());
  assert.equal(me.user.nick, '历史脏数据');

  /* 再登录一次不应重复报 nickReset */
  const again = await post('/api/auth/login', { username: '历史脏数据', password: PASSWORD });
  assert.equal(again.body.nickReset, false);
});

test('超长密码整串当昵称也要被拒（先截断再比较会漏掉前缀）', async () => {
  const longPass = 'A1' + 'x'.repeat(30); // 32 位，超过昵称 20 字上限
  const r = await post('/api/auth/register', { username: '超长密码庚', password: longPass, nick: longPass });
  assert.equal(r.status, 400, '密码超过 20 位时，先截断再比较就会漏过检查');
  assert.match(r.body.error, /昵称不能与密码相同/);
});

test('正常登录不会被误伤', async () => {
  const reg = await post('/api/auth/register', { username: '正常账号己', password: PASSWORD, nick: '小己' });
  const login = await post('/api/auth/login', { username: '正常账号己', password: PASSWORD });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.nick, '小己');
  assert.equal(login.body.nickReset, false);
  assert.equal(reg.body.user.nick, '小己');
});
