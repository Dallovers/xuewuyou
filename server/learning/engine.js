'use strict';
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
let active = 0;
function run(input) {
  const base = path.resolve(__dirname, '../../services/learning');
  const python = process.env.LEARNING_PYTHON || path.join(base, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
  if (!fs.existsSync(python)) return Promise.reject(Object.assign(new Error('请先运行 services/Setup-Learning.ps1 安装学习引擎'), { status: 503 }));
  if (active >= 2) return Promise.reject(Object.assign(new Error('学习引擎正在计算，请稍后重试'), { status: 429 }));
  active++;
  return new Promise((resolve, reject) => {
    const child = spawn(python, [path.join(base, 'worker.py')], { windowsHide: true, env: { ...process.env, PYTHONIOENCODING: 'utf-8', OMP_NUM_THREADS: '1', OPENBLAS_NUM_THREADS: '1' }, stdio: ['pipe', 'pipe', 'pipe'] });
    let chunks = [], size = 0, finished = false;
    const finish = (error, result) => { if (finished) return; finished = true; clearTimeout(timer); active--; error ? reject(error) : resolve(result); };
    const timer = setTimeout(() => { child.kill(); finish(Object.assign(new Error('学习引擎计算超时，请减少计划天数后重试'), { status: 503 })); }, 45000);
    child.stdout.on('data', bytes => { size += bytes.length; if (size > 2e6) child.kill(); else chunks.push(bytes); });
    child.stderr.on('data', () => {});
    child.on('error', () => finish(Object.assign(new Error('无法启动学习引擎，请检查 Python 环境'), { status: 503 })));
    child.on('close', code => {
      if (code) return finish(Object.assign(new Error('学习引擎执行失败，请运行安装脚本检查依赖'), { status: 503 }));
      try { finish(null, JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { finish(Object.assign(new Error('学习引擎返回格式异常'), { status: 503 })); }
    });
    child.stdin.on('error', () => {});
    child.stdin.end(JSON.stringify(input));
  });
}
module.exports = { run };
