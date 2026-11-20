/*
 * 复用校园模块的 esbuild 打包方式，把 src/app.js 与本地 Three.js
 * 打成可直接部署的 app.bundle.js。未安装 esbuild 时不影响源码直开预览。
 */
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));

await build({
  absWorkingDir: root,
  entryPoints: { 'app.bundle': 'src/app.js' },
  bundle: true,
  minify: true,
  outdir: root,
  format: 'esm',
  target: 'es2022',
  alias: { three: './vendor/three.module.js' },
  legalComments: 'eof'
});

console.log('Exploration workspace built: app.bundle.js');
