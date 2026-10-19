'use strict';
/* ============ 前端语法闸门 ============
 *
 * 把 js/*.js 全量过一遍 `node --check`。
 *
 * 为什么不再手写清单：原来的 check 脚本是一串硬编码的 `node --check ../js/xxx.js`，
 * 34 个前端文件只覆盖了 13 个。新增文件默认不在名单里，而改得最勤的几个
 * （mathview / gaoshu / wenku / quiz）恰好都在名单外——语法错误照样能过 CI，
 * 到线上就是整页不执行。
 *
 * 现在遍历目录，新加文件自动纳入。唯一的例外用 SKIP 显式声明，不靠漏写。
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const JS_DIR = path.join(__dirname, '..', '..', 'js');

/* 明确不检查的：目前没有。要加就写在这里，并说明原因。 */
const SKIP = new Set([]);

const files = fs.readdirSync(JS_DIR)
  .filter((f) => f.endsWith('.js') && !SKIP.has(f))
  .sort();

let bad = 0;
for (const f of files) {
  try {
    execFileSync(process.execPath, ['--check', path.join(JS_DIR, f)], { stdio: 'pipe' });
  } catch (e) {
    bad++;
    console.error('\n语法错误：' + f);
    console.error(String(e.stderr || e.message).trim());
  }
}

if (bad) {
  console.error('\n前端语法检查失败：' + bad + ' / ' + files.length + ' 个文件。');
  process.exit(1);
}

console.log('前端语法检查通过：' + files.length + ' 个文件。');
