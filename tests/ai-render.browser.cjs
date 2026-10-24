/* Browser regression with deterministic AI fixtures; no real AI account/key is used.
 * Install the existing campus-hub dev dependencies, serve repo root, then run:
 * NODE_PATH=js/features/campus-hub/node_modules node tests/ai-render.browser.cjs
 * AI_RENDER_BASE and AI_RENDER_OUTPUT optionally override URL and screenshot directory.
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.AI_RENDER_BASE || 'http://127.0.0.1:4190/';
const output = process.env.AI_RENDER_OUTPUT || path.join(__dirname, '../previews/ai-math');
const answer = String.raw`### 泰勒展开：以指数函数为例
以 \(f(x)=e^x\) 在 \(x=0\) 处展开为例：

1. **函数和点**：\(f(x)=e^x\)，\(a=0\)。
2. **计算导数**：\(f'(x)=f''(x)=e^x\)，各阶导数在零点的值均为 1。
3. **构造多项式**：将计算出的导数值代入泰勒公式。

\[
e^x=1+x+\frac{x^2}{2!}+\cdots+\frac{x^n}{n!}+R_n(x)
\]

4. **计算余项**：用 \(R_n(x)=\frac{e^{\xi}x^{n+1}}{(n+1)!}\) 估计误差。

> 先确定展开点，再求各阶导数，最后代入公式。`;

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const reports = [];
  try {
    for (const [name, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
      const page = await context.newPage(), errors = [], sent = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/api/**', async route => {
        const pathname = new URL(route.request().url()).pathname;
        let body = {};
        if (pathname === '/api/ai/chat' || pathname === '/api/ai/vision') {
          sent.push(route.request().postDataJSON());
          body = { content: answer };
        } else if (pathname === '/api/ai/notes') {
          body = { notes: [{ id: 'fixture', kind: 'explain', nick: '测试同学', question: '泰勒展开', answer, createdAt: Date.now() }] };
        }
        await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
      });
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.StudyAppBridge?.ready && window.WG_AIView);
      if (await page.locator('#obSkip').isVisible()) await page.locator('#obSkip').click();
      await page.evaluate(() => StudyAppBridge.navTo('ai'));
      await page.locator('#aiToolsChat').click();
      await page.locator('#aiInput').fill('泰勒公式怎么用？');
      await page.locator('#aiSend').click();
      await page.waitForFunction(() => document.querySelectorAll('#aiMsgs .bot .katex').length >= 5);
      const last = page.locator('#aiMsgs .bot').last();
      assert.equal(await last.locator('h3').count(), 1);
      assert.equal(await last.locator('strong').count(), 4);
      assert.equal(await last.locator('.ai-math-block .katex').count(), 1);
      assert.equal(await last.locator('.katex-error,.ai-math-fallback').count(), 0);
      assert.equal(await last.locator('math').count(), await last.locator('.katex').count());
      assert.equal(await page.evaluate(raw => JSON.parse(localStorage.getItem('xwy_ai_chat')).at(-1).text === raw, answer), true);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('#aiMsgs').evaluate(el => el.scrollTop = 0);
      await page.locator('#aiSide').screenshot({ path: path.join(output, `${name}.png`) });

      // Restored history must render once and send original source to the AI, not duplicate glyphs.
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.StudyAppBridge?.ready);
      await page.evaluate(() => StudyAppBridge.navTo('ai'));
      await page.locator('#aiToolsChat').click();
      assert.ok(await page.locator('#aiMsgs .bot .katex').count() >= 5);
      await page.locator('#aiInput').fill('再解释一下余项');
      await page.locator('#aiSend').click();
      await page.waitForFunction(() => document.querySelectorAll('#aiMsgs .bot h3').length === 2);
      assert.equal(sent.at(-1).messages.filter(message => message.role === 'assistant').at(-1).content, answer);

      // Photograph -> answer uses the same renderer.
      await page.locator('#aiPhotoInput').setInputFiles({ name: 'test.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfAAAAABJRU5ErkJggg==', 'base64') });
      await page.waitForFunction(() => !document.getElementById('aiPhotoPreview').classList.contains('hidden'));
      await page.locator('#aiSend').click();
      await page.waitForFunction(() => document.querySelectorAll('#aiMsgs .bot h3').length === 3);

      // A long formula scrolls within the bubble instead of expanding the document or dialog.
      const layout = await page.evaluate(() => {
        const node = document.createElement('div'); node.className = 'ai-msg bot';
        document.getElementById('aiMsgs').append(node);
        WG_AIView.mount(node, '\\[' + Array(24).fill('\\frac{x^{n+1}}{(n+1)!}').join('+') + '\\]');
        const formula = node.querySelector('.ai-math-block');
        return { pageOverflow: document.documentElement.scrollWidth - innerWidth, bubbleOverflow: node.scrollWidth - node.clientWidth, formulaScrolls: formula.scrollWidth > formula.clientWidth };
      });
      assert.ok(layout.pageOverflow <= 1, JSON.stringify(layout));
      assert.ok(layout.bubbleOverflow <= 1, JSON.stringify(layout));
      assert.equal(layout.formulaScrolls, true);

      // Main AI tools and saved public answers use the same renderer.
      await page.locator('#aiSideClose').click();
      await page.evaluate(() => { WG_API.isCloudSession = () => true; StudyAppBridge.navTo('ai'); });
      await page.locator('#aiToolQuestion').fill('求指数函数的泰勒展开');
      await page.locator('#aiExplainDemo').click();
      await page.waitForFunction(() => document.querySelector('#aiChat .katex'));
      await page.waitForFunction(() => document.querySelector('#aiNotesList .ai-rich-text .katex'), null, { timeout: 5000 }).catch(async error => {
        throw new Error(error.message + '\nPublic answer: ' + await page.locator('#aiNotesList').innerText() + '\nPage errors: ' + JSON.stringify(errors));
      });
      assert.equal(await page.locator('#aiChat .katex-error').count(), 0);
      await page.locator('#aiNotesList summary').first().click();
      assert.equal(await page.locator('#aiNotesList .ai-rich-text').evaluate(node => getComputedStyle(node).whiteSpace), 'normal');

      // Partial responses can be re-mounted without an exception or duplicate formulas.
      const partial = await page.evaluate(() => {
        const node = document.createElement('div');
        WG_AIView.mount(node, '**答案**：\\(\\frac{1}{');
        WG_AIView.mount(node, '**答案**：\\(\\frac{1}{2}\\)');
        return { formulas: node.querySelectorAll('.katex').length, raw: WG_AIView.source(node) };
      });
      assert.equal(partial.formulas, 1);
      assert.equal(partial.raw, String.raw`**答案**：\(\frac{1}{2}\)`);
      assert.deepEqual(errors, []);
      reports.push({ viewport: name, checks: ['chat', 'history', 'original source', 'photo answer', 'long formula', 'AI tool', 'public answer', 'partial update'], layout, pageErrors: errors.length });
      await context.close();
    }
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(reports, null, 2));
    console.log(JSON.stringify(reports, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
