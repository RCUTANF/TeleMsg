# MinIO Windows 安装脚本 - 使用相对路径
$ErrorActionPreference = "Stop"

# 获取脚本所在目录的父目录作为项目根目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# 设置相对路径
$MinioDir = Join-Path $ProjectRoot "lib\minio"
$MinioData = Join-Path $MinioDir "data"
$MinioExe = Join-Path $MinioDir "minio.exe"
$McExe = Join-Path $MinioDir "mc.exe"

# URL
$MinioUrl = "https://dl.min.io/server/minio/release/windows-amd64/minio.exe"
$McUrl = "https://dl.min.io/client/mc/release/windows-amd64/mc.exe"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     MinIO Windows Installation         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Gray

# 创建目录
Write-Host "`n[1/5] Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $MinioDir -Force | Out-Null
New-Item -ItemType Directory -Path $MinioData -Force | Out-Null
Write-Host "Done" -ForegroundColor Green

# 下载 MinIO Server
Write-Host "`n[2/5] Downloading MinIO Server..." -ForegroundColor Yellow
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri $MinioUrl -OutFile $MinioExe -UseBasicParsing
Write-Host "Done" -ForegroundColor Green

# 下载 MinIO Client
Write-Host "`n[3/5] Downloading MinIO Client..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $McUrl -OutFile $McExe -UseBasicParsing
Write-Host "Done" -ForegroundColor Green

# 设置环境变量
Write-Host "`n[4/5] Setting environment variables..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("MINIO_ROOT_USER", "admin", "User")
[Environment]::SetEnvironmentVariable("MINIO_ROOT_PASSWORD", "password123", "User")
Write-Host "Done" -ForegroundColor Green

# 创建启动脚本
Write-Host "`n[5/5] Creating start scripts..." -ForegroundColor Yellow

# start-minio.bat
@"
@echo off
set MINIO_ROOT_USER=admin
set MINIO_ROOT_PASSWORD=password123
echo Starting MinIO...
cd /d "$MinioDir"
"$MinioExe" server "$MinioData" --console-address ":9001"
pause
"@ | Out-File -FilePath "$MinioDir\start-minio.bat" -Encoding ASCII

# stop-minio.bat
@"
@echo off
taskkill /F /IM minio.exe
pause
"@ | Out-File -FilePath "$MinioDir\stop-minio.bat" -Encoding ASCII

Write-Host "Done" -ForegroundColor Green

# 显示完成信息
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "        MinIO Installation Complete!     " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nInstall location: $MinioDir" -ForegroundColor White
Write-Host "Data directory: $MinioData" -ForegroundColor White
Write-Host "`nAccess URLs:" -ForegroundColor Cyan
Write-Host "  Console: http://localhost:9001" -ForegroundColor Cyan
Write-Host "  API:     http://localhost:9000" -ForegroundColor Cyan
Write-Host "`nCredentials:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor Yellow
Write-Host "  Password: password123" -ForegroundColor Yellow

Write-Host "`nPress Enter to start MinIO..." -ForegroundColor Green
Read-Host

# 启动 MinIO
Start-Process cmd -ArgumentList "/k", "$MinioDir\start-minio.bat"
Start-Sleep -Seconds 3
Start-Process "http://localhost:9001"

Write-Host "`nMinIO started!" -ForegroundColor Green
