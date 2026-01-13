$ErrorActionPreference = "Stop"

Write-Host "Stopping MinIO..." -ForegroundColor Yellow
Stop-Process -Name "minio" -Force -ErrorAction SilentlyContinue
Write-Host "Done" -ForegroundColor Green
pause
