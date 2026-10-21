#!/usr/bin/env node
'use strict';
/* 社交广场 · 好友与留言的真实业务闭环（双账号）
 *
 * 对正在运行的后端走一遍 3D 场景里两个交互点对应的业务流程：
 *   服务台  → /api/community/home  → 发申请 → 对方接受 → 双方好友列表
 *   公告栏  → /api/community/posts → 发留言 → 另一账号可见 → 删除后不可见
 *
 * 纯 HTTP，不依赖服务端源码，能打本地也能打部署。
 *   node scripts/community-friend-e2e.js http://127.0.0.1:3000
 *
 * 退出码：全通过 0，有失败 1。
 */

const BASE = (process.argv[2] || process.env.E2E_BASE || 'http://127.0.0.1:3000').replace(/\/+$/, '');
const TIMEOUT = Number(process.env.E2E_TIMEOUT || 20000);
const stamp = Date.now().toString(36);

const rows = [];
let failed = 0;

function check(name, ok, detail) {
  rows.push({ name, ok, detail: detail || '' });
  if (!ok) failed++;
  console.log((ok ? '  PASS  ' : '  FAIL  ') + name + (detail ? '  — ' + detail : ''));
}

async function call(method, path, body, token) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(TIMEOUT),
  });
  let json = null;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, body: json };
}

async function register(tag) {
  const username = 'e2e' + tag + stamp;
  const password = 'E2e' + stamp + '!';
  const r = await call('POST', '/api/auth/register', { username, password });
  if (r.status !== 200 || !r.body || !r.body.token) {
    throw new Error('注册失败 ' + username + ' status=' + r.status + ' body=' + JSON.stringify(r.body).slice(0, 200));
  }
  return { username, password, token: r.body.token, id: r.body.user && r.body.user.id };
}

async function publishProfile(account, subjects) {
  return call('PUT', '/api/community/profile', {
    nick: account.username,
    visible: true,
    subjects,
    goal: 'E2E 验证账号',
    availability: '晚间',
  }, account.token);
}

(async () => {
  console.log('base:', BASE);
  console.log('');

  // 1. 两个账号
  const alice = await register('a');
  const bob = await register('b');
  check('注册两个账号', true, alice.username + ' / ' + bob.username);

  // 2. 双方公开搭子名片（否则目录里发现不了）
  const pa = await publishProfile(alice, ['高等数学']);
  const pb = await publishProfile(bob, ['高等数学', '英语']);
  check('A 公开名片', pa.status === 200 && pa.body && pa.body.ok === true, 'status=' + pa.status);
  check('B 公开名片', pb.status === 200 && pb.body && pb.body.ok === true, 'status=' + pb.status);

  // 3. A 在 directory 里能看到 B（服务台打开时读的就是这个）
  const homeA1 = await call('GET', '/api/community/home', undefined, alice.token);
  const seesB = !!(homeA1.body && homeA1.body.directory || []).find((p) => p.id === bob.id);
  check('A 的服务台目录里有 B', seesB, 'directory=' + ((homeA1.body && homeA1.body.directory || []).length) + ' 人');

  // 4. A 发好友申请（服务台 → 邀请成为搭子）
  const reqRes = await call('POST', '/api/community/request', { to: bob.id, message: '一起学高数' }, alice.token);
  const reqId = reqRes.body && reqRes.body.request && reqRes.body.request.id;
  check('A 发送好友申请', reqRes.status === 200 && !!reqId, 'requestId=' + (reqId || 'none'));

  // 5. B 的待处理邀请里能看到
  const homeB1 = await call('GET', '/api/community/home', undefined, bob.token);
  const pendingForB = !!(homeB1.body && homeB1.body.requests || []).find((r) => r.id === reqId && r.to === bob.id);
  check('B 收到待处理邀请', pendingForB, 'requests=' + ((homeB1.body && homeB1.body.requests || []).length));

  // 6. B 接受
  const acceptRes = await call('PUT', '/api/community/request', { id: reqId, action: 'accept' }, bob.token);
  check('B 接受邀请', acceptRes.status === 200 && acceptRes.body && acceptRes.body.status === 'accepted', 'status=' + (acceptRes.body && acceptRes.body.status));

  // 7. 双方好友列表都能看到对方（刷新后仍然成立）
  const homeA2 = await call('GET', '/api/community/home', undefined, alice.token);
  const homeB2 = await call('GET', '/api/community/home', undefined, bob.token);
  const aHasB = !!(homeA2.body && homeA2.body.friends || []).find((p) => p.id === bob.id);
  const bHasA = !!(homeB2.body && homeB2.body.friends || []).find((p) => p.id === alice.id);
  check('A 的好友列表含 B', aHasB, 'friends=' + ((homeA2.body && homeA2.body.friends || []).length));
  check('B 的好友列表含 A', bHasA, 'friends=' + ((homeB2.body && homeB2.body.friends || []).length));

  // 8. 公告栏：A 贴一张便签
  const text = 'E2E 便签 ' + stamp;
  const postRes = await call('POST', '/api/community/posts', { text }, alice.token);
  const postId = postRes.body && postRes.body.post && postRes.body.post.id;
  check('A 发布留言', postRes.status === 200 && !!postId, 'postId=' + (postId || 'none'));

  // 9. B 读留言板能看到这条（公告栏打开时读的就是这个）
  const postsB = await call('GET', '/api/community/posts?mode=all', undefined, bob.token);
  const bSeesPost = !!(postsB.body && postsB.body.posts || []).find((p) => p.id === postId && p.text === text);
  check('B 能看到 A 的留言', bSeesPost, 'posts=' + ((postsB.body && postsB.body.posts || []).length));

  // 10. 重新读取（模拟刷新）后仍在，证明是持久化而不是内存态
  const postsB2 = await call('GET', '/api/community/posts?mode=all', undefined, bob.token);
  const stillThere = !!(postsB2.body && postsB2.body.posts || []).find((p) => p.id === postId);
  check('再次读取仍在（持久化）', stillThere, '');

  // 11. 只有作者能删
  const delByB = await call('DELETE', '/api/community/posts', { id: postId }, bob.token);
  check('B 删 A 的留言被拒', delByB.status === 403, 'status=' + delByB.status + ' error=' + (delByB.body && delByB.body.error));
  const delByA = await call('DELETE', '/api/community/posts', { id: postId }, alice.token);
  check('A 删除自己的留言', delByA.status === 200, 'status=' + delByA.status);

  const postsAfter = await call('GET', '/api/community/posts?mode=all', undefined, bob.token);
  const goneAfterDelete = !(postsAfter.body && postsAfter.body.posts || []).find((p) => p.id === postId && !p.deleted);
  check('删除后不再显示', goneAfterDelete, '');

  // 12. 未登录状态
  const anon = await call('GET', '/api/community/home');
  check('未登录返回 401', anon.status === 401, 'status=' + anon.status + ' error=' + (anon.body && anon.body.error));

  console.log('');
  console.log('账号：' + alice.username + ' / ' + bob.username + '（密码同一个，stamp=' + stamp + '）');
  console.log('结果：' + (rows.length - failed) + '/' + rows.length + ' 通过');
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error('中断：' + (err && err.stack || err));
  process.exit(1);
});
