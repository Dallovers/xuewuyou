$ErrorActionPreference = 'Stop'
Push-Location (Join-Path $PSScriptRoot 'server')
try {
  if (!(Get-Command node -ErrorAction SilentlyContinue)) { throw '请先安装 Node.js 22.12 或更新版本。' }
  node -e "const [a,b]=process.versions.node.split('.').map(Number);if(a<22||(a===22&&b<12))process.exit(1)"
  if ($LASTEXITCODE -ne 0) { throw '需要 Node.js 22.12 或更新版本。' }
  if (!(Test-Path -LiteralPath '.env')) { Copy-Item -LiteralPath '.env.example' -Destination '.env' }
  if (!(Test-Path -LiteralPath 'node_modules/ts-fsrs') -or !(Test-Path -LiteralPath 'node_modules/cytoscape') -or !(Test-Path -LiteralPath 'node_modules/pyodide') -or !(Test-Path -LiteralPath 'node_modules/phaser') -or !(Test-Path -LiteralPath 'node_modules/socket.io') -or !(Test-Path -LiteralPath 'node_modules/markdown-it')) {
    npm ci
    if ($LASTEXITCODE -ne 0) { throw '依赖安装失败，请检查 npm 网络连接。' }
  }
  if (!(Test-Path -LiteralPath '../vendor/phaser/phaser.min.js') -or !(Test-Path -LiteralPath '../vendor/socketio/socket.io.min.js') -or !(Test-Path -LiteralPath '../vendor/markdown-it/markdown-it.min.js')) {
    node scripts/vendor.js
    if ($LASTEXITCODE -ne 0) { throw '地图资源准备失败，请重新安装依赖后重试。' }
  }
  if (!(Test-Path -LiteralPath '../vendor/pyodide/runtime.json')) {
    npm run vendor:math
    if ($LASTEXITCODE -ne 0) { throw '数学实验室资源准备失败，请检查网络后重试。' }
  }
  if (!(Test-Path -LiteralPath '../vendor/whiteboard/index.html')) {
    Push-Location (Join-Path $PSScriptRoot 'widgets/whiteboard')
    try { npm ci; if ($LASTEXITCODE -ne 0) { throw '白板依赖安装失败。' }; npm run build; if ($LASTEXITCODE -ne 0) { throw '白板构建失败。' } } finally { Pop-Location }
  }
  if (!(Test-Path -LiteralPath '../services/learning/.ready') -or !(Test-Path -LiteralPath '../services/learning/.venv/Scripts/python.exe')) { & (Join-Path $PSScriptRoot 'services/Setup-Learning.ps1') }
  Write-Host '请按下方控制台地址访问网站（默认 http://localhost:3000）；端口可在 server/.env 中修改。'
  npm start
} finally { Pop-Location }
