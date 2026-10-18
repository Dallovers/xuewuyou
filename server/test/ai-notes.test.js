'use strict';
/* 公开的 AI 产出（讲题 / 出题 / 备考计划）
 *
 * 产品决定：只有这三类「通用工具」的结果对外可见。
 * 自由提问和「按我的错题生成计划」不上墙——后者带着个人错题清单，
 * 公开等于替用户决定要不要暴露自己的短板。
 *
 * 这里钉四件事：只有登录能用、只收三类、列表按时间倒序、有人能把它撤下来。
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-ainotes-'));
process.env.DATA_DIR = temp;
process.env.JWT_SECRET = 'ainotes-test-secret';
process.env.AI_NOTE_WRITE_PER_MIN = '5000';
delete process.env.ADMIN_USERNAMES;

let server, base, store;
let tokenA, tokenB, adminToken;

const call = (p, method, body, token) => fetch(base + p, {
  method,
  headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}),
  ...(body === undefined ? {} : { body: JSON.stringify(body) })
}).then(async (r) => ({ status: r.status, body: await r.json() }));

before(async () => {
  ({ server } = require('../server'));
  store = require('../lib/store');
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;

  const a = await call('/api/auth/register', 'POST', { username: '讲题甲', password: 'test123456' });
  tokenA = a.body.token;
  const b = await call('/api/auth/register', 'POST', { username: '讲题乙', password: 'test123456' });
  tokenB = b.body.token;
  const admin = await call('/api/auth/register', 'POST', { username: '公开管理员', password: 'test123456' });
  adminToken = admin.body.token;
  const users = store.get('users') || {};
  users[admin.body.user.id].role = 'admin';
  store.set('users', users);
});

after(() => { server.close(); });

test('未登录不能写也不能读', async () => {
  assert.equal((await call('/api/ai/notes', 'POST', { kind: 'explain', question: 'q', answer: 'a' })).status, 401);
  assert.equal((await call('/api/ai/notes', 'GET')).status, 401);
});

test('三类通用产出可以公开，别人能看到且带上昵称', async () => {
  const saved = await call('/api/ai/notes', 'POST', {
    kind: 'explain', question: '求 lim x→0 sinx/x', answer: '等于 1，因为 sinx ~ x。'
  }, tokenA);
  assert.equal(saved.status, 200, JSON.stringify(saved.body));

  const list = await call('/api/ai/notes', 'GET', undefined, tokenB);
  assert.equal(list.status, 200);
  const item = list.body.notes.find((n) => n.id === saved.body.note.id);
  assert.ok(item, '乙应该能看到甲公开的讲解');
  assert.equal(item.nick, '讲题甲', '要带上作者昵称');
  assert.equal(item.kind, 'explain');
});

test('不在白名单里的类型一律拒绝（自由提问、按错题生成都不上墙）', async () => {
  for (const kind of ['chat', 'myplan', '']) {
    const r = await call('/api/ai/notes', 'POST', { kind, question: 'q', answer: 'a' }, tokenA);
    assert.equal(r.status, 400, kind + ' 不该被接受');
  }
});

test('空问题或空回答拒绝，超长内容被截断而不是撑爆存储', async () => {
  assert.equal((await call('/api/ai/notes', 'POST', { kind: 'gen', question: '  ', answer: 'a' }, tokenA)).status, 400);
  assert.equal((await call('/api/ai/notes', 'POST', { kind: 'gen', question: 'q', answer: '' }, tokenA)).status, 400);

  const long = await call('/api/ai/notes', 'POST', { kind: 'gen', question: 'x'.repeat(5000), answer: 'y'.repeat(9000) }, tokenA);
  assert.equal(long.status, 200);
  assert.equal(long.body.note.question.length, 2000, '问题截断到 2000');
  assert.equal(long.body.note.answer.length, 8000, '回答截断到 8000');
});

test('列表按时间倒序，limit 生效', async () => {
  const list = await call('/api/ai/notes?limit=2', 'GET', undefined, tokenA);
  assert.equal(list.body.notes.length, 2);
  const times = list.body.notes.map((n) => n.createdAt);
  assert.deepEqual(times, [...times].sort((a, b) => b - a), '新的在前');
});

test('只保留最近 200 条，不会无限增长', async () => {
  for (let i = 0; i < 205; i++) {
    const r = await call('/api/ai/notes', 'POST', { kind: 'plan', question: 'q' + i, answer: 'a' + i }, tokenA);
    assert.equal(r.status, 200);
  }
  const all = store.get('aiNotes') || {};
  assert.ok(Object.keys(all).length <= 200, '实际 ' + Object.keys(all).length + ' 条');
});

test('管理员可以把它下架，审计留痕', async () => {
  const saved = await call('/api/ai/notes', 'POST', { kind: 'plan', question: '要被撤下的', answer: '内容' }, tokenA);
  const id = saved.body.note.id;

  const denied = await call('/api/admin/ai-note-action', 'POST', { id, action: 'delete' }, tokenB);
  assert.equal(denied.status, 403, '普通用户不能下架');

  const ok = await call('/api/admin/ai-note-action', 'POST', { id, action: 'delete' }, adminToken);
  assert.equal(ok.status, 200, JSON.stringify(ok.body));

  const list = await call('/api/ai/notes?limit=50', 'GET', undefined, tokenB);
  assert.ok(!list.body.notes.some((n) => n.id === id), '下架后列表里不该再有');

  const audit = await call('/api/admin/audit', 'GET', undefined, adminToken);
  assert.ok(audit.body.items.some((x) => x.action === 'ai-note-delete'), '审计里要留痕');
});

/* 只有删除接口而没有列表，等于出事时还得手动翻存储找 id。
 * 后台列表比公开接口多给作者账号和完整正文，所以权限必须更严：不是管理员一律不给。 */
test('后台能列出公开回答：匿名 401、普通用户 403、管理员能按内容搜到并看到作者', async () => {
  const marker = '检索标记' + Date.now();
  const saved = await call('/api/ai/notes', 'POST', { kind: 'explain', question: marker, answer: '回答正文' }, tokenA);
  assert.equal(saved.status, 200, JSON.stringify(saved.body));

  assert.equal((await call('/api/admin/ai-notes', 'GET')).status, 401, '匿名不给看');
  assert.equal((await call('/api/admin/ai-notes', 'GET', undefined, tokenB)).status, 403, '普通用户不给看');

  const list = await call('/api/admin/ai-notes?q=' + encodeURIComponent(marker), 'GET', undefined, adminToken);
  assert.equal(list.status, 200, JSON.stringify(list.body));
  assert.equal(list.body.total, 1, '按内容应该只筛到这一条');

  const item = list.body.items[0];
  assert.equal(item.id, saved.body.note.id);
  assert.equal(item.kind, 'explain');
  assert.equal(item.answer, '回答正文', '后台看得到完整正文');
  assert.equal(item.author.username, '讲题甲', '后台要能看出是谁发的');
});

/* 撤下来的内容不能换个地方继续留着：审计里只记 id、类型和作者，不抄正文。 */
test('下架后审计只留 id 与类型，不抄被撤的正文', async () => {
  const saved = await call('/api/ai/notes', 'POST', {
    kind: 'explain', question: '这个问题不该进审计', answer: '这段回答也不该进审计'
  }, tokenA);
  const del = await call('/api/admin/ai-note-action', 'POST', { id: saved.body.note.id, action: 'delete' }, adminToken);
  assert.equal(del.status, 200, JSON.stringify(del.body));

  const audit = await call('/api/admin/audit?limit=20', 'GET', undefined, adminToken);
  const row = audit.body.items.find((x) => x.action === 'ai-note-delete');
  assert.ok(row, '要有这条审计');
  assert.ok(!/这个问题|这段回答/.test(row.detail || ''), '审计细节里不能出现被撤的内容：' + row.detail);
  assert.equal(row.target && row.target.username, '讲题甲', '审计要记下是谁发的');
});
