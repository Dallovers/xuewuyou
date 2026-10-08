'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ctx = vm.createContext({});
// Only the bundled bank is evaluated; no uploaded document is executable.
vm.runInContext(fs.readFileSync(path.join(__dirname, '../../js/gaoshu_bank.js'), 'utf8'), ctx, { timeout: 5000 });
const questions = new Map();
for (const group of Object.values(ctx.GAOSHU_BANK || {})) {
  for (const p of group.problems || []) {
    questions.set(String(p.id), {
      id: String(p.id), topic: p.topic || group.subject || '综合', subject: p.subject || group.subject || '数学', question: p.stem || p.content,
      options: Array.isArray(p.opts) ? Array.from(p.opts) : [],
      answer: String(p.ans || ''), analysis: String(p.solution || ''),
      selfAssessed: !(Array.isArray(p.opts) && /^[A-D]$/.test(p.ans || ''))
    });
  }
}
module.exports = { questions };
