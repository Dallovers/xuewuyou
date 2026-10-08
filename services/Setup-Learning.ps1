$ErrorActionPreference = 'Stop'
$learningDir = Join-Path $PSScriptRoot 'learning'
$pythonExe = Join-Path $learningDir '.venv/Scripts/python.exe'
if (!(Test-Path -LiteralPath $pythonExe)) {
  if (Get-Command py -ErrorAction SilentlyContinue) { py -3 -m venv (Join-Path $learningDir '.venv') }
  elseif (Get-Command python -ErrorAction SilentlyContinue) { python -m venv (Join-Path $learningDir '.venv') }
  else { throw '请安装 Python 3.10–3.14 后重新启动。OR-Tools 和 pyBKT 使用独立虚拟环境。' }
  if ($LASTEXITCODE -ne 0) { throw 'Python 虚拟环境创建失败。' }
}
& $pythonExe -m pip install -r (Join-Path $learningDir 'requirements.txt')
if ($LASTEXITCODE -ne 0) { throw '学习引擎安装失败，请检查 Python 版本和网络后重试。' }
& $pythonExe -c "from pyBKT.models import Model; from ortools.sat.python import cp_model; print('OR-Tools / pyBKT ready')"
if ($LASTEXITCODE -ne 0) { throw '学习引擎依赖检查失败。' }
Set-Content -LiteralPath (Join-Path $learningDir '.ready') -Value 'ortools 9.15.6755; pyBKT 1.4.3; sklearn 1.7.2' -Encoding utf8
Write-Host '学习引擎已安装，无需单独启动 Python 服务。'
