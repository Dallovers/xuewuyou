$ErrorActionPreference = 'Stop'
if (!(Get-Command docker -ErrorAction SilentlyContinue)) { throw '请先安装并启动 Docker Desktop，再运行此脚本。' }
$servicePath = Join-Path $PSScriptRoot 'ragflow'
if (!(Test-Path -LiteralPath (Join-Path $servicePath '.git'))) {
  git clone --depth 1 https://github.com/infiniflow/ragflow.git $servicePath
  if ($LASTEXITCODE -ne 0) { throw '下载 RAGFlow 失败。' }
}
$composePath = Join-Path $servicePath 'docker'
if (!(Test-Path -LiteralPath (Join-Path $composePath 'docker-compose.yml'))) { throw '上游部署布局已变化，请按 RAGFlow 官方 README 启动。' }
# Keep the website's 80/3306/6379 ports available when both stacks run on one host.
$envPath = Join-Path $composePath '.env'
if (Test-Path -LiteralPath $envPath) {
  $ragEnv = Get-Content -LiteralPath $envPath -Raw
  $ragEnv = $ragEnv -replace '(?m)^SVR_WEB_HTTP_PORT=.*$', 'SVR_WEB_HTTP_PORT=8088'
  $ragEnv = $ragEnv -replace '(?m)^SVR_WEB_HTTPS_PORT=.*$', 'SVR_WEB_HTTPS_PORT=8448'
  $ragEnv = $ragEnv -replace '(?m)^EXPOSE_MYSQL_PORT=.*$', 'EXPOSE_MYSQL_PORT=3307'
  $ragEnv = $ragEnv -replace '(?m)^KVROCKS_PORT=.*$', 'KVROCKS_PORT=6381'
  [System.IO.File]::WriteAllText($envPath, $ragEnv, (New-Object System.Text.UTF8Encoding($false)))
}
Write-Host '将按下载版本的官方 Compose 启动 RAGFlow。首次拉取镜像需要时间。'
Push-Location $composePath
try {
  docker compose -f docker-compose.yml up -d
  if ($LASTEXITCODE -ne 0) { throw 'RAGFlow 启动失败，请查看 Docker 日志和官方部署要求。' }
} finally { Pop-Location }
Write-Host '打开 http://127.0.0.1:8088，配置 Embedding 模型并创建 API Key。server/.env 中填写 RAGFLOW_BASE_URL=http://127.0.0.1:9380 和 API Key。网站会自动为每个用户创建知识库。'
