$ErrorActionPreference = "Stop"

$MinioExe = "E:\project\TeleMsg\TeleMsg-SpringBoot\lib\minio\minio.exe"
$MinioData = "E:\project\TeleMsg\TeleMsg-SpringBoot\lib\minio\data"

Write-Host "Checking MinIO..." -ForegroundColor Yellow

# Check file exists
$exists = Test-Path $MinioExe
if ($exists -eq $false) {
    Write-Host "MinIO not installed!" -ForegroundColor Red
    pause
    exit
}

# Check process
$process = Get-Process -Name "minio" -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "MinIO is running!" -ForegroundColor Yellow
    Write-Host "http://localhost:9001" -ForegroundColor Cyan
    pause
    exit
}

# Start MinIO
$env:MINIO_ROOT_USER = "admin"
$env:MINIO_ROOT_PASSWORD = "password123"

Write-Host "Starting MinIO..." -ForegroundColor Green
Start-Process -FilePath $MinioExe -ArgumentList "server", $MinioData, "--console-address", ":9001"

Start-Sleep -Seconds 3
Start-Process "http://localhost:9001"

Write-Host ""
Write-Host "Started!" -ForegroundColor Green
Write-Host "Username: admin" -ForegroundColor Yellow
Write-Host "Password: password123" -ForegroundColor Yellow
Write-Host ""
pause
