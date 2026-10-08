'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
async function main() {
  const source = path.dirname(require.resolve('pyodide'));
  const target = path.join(__dirname, '../../vendor/pyodide');
  fs.mkdirSync(target, { recursive: true });
  for (const filename of ['pyodide.js', 'pyodide.mjs', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']) fs.copyFileSync(path.join(source, filename), path.join(target, filename));
  const lock = JSON.parse(fs.readFileSync(path.join(source, 'pyodide-lock.json')));
  const version = require('pyodide/package.json').version;
  const packages = new Set();
  function visit(name) { if (packages.has(name)) return; const p = lock.packages[name]; if (!p) throw new Error('Unknown Pyodide package ' + name); packages.add(name); (p.depends || []).forEach(visit); }
  ['numpy', 'sympy', 'matplotlib'].forEach(visit);
  for (const name of packages) {
    const p = lock.packages[name], dest = path.join(target, p.file_name);
    if (fs.existsSync(dest) && crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex') === p.sha256) continue;
    process.stdout.write('Preparing math runtime: ' + name + '\n');
    const response = await fetch(`https://cdn.jsdelivr.net/pyodide/v${version}/full/${p.file_name}`, { signal: AbortSignal.timeout(90000) });
    if (!response.ok) throw new Error('Failed to download ' + name);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (crypto.createHash('sha256').update(bytes).digest('hex') !== p.sha256) throw new Error('Package checksum failed: ' + name);
    fs.writeFileSync(dest, bytes);
  }
  fs.writeFileSync(path.join(target, 'runtime.json'), JSON.stringify({ version, packages: [...packages], source: 'https://github.com/pyodide/pyodide', license: 'MPL-2.0' }, null, 2));
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
