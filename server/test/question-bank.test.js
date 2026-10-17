'use strict';
/* 题库结构校验（A03）
 *
 * 把「题库再导入时混进坏题」变成 CI 可发现的问题：
 * 已知缺陷登记在 integrations/question-audit.js，新出现的缺陷会让这里失败。
 * 本测试不修改题库、不猜任何答案。
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const {
  KNOWN_DEFECTS, MAX_KNOWN_DUPLICATE_IDS, audit, diffAgainstRegistry
} = require('../integrations/question-audit');

function loadBank() {
  const ctx = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'gaoshu_bank.js'), 'utf8'), ctx, { timeout: 10000 });
  return ctx.GAOSHU_BANK;
}

const bank = loadBank();
const result = audit(bank);

test('题库可加载，总量与题号数自洽', () => {
  assert.ok(result.total > 1500, '题库规模异常，仅 ' + result.total + ' 条');
  const extra = result.duplicateIds.reduce((n, d) => n + d.count - 1, 0);
  assert.equal(result.uniqueIds + extra, result.total, '题号数与总量不自洽');
});

test('题号跨章节复用属综合复用：题面必须一致，数量不得增长', () => {
  assert.ok(result.duplicateIds.length <= MAX_KNOWN_DUPLICATE_IDS,
    '重复题号增加到 ' + result.duplicateIds.length + ' 个，超过登记上限 ' + MAX_KNOWN_DUPLICATE_IDS + '，请先核对是否录入了重复题');
  const diffStem = result.duplicateIds.filter((d) => !d.sameStem);
  assert.deepEqual(diffStem.map((d) => d.id), [], '这些题号在不同章节的题面不同，属于真重复而非综合复用');
});

test('有选项的选择题必须有 A–D 答案，且不得出现未登记缺陷', () => {
  const ids = result.emptyAnsChoice.map((r) => r.id);
  const unregistered = ids.filter((id) => !(id in KNOWN_DEFECTS));
  assert.deepEqual(unregistered, [],
    '出现未登记的有选项无答案题目，请核对题面后登记到 integrations/question-audit.js：' + unregistered.join(', '));
});

test('同一道题的选项不得重复，且不得出现未登记缺陷', () => {
  const ids = result.duplicatedOptions.map((r) => r.id);
  const unregistered = ids.filter((id) => !(id in KNOWN_DEFECTS));
  assert.deepEqual(unregistered, [],
    '出现选项重复的题目，请核对后登记：' + unregistered.join(', '));
});

test('登记表本身完整：每条缺陷都要写明严重程度与原因', () => {
  for (const [id, d] of Object.entries(KNOWN_DEFECTS)) {
    assert.ok(d.severity === 'broken' || d.severity === 'cosmetic', id + ' 的 severity 非法');
    assert.ok(d.reason && d.reason.length > 5, id + ' 缺少原因说明');
  }
  const broken = Object.values(KNOWN_DEFECTS).filter((d) => d.severity === 'broken');
  assert.equal(broken.length, 8, '标记为 broken 的题目数量变化，请确认是否修好或新增');
});

test('登记表不得腐化：已修复的题号必须从登记表移除', () => {
  const { stale } = diffAgainstRegistry(result);
  assert.deepEqual(stale, [],
    '这些题号在登记表里但已不再有缺陷，说明已修复或题库变更，请从 KNOWN_BROKEN_CHOICE 移除：' + stale.join(', '));
});

test('基础字段完整：题号为数字、题干与章节非空、选项非空串', () => {
  assert.deepEqual(result.badId.map((r) => r.id), [], '存在非数字题号');
  assert.deepEqual(result.emptyStem.map((r) => r.id), [], '存在空题干');
  assert.deepEqual(result.badTopic.map((r) => r.id), [], '存在空章节');
  assert.deepEqual(result.overLimit.map((r) => r.id), [], '存在空白选项');
});
