'use strict';
/* ADMIN_USERNAMES 引导：必须在 start() 里、并处在 store.run() 事务内执行
 *
 * 最初它写在 server.js 的模块顶层。配了 DATABASE_URL 时存储层切到 store-postgres，
 * 它的每次读写都要求处在事务里，于是模块加载阶段就抛「数据库操作必须在活动事务内执行」，
 * 进程直接退出。产生的现象极具迷惑性：
 *   进程起不来 → 健康检查不过 → Render 保留旧版本继续服务 → 看起来就是「部署了但没生效」。
 *
 * 而这条路径只在「DATABASE_URL + ADMIN_USERNAMES 同时配了」的生产环境才走到，
 * 本地走 JSON 文件存储没有任何事务约束，所以本地怎么试都是好的。
 *
 * 下面两条用例钉的就是顺序：require 阶段不许碰存储，start() 之后才允许提升。
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-bootstrap-'));
process.env.DATA_DIR = temp;
process.env.JWT_SECRET = 'bootstrap-test-secret';
process.env.ADMIN_USERNAMES = '引导同学';

/* 在 require server 之前把账号直接写进文件存储，模拟「线上已经注册过的账号」。
 * 有了这个"本该被提升"的账号，才能用它的 role 判断引导到底发生在什么时候。 */
fs.writeFileSync(path.join(temp, 'users.json'), JSON.stringify({
  u_boot_1: {
    id: 'u_boot_1',
    username: '引导同学',
    passHash: 'salt:hash',
    nick: '引导同学',
    createdAt: Date.now()
  }
}), 'utf8');

let server, start, store;

before(() => {
  ({ server, start } = require('../server'));
  store = require('../lib/store');
});

after(() => {
  try { server.close(); } catch (e) {}
});

test('require 阶段不碰存储：加载完还没被提升', () => {
  const users = store.get('users') || {};
  assert.ok(users.u_boot_1, '预置账号应能被读到');
  assert.equal(users.u_boot_1.role, undefined,
    'require 阶段就提升，说明引导又跑回模块顶层了——生产环境会启动即崩');
});

test('start() 之后完成提升（如果这里没过，说明引导没挂进启动流程）', async () => {
  await start(0, '127.0.0.1');
  const users = store.get('users') || {};
  assert.equal(users.u_boot_1.role, 'admin');
});
