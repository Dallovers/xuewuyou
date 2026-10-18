'use strict';
/* 管理员后台（A01 认证面的延伸）
 *
 * 覆盖四类，都是「没有就等于没有后台」的东西：
 *   1. 权限：未登录 401、普通用户 403，一个接口都不能漏
 *   2. 数据：账号/留言列表能看，但**绝不能把 passHash 带出去**
 *   3. 处罚：禁言真的挡住发留言，封号真的让已签发的 token 立刻失效
 *   4. 约束：不能封自己、不能封另一个管理员、不能撤掉最后一个管理员、每次操作都要留审计
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-admin-'));
process.env.DATA_DIR = temp;
process.env.JWT_SECRET = 'admin-test-secret';
delete process.env.ADMIN_USERNAMES;

let server, integrations, base, store;
let adminToken, adminId, userToken, userId, otherToken;

const call = (p, method, body, token) => fetch(base + p, {
  method,
  headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}),
  ...(body === undefined ? {} : { body: JSON.stringify(body) })
}).then(async (r) => ({ status: r.status, body: await r.json() }));

const register = async (username) => {
  const r = await call('/api/auth/register', 'POST', { username, password: 'test123456' });
  assert.equal(r.status, 200, username + ' 注册失败：' + JSON.stringify(r.body));
  return r.body;
};

before(async () => {
  ({ server, integrations } = require('../server'));
  store = require('../lib/store');
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;

  const a = await register('后台管理员');
  adminToken = a.token;
  adminId = a.user.id;
  /* 管理员身份用改库的方式给，和 scripts/grant-admin.js 做的事一样 */
  const users = store.get('users') || {};
  users[adminId].role = 'admin';
  store.set('users', users);

  const u = await register('普通同学甲');
  userToken = u.token;
  userId = u.user.id;
  const o = await register('普通同学乙');
  otherToken = o.token;
});

after(async () => {
  await integrations.close();
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(temp, { recursive: true, force: true });
});

test('未登录 401、普通用户 403：管理接口一个都不能漏', async () => {
  const gets = ['overview', 'users', 'posts', 'audit'];
  for (const p of gets) {
    const anon = await call('/api/admin/' + p, 'GET');
    assert.equal(anon.status, 401, 'GET /api/admin/' + p + ' 匿名应 401');
    const normal = await call('/api/admin/' + p, 'GET', undefined, userToken);
    assert.equal(normal.status, 403, 'GET /api/admin/' + p + ' 普通用户应 403');
  }
  const act = await call('/api/admin/user-action', 'POST', { action: 'ban', uid: adminId }, userToken);
  assert.equal(act.status, 403, '普通用户不能调处罚接口');
});

test('总览能看账号数、在线数与留言数', async () => {
  /* 先制造一个「在线」心跳 */
  const beat = await call('/api/study/presence', 'PUT', {}, userToken);
  assert.equal(beat.status, 200);

  const r = await call('/api/admin/overview', 'GET', undefined, adminToken);
  assert.equal(r.status, 200);
  assert.ok(r.body.users.total >= 3, '注册数应包含三个测试账号');
  assert.equal(r.body.users.admins, 1);
  assert.ok(r.body.online >= 1, '打过心跳的账号应算在线');
  assert.equal(typeof r.body.posts.total, 'number');
});

test('账号列表能看到状态，但绝不能带出 passHash', async () => {
  const r = await call('/api/admin/users', 'GET', undefined, adminToken);
  assert.equal(r.status, 200);
  const raw = JSON.stringify(r.body);
  assert.ok(!/passHash/.test(raw), '响应里不能出现 passHash 字段');
  assert.ok(!/hash/i.test(raw), '响应里不应出现任何哈希痕迹');
  const me = r.body.items.find((u) => u.id === userId);
  assert.ok(me, '应能查到普通账号');
  assert.equal(me.banned, false);
  assert.equal(me.muted, false);
  assert.equal(me.role, null);
  assert.equal(me.username, '普通同学甲');

  /* 搜索也要能用 */
  const q = await call('/api/admin/users?q=' + encodeURIComponent('同学乙'), 'GET', undefined, adminToken);
  assert.equal(q.status, 200);
  assert.equal(q.body.total, 1);
});

test('禁言：发留言被 403 挡住，解禁后恢复', async () => {
  const mute = await call('/api/admin/user-action', 'POST', { action: 'mute', uid: userId, minutes: 30, reason: '刷屏' }, adminToken);
  assert.equal(mute.status, 200);
  assert.equal(mute.body.user.muted, true);
  assert.equal(mute.body.user.muteReason, '刷屏');

  const blocked = await call('/api/community/posts', 'POST', { text: '被禁言还能发吗' }, userToken);
  assert.equal(blocked.status, 403, '被禁言时发留言必须被拒');
  assert.match(blocked.body.error, /禁言/);
  assert.match(blocked.body.error, /刷屏/, '拒绝理由里应带出管理员填写的原因');

  /* 被禁言不影响只读 */
  const read = await call('/api/community/posts', 'GET', undefined, userToken);
  assert.equal(read.status, 200, '禁言不该挡住浏览');

  const unmute = await call('/api/admin/user-action', 'POST', { action: 'unmute', uid: userId }, adminToken);
  assert.equal(unmute.status, 200);
  const ok = await call('/api/community/posts', 'POST', { text: '解禁后可以发了' }, userToken);
  assert.equal(ok.status, 200, '解禁后应能发留言');
});

test('禁言时长有下限和上限，乱传被拒', async () => {
  for (const minutes of [0, -5, 60 * 24 * 31, 'abc']) {
    const r = await call('/api/admin/user-action', 'POST', { action: 'mute', uid: userId, minutes }, adminToken);
    assert.equal(r.status, 400, '时长 ' + minutes + ' 应被拒');
  }
});

test('封号：已签发的 token 立刻失效，登录也进不来', async () => {
  const ban = await call('/api/admin/user-action', 'POST', { action: 'ban', uid: userId, reason: '违规内容' }, adminToken);
  assert.equal(ban.status, 200);
  assert.equal(ban.body.user.banned, true);

  /* token 是封号之前签发的，这里必须是 401 —— 否则封号形同虚设 */
  const stale = await call('/api/auth/me', 'GET', undefined, userToken);
  assert.equal(stale.status, 401, '封号后旧 token 必须立即失效');

  const data = await call('/api/data', 'GET', undefined, userToken);
  assert.equal(data.status, 401, '封号后所有受保护接口都应拒绝');

  const login = await call('/api/auth/login', 'POST', { username: '普通同学甲', password: 'test123456' });
  assert.equal(login.status, 403, '封号后不允许登录');
  assert.match(login.body.error, /封禁/);
  assert.match(login.body.error, /违规内容/);

  /* 密码错时不能透出封禁状态，避免拿来探测账号 */
  const wrong = await call('/api/auth/login', 'POST', { username: '普通同学甲', password: 'wrong-password' });
  assert.equal(wrong.status, 401);
  assert.match(wrong.body.error, /用户名或密码错误/);

  const unban = await call('/api/admin/user-action', 'POST', { action: 'unban', uid: userId }, adminToken);
  assert.equal(unban.status, 200);
  const back = await call('/api/auth/login', 'POST', { username: '普通同学甲', password: 'test123456' });
  assert.equal(back.status, 200, '解封后应能重新登录');
  userToken = back.body.token;
});

test('不能封自己、不能封另一个管理员、不能撤掉最后一个管理员', async () => {
  const self = await call('/api/admin/user-action', 'POST', { action: 'ban', uid: adminId }, adminToken);
  assert.equal(self.status, 400);
  assert.match(self.body.error, /不能对自己/);

  const selfDemote = await call('/api/admin/user-action', 'POST', { action: 'demote', uid: adminId }, adminToken);
  assert.equal(selfDemote.status, 400);

  /* 再提一个管理员，然后验证「不能处罚管理员」 */
  const users = store.get('users') || {};
  const ids = Object.keys(users);
  const second = ids.find((id) => users[id].username === '普通同学乙');
  users[second].role = 'admin';
  store.set('users', users);

  const banAdmin = await call('/api/admin/user-action', 'POST', { action: 'ban', uid: second }, adminToken);
  assert.equal(banAdmin.status, 400);
  assert.match(banAdmin.body.error, /取消其管理员身份/);

  /* 撤掉一个可以，但撤到只剩一个就不行 */
  const demote = await call('/api/admin/user-action', 'POST', { action: 'demote', uid: second }, adminToken);
  assert.equal(demote.status, 200);
  const last = await call('/api/admin/user-action', 'POST', { action: 'demote', uid: adminId }, adminToken);
  assert.equal(last.status, 400);
  assert.match(last.body.error, /不能对自己|至少要保留/);
});

test('留言可以下架与恢复，作者自删的不能恢复', async () => {
  const mine = await call('/api/community/posts', 'POST', { text: '这条会被管理员下架' }, userToken);
  assert.equal(mine.status, 200);
  const pid = mine.body.post.id;

  const del = await call('/api/admin/post-action', 'POST', { action: 'delete', id: pid }, adminToken);
  assert.equal(del.status, 200);
  assert.equal(del.body.post.deleted, true);
  assert.equal(del.body.post.text, '', '下架后正文应清空');

  const list = await call('/api/admin/posts?filter=removed', 'GET', undefined, adminToken);
  assert.ok(list.body.items.some((p) => p.id === pid), '下架后应能在列表里查到');

  /* 回归：下架后原文不能跟着公开列表发出去。
   * moderatedText 是给「恢复」留的备份，publicPost 之前整条展开把它一起下发了 ——
   * 前端不渲染，但任何人打开网络面板都能看到原文，等于没删干净。 */
  const publicList = await call('/api/community/posts', 'GET', undefined, userToken);
  assert.equal(publicList.status, 200);
  assert.ok(!JSON.stringify(publicList.body).includes('这条会被管理员下架'),
    '下架后原文不应出现在公开留言列表里');
  assert.ok(!/moderatedText/.test(JSON.stringify(publicList.body)),
    '公开列表不应带出 moderatedText 这类管理侧字段');

  const restore = await call('/api/admin/post-action', 'POST', { action: 'restore', id: pid }, adminToken);
  assert.equal(restore.status, 200);
  assert.equal(restore.body.post.text, '这条会被管理员下架', '恢复应还原原文');

  /* 作者自己删的没有留底，不能恢复 */
  await call('/api/community/posts', 'DELETE', { id: pid }, userToken);
  const cannot = await call('/api/admin/post-action', 'POST', { action: 'restore', id: pid }, adminToken);
  assert.equal(cannot.status, 409);
});

test('管理员登录：正确密码换 token，错密码与普通账号一律同码同文案', async () => {
  const ok = await call('/api/admin/login', 'POST', { username: '后台管理员', password: 'test123456' });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.token, '应换到 token');
  assert.equal(ok.body.user.role, 'admin');
  assert.ok(!/passHash|hash/i.test(JSON.stringify(ok.body)), '登录响应也不能带出哈希');

  /* 换到的 token 直接能用 */
  const overview = await call('/api/admin/overview', 'GET', undefined, ok.body.token);
  assert.equal(overview.status, 200);

  const wrongPass = await call('/api/admin/login', 'POST', { username: '后台管理员', password: 'nope-nope-nope' });
  assert.equal(wrongPass.status, 401);

  /* 密码正确但不是管理员：必须和「密码错」同样的状态码与文案，
   * 否则这个接口就成了「谁是管理员」的探测器 */
  const notAdmin = await call('/api/admin/login', 'POST', { username: '普通同学乙', password: 'test123456' });
  assert.equal(notAdmin.status, 401);
  assert.equal(notAdmin.body.error, wrongPass.body.error, '两种失败必须给出相同文案');
  assert.equal(notAdmin.body.token, undefined, '非管理员不能拿到 token');

  const ghost = await call('/api/admin/login', 'POST', { username: '根本不存在的人', password: 'whatever' });
  assert.equal(ghost.status, 401);
  assert.equal(ghost.body.error, wrongPass.body.error, '账号不存在也不能有区别');
});

test('管理员登录的失败限流：连续失败后短暂锁定', async () => {
  const bad = { username: '限流测试目标', password: 'wrong' };
  for (let i = 1; i <= 5; i++) {
    const r = await call('/api/admin/login', 'POST', bad);
    assert.equal(r.status, 401, '第 ' + i + ' 次应为 401，实际 ' + r.status);
  }
  const locked = await call('/api/admin/login', 'POST', bad);
  assert.equal(locked.status, 429, '第 6 次应被限流');
  assert.match(locked.body.error, /次数过多/);
});

test('ADMIN_USERNAMES 引导：只提升已存在的账号，且幂等', async () => {
  const { admin } = require('../server');
  const first = admin.promoteByUsername(['普通同学甲', '根本不存在的账号']);
  assert.deepEqual(first, ['普通同学甲'], '只应提升已存在的那个账号');

  const again = admin.promoteByUsername(['普通同学甲']);
  assert.deepEqual(again, [], '重复引导不应重复提升');

  const me = await call('/api/auth/login', 'POST', { username: '普通同学甲', password: 'test123456' });
  assert.equal(me.body.user.role, 'admin', '引导后登录返回的角色应是管理员');
  const list = await call('/api/admin/users?filter=admin', 'GET', undefined, me.body.token);
  assert.ok(list.body.total >= 2, '筛选管理员应能筛出两个');
});

test('每次处罚都写审计：谁、对谁、做了什么', async () => {
  const r = await call('/api/admin/audit', 'GET', undefined, adminToken);
  assert.equal(r.status, 200);
  const actions = r.body.items.map((x) => x.action);
  for (const expected of ['ban', 'unban', 'mute', 'unmute', 'post-delete']) {
    assert.ok(actions.includes(expected), '审计里应有 ' + expected + ' 记录');
  }
  const item = r.body.items.find((x) => x.action === 'ban');
  assert.equal(item.actor.username, '后台管理员', '要记清是谁操作的');
  assert.equal(item.target.username, '普通同学甲', '要记清被处理的是谁');
  assert.ok(item.at > 0);
});

test('统一显示名：只改与用户名不同的账号，可重复执行，并留审计', async () => {
  /* 造一个有自定义昵称的账号 */
  const a = await register('统一测试甲');
  const renamed = await call('/api/auth/profile', 'PUT', { nick: '自定义昵称甲' }, a.token);
  assert.equal(renamed.body.user.nick, '自定义昵称甲', '先把昵称改成和用户名不同');

  const first = await call('/api/admin/unify-nicks', 'POST', {}, adminToken);
  assert.equal(first.status, 200, JSON.stringify(first.body));
  assert.ok(first.body.changed >= 1, '应至少改掉一个');

  const me = await call('/api/auth/me', 'GET', undefined, a.token);
  assert.equal(me.body.user.nick, '统一测试甲', '显示名应等于用户名');

  /* 再执行一次：没有可改的，不该反复写库 */
  const again = await call('/api/admin/unify-nicks', 'POST', {}, adminToken);
  assert.equal(again.body.changed, 0, '幂等：第二次应为 0');

  const audit = await call('/api/admin/audit', 'GET', undefined, adminToken);
  assert.ok(audit.body.items.some((x) => x.action === 'unify-nicks'), '审计里要留痕');
});

test('统一显示名要有管理员权限', async () => {
  /* 注意：userToken 那个账号在后面的 ADMIN_USERNAMES 用例里已经被提成管理员了，
     所以这里必须现注册一个普通账号来验权限，不能复用。 */
  const fresh = await register('无权测试丙');
  const denied = await call('/api/admin/unify-nicks', 'POST', {}, fresh.token);
  assert.equal(denied.status, 403, '普通用户不能触发批量改名');

  const anonymous = await call('/api/admin/unify-nicks', 'POST', {});
  assert.equal(anonymous.status, 401, '未登录更不能');
});
