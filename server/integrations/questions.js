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
/* 题号 → 出现过的全部章节。题库里有 30 个题号被两个章节同时收录（题面完全相同），
 * 而题目池按题号索引，只能归属一个章节——否则任何计数都会重复。
 * 政策：保留最后加载到的那个章节作为主章节（与改造前一致，不改变用户可见归宿），
 * 其余记录为 alsoInTopics，并允许按别名章节检索，不让它在另一个章节里凭空消失。 */
const topicIndex = new Map();
for (const group of Object.values(ctx.GAOSHU_BANK || {})) {
  for (const p of group.problems || []) {
    const id = String(p.id);
    const defect = KNOWN_DEFECTS[id];
    if (defect && defect.severity === 'broken') { excluded.add(id); continue; }
    const topic = p.topic || group.subject || '综合';
    if (!topicIndex.has(id)) topicIndex.set(id, []);
    topicIndex.get(id).push(topic);
    questions.set(id, {
      id, topic, subject: p.subject || group.subject || '数学', question: p.stem || p.content,
      options: Array.isArray(p.opts) ? Array.from(p.opts) : [],
      answer: String(p.ans || ''), analysis: String(p.solution || ''),
      selfAssessed: !(Array.isArray(p.opts) && /^[A-D]$/.test(p.ans || ''))
    });
  }
}

/* 补上别名章节：同一题号出现在别的章节时，那些章节记在 alsoInTopics */
let aliasCount = 0;
for (const [id, q] of questions) {
  const all = topicIndex.get(id) || [];
  const aliases = all.filter((t) => t !== q.topic);
  q.alsoInTopics = [...new Set(aliases)];
  if (q.alsoInTopics.length) aliasCount += 1;
}
/* 导入批次：独立文件，加载时合并。题号与现有题库冲突的批次整批拒绝，
 * 不做静默覆盖；不合法的批次会被跳过并记录在 importProblems 里。 */
const { loadImports } = require('./question-imports');
const topics = new Set([...questions.values()].map((q) => q.topic));
const imported = loadImports({ existingIds: new Set(questions.keys()), topics });
for (const q of imported.questions) {
  questions.set(q.id, {
    id: q.id, topic: q.topic, subject: q.subject, question: q.question,
    options: q.options, answer: q.answer, analysis: q.analysis,
    selfAssessed: q.selfAssessed,
    difficulty: q.difficulty, type: q.type, batch: q.batch
  });
}

module.exports = {
  questions,
  excluded: [...excluded],
  importedCount: imported.questions.length,
  importProblems: imported.problems,
  aliasCount
};
