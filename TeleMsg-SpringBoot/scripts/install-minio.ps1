# MinIO Windows 安装脚本 - 简化版
# 设置错误时停止
$ErrorActionPreference = "Stop"

# 设置变量
$ProjectRoot = "E:\project\TeleMsg\TeleMsg-SpringBoot"
$MinioDir = "$ProjectRoot\lib\minio"
$MinioData = "$MinioDir\data"
$MinioExe = "$MinioDir\minio.exe"
$McExe = "$MinioDir\mc.exe"

# URL
$MinioUrl = "https://dl.min.io/server/minio/release/windows-amd64/minio.exe"
$McUrl = "https://dl.min.io/client/mc/release/windows-amd64/mc.exe"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     MinIO Windows 安装脚本            " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 创建目录
Write-Host "`n[1/5] 创建目录..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $MinioDir -Force | Out-Null
New-Item -ItemType Directory -Path $MinioData -Force | Out-Null
Write-Host "完成" -ForegroundColor Green

# 下载 MinIO Server
Write-Host "`n[2/5] 下载 MinIO Server..." -ForegroundColor Yellow
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri $MinioUrl -OutFile $MinioExe -UseBasicParsing
Write-Host "完成" -ForegroundColor Green

# 下载 MinIO Client
Write-Host "`n[3/5] 下载 MinIO Client..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $McUrl -OutFile $McExe -UseBasicParsing
Write-Host "完成" -ForegroundColor Green

# 设置环境变量
Write-Host "`n[4/5] 设置环境变量..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("MINIO_ROOT_USER", "admin", "User")
[Environment]::SetEnvironmentVariable("MINIO_ROOT_PASSWORD", "password123", "User")
Write-Host "完成" -ForegroundColor Green

# 创建启动脚本
Write-Host "`n[5/5] 创建启动脚本..." -ForegroundColor Yellow

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

Write-Host "完成" -ForegroundColor Green

# 显示完成信息
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "        MinIO 安装完成！                " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`n安装位置: $MinioDir" -ForegroundColor White
Write-Host "数据目录: $MinioData" -ForegroundColor White
Write-Host "`n访问地址:" -ForegroundColor Cyan
Write-Host "  Console: http://localhost:9001" -ForegroundColor Cyan
Write-Host "  API:     http://localhost:9000" -ForegroundColor Cyan
Write-Host "`n登录信息:" -ForegroundColor Yellow
Write-Host "  用户名: admin" -ForegroundColor Yellow
Write-Host "  密码: password123" -ForegroundColor Yellow
Write-Host "`n启动命令: $MinioDir\start-minio.bat" -ForegroundColor White
Write-Host "停止命令: $MinioDir\stop-minio.bat" -ForegroundColor White

Write-Host "`n按回车键启动 MinIO..." -ForegroundColor Green
Read-Host

# 启动 MinIO
Start-Process cmd -ArgumentList "/k", "$MinioDir\start-minio.bat"
Start-Sleep -Seconds 3
Start-Process "http://localhost:9001"

Write-Host "`nMinIO 已启动！" -ForegroundColor Green
