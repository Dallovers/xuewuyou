'use strict';
/* ============ 校园地点清单一致性体检 ============
 *
 * 查两件事：
 *   A. 同一份「校园有哪些地点」的清单，前端与服务端还是不是同一份；
 *   B. 有没有人又在一份清单之外偷偷写第二份。
 *
 * 为什么需要：
 *   地点清单原来存在三处 —— 前端注册表 `js/campus-registry.js`、地图的硬编码兜底
 *   `js/atlas.js` 的 campusNodes()、服务端 `server/campus/index.js` 的 LOCATIONS。
 *   两处注释都写着"改一处必须同步改另一处"，但没有任何机制保证，于是确实漂移了：
 *   registry 里是 arena（好友竞技场），地图兜底里还是 review（记忆复习站）。因为
 *   registry 先加载、兜底永不执行，语法检查、单测、CI 全绿，线上也看不出异常——
 *   只有把两份摊在一起比才会发现。
 *
 *   现在兜底已经删除，清单只剩两处，各自有各自不可替代的职责：
 *     - 前端注册表：文案与入口（entries），画面真正用的那份
 *     - 服务端 LOCATIONS：八地点状态里的 metric 口径
 *   它们本来就该同源，比对它是合理的。
 *
 * 判定：
 *   A1. 两处 id 集合不同 → ERROR（exit 1）。缺一个 id，那个地点在地图上没有节点；
 *       多一个 id，点进去会导航到不存在的视图。
 *   A2. 同一个 id 的 label 不同 → WARN（不拦 CI）。服务端只做统计，文案未必非要一样，
 *       但同一个地点两个名字，用户说的和你排查时说的就不是一回事。
 *   A3. 任一处解析出 0 条 → ERROR。正则失效导致"检查永远通过"比检查报错更糟。
 *   B.  campusNodes() 里再出现 `{id:'` 字面量 → ERROR（有人在重建第二份真相）。
 *
 * 做法是纯文本扫描，不 require、不 eval：前端是浏览器脚本（直接 eval 要造 window），
 * 服务端那份在闭包里没有导出，执行它们反而不可靠。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');   // server/scripts -> 仓库根
const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/* 取 [from, to) 这一段的行范围，返回 { lines, firstLine } */
function slice(rel, from, to) {
  const src = readText(rel);
  const start = src.indexOf(from);
  if (start < 0) return { rel, error: '找不到片段起点：' + from };
  const end = src.indexOf(to, start + from.length);
  if (end < 0) return { rel, error: '找不到片段终点：' + to };
  const body = src.slice(start, end);
  return {
    rel,
    lines: body.split('\n'),
    firstLine: src.slice(0, start).split('\n').length
  };
}

/* 在切片里按给定正则收集 { id, label, line } */
function collect(rel, from, to, re) {
  const s = slice(rel, from, to);
  if (s.error) return s;
  const items = [];
  s.lines.forEach((line, i) => {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(line))) items.push({ id: m[1], label: m[2], line: s.firstLine + i });
  });
  return { rel, items };
}

const BROWSER_RE = /\{id:'([^']+)',label:'([^']+)'/g;
const SERVER_RE = /\{\s*id:\s*'([^']+)',\s*label:\s*'([^']+)'/g;

const sources = [
  {
    name: '前端注册表',
    ...collect('js/campus-registry.js', 'window.WG_CampusDistricts = [', '];',
      BROWSER_RE)
  },
  {
    name: '服务端地点表',
    ...collect('server/campus/index.js', 'const LOCATIONS = [', '\n];', SERVER_RE)
  }
];

let fatal = false;

sources.forEach((s) => {
  if (s.error) {
    console.error('[' + s.name + '] ' + s.rel + '：' + s.error);
    fatal = true;
  } else if (!s.items.length) {
    console.error('[' + s.name + '] ' + s.rel + '：一条都没解析到。正则或代码结构变了，这个检查已经失效——');
    console.error('  它现在无论怎么改都会通过，比报错更糟，所以直接按失败处理。');
    fatal = true;
  }
});

/* B. 地图节点里不允许再有第二份清单 */
const atlas = slice('js/atlas.js', 'function campusNodes() {', '\n  }');
const secondList = [];
if (atlas.error) {
  console.error('[地图节点] js/atlas.js：' + atlas.error);
  fatal = true;
} else {
  atlas.lines.forEach((line, i) => {
    if (/\{id:'/.test(line)) secondList.push(atlas.firstLine + i);
  });
  if (secondList.length) {
    console.error('[地图节点] js/atlas.js 的 campusNodes() 里又出现了写死的地点清单（第 '
      + secondList.join('、') + ' 行）。');
    console.error('  这份清单原来就漂移过，别重建第二份：地点定义只放 js/campus-registry.js。');
    fatal = true;
  }
}

if (fatal) {
  console.error('\n一致性体检无法进行。');
  process.exit(1);
}

/* A. 两份清单比对，基准是前端注册表：画面真正用的那份 */
const [base, other] = sources;
const baseIds = base.items.map((x) => x.id);
const otherIds = other.items.map((x) => x.id);
const otherSet = new Set(otherIds);
const baseSet = new Set(baseIds);

console.log('前端注册表  js/campus-registry.js    ' + base.items.length + ' 个地点');
console.log('  ' + baseIds.join(' / '));
console.log('服务端      server/campus/index.js    ' + other.items.length + ' 个地点');
console.log('  ' + otherIds.join(' / ') + '\n');
console.log('地图节点    js/atlas.js              没有第二份清单（只读注册表）');

const missing = baseIds.filter((id) => !otherSet.has(id));
const extra = otherIds.filter((id) => !baseSet.has(id));

if (missing.length || extra.length) {
  console.error('\n地点 id 集合不一致。这不是文案问题：');
  console.error('缺一个 id，服务端就不会算那个地点的状态；多一个 id，前端根本没有对应的节点。\n');
  if (missing.length) console.error('  服务端缺：' + missing.join(', '));
  if (extra.length) console.error('  服务端多：' + extra.join(', '));
  console.error('\n以 js/campus-registry.js 的 WG_CampusDistricts 为准，把 server/campus/index.js 对齐。');
  process.exit(1);
}

const labelProblems = [];
base.items.forEach((b) => {
  const hit = other.items.find((x) => x.id === b.id);
  if (hit && hit.label !== b.label) {
    labelProblems.push({ id: b.id, base: b.label, here: hit.label, line: hit.line });
  }
});

if (labelProblems.length) {
  console.warn('\nid 全部对得上，但同一个地点两处叫的名字不一样：');
  labelProblems.forEach((p) => {
    console.warn('  ' + p.id + '：注册表「' + p.base + '」/ 服务端「' + p.here
      + '」（server/campus/index.js 第 ' + p.line + ' 行）');
  });
  console.warn('\n这条不拦 CI——服务端只做统计、不展示文案，两条名字未必都要一样。');
  console.warn('但同一个地点出现两个名字，用户看到的和你排查时说的就不是一回事。');
  console.warn('要统一的话，以注册表为准。\n');
}

console.log('\n地点清单一致性体检通过：两处 id 集合相同（' + base.items.length + ' 个）'
  + (labelProblems.length ? '，' + labelProblems.length + ' 处文案差异（见上）' : '，文案也一致')
  + '；地图节点没有第二份清单。');
