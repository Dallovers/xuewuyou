'use strict';
/* 题目详情（difficulty / type / isExam）的懒加载索引（A04）
 *
 * 为什么单独一个模块：server/integrations/questions.js 只映射了题目内容相关字段，
 * 没有 difficulty / type；而那个文件正被题库质量的 PR 修改，这里不再动它，
 * 避免两条分支改同一处代码。索引在首次使用时才建立（约一次 3.68 MB 解析），
 * 之后常驻内存。
 *
 * 后续可合并回 questions.js 一次扫描搞定，届时删掉本文件即可。
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let index = null;

function loadAll() {
  if (index) return index;
  const ctx = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../../js/gaoshu_bank.js'), 'utf8'), ctx, { timeout: 5000 });
  index = new Map();
  for (const [, group] of Object.entries(ctx.GAOSHU_BANK || {})) {
    for (const p of group.problems || []) {
      index.set(String(p.id), {
        difficulty: String(p.difficulty || ''),
        type: String(p.type || ''),
        isExam: !!p.isExam
      });
    }
  }
  return index;
}

function detailOf(id) {
  return loadAll().get(String(id)) || { difficulty: '', type: '', isExam: false };
}

module.exports = { detailOf, loadAll };
