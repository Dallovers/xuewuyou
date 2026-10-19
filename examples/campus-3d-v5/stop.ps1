$ErrorActionPreference = 'Stop'
try {
    $academyHealth = Invoke-RestMethod -Uri 'http://127.0.0.1:4183/api/health' -TimeoutSec 2
    if ($academyHealth.app -eq 'xuewuyou-academy-v5') {
        $academyProcess = Get-Process -Id $academyHealth.pid -ErrorAction Stop
        if ($academyProcess.ProcessName -eq 'node') { Stop-Process -Id $academyProcess.Id }
    }
} catch { Write-Output '课程学院服务未运行。' }
