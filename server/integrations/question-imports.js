'use strict';
/* ============ 题库导入批次：校验与加载（A03） ============
 *
 * 为什么不直接改 js/gaoshu_bank.js：
 *   那是 3.68 MB 的单行生成文件，每次导入都重写它会产生巨大 diff、极易冲突，
 *   也没法按批次回滚。
 *
 * 所以导入走独立批次：server/content/question-imports/<批次>.json
 *   - 导入 = 新增一个批次文件（git 可审阅）
 *   - 回滚 = 删掉那个批次文件，下一次启动就不再包含
 *   - 批次内的题目在加载时与题库合并，题号冲突直接拒绝，不静默覆盖
 *
 * 校验规则（任何一条不过，整批拒绝，不做「导入一部分」）：
 *   id 为数字串、批内唯一、与题库及已登记缺陷题不冲突；章节必须已存在；
 *   题干非空；有选项时选项不重复且答案为 A–D；无选项时答案必须为空。
 */
const fs = require('fs');
const path = require('path');
const { KNOWN_DEFECTS } = require('./question-audit');

const DEFAULT_DIR = path.join(__dirname, '..', 'content', 'question-imports');
const MAX_BATCH_QUESTIONS = 500;

function batchDir(dir) {
  return dir || process.env.QUESTION_IMPORT_DIR || DEFAULT_DIR;
}

function listBatchFiles(dir) {
  const d = batchDir(dir);
  let names;
  try { names = fs.readdirSync(d); } catch { return []; }
  return names.filter((n) => n.endsWith('.json')).sort().map((n) => ({ name: n, file: path.join(d, n) }));
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

/* 校验一个批次。existingIds / topics 由调用方传入，保证与当前题库一致。 */
function validateBatch(batch, { existingIds, topics } = {}) {
  const errors = [];
  const warnings = [];

  if (!batch || typeof batch !== 'object') throw new Error('批次内容必须是对象');
  if (!isNonEmptyString(batch.name)) errors.push('缺少批次名 name');
  if (!Array.isArray(batch.questions)) throw new Error('questions 必须是数组');
  if (batch.questions.length === 0) errors.push('批次没有题目');
  if (batch.questions.length > MAX_BATCH_QUESTIONS) {
    errors.push('单批题目不得超过 ' + MAX_BATCH_QUESTIONS + ' 道，当前 ' + batch.questions.length);
  }

  const seen = new Set();
  batch.questions.forEach((q, i) => {
    const at = '第 ' + (i + 1) + ' 题';
    if (!q || typeof q !== 'object') { errors.push(at + ' 不是对象'); return; }

    const id = String(q.id == null ? '' : q.id);
    if (!/^\d+$/.test(id)) errors.push(at + ' 的 id 必须是数字串');
    else if (seen.has(id)) errors.push(at + ' 的题号 ' + id + ' 在本批内重复');
    else if (existingIds && existingIds.has(id)) errors.push(at + ' 的题号 ' + id + ' 与现有题库冲突');
    else if (KNOWN_DEFECTS[id]) errors.push(at + ' 的题号 ' + id + ' 已于缺陷登记表中标为有问题');
    seen.add(id);

    if (!isNonEmptyString(q.stem)) errors.push(at + '（' + id + '）题干为空');
    if (!isNonEmptyString(q.topic)) errors.push(at + '（' + id + '）缺少章节 topic');
    else if (topics && topics.size && !topics.has(q.topic)) {
      errors.push(at + '（' + id + '）的章节「' + q.topic + '」不在现有章节里，新增章节需先改课程配置');
    }
    if (!isNonEmptyString(q.subject)) warnings.push(at + '（' + id + '）缺少 subject');
    if (!isNonEmptyString(q.difficulty)) warnings.push(at + '（' + id + '）缺少 difficulty');
    if (!isNonEmptyString(q.type)) warnings.push(at + '（' + id + '）缺少 type');
    if (!isNonEmptyString(q.solution)) warnings.push(at + '（' + id + '）缺少解析 solution');

    const opts = Array.isArray(q.opts) ? q.opts : [];
    if (opts.length) {
      if (opts.length < 2) errors.push(at + '（' + id + '）选项少于 2 个');
      if (opts.some((o) => !isNonEmptyString(String(o == null ? '' : o)))) errors.push(at + '（' + id + '）存在空选项');
      const trimmed = opts.map((o) => String(o).trim());
      if (new Set(trimmed).size !== trimmed.length) errors.push(at + '（' + id + '）选项内容重复');
      const ans = String(q.ans == null ? '' : q.ans).trim();
      if (!/^[A-D]$/.test(ans)) errors.push(at + '（' + id + '）有选项但答案不是 A–D');
      else if ('ABCD'.indexOf(ans) >= opts.length) errors.push(at + '（' + id + '）答案 ' + ans + ' 超出选项范围');
    } else {
      if (String(q.ans == null ? '' : q.ans).trim() !== '') {
        errors.push(at + '（' + id + '）没有选项却给了答案，主观题不应有结构化答案');
      }
    }
  });

  return { ok: errors.length === 0, errors, warnings, count: batch.questions.length };
}

/* 加载全部批次。单个批次不合法时跳过并记录，不让整个服务起不来，
   但会把问题暴露在 importProblems 里供测试与冒烟发现。 */
function loadImports({ dir, existingIds, topics } = {}) {
  const questions = [];
  const problems = [];
  for (const { name, file } of listBatchFiles(dir)) {
    let batch;
    try {
      batch = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      problems.push({ batch: name, errors: ['JSON 解析失败：' + e.message] });
      continue;
    }
    let result;
    try {
      result = validateBatch(batch, { existingIds, topics });
    } catch (e) {
      problems.push({ batch: name, errors: [e.message] });
      continue;
    }
    if (!result.ok) {
      problems.push({ batch: name, errors: result.errors });
      continue;
    }
    for (const q of batch.questions) {
      const opts = Array.isArray(q.opts) ? q.opts.map(String) : [];
      questions.push({
        id: String(q.id),
        topic: q.topic,
        subject: q.subject || '高等数学',
        question: q.stem,
        options: opts,
        answer: String(q.ans == null ? '' : q.ans),
        analysis: String(q.solution || ''),
        selfAssessed: !(opts.length && /^[A-D]$/.test(String(q.ans || ''))),
        difficulty: String(q.difficulty || ''),
        type: String(q.type || ''),
        batch: name
      });
      /* 同批通过校验后，后续批次的同题号将被视为冲突 */
      if (existingIds) existingIds.add(String(q.id));
    }
  }
  return { questions, problems };
}

module.exports = { DEFAULT_DIR, batchDir, listBatchFiles, validateBatch, loadImports, MAX_BATCH_QUESTIONS };
