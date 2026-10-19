'use strict';
/* 题面公式渲染层 WG_Math（js/mathview.js）
 *
 * 这一层只做前端，没有后端能测，所以用 vm 把文件加载进来，配一个假 KaTeX：
 * 遇到指定条件就抛错（模拟 KaTeX 解析失败），否则返回占位串。
 * 这样就能验证「失败 → 修正 → 重试 → 还不行才降级」这条链，
 * 而不用真的跑一个浏览器。
 *
 * 钉四件事：脏命令被修掉、修正只做一次、计数器算得对、修不好也不抛。
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'mathview.js'), 'utf8');

/* 数「没被反斜杠转义」的花括号，用来判断 KaTeX 会不会报配平错误 */
function unbalanced(tex) {
  const count = (ch) => tex.split('').filter((c, i) => c === ch && tex[i - 1] !== '\\').length;
  return count('{') !== count('}');
}

/* 每次都新建一份模块实例，免得 stats 互相污染 */
function load(shouldThrow) {
  const calls = [];
  const katex = {
    renderToString(tex) {
      calls.push(tex);
      if (shouldThrow(tex)) throw new Error('KaTeX parse error');
      return '<span class="katex">' + tex + '</span>';
    }
  };
  const sandbox = { window: { katex }, console };
  vm.runInNewContext(SRC, sandbox, { filename: 'mathview.js' });
  const math = sandbox.window.WG_Math;
  return {
    math,
    calls,
    render(tex) {
      const html = math.toHtml('$' + tex + '$');
      return { html, calls, last: calls[calls.length - 1] };
    }
  };
}

test('KaTeX 不认的简写命令会被修正后重试一次', () => {
  const m = load((tex) => tex.includes('\\symbf'));
  const r = m.render('\\symbf{v}');

  assert.equal(r.calls.length, 2, '应该只重试一次');
  assert.ok(r.last.includes('\\mathbf'), '修正后应是 \\mathbf：' + r.last);
  assert.ok(!r.last.includes('\\symbf'), '修正后不该还留着 \\symbf');
  assert.equal(m.math.stats().repaired, 1);
});

test('\\ds 这类简写也会被展开成完整命令', () => {
  const m = load((tex) => tex.includes('\\ds'));
  const r = m.render('\\ds\\sum_{i=1}^{n} i');

  assert.equal(r.calls.length, 2);
  assert.ok(r.last.includes('\\displaystyle'), r.last);
});

test('集合里多出来的右括号会被去掉，修完能正常渲染', () => {
  const tex = '\\left\\{ \\left\\{ {a}} \\right\\} \\right\\}';
  const m = load(unbalanced);
  const r = m.render(tex);

  assert.equal(r.calls.length, 2, '第一遍失败、修正后应重试');
  assert.equal(unbalanced(r.last), false, '修正后花括号应配平：' + r.last);
  assert.ok(r.html.includes('katex'), '应该渲染成功而不是降级');
  assert.equal(m.math.stats().repaired, 1);
});

test('修正不产生变化时不白重试，修不好降级也不抛错', () => {
  const m = load(() => true);
  const r = m.render('\\frac{1}{');

  assert.equal(r.calls.length, 1, '修不出变化就不该再调一次 KaTeX');
  assert.ok(r.html.includes('tex-fallback'), '修不好应降级成纯文本：' + r.html);
  assert.equal(m.math.stats().degraded, 1);
});

test('重置计数后 repaired 归零，且对外读得到这个键', () => {
  const m = load((tex) => tex.includes('\\symbf'));
  m.render('\\symbf{v}');
  assert.equal(m.math.stats().repaired, 1);

  m.math.resetStats();
  const after = m.math.stats();
  assert.equal(after.repaired, 0, 'reset 之后必须归零');
  assert.deepEqual(
    Object.keys(after).sort(),
    ['degraded', 'katex', 'math', 'noKatex', 'repaired'],
    '对外暴露的键要和内部计数一一对应'
  );
});
