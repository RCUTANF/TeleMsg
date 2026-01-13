$ErrorActionPreference = "Stop"

# 获取脚本所在目录的父目录作为项目根目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# 设置相对路径
$MinioExe = Join-Path $ProjectRoot "lib\minio\minio.exe"
$MinioData = Join-Path $ProjectRoot "lib\minio\data"

Write-Host "Checking MinIO..." -ForegroundColor Yellow
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Gray

# Check file exists
$exists = Test-Path $MinioExe
if ($exists -eq $false) {
    Write-Host "MinIO not installed!" -ForegroundColor Red
    Write-Host "Run install-minio.ps1 first" -ForegroundColor Yellow
    pause
    exit
}

# Check process
$process = Get-Process -Name "minio" -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "MinIO is already running!" -ForegroundColor Yellow
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
