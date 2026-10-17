'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { KNOWN_DEFECTS } = require('./question-audit');
const ctx = vm.createContext({});
// Only the bundled bank is evaluated; no uploaded document is executable.
vm.runInContext(fs.readFileSync(path.join(__dirname, '../../js/gaoshu_bank.js'), 'utf8'), ctx, { timeout: 5000 });
const questions = new Map();
/* 已登记为 broken 的题（题面或选项损坏、答案无法确定）不进题目池：
 * 练习、竞技、掌握度估计、题库地图都从这里取数据，过滤一处即可全局一致。
 * cosmetic 级（仅选项冗余但答案唯一）仍然保留。
 * 登记表见 ./question-audit.js，缺陷修好后从登记表移除即可自动恢复。 */
const excluded = new Set();
for (const group of Object.values(ctx.GAOSHU_BANK || {})) {
  for (const p of group.problems || []) {
    const id = String(p.id);
    const defect = KNOWN_DEFECTS[id];
    if (defect && defect.severity === 'broken') { excluded.add(id); continue; }
    questions.set(id, {
      id, topic: p.topic || group.subject || '综合', subject: p.subject || group.subject || '数学', question: p.stem || p.content,
      options: Array.isArray(p.opts) ? Array.from(p.opts) : [],
      answer: String(p.ans || ''), analysis: String(p.solution || ''),
      selfAssessed: !(Array.isArray(p.opts) && /^[A-D]$/.test(p.ans || ''))
    });
  }
}
module.exports = { questions, excluded: [...excluded] };
