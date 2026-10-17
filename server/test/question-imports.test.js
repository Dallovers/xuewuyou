'use strict';
/* 题库导入批次与回滚（A03）
 *
 * 覆盖：批次校验的每一条硬规则、不合法批次被整批拒绝而不是导入一部分、
 * 导入后题目真的进入题目池并能通过接口取到、以及批次文件删除后即消失（回滚）。
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const importDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-imports-'));
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-imports-data-'));

/* 必须在 require('../server') 之前设置，questions.js 在模块加载时就会合并批次 */
process.env.QUESTION_IMPORT_DIR = importDir;
process.env.DATA_DIR = dataDir;
process.env.JWT_SECRET = 'question-imports-test-secret';

const VALID_BATCH = {
  name: '单元测试批次',
  source: 'test',
  questions: [
    { id: '90001', subject: '高等数学', topic: '函数与极限', difficulty: '基础', type: '选择题',
      stem: '单元测试选择题：下列哪个是质数？', opts: ['4', '7', '9', '15'], ans: 'B', solution: '7 是质数' },
    { id: '90002', subject: '高等数学', topic: '函数与极限', difficulty: '提高', type: '解答题',
      stem: '单元测试主观题：证明连续函数的介值性。', opts: [], ans: '', solution: '略' }
  ]
};
fs.writeFileSync(path.join(importDir, '01-test-batch.json'), JSON.stringify(VALID_BATCH), 'utf8');

let server, integrations, base, questions, importedCount, importProblems, token;

const { validateBatch, loadImports } = require('../integrations/question-imports');

function batchOf(questions) {
  return { name: 'x', questions };
}
function oneQ(patch) {
  return Object.assign({
    id: '91000', subject: '高等数学', topic: '函数与极限', difficulty: '基础', type: '选择题',
    stem: '题干', opts: ['a', 'b', 'c', 'd'], ans: 'A', solution: '解析'
  }, patch || {});
}

before(async () => {
  ({ server, integrations } = require('../server'));
  ({ questions, importedCount, importProblems } = require('../integrations/questions'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  token = (await (await fetch(base + '/api/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: '导入测试', password: 'test123456' })
  })).json()).token;
});

after(async () => {
  await integrations.close();
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(importDir, { recursive: true, force: true });
  fs.rmSync(dataDir, { recursive: true, force: true });
});

/* ---------- 校验规则 ---------- */

test('合法批次通过校验', () => {
  const r = validateBatch(VALID_BATCH, { existingIds: new Set(), topics: new Set(['函数与极限']) });
  assert.equal(r.ok, true, r.errors.join('; '));
  assert.equal(r.count, 2);
});

test('题号与现有题库冲突时整批拒绝', () => {
  const r = validateBatch(batchOf([oneQ({ id: '7036' })]), { existingIds: new Set(['7036']), topics: new Set(['函数与极限']) });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(), /与现有题库冲突/);
});

test('批内题号重复被拒绝', () => {
  const r = validateBatch(batchOf([oneQ({ id: '91001' }), oneQ({ id: '91001' })]), { existingIds: new Set(), topics: new Set(['函数与极限']) });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(), /本批内重复/);
});

test('章节不在现有章节里被拒绝（避免新增章节绕过课程配置）', () => {
  const r = validateBatch(batchOf([oneQ({ topic: '不存在的章节' })]), { existingIds: new Set(), topics: new Set(['函数与极限']) });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(), /不在现有章节/);
});

test('有选项但答案不是 A–D、或超出选项范围，都被拒绝', () => {
  const noAnswer = validateBatch(batchOf([oneQ({ id: '91002', ans: '' })]), { existingIds: new Set(), topics: new Set(['函数与极限']) });
  assert.equal(noAnswer.ok, false);
  assert.match(noAnswer.errors.join(), /答案不是 A–D/);

  const outOfRange = validateBatch(batchOf([oneQ({ id: '91003', opts: ['a', 'b'], ans: 'D' })]), { existingIds: new Set(), topics: new Set(['函数与极限']) });
  assert.equal(outOfRange.ok, false);
  assert.match(outOfRange.errors.join(), /超出选项范围/);
});

test('选项内容重复被拒绝（这正是现有题库里那几道坏题的问题）', () => {
  const r = validateBatch(batchOf([oneQ({ opts: ['一样', '一样', 'c', 'd'] })]), { existingIds: new Set(), topics: new Set(['函数与极限']) });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(), /选项内容重复/);
});

test('主观题给结构化答案被拒绝', () => {
  const r = validateBatch(batchOf([oneQ({ opts: [], ans: 'B' })]), { existingIds: new Set(), topics: new Set(['函数与极限']) });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(), /主观题不应有结构化答案/);
});

test('题干为空、题号非数字被拒绝', () => {
  const empty = validateBatch(batchOf([oneQ({ stem: '   ' })]), { existingIds: new Set(), topics: new Set(['函数与极限']) });
  assert.equal(empty.ok, false);
  assert.match(empty.errors.join(), /题干为空/);

  const badId = validateBatch(batchOf([oneQ({ id: 'abc' })]), { existingIds: new Set(), topics: new Set(['函数与极限']) });
  assert.equal(badId.ok, false);
  assert.match(badId.errors.join(), /必须是数字串/);
});

test('单批超过 500 题被拒绝', () => {
  const many = Array.from({ length: 501 }, (_, i) => oneQ({ id: String(92000 + i) }));
  const r = validateBatch(batchOf(many), { existingIds: new Set(), topics: new Set(['函数与极限']) });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(), /不得超过 500/);
});

test('缺少元信息只报警告，不阻断导入', () => {
  const r = validateBatch(batchOf([oneQ({ difficulty: '', type: '', solution: '' })]), { existingIds: new Set(), topics: new Set(['函数与极限']) });
  assert.equal(r.ok, true, '不建议阻断导入');
  assert.ok(r.warnings.length >= 3, '应提示缺难度/题型/解析');
});

/* ---------- 加载与回滚 ---------- */

test('不合法批次被跳过并记录，不影响其他批次', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-imports-bad-'));
  try {
    fs.writeFileSync(path.join(dir, 'bad.json'), '{ 这不是 JSON', 'utf8');
    fs.writeFileSync(path.join(dir, 'good.json'), JSON.stringify(VALID_BATCH), 'utf8');
    const out = loadImports({ dir, existingIds: new Set(), topics: new Set(['函数与极限']) });
    assert.equal(out.questions.length, 2, '合法批次应正常载入');
    assert.equal(out.problems.length, 1, '不合法批次应被记录');
    assert.match(out.problems[0].errors.join(), /JSON 解析失败/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('批次题目真的进入题目池，并能通过接口取到', async () => {
  assert.equal(importProblems.length, 0, '仓库内不应有不合法的导入批次：' + JSON.stringify(importProblems));
  assert.equal(importedCount, 2);
  assert.ok(questions.has('90001') && questions.has('90002'));
  assert.equal(questions.get('90001').answer, 'B');
  assert.equal(questions.get('90002').selfAssessed, true, '主观题应标为自评');

  const meta = await fetch(base + '/api/questions/meta').then((r) => r.json());
  assert.equal(meta.total, questions.size, '题目总数应与题目池一致');

  const auth = { Authorization: 'Bearer ' + token };
  const found = await fetch(base + '/api/questions?limit=5&q=' + encodeURIComponent('单元测试选择题'), { headers: auth }).then((r) => r.json());
  assert.ok(found.total >= 1, '应能按关键词搜到导入的题目');
  assert.equal(found.items[0].id, '90001');
  assert.equal(found.items[0].difficulty, '基础', '导入题的难度应能正常返回');
  assert.equal(found.items[0].type, '选择题');
  assert.equal(found.items[0].answer, undefined, '列表默认仍不下发答案');
});

test('删掉批次文件即完成回滚，题目从题目池消失', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'xwy-imports-rollback-'));
  try {
    fs.writeFileSync(path.join(dir, 'b.json'), JSON.stringify(VALID_BATCH), 'utf8');
    const withBatch = loadImports({ dir, existingIds: new Set(), topics: new Set(['函数与极限']) });
    assert.equal(withBatch.questions.length, 2);

    fs.rmSync(path.join(dir, 'b.json'));
    const afterRollback = loadImports({ dir, existingIds: new Set(), topics: new Set(['函数与极限']) });
    assert.equal(afterRollback.questions.length, 0, '回滚后不应再有导入题目');
    assert.equal(afterRollback.problems.length, 0, '目录为空不是错误');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
