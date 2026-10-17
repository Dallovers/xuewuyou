#!/usr/bin/env node
'use strict';
/* 授予 / 取消管理员
 *
 *   node scripts/grant-admin.js --list              查看当前管理员
 *   node scripts/grant-admin.js <用户名>             设为管理员
 *   node scripts/grant-admin.js <用户名> --revoke    取消管理员
 *
 * 为什么要用脚本而不是「第一个注册的人自动是管理员」：
 *   那样等于把后台送给了第一个抢注的人。管理员身份必须是维护者手动指定的。
 *
 * 注意：store 是按进程缓存的，脚本改完文件后，正在运行的服务看不到这次改动，
 * 还会在下次写库时把它覆盖回去。所以**改完要重启服务**（脚本会提示）。
 */
const store = require('../lib/store');
const { ADMIN_ROLE } = require('../lib/moderation');

const args = process.argv.slice(2);
const list = args.includes('--list');
const revoke = args.includes('--revoke');
const username = args.find((a) => !a.startsWith('--'));

const users = store.get('users') || {};
const all = Object.values(users);
const admins = all.filter((u) => u.role === ADMIN_ROLE);

if (list) {
  if (!admins.length) {
    console.log('当前没有管理员。用 node scripts/grant-admin.js <用户名> 指定一个。');
    process.exit(0);
  }
  console.log('当前管理员（' + admins.length + ' 个）：');
  admins.forEach((u) => console.log('  ' + u.username + '\t' + u.id + '\t注册于 ' + new Date(u.createdAt || 0).toLocaleString('zh-CN')));
  process.exit(0);
}

if (!username) {
  console.error('用法：node scripts/grant-admin.js <用户名> [--revoke] ｜ node scripts/grant-admin.js --list');
  process.exit(2);
}

const target = all.find((u) => u.username === username);
if (!target) {
  console.error('找不到用户名为「' + username + '」的账号。先让这个账号注册一次。');
  process.exit(1);
}

if (revoke) {
  if (target.role !== ADMIN_ROLE) {
    console.error('「' + username + '」本来就不是管理员。');
    process.exit(1);
  }
  if (admins.length <= 1) {
    console.error('这是最后一个管理员，取消后没人能进后台了。先指定另一个管理员再撤这个。');
    process.exit(1);
  }
  delete target.role;
  store.set('users', users);
  console.log('已取消「' + username + '」的管理员身份。');
} else {
  if (target.role === ADMIN_ROLE) {
    console.log('「' + username + '」已经是管理员，无需重复操作。');
    process.exit(0);
  }
  target.role = ADMIN_ROLE;
  store.set('users', users);
  console.log('已把「' + username + '」设为管理员。');
}

/* 审计：脚本操作也要留痕，不然「谁把我设成管理员」这件事查不出来 */
const log = store.get('adminAudit', 'log', []);
if (Array.isArray(log)) {
  log.unshift({
    id: 'cli-' + Date.now(),
    at: Date.now(),
    actor: { id: 'cli', username: '命令行' },
    action: revoke ? 'demote' : 'promote',
    target: { id: target.id, username: target.username },
    detail: 'grant-admin.js'
  });
  store.set('adminAudit', 'log', log.slice(0, 500));
}

console.log('⚠ 正在运行的服务读的是自己的缓存，请重启服务后再生效。');
