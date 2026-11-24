/* 静态交付检查：入口、资源、模块依赖与 DOM ID 是否齐全。 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const required = [
  'index.html', 'styles.css', 'package.json', 'build.mjs', 'README.md',
  'vendor/three.module.js', 'vendor/THREE-LICENSE.txt', 'entry-inject.js',
  'src/app.js', 'src/contract.js', 'src/state.js', 'src/model-host.js',
  'src/preview-models.js', 'src/services.js', 'src/view3d.js', 'src/charts.js',
  'tests/contract.test.mjs', 'tests/api.test.mjs', 'tests/serve.mjs'
];
let failed = false;
required.forEach((file) => {
  const target = path.join(root, file);
  if (!fs.existsSync(target)) { console.error(`[缺失] ${file}`); failed = true; }
});

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
const idBlock = app.match(/const \$ = \(id\) => document\.getElementById\(id\);[\s\S]*?\]\.forEach/);
if (!idBlock) {
  console.error('[检查失败] 未能解析 app.js 的 DOM ID 列表');
  failed = true;
} else {
  const ids = [...idBlock[0].matchAll(/'([A-Za-z][A-Za-z0-9]*)'/g)].map(match => match[1]);
  const missing = ids.filter(id => !new RegExp(`id="${id}"`).test(html));
  if (missing.length) { console.error(`[DOM ID 缺失] ${missing.join(', ')}`); failed = true; }

  const used = [...new Set([...app.matchAll(/\bel\.([A-Za-z][A-Za-z0-9]*)\b/g)].map(match => match[1]))];
  const unregistered = used.filter(id => !ids.includes(id));
  if (unregistered.length) { console.error(`[未注册的 DOM ID] ${unregistered.join(', ')}`); failed = true; }
}

if (!html.includes('"three":"./vendor/three.module.js"')) {
  console.error('[检查失败] index.html 缺少 three 的 importmap');
  failed = true;
}

if (failed) process.exit(1);
console.log(`静态检查通过：${required.length} 个交付文件、DOM ID 与 importmap 均齐全。`);
