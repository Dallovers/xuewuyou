#!/usr/bin/env node
'use strict';
/* 导入一个题库批次。
 *
 *   node scripts/import-questions.js <批次.json> [--dry-run]
 *
 * 校验不通过整批拒绝，不做「导入一部分」——半批数据比没导入更难收拾。
 * 导入只是把一个批次文件放进 content/question-imports/，重启后生效；
 * 回滚用 scripts/rollback-import.js。
 */
const fs = require('fs');
const path = require('path');
const { validateBatch, batchDir } = require('../integrations/question-imports');
const questionsModule = require('../integrations/questions');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const file = args.find((a) => !a.startsWith('--'));

if (!file) {
  console.error('用法: node scripts/import-questions.js <批次.json> [--dry-run]');
  process.exit(2);
}

let batch;
try {
  batch = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
} catch (e) {
  console.error('读不到批次文件或 JSON 解析失败：' + e.message);
  process.exit(1);
}

const dir = batchDir();

/* 题目池在模块加载时已经把批次目录里的题合并进来了。
   如果待校验的文件本身就在批次目录里，它自己的题号会和自己冲突（整批被误判为冲突），
   所以把「来自同一个文件」的题从冲突集合里排除。不这么做，README 里那条
   「批次放在这个目录，用脚本校验」的流程永远跑不通。
   注意只在文件确实位于批次目录内时才排除：目录外的同名文件仍然要正常查冲突。 */
const inBatchDir = path.resolve(path.dirname(path.resolve(file))) === path.resolve(dir);
const selfBatch = inBatchDir ? path.basename(path.resolve(file)) : null;
const existingIds = new Set();
for (const [id, q] of questionsModule.questions) {
  if (!selfBatch || !q || q.batch !== selfBatch) existingIds.add(id);
}
const topics = new Set([...questionsModule.questions.values()].map((q) => q.topic));
const result = validateBatch(batch, { existingIds, topics });

console.log('批次：' + (batch.name || '(未命名)') + ' ｜ 题目 ' + result.count + ' 道');

if (result.warnings.length) {
  console.log('\n警告（不阻断导入，建议补齐）：');
  result.warnings.forEach((w) => console.log('  ! ' + w));
}

if (!result.ok) {
  console.log('\n校验未通过，未导入：');
  result.errors.forEach((e) => console.log('  ✗ ' + e));
  process.exit(1);
}

const safeName = String(batch.name || 'batch').replace(/[^\w\u4e00-\u9fa5-]/g, '_').slice(0, 40);
const target = path.join(dir, new Date().toISOString().slice(0, 10) + '-' + safeName + '.json');

if (dryRun) {
  console.log(inBatchDir
    ? '\n（dry-run）校验通过。该批次已在批次目录内，服务启动时会自动加载，不会重复写入。'
    : '\n（dry-run）校验通过，将写入 ' + target);
  process.exit(0);
}

/* 文件已经在批次目录里，说明它本来就被加载了；再写一份日期前缀的副本会让同一批题
   出现两次，后一个批次因题号冲突被整批跳过。直接告知即可，不要制造重复。 */
if (inBatchDir) {
  console.log('\n校验通过。该批次已在批次目录内（' + path.basename(file) + '），服务启动时会自动加载，无需重复写入。');
  console.log('回滚：node scripts/rollback-import.js ' + path.basename(file));
  process.exit(0);
}

fs.mkdirSync(dir, { recursive: true });
if (fs.existsSync(target)) {
  console.error('\n目标批次文件已存在，拒绝覆盖：' + target);
  console.error('如需替换，先执行 node scripts/rollback-import.js ' + path.basename(target));
  process.exit(1);
}
fs.writeFileSync(target, JSON.stringify(batch, null, 2) + '\n', 'utf8');

console.log('\n已写入 ' + target);
console.log('重启服务后生效。回滚：node scripts/rollback-import.js ' + path.basename(target));
