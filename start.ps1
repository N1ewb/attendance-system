$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$clientJob = Start-Job -ScriptBlock {
  Set-Location "$using:root\client"
  npm run dev
}

$serverJob = Start-Job -ScriptBlock {
  Set-Location "$using:root"
  python -m uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
}

Write-Host "=== Attendance System ===" -ForegroundColor Green
Write-Host "Client: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Server: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop both." -ForegroundColor Yellow

try {
  while ($true) {
    Start-Sleep -Seconds 1
    Receive-Job -Job $clientJob -ErrorAction SilentlyContinue
    Receive-Job -Job $serverJob -ErrorAction SilentlyContinue

    if ($clientJob.State -eq 'Failed') {
      Write-Host "Client failed: $($clientJob.ChildJobs[0].JobStateInfo.Reason.Message)" -ForegroundColor Red
      break
    }
    if ($serverJob.State -eq 'Failed') {
      Write-Host "Server failed: $($serverJob.ChildJobs[0].JobStateInfo.Reason.Message)" -ForegroundColor Red
      break
    }
  }
} finally {
  Write-Host "`nStopping..." -ForegroundColor Yellow
  Stop-Job $clientJob -ErrorAction SilentlyContinue
  Stop-Job $serverJob -ErrorAction SilentlyContinue
  Remove-Job $clientJob -ErrorAction SilentlyContinue
  Remove-Job $serverJob -ErrorAction SilentlyContinue
  Write-Host "Stopped." -ForegroundColor Green
}
