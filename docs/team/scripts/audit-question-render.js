#!/usr/bin/env node
/**
 * 题库题面/解析渲染质量审计（只读，不改数据）
 *
 * 用法：
 *   node docs/team/scripts/audit-question-render.js          # 对比旧渲染与 WG_Math
 *   node docs/team/scripts/audit-question-render.js --json   # 输出明细
 *
 * 为什么需要它：
 *   线上题库是 js/gaoshu_bank.js（1823 题），content / solution 是抓取来的原始 LaTeX。
 *   旧路径用 latexToText() 压成纯文本，会留下 √()、孤立反斜杠、HTML 标签；
 *   新路径 js/mathview.js 先清残留再交给 KaTeX。
 *   脚本按两条真实路径各跑一遍，给出缺陷题数与降级率，防止改动回退。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '../../..');
const BANK = path.join(ROOT, 'js/gaoshu_bank.js');
const RENDERER = path.join(ROOT, 'js/gaoshu.js');
const MATHVIEW = path.join(ROOT, 'js/mathview.js');
const KATEX = path.join(ROOT, 'vendor/katex/katex.min.js');

function boot() {
  const ctx = {
    window: {},
    document: {
      getElementById: () => null,
      addEventListener: () => {},
      querySelectorAll: () => [],
      createElement: () => ({ style: {}, classList: { add() {}, remove() {} } }),
    },
    console,
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
    localStorage: { getItem: () => null, setItem: () => {} },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  if (fs.existsSync(KATEX)) vm.runInContext(fs.readFileSync(KATEX, 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(RENDERER, 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(MATHVIEW, 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(BANK, 'utf8'), ctx);
  return ctx;
}

const CHECKS = [
  { key: 'pagePayload', label: '页面源码残留(RSC/JSON)', re: /"\$L\d+|self\.__next_f|"sequence":|__NEXT_DATA__/ },
  { key: 'htmlTag', label: '未清理的 HTML 标签', re: /<\/?(div|span|p|br|img|a|ul|li|table|sup|sub)\b[^>]*>/i },
  { key: 'emptyRadical', label: '空根号 √()', re: /√\(\s*\)/ },
  { key: 'residualCmd', label: '残留 LaTeX 命令', re: /\\[a-zA-Z]{2,}/ },
  { key: 'straySlash', label: '孤立反斜杠', re: /\\\s/ },
  { key: 'entity', label: '未解码实体', re: /&(?:quot|amp|lt|gt|#\d+);/ },
  { key: 'replacement', label: '替换字符/缺字方框', re: /[\ufffd\u25a1]/ },
];

function collect(ctx) {
  const B = ctx.GAOSHU_BANK || ctx.window.GAOSHU_BANK;
  const list = [];
  Object.keys(B || {}).forEach((topic) => {
    (B[topic].problems || []).forEach((p) => list.push({ topic, p }));
  });
  return list;
}

function main() {
  const ctx = boot();
  const G = ctx.WG_Gaoshu;
  const M = ctx.WG_Math;
  const list = collect(ctx);

  const oldBad = {}, newBad = {};
  CHECKS.forEach((c) => { oldBad[c.key] = 0; newBad[c.key] = 0; });
  let oldAny = 0, newAny = 0;
  const samples = [];

  list.forEach(({ topic, p }) => {
    /* 两个字段分别检查：拼在一起会把「题干末尾的反斜杠 + 换行」误判成孤立反斜杠 */
    const oldParts = [G.latexToText(p.content || ''), G.latexToText(p.solution || '')];
    const newParts = [M.plain(p.content || ''), M.plain(p.solution || '')];
    let o = false, n = false;
    CHECKS.forEach((c) => {
      if (oldParts.some((t) => c.re.test(t))) { oldBad[c.key]++; o = true; }
      if (newParts.some((t) => c.re.test(t))) { newBad[c.key]++; n = true; }
    });
    if (o) oldAny++;
    if (n) {
      newAny++;
      const hits = CHECKS.filter((c) => newParts.some((t) => c.re.test(t))).map((c) => c.key);
      if (samples.length < 10) samples.push({ id: p.id, topic, type: p.type, hits });
    }
  });

  const n = list.length || 1;
  const stats = M.stats();
  const result = {
    bank: path.relative(ROOT, BANK),
    totalProblems: list.length,
    old: { problems: oldAny, rate: +(oldAny / n * 100).toFixed(1), byType: oldBad },
    current: { problems: newAny, rate: +(newAny / n * 100).toFixed(1), byType: newBad },
    katex: stats,
    degradedRate: +(stats.degraded / Math.max(1, stats.math) * 100).toFixed(2),
    samples,
  };

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log('题库：' + result.bank + '　共 ' + list.length + ' 题');
  console.log('');
  console.log('旧渲染 latexToText：' + oldAny + ' 题有可见缺陷（' + result.old.rate + '%）');
  console.log('新渲染 WG_Math   ：' + newAny + ' 题有可见缺陷（' + result.current.rate + '%）');
  console.log('');
  console.log('分类对比（旧 → 新）：');
  CHECKS.forEach((c) => {
    console.log('  ' + c.label.padEnd(22, ' ') + String(oldBad[c.key]).padStart(5) + ' → ' + String(newBad[c.key]).padStart(4));
  });
  console.log('');
  console.log('KaTeX：' + stats.katex + ' / ' + stats.math + ' 个公式成功渲染，降级 ' + stats.degraded + '（' + result.degradedRate + '%）');
  if (samples.length) {
    console.log('仍有缺陷的题号：' + samples.map((s) => s.id).join(', ') + (newAny > samples.length ? ' …' : ''));
  }
  process.exitCode = newAny > 0 ? 1 : 0;
}

main();
