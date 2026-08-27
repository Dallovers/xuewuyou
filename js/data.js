/* ============ 稳过 · 数据层：大陆 / 题库模块 ============ */
'use strict';

/* 大陆配置：纯刷题模式，按学科归类、模块合并 */
var CONTINENTS = [
  {
    id: 'study',
    name: '数学',
    group: 'study',
    tag: 'MATH',
    desc: '1823 道真题级题库：高等数学 1026 · 线性代数 528 · 概率论 269，分三大子板块自由练习',
    boss: '',
    color: '#67e8f9',
    unlocked: true,
    levels: [
      /* n: 0 = 不限量，把这一关覆盖的知识点全部题目放进一轮（答题卡按题库题量列全） */
      /* 高等数学 */
      { id: 'b1', name: '高数（上册）', type: 'gaoshu', group: '高等数学', topicList: ['函数与极限', '导数与微分', '中值定理', '一元积分'], n: 0, diff: 2, free: true },
      { id: 'b2', name: '高数（下册）', type: 'gaoshu', group: '高等数学', topicList: ['多元函数微分', '重积分', '曲线曲面积分', '无穷级数', '微分方程'], n: 0, diff: 2, free: true },
      { id: 'b3', name: '高数综合刷题', type: 'gaoshu', group: '高等数学', subject: '高等数学', n: 0, diff: 2, free: true },
      /* 线性代数 */
      { id: 'l1', name: '线代基础', type: 'gaoshu', group: '线性代数', topicList: ['行列式', '矩阵运算', '线性方程组', '向量组与秩'], n: 0, diff: 2, free: true },
      { id: 'l2', name: '线代进阶', type: 'gaoshu', group: '线性代数', topicList: ['特征值与特征向量', '相似对角化', '二次型'], n: 0, diff: 2, free: true },
      { id: 'l3', name: '线代综合刷题', type: 'gaoshu', group: '线性代数', subject: '线性代数', n: 0, diff: 2, free: true },
      /* 概率论 */
      { id: 'p1', name: '概率基础', type: 'gaoshu', group: '概率论', topicList: ['随机事件与概率', '一维随机变量', '二维随机变量'], n: 0, diff: 2, free: true },
      { id: 'p2', name: '概率进阶', type: 'gaoshu', group: '概率论', topicList: ['数字特征', '大数定律与中心极限定理', '参数估计', '假设检验'], n: 0, diff: 2, free: true },
      { id: 'p3', name: '概率综合刷题', type: 'gaoshu', group: '概率论', subject: '概率论', n: 0, diff: 2, free: true }
    ],
    bossLevel: null
  },
  {
    id: 'english',
    name: '英语',
    group: 'english',
    tag: 'ENGLISH',
    desc: '四级核心词 1372 + 六级进阶词 1021，已滤掉初高中基础词汇，覆盖四六级全部考点',
    boss: '',
    color: '#f472b6',
    unlocked: true,
    levels: [
      { id: 's7', name: '四级核心词', type: 'practice', kw: '四级词汇', bank: 'ENGLISH_CET4', group: '四级', n: 20, diff: 2, free: true },
      { id: 's8', name: '六级进阶词', type: 'practice', kw: '六级词汇', bank: 'ENGLISH_CET6', group: '六级', n: 20, diff: 3, free: true }
    ]
  },
  {
    id: 'ielts',
    name: '雅思',
    group: 'ielts',
    tag: 'IELTS',
    desc: '剑桥雅思真题考点词：阅读同义替换 90 · 核心词汇 66 · 写作高分替换 36，冲 7 分必备',
    boss: '',
    color: '#a78bfa',
    unlocked: true,
    levels: [
      { id: 'i1', name: '阅读同义替换', type: 'practice', kw: '雅思阅读', bank: 'IELTS_SYNONYM', group: '雅思阅读', n: 15, diff: 3, free: true },
      { id: 'i2', name: '核心词汇', type: 'practice', kw: '雅思词汇', bank: 'IELTS_VOCAB', group: '雅思词汇', n: 15, diff: 2, free: true },
      { id: 'i3', name: '写作高分替换', type: 'practice', kw: '雅思写作', bank: 'IELTS_WRITING', group: '雅思写作', n: 12, diff: 2, free: true }
    ]
  },
  {
    id: 'computer',
    name: '计算机考级',
    tag: 'NCRE',
    desc: '计算机二级（Office / C语言 / Python）+ 三级四级进阶',
    boss: '敬请期待',
    color: '#67e8f9',
    unlocked: false,
    levels: []
  },
  {
    id: 'final',
    name: '速通城',
    tag: 'FINAL CITY',
    desc: '期末专业课冲刺，Boss 是 DDL 大魔王',
    boss: 'Boss：DDL 大魔王',
    color: '#fbbf24',
    unlocked: false,
    levels: []
  }
];

/* 按大陆取全部关卡（含 Boss） */
function getLevelsOf(continentId) {
  var c = CONTINENTS.find(function (x) { return x.id === continentId; });
  if (!c) return [];
  return c.levels.concat(c.bossLevel ? [c.bossLevel] : []);
}

function getContinent(id) {
  return CONTINENTS.find(function (x) { return x.id === id; });
}

/* 在全部已解锁大陆中按 id 查找关卡（跨大陆找模块） */
function findLevel(levelId) {
  for (var i = 0; i < CONTINENTS.length; i++) {
    var c = CONTINENTS[i];
    if (!c.unlocked) continue;
    var lv = getLevelsOf(c.id).find(function (l) { return l.id === levelId; });
    if (lv) return lv;
  }
  return null;
}

/* 查找关卡所属大陆 */
function findLevelContinent(levelId) {
  for (var i = 0; i < CONTINENTS.length; i++) {
    var c = CONTINENTS[i];
    if (!c.unlocked) continue;
    if (getLevelsOf(c.id).some(function (l) { return l.id === levelId; })) return c;
  }
  return null;
}

/* ============ 高数题库生成器 ============
 * 每道题带 answer(整数 1-8) 与 topic(知识点)，供学情报告统计
 * ======================================== */
function rnd(n) { return Math.floor(Math.random() * n); }
function choice(arr) { return arr[rnd(arr.length)]; }

function polyStr(a, b, c) {
  var s = (a === 1 ? 'x²' : a + 'x²');
  if (b > 0) s += '+' + (b === 1 ? 'x' : b + 'x');
  else if (b < 0) s += '−' + (b === -1 ? 'x' : (-b) + 'x');
  if (c > 0) s += '+' + c;
  else if (c < 0) s += '−' + (-c);
  return s;
}

function genCalcProblem(k, diff) {
  var d = diff || 1;
  var v = rnd(d >= 3 ? 12 : (d >= 2 ? 9 : 6));
  if (v === 0) {
    /* 导数：f'(1) = k */
    if (k >= 3) {
      var a = 1 + rnd(Math.floor((k - 1) / 2));
      var b = k - 2 * a;
      var c = 1 + rnd(8);
      return { text: 'f(x) = ' + polyStr(a, b, c) + '，求 f′(1)', answer: k, topic: '导数', diff: 2 };
    }
    return { text: 'f(x) = ' + k + 'x + 7，求 f′(x)', answer: k, topic: '导数', diff: 0 };
  }
  if (v === 1) {
    /* 定积分：∫₀¹ (ax+b) dx = k */
    var a2 = choice([2, 4, 6, 8]);
    var b2 = k - a2 / 2;
    var s2 = a2 + 'x' + (b2 > 0 ? '+' + b2 : (b2 < 0 ? '−' + (-b2) : ''));
    return { text: '∫₀¹ (' + s2 + ') dx = ?', answer: k, topic: '积分', diff: 1 };
  }
  if (v === 2) return { text: 'lim(x→0) sin(' + k + 'x)/x = ?', answer: k, topic: '极限', diff: 2 };
  if (v === 3) return { text: 'lim(x→0) (e^(' + k + 'x) − 1)/x = ?', answer: k, topic: '极限', diff: 2 };
  if (v === 4) return { text: 'lim(n→∞) (' + k + ' + 1/n) = ?', answer: k, topic: '极限', diff: 1 };
  if (v === 5) return { text: 'lim(x→0) tan(' + k + 'x)/x = ?', answer: k, topic: '极限', diff: 2 };
  if (v === 6) return { text: 'lim(x→0) ln(1 + ' + k + 'x)/x = ?', answer: k, topic: '极限', diff: 3 };
  if (v === 7) return { text: 'f(x) = sin(' + k + 'x)，求 f′(0)', answer: k, topic: '导数', diff: 2 };
  if (v === 8) return { text: 'f(x) = e^(' + k + 'x)，求 f′(0)', answer: k, topic: '导数', diff: 2 };
  if (v === 9) return { text: 'F(x) = ∫₀ˣ ' + k + 't dt，求 F′(1)', answer: k, topic: '积分', diff: 3 };
  if (v === 10) return { text: 'lim(x→∞) (2' + k + 'x + 1)/(2x + 3) = ?', answer: k, topic: '极限', diff: 3 };
  return { text: 'f(x) = (x+1)^' + k + '，求 f′(0)', answer: k, topic: '导数', diff: 2 };
}

function genAlgProblem(k) {
  var v = rnd(7);
  if (v === 0) {
    var a = choice([2, 3, 4]);
    return { text: a + 'x − ' + ((a - 1) * k) + ' = x，求 x', answer: k, topic: '代数', diff: 1 };
  }
  if (v === 1) {
    var a2 = choice([2, 3, 4]);
    var b2 = 1 + rnd(8);
    return { text: a2 + 'x + ' + b2 + ' = ' + (a2 * k + b2) + '，求 x', answer: k, topic: '代数', diff: 1 };
  }
  if (v === 2) {
    var a3 = 1 + rnd(4);
    var b3 = 1 + rnd(8);
    var c3 = k - a3 * b3;
    return { text: a3 + ' × ' + b3 + (c3 > 0 ? ' + ' + c3 : c3 < 0 ? ' − ' + (-c3) : '') + ' = ?', answer: k, topic: '代数', diff: 0 };
  }
  if (v === 3) return { text: '若 x > 0 且 x² = ' + (k * k) + '，求 x', answer: k, topic: '代数', diff: 0 };
  if (v === 4) return { text: 'log₂(2^' + k + ') = ?', answer: k, topic: '对数', diff: 1 };
  if (v === 5) return { text: '借出 ' + (k - 2) + ' 支笔后还剩 2 支，原来有几支笔？', answer: k, topic: '应用', diff: 0 };
  if (k % 2 === 0) return { text: '(1/2)x + 3 = ' + (k / 2 + 3) + '，求 x', answer: k, topic: '代数', diff: 2 };
  return null;
}

function genTrigProblem(k) {
  var v = rnd(4);
  if (v === 0) return { text: 'sin30° × 2 + ' + (k - 1) + ' = ?', answer: k, topic: '三角', diff: 0 };
  if (v === 1) return { text: 'tan45° + ' + (k - 1) + ' = ?', answer: k, topic: '三角', diff: 0 };
  if (v === 2) return { text: 'sin²45° + cos²45° + ' + (k - 1) + ' = ?', answer: k, topic: '三角', diff: 1 };
  return { text: 'sin90° × ' + k + ' = ?', answer: k, topic: '三角', diff: 0 };
}

function genCombProblem(k) {
  var v = rnd(4);
  if (v === 0) return { text: 'C(' + k + ', 1) = ?', answer: k, topic: '组合', diff: 1 };
  if (v === 1 && k >= 2) return { text: 'C(' + k + ', ' + (k - 1) + ') = ?', answer: k, topic: '组合', diff: 1 };
  if (v === 2) return { text: 'P(' + k + ', 1) = ?', answer: k, topic: '组合', diff: 1 };
  var c = k - 6;
  return { text: 'C(4,2)' + (c > 0 ? ' + ' + c : c < 0 ? ' − ' + (-c) : '') + ' = ?', answer: k, topic: '组合', diff: 1 };
}

/* 线性代数（大学难度） */
function genLinAlgProblem(k) {
  var v = rnd(4);
  if (v === 0) return { text: '行列式 |' + k + ' 0；0 1| = ?', answer: k, topic: '线代', diff: 1 };
  if (v === 1) return { text: '矩阵 [[' + k + ',0],[0,0]] 的特征值之和 = ?', answer: k, topic: '线代', diff: 2 };
  if (v === 2) return { text: '矩阵 [[' + k + ',0],[0,1]] 的所有特征值之积 = ?', answer: k, topic: '线代', diff: 2 };
  return { text: '若 x+y=' + k + ' 且 x−y=' + k + '，求 x', answer: k, topic: '线代', diff: 1 };
}

/* 概率统计（大学难度） */
function genProbProblem(k) {
  var v = rnd(4);
  if (v === 0) return { text: 'X~B(' + (2 * k) + ', 1/2)，E(X) = ?', answer: k, topic: '概率', diff: 2 };
  if (v === 1) return { text: 'X 等可能取 1,2,…,' + (2 * k - 1) + '，E(X) = ?', answer: k, topic: '概率', diff: 2 };
  if (v === 2) return { text: 'X~B(' + (4 * k) + ', 1/2)，D(X) = ?', answer: k, topic: '概率', diff: 3 };
  return { text: 'X 在 (0, ' + (2 * k) + ') 上均匀分布，E(X) = ?', answer: k, topic: '概率', diff: 2 };
}

var GAOSHU_GEN = [genCalcProblem, genAlgProblem, genTrigProblem, genCombProblem, genLinAlgProblem, genProbProblem];

/* 按关卡难度生成题目：高难度关卡出难题的概率更高 */
function genProblem(count, levelKw, levelDiff) {
  var diff = levelDiff || 1;
  for (var t = 0; t < 14; t++) {
    var gen = choice(GAOSHU_GEN);
    var p = gen(count, diff);
    if (p && p.diff <= diff + 1) return p;
  }
  return { text: 'k 的数值是？', answer: count, topic: levelKw || '综合', diff: 0 };
}

/* ============ 贝叶斯侦探 · 案件库 ============ */
var BAYES_CASES = [
  {
    title: '空调遥控器疑案',
    story: '图书馆自习室的空调遥控器不见了。管理员调出监控：案发时段只有三人进过自习室。新线索：目击者说拿走遥控器的人穿着黑色外套。',
    clue: '线索：嫌疑人穿黑色外套',
    suspects: [
      { name: '小明', prior: 0.3, like: 0.80 },
      { name: '小红', prior: 0.5, like: 0.20 },
      { name: '小刚', prior: 0.2, like: 0.10 }
    ],
    culprit: 0
  },
  {
    title: '螺蛳粉失踪案',
    story: '宿舍冰箱里最后一份螺蛳粉不见了，全楼都炸了。新线索：有室友半夜闻到过螺蛳粉的味道，说明凶手当晚去过厨房。',
    clue: '线索：凶手当晚去过厨房',
    suspects: [
      { name: '阿伟', prior: 0.25, like: 0.70 },
      { name: '阿杰', prior: 0.45, like: 0.15 },
      { name: '阿丽', prior: 0.30, like: 0.15 }
    ],
    culprit: 0
  }
];

/* ============ 考研数学风格题库（真题模拟用，答案 1-8） ============ */
var MATH_BANK = [
  { q: 'lim(x→∞) x·sin(1/x) = ?', ans: 1, topic: '极限' },
  { q: 'lim(x→0) (sin x + tan x)/x = ?', ans: 2, topic: '极限' },
  { q: 'lim(x→0) (e^x − 1)/(sin x) = ?', ans: 1, topic: '极限' },
  { q: 'lim(x→0) ln(1+2x)/(e^x − 1) = ?', ans: 2, topic: '极限' },
  { q: 'lim(x→0) tan(3x)/sin(x) = ?', ans: 3, topic: '极限' },
  { q: 'lim(x→0) x/sin(3x) = ?', ans: 1, topic: '极限' },
  { q: '若 f′(1)=2，则 lim(h→0) [f(1+h)−f(1)]/h = ?', ans: 2, topic: '导数' },
  { q: 'f(x)=x³，求 f′(1)', ans: 3, topic: '导数' },
  { q: 'f(x)=x⁴，求 f′(1)', ans: 4, topic: '导数' },
  { q: 'f(x)=x⁵，求 f′(1)', ans: 5, topic: '导数' },
  { q: 'f(x)=ln x，求 f′(1)', ans: 1, topic: '导数' },
  { q: '∫₀² x dx = ?', ans: 2, topic: '积分' },
  { q: '∫₀² 2x dx = ?', ans: 4, topic: '积分' },
  { q: '∫₀¹ (3x²+2x) dx = ?', ans: 2, topic: '积分' },
  { q: '∫₀^π sin x dx = ?', ans: 2, topic: '积分' },
  { q: '∫₀^(π/2) cos x dx = ?', ans: 1, topic: '积分' },
  { q: '行列式 |2 1；0 3| = ?', ans: 6, topic: '线代' },
  { q: 'A=[[1,2],[2,1]]，求 A 的迹 tr(A)', ans: 2, topic: '线代' },
  { q: '行列式 |1 2；3 k| = 0，求 k', ans: 6, topic: '线代' },
  { q: '掷两枚骰子，点数之和为 7 的情况数 = ?', ans: 6, topic: '概率' },
  { q: 'X~B(8, 1/2)，求 D(X)', ans: 2, topic: '概率' },
  { q: '掷一个骰子，点数为偶数的概率 ×6 = ?', ans: 3, topic: '概率' }
];

