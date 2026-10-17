'use strict';
/* 重复题号的章节归属（A03）
 *
 * 题库里有 30 个题号被两个章节同时收录、题面完全相同。题目池按题号索引，
 * 一道题只能归属一个主章节，否则任何章节计数都会重复。
 *
 * 这里锁定三件事：
 *   1. 每个题号的主章节 + 别名章节，恰好等于它在题库里出现过的全部章节（不丢信息）；
 *   2. 各章节主章节题数之和等于题目总数（不重复计数）；
 *   3. 按别名章节默认查不到，includeAliases=1 能查到（从任一章节都找得到）。
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-alias-'));
process.env.DATA_DIR = dataDir;
process.env.JWT_SECRET = 'alias-test-secret';
process.env.QUESTION_IMPORT_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-alias-imp-'));

let server, integrations, base, token;
let questions, aliasCount;

/* 直接从题库原文统计每个题号出现过的章节 */
function bankTopics() {
  const ctx = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'gaoshu_bank.js'), 'utf8'), ctx, { timeout: 10000 });
  const index = new Map();
  for (const group of Object.values(ctx.GAOSHU_BANK || {})) {
    for (const p of group.problems || []) {
      const id = String(p.id);
      const topic = p.topic || group.subject || '综合';
      if (!index.has(id)) index.set(id, new Set());
      index.get(id).add(topic);
    }
  }
  return index;
}

before(async () => {
  ({ server, integrations } = require('../server'));
  ({ questions, aliasCount } = require('../integrations/questions'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  token = (await (await fetch(base + '/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '别名测试', password: 'test123456' })
  })).json()).token;
});

after(async () => {
  await integrations.close();
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(dataDir, { recursive: true, force: true });
});

test('主章节 + 别名章节，恰好等于该题号在题库里出现过的全部章节', () => {
  const index = bankTopics();
  const mismatched = [];
  for (const [id, q] of questions) {
    const expected = [...(index.get(id) || new Set([q.topic]))].sort();
    const actual = [q.topic, ...(q.alsoInTopics || [])].sort();
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      mismatched.push(id + ' 期望 ' + expected.join('/') + '，实际 ' + actual.join('/'));
    }
  }
  assert.deepEqual(mismatched, [], '这些题号的章节归属与题库不一致，信息被丢了：\n' + mismatched.join('\n'));
});

test('别名章节一定不同于主章节，且没有重复别名', () => {
  for (const [id, q] of questions) {
    const aliases = q.alsoInTopics || [];
    assert.ok(!aliases.includes(q.topic), id + ' 的别名里不应包含主章节');
    assert.equal(new Set(aliases).size, aliases.length, id + ' 的别名有重复');
  }
});

test('各章节题数之和等于题目总数（不重复计数）', () => {
  const byTopic = new Map();
  for (const q of questions.values()) byTopic.set(q.topic, (byTopic.get(q.topic) || 0) + 1);
  const sum = [...byTopic.values()].reduce((n, v) => n + v, 0);
  assert.equal(sum, questions.size, '章节题数之和与题目总数不一致，说明有题被重复计数');
});

test('存在跨章节复用的题号，且数量与题库一致', () => {
  const index = bankTopics();
  let expected = 0;
  for (const id of questions.keys()) {
    if ((index.get(id) || new Set()).size > 1) expected += 1;
  }
  assert.ok(expected > 0, '题库里应当存在跨章节复用的题号');
  assert.equal(aliasCount, expected, '带别名的题数应与题库中的复用题号数一致');
});

test('按别名章节默认查不到，includeAliases=1 能查到', async () => {
  const auth = { Authorization: 'Bearer ' + token };
  const dup = [...questions.values()].find((q) => (q.alsoInTopics || []).length);
  assert.ok(dup, '应能找到一道跨章节复用的题');

  const primary = await fetch(base + '/api/questions?limit=1&topic=' + encodeURIComponent(dup.topic), { headers: auth }).then((r) => r.json());
  const alias = dup.alsoInTopics[0];

  const withoutAliases = await fetch(base + '/api/questions?limit=1&topic=' + encodeURIComponent(alias), { headers: auth }).then((r) => r.json());
  const withAliases = await fetch(base + '/api/questions?limit=1&topic=' + encodeURIComponent(alias) + '&includeAliases=1', { headers: auth }).then((r) => r.json());

  const expectedExtra = [...questions.values()].filter((q) => (q.alsoInTopics || []).includes(alias)).length;
  assert.equal(withAliases.total - withoutAliases.total, expectedExtra,
    '别名检索应恰好补上归属到该章节的复用题');
  assert.ok(primary.total >= 1);
});

test('题目条目返回别名章节，前端可提示「本章也收录」', async () => {
  const auth = { Authorization: 'Bearer ' + token };
  const counts = new Map();
  for (const q of questions.values()) counts.set(q.topic, (counts.get(q.topic) || 0) + 1);
  const dup = [...questions.values()]
    .find((q) => (q.alsoInTopics || []).length && (counts.get(q.topic) || 0) <= 50);
  assert.ok(dup, '应存在主章节题量不超过 50 的复用题（用于翻页范围内验证）');

  const list = await fetch(base + '/api/questions?limit=50&topic=' + encodeURIComponent(dup.topic), { headers: auth }).then((r) => r.json());
  const found = list.items.find((x) => x.id === dup.id);
  assert.ok(found, '该章节题量不超过 50，应能在一页内包含该题');
  assert.deepEqual(found.alsoInTopics, dup.alsoInTopics);
});
