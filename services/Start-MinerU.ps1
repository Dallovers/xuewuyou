param([ValidateSet('flash','basic','standard')][string]$Tier = 'basic', [int]$Port = 8000)
$ErrorActionPreference = 'Stop'
$serviceRoot = Join-Path $PSScriptRoot 'mineru'
$venvPython = Join-Path $serviceRoot '.venv/Scripts/python.exe'
$mineruCommand = Join-Path $serviceRoot '.venv/Scripts/mineru-kit.exe'
if (!(Test-Path -LiteralPath $venvPython)) {
  python -m venv (Join-Path $serviceRoot '.venv')
  if ($LASTEXITCODE -ne 0) { throw '创建 Python 虚拟环境失败，请使用 Python 3.10–3.14。' }
}
& $venvPython -m pip install -r (Join-Path $serviceRoot 'requirements.txt')
if ($LASTEXITCODE -ne 0) { throw 'MinerU 安装失败，请检查 Python 版本与软件源。' }
New-Item -ItemType Directory -Force -Path (Join-Path $serviceRoot 'uploads') | Out-Null
$serviceArgs = @('api-server', '--host', '127.0.0.1', '--port', "$Port", '--tier', $Tier, '--upload-dir', (Join-Path $serviceRoot 'uploads'), '--concurrency', '1')
if ($env:MINERU_API_KEY) { $serviceArgs += @('--api-key', $env:MINERU_API_KEY) }
Write-Host "启动 MinerU：仅本机访问 http://127.0.0.1:$Port。首次 Basic/Standard 解析可能下载模型。"
& $mineruCommand @serviceArgs
