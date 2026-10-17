'use strict';
/* 填空题判分：WG_QE.sameAnswer（A03/前端判分）
 *
 * 这是全站唯一决定「填空答案算不算对」的函数。判松了会放过错的，判紧了会冤枉对的
 * ——学生把 1 写成 1.0 被判错，是比不判分更伤人的那种错误。
 *
 * js/qenhance.js 不依赖 DOM，可以直接在 Node 里加载真实实现来测，不需要浏览器。
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'qenhance.js'), 'utf8'), ctx, { timeout: 10000 });
const sameAnswer = ctx.WG_QE.sameAnswer;

test('完全一致与常见书写差异都算对', () => {
  assert.equal(sameAnswer('1', '1'), true);
  assert.equal(sameAnswer(' 1 ', '1'), true, '前后空格不应影响');
  assert.equal(sameAnswer('x', 'x'), true);
  assert.equal(sameAnswer('X', 'x'), true, '大小写不应影响');
  assert.equal(sameAnswer('（1）', '(1)'), true, '全角括号应归一');
  assert.equal(sameAnswer('2×3', '2·3'), true, '不同乘号写法应归一');
});

test('LaTeX 包装与可读写法等价', () => {
  assert.equal(sameAnswer('\\frac{1}{2}', '1/2'), true);
  assert.equal(sameAnswer('\\dfrac{1}{2}', '1/2'), true, '\\dfrac 与 \\frac 必须等价（题库里两种都有）');
  assert.equal(sameAnswer('\\sqrt{2}', '√2'), true);
  assert.equal(sameAnswer('\\pi', 'π'), true);
  assert.equal(sameAnswer('\\infty', '∞'), true);
  assert.equal(sameAnswer('{x}', 'x'), true, '多余的 LaTeX 花括号应被忽略');
});

test('数值等价：多余的零不应导致判错（回归）', () => {
  /* 曾经的实现用 String(parseFloat(x)) === x 判断「是不是纯数字」，
     于是 1.0 / 0.50 / 0.0 都被当成非数字，学生写 1.0 而答案是 1 会被判错。 */
  assert.equal(sameAnswer('1.0', '1'), true, '1.0 与 1 应等价');
  assert.equal(sameAnswer('1', '1.0'), true);
  assert.equal(sameAnswer('0.50', '0.5'), true);
  assert.equal(sameAnswer('0', '0.0'), true);
  assert.equal(sameAnswer('-2', '-2.00'), true);
  assert.equal(sameAnswer('-0', '0'), true, '-0 与 0 应等价');
});

test('数值容差保持收紧，不会把明显不同的数判成相等', () => {
  assert.equal(sameAnswer('1.0000001', '1'), false, '相差 1e-7 应判错');
  assert.equal(sameAnswer('1.0000000001', '1'), true, '相差 1e-10 在容差内');
  assert.equal(sameAnswer('2', '3'), false);
});

test('不把非数字当成数字（避免 2x 被当成 2）', () => {
  assert.equal(sameAnswer('2x', '2'), false);
  assert.equal(sameAnswer('2x', '2x'), true);
  assert.equal(sameAnswer('x2', 'x'), false);
  assert.equal(sameAnswer('π', '3.14'), false, '不同表示形式不做近似');
});

test('空值一律判错，不会因为"都为空"而算对', () => {
  assert.equal(sameAnswer('', ''), false);
  assert.equal(sameAnswer(null, '1'), false);
  assert.equal(sameAnswer('1', null), false);
  assert.equal(sameAnswer(undefined, undefined), false);
  assert.equal(sameAnswer('   ', '   '), false);
});

test('数字类型与字符串可以互比', () => {
  assert.equal(sameAnswer(1, '1'), true);
  assert.equal(sameAnswer(1.5, '1.5'), true);
  assert.equal(sameAnswer(0, '0'), true);
});

test('已知限制：分数与小数不互相换算', () => {
  /* 这是刻意保留的：要支持就得求值表达式，风险远大于收益。
     记录在这里，避免以后有人以为是 bug 而去"修"坏判分。 */
  assert.equal(sameAnswer('1/2', '0.5'), false);
  assert.equal(sameAnswer('\\frac{1}{2}', '0.5'), false);
});
