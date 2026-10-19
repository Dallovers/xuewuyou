$ErrorActionPreference = 'Stop'
$meshUrl = 'http://127.0.0.1:4183'
$meshRunning = $false
try {
    $meshHealth = Invoke-RestMethod -Uri ($meshUrl + '/api/health') -TimeoutSec 2
    if ($meshHealth.app -eq 'xuewuyou-academy-v5') { $meshRunning = $true }
} catch {}
if (-not $meshRunning) {
    $meshNode = (Get-Command node.exe -ErrorAction Stop).Source
    Start-Process -FilePath $meshNode -ArgumentList 'server.mjs' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
    for ($meshAttempt = 0; $meshAttempt -lt 20; $meshAttempt++) {
        Start-Sleep -Milliseconds 250
        try {
            $meshHealth = Invoke-RestMethod -Uri ($meshUrl + '/api/health') -TimeoutSec 1
            if ($meshHealth.app -eq 'xuewuyou-academy-v5') { $meshRunning = $true; break }
        } catch {}
    }
}
if (-not $meshRunning) { throw '启动失败，请检查本机 4183 端口是否被占用。' }
Start-Process $meshUrl
