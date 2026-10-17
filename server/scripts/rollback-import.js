#!/usr/bin/env node
'use strict';
/* 回滚一个导入批次。
 *
 *   node scripts/rollback-import.js <批次文件名> [--dry-run]
 *   node scripts/rollback-import.js --list
 *
 * 回滚 = 删掉批次文件。题库本体（js/gaoshu_bank.js）从未被导入改动过，
 * 所以这里只有增删批次这一种操作，不会伤到原始题库。
 */
const fs = require('fs');
const path = require('path');
const { batchDir, listBatchFiles } = require('../integrations/question-imports');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const listOnly = args.includes('--list');
const name = args.find((a) => !a.startsWith('--'));

const dir = batchDir();

if (listOnly) {
  const files = listBatchFiles();
  console.log('批次目录：' + dir);
  if (!files.length) { console.log('（暂无导入批次）'); process.exit(0); }
  files.forEach((f) => {
    const size = fs.statSync(f.file).size;
    console.log('  ' + f.name + '  (' + (size / 1024).toFixed(1) + ' KB)');
  });
  process.exit(0);
}

if (!name) {
  console.error('用法: node scripts/rollback-import.js <批次文件名> [--dry-run]');
  console.error('      node scripts/rollback-import.js --list');
  process.exit(2);
}

/* 只允许删批次目录内的 .json，防止 ../ 之类的路径穿越 */
const base = path.resolve(dir);
const target = path.resolve(base, path.basename(name));
if (!target.startsWith(base + path.sep) || !target.endsWith('.json')) {
  console.error('拒绝操作：目标不在批次目录内，或不是 .json 文件');
  process.exit(1);
}
if (!fs.existsSync(target)) {
  console.error('找不到批次文件：' + target);
  process.exit(1);
}

if (dryRun) {
  console.log('（dry-run）将删除 ' + target);
  process.exit(0);
}

fs.rmSync(target);
console.log('已移除批次 ' + path.basename(target));
console.log('重启服务后生效。');
