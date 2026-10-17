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
const { questions } = require('../integrations/questions');

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

const existingIds = new Set(questions.keys());
const topics = new Set([...questions.values()].map((q) => q.topic));
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

const dir = batchDir();
const safeName = String(batch.name || 'batch').replace(/[^\w\u4e00-\u9fa5-]/g, '_').slice(0, 40);
const target = path.join(dir, new Date().toISOString().slice(0, 10) + '-' + safeName + '.json');

if (dryRun) {
  console.log('\n（dry-run）校验通过，将写入 ' + target);
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
