'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '../..');
// Use the same vendored libraries as Pages, not stubs or a different installed version.
const markdownit = require('../../vendor/markdown-it/markdown-it.min.js');
const katex = require('../../vendor/katex/katex.min.js');
const script = fs.readFileSync(path.join(root, 'js/ai-render.js'), 'utf8');
function view(libraries = { markdownit, katex }) {
  const sandbox = { window: libraries };
  vm.runInNewContext(script, sandbox);
  return sandbox.WG_AIView;
}
const render = (source) => view().toHtml(source);
const count = (html, marker) => html.split(marker).length - 1;

test('screenshot: Chinese steps, bold labels, heading and LaTeX render together', () => {
  const html = render(String.raw`3. **构造多项式**：将导数值代入泰勒公式。
4. **计算余项**：可以计算余项 \( R_n(x) \)。

### 例子
以 \( f(x) = e^x \) 在 \( x = 0 \) 处的展开为例：

1. **函数和点**：\( f(x) = e^x \)，\( a = 0 \)。
2. **计算导数**：\( f'(x) = e^x \)，\( f''(x) = e^x \)。`);
  assert.match(html, /<ol start="3">/);
  assert.match(html, /<strong>构造多项式<\/strong>/);
  assert.match(html, /<h3>例子<\/h3>/);
  assert.equal(count(html, 'class="katex"'), 7);
  assert.doesNotMatch(html, /ai-math-fallback|katex-error/);
  assert.match(html, /<math /, 'accessible MathML is present');
});

test('all four delimiters protect math from Markdown emphasis/escapes', () => {
  for (const source of [String.raw`\(\frac{x_1}{x_2}+a*b\)`, String.raw`\[\frac{x_1}{x_2}+a*b\]`, '$$\\frac{x_1}{x_2}+a*b$$', '$\\frac{x_1}{x_2}+a*b$']) {
    const html = render(source);
    assert.match(html, /class="katex"/, source);
    assert.doesNotMatch(html, /ai-math-fallback|<em>|katex-error/, source);
  }
});

test('display formulas preserve aligned rows, matrices and blank lines', () => {
  const html = render(String.raw`推导：
\[
\begin{aligned}
f(x)&=1+x+\frac{x^2}{2!}\\
R_n(x)&=\frac{e^\xi x^{n+1}}{(n+1)!}
\end{aligned}
\]

$$
\begin{pmatrix}1&2\\3&4\end{pmatrix}

$$
完成。`);
  assert.equal(count(html, 'class="ai-math-block"'), 2);
  assert.equal(count(html, 'class="katex"'), 2);
  assert.doesNotMatch(html, /ai-math-fallback|katex-error/);
  assert.match(html, /完成。/);
});

test('math blocks work inside numbered steps and blockquotes', () => {
  const html = render('1. 推导\n\n   $$\n   x^2+1\n   $$\n\n2. 下一步\n\n> \\[x+1\\]');
  assert.equal(count(html, 'class="katex"'), 2);
  assert.match(html, /<blockquote>/);
});

test('inline and fenced code remain literal even when they contain math', () => {
  const html = render('`\\(x^2\\)`\n\n```latex\n\\[x^2\\]\n```');
  assert.doesNotMatch(html, /class="katex"/);
  assert.match(html, /<code>\\\(x\^2\\\)<\/code>/);
  assert.match(html, /<pre><code class="language-latex">/);
});

test('escaped delimiters and ordinary currency are not formulas', () => {
  for (const source of [String.raw`价格 \$5 和 \$10`, '价格 $5 和 $10', '只需 $5.00，余额 $10.00', String.raw`源码 \\(x\\)`]) {
    assert.doesNotMatch(render(source), /class="katex"/, source);
  }
});

test('HTML, script URLs, tracking images and trusted TeX cannot create active content', () => {
  const html = render(String.raw`<script>alert(1)</script><img src=x onerror=alert(1)>
[危险](javascript:alert(1))
![跟踪](https://example.com/track.png)
\(\href{javascript:alert(1)}{点击}\)
\(\htmlClass{injected}{x}\)
[资料](https://example.com/math)`);
  assert.doesNotMatch(html, /<script|<img|href="javascript:|class="injected"|onerror="/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test('partial and invalid formulas keep the answer readable instead of throwing', () => {
  for (const raw of [String.raw`先求导 \(\frac{1}{`, String.raw`答案 \(\notARealCommand{x}\) 后文`, '$$\n\\frac{\n$$\n后文']) {
    const html = render(raw);
    assert.ok(html.length > 0);
    assert.doesNotMatch(html, /katex-error/);
    if (raw.includes('后文')) assert.match(html, /后文/);
  }
});

test('absent dependencies degrade safely and can recover once libraries are ready', () => {
  const libraries = {}, v = view(libraries);
  assert.match(v.toHtml('<img src=x>'), /&lt;img/);
  libraries.markdownit = markdownit;
  assert.match(v.toHtml(String.raw`\(x^2\)`), /ai-math-fallback/);
  libraries.katex = katex;
  assert.match(v.toHtml(String.raw`\(x^2\)`), /class="katex"/);
});

test('mount keeps original Markdown/LaTeX for storage and later conversation turns', () => {
  const v = view(), node = { classList: { add() {} }, innerHTML: '', textContent: 'duplicated KaTeX glyphs' };
  const raw = String.raw`**答案**：\(\frac{1}{2}\)`;
  v.mount(node, raw);
  assert.match(node.innerHTML, /class="katex"/);
  assert.equal(v.source(node), raw);
  v.mount(node, '请求失败');
  assert.equal(v.source(node), '请求失败');
  assert.equal(v.source({ textContent: '用户原文' }), '用户原文');
});
