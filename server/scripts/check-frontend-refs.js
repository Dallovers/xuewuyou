'use strict';
/* ============ 前端引用体检 ============
 *
 * 查一件事：JS 里按 id 取的那些节点，HTML 里是不是还在。
 *
 * 为什么要单独做这个检查：
 *   `npm run check` 里的 `node --check` 只查语法。但本项目是原生 JS、脚本全部在
 *   DOMContentLoaded 时一次性绑定，`$('foo').addEventListener(...)` 里的 foo 一旦
 *   从 index.html 被删掉，语法完全合法、测试全绿、CI 全绿，线上打开就是白屏——
 *   因为那行 throw 之后，后面的绑定一条都不会执行。PR #21 就是这么挂的。
 *
 * 判定规则（命中任意一条就算安全）：
 *   1. 这个 id 在某个 .html 里存在；
 *   2. 这个 id 是在 JS 里运行时建出来的（`id='x'` / `el.id = 'x'`）；
 *   3. 取出来的值只是被存起来，没有立刻取成员——`var n = $('x')` 或 `map: getElementById('x')`
 *      这种写法本身不会抛错，真正的风险是 `$('x').addEventListener(...)`；
 *   4. 调用点同行、且在出现位置之前有判空/短路（if、&&、||、?）。
 *
 * 第 3 条才是核心：白屏的成因是「立刻对 null 取成员」，不是「碰过 null」。
 * 第 4 条是补充，兜住 `if (n)` 写在同行前面的常见写法。
 * 这套规则宁可漏报不误报——它的作用是拦「新写了一个指向已删除节点的绑定」，
 * 不是做静态分析证明。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');   // server/scripts -> 仓库根
const JS_DIR = path.join(ROOT, 'js');

const readText = (p) => fs.readFileSync(p, 'utf8');

/* ---------- HTML 里所有的 id ---------- */
const htmlIds = new Set();
for (const f of fs.readdirSync(ROOT)) {
  if (!f.endsWith('.html')) continue;
  const src = readText(path.join(ROOT, f));
  for (const m of src.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)) htmlIds.add(m[1]);
}

const REF = /\$\(\s*'([A-Za-z][\w-]*)'\s*\)|getElementById\(\s*'([A-Za-z][\w-]*)'\s*\)/g;
const GUARD = /\bif\b|\?\.|\?|&&|\|\||!=|!==/;

const problems = [];
const dynamic = [];
const carried = [];   // 取出来只是存着的
const guarded = [];   // 同行前面有判空的

for (const f of fs.readdirSync(JS_DIR).sort()) {
  if (!f.endsWith('.js')) continue;
  const src = readText(path.join(JS_DIR, f));
  const lines = src.split('\n');

  lines.forEach((line, i) => {
    REF.lastIndex = 0;
    let m;
    while ((m = REF.exec(line))) {
      const id = m[1] || m[2];
      if (htmlIds.has(id)) continue;

      /* 运行时建出来的节点：JS 里出现过 id='x' 或 el.id = 'x' */
      const created = new RegExp('(^|[^\\w])([\\w$]+\\.)?id\\s*=\\s*[\'"]' + id + '[\'"]').test(src);

      /* 立刻取成员才是危险动作；只是赋值/放进对象里不算 */
      const after = line.slice(m.index + m[0].length);
      const deref = /^\s*(\.|\[)/.test(after);

      /* 调用点前面的判空：只看同一行、只看出现位置之前 */
      const isGuarded = GUARD.test(line.slice(0, m.index));

      if (created) dynamic.push({ file: f, line: i + 1, id });
      else if (!deref) carried.push({ file: f, line: i + 1, id });
      else if (isGuarded) guarded.push({ file: f, line: i + 1, id });
      else problems.push({ file: f, line: i + 1, id });
    }
  });
}

const where = (p) => '  ' + p.file + ':' + p.line + '  #' + p.id;

if (problems.length) {
  console.error('前端引用体检没通过：下面这些 id 在 HTML 里不存在，调用处也没有判空。');
  console.error('这类绑定会在脚本加载时抛错，让后面的初始化整段不执行（表现为白屏）。');
  console.error('要么把节点补回 HTML，要么在 JS 里加 if 判空，要么这个元素本来就该删——把引用一起删掉。\n');
  problems.forEach((p) => console.error(where(p)));
  console.error('\n共 ' + problems.length + ' 处。');
  process.exit(1);
}

console.log('前端引用体检通过：' + htmlIds.size + ' 个 id，'
  + carried.length + ' 处取出即存（不取成员），'
  + guarded.length + ' 处同行已判空，'
  + dynamic.length + ' 处指向运行时创建的节点。');
