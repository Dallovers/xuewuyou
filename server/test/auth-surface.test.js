'use strict';
/* 接口鉴权面（A06）
 *
 * 不手写一份接口清单——那样新加接口就不会被覆盖。这里直接读取 server.js 导出的
 * 路由表，逐个不带 token 打一遍：除明确登记的公开接口外，必须一律 401。
 *
 * 任何人新增接口时若忘记校验登录态，这个测试会立刻失败，并被要求显式决定
 * 「是否应该公开」——而不是默默漏掉。
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-auth-surface-'));
let server, integrations, routes, base;

/* 明确允许匿名访问的接口。新增公开接口必须在这里登记并写明理由，
 * 否则会被下面的断言拦下。 */
const PUBLIC_ROUTES = new Map([
  ['GET /api/health', '健康检查，部署探针需要匿名可访问'],
  ['POST /api/auth/register', '注册本身必须在未登录时可用'],
  ['POST /api/admin/login', '管理员后台自己的登录入口，凭账号密码换 token，本身不能要求已登录'],
  ['GET /api/questions/meta', '题库统计量，不含题目内容或答案，供未登录页面展示规模']
]);

function key(route) {
  return route.method + ' ' + route.pattern;
}

async function anonymous(route) {
  const res = await fetch(base + route.pattern, {
    method: route.method,
    headers: { 'Content-Type': 'application/json' },
    ...(route.method === 'GET' ? {} : { body: '{}' })
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

before(async () => {
  process.env.DATA_DIR = temp;
  process.env.JWT_SECRET = 'auth-surface-test-secret';
  ({ server, integrations, routes } = require('../server'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});

after(async () => {
  await integrations.close();
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(temp, { recursive: true, force: true });
});

test('路由表可读取，规模符合预期', () => {
  assert.ok(Array.isArray(routes), 'server.js 未导出路由表');
  assert.ok(routes.length >= 70, '路由数量异常，仅 ' + routes.length + ' 条');
});

test('除登记在案的公开接口外，所有接口匿名访问一律 401', async () => {
  const leaked = [];
  for (const route of routes) {
    if (PUBLIC_ROUTES.has(key(route))) continue;
    const { status } = await anonymous(route);
    if (status !== 401) leaked.push(key(route) + ' -> ' + status);
  }
  assert.deepEqual(leaked, [],
    '以下接口在未登录时没有返回 401。若确为公开接口，请加入 PUBLIC_ROUTES 并写明理由：\n' + leaked.join('\n'));
});

test('公开接口只暴露应有的内容', async () => {
  for (const route of routes) {
    const k = key(route);
    if (!PUBLIC_ROUTES.has(k)) continue;
    const { status, body } = await anonymous(route);
    assert.notEqual(status, 401, k + ' 登记为公开，但仍要求登录');

    if (k === 'GET /api/health') {
      assert.equal(body.ok, true);
    }
    if (k === 'GET /api/questions/meta') {
      /* 统计量可以公开，但绝不能带出题干、答案或解析 */
      const text = JSON.stringify(body);
      assert.ok(!/"answer"|"analysis"|"question"/.test(text), '题库元信息泄露了题目内容或答案');
      assert.equal(typeof body.total, 'number');
    }
  }
});

test('公开接口以外的每个接口都需要有效身份，不能只靠请求体里的 uid', async () => {
  /* 抽样验证：带一个伪造的 uid 头部/查询参数仍必须 401 */
  const samples = routes.filter((r) => !PUBLIC_ROUTES.has(key(r))).slice(0, 12);
  for (const route of samples) {
    const url = base + route.pattern;
    const res = await fetch(url, {
      method: route.method,
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'forged-uid',
        Authorization: 'Bearer forged-token'
      },
      ...(route.method === 'GET' ? {} : { body: JSON.stringify({ uid: 'forged-uid', userId: 'forged-uid' }) })
    });
    assert.equal(res.status, 401, key(route) + ' 接受了伪造身份');
  }
});
