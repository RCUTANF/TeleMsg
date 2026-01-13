# Windows 原生 MinIO 安装和配置指南

## 概述

本指南将帮助您在Windows系统上直接运行MinIO，无需Docker环境，适合开发和测试使用。

## 🚀 MinIO Windows 安装步骤

### 1. 下载 MinIO

访问 MinIO 官方下载页面或直接下载：

```powershell
# 创建MinIO目录
mkdir C:\minio
cd C:\minio

# 下载MinIO服务器 (Windows AMD64)
curl -O https://dl.min.io/server/minio/release/windows-amd64/minio.exe

# 下载MinIO客户端工具 (可选)
curl -O https://dl.min.io/client/mc/release/windows-amd64/mc.exe
```

或者手动下载：
- **MinIO Server**: https://dl.min.io/server/minio/release/windows-amd64/minio.exe
- **MinIO Client**: https://dl.min.io/client/mc/release/windows-amd64/mc.exe

### 2. 创建数据目录

```powershell
# 创建MinIO数据存储目录
mkdir C:\minio\data

# 创建配置目录
mkdir C:\minio\config
```

### 3. 设置环境变量

创建批处理文件 `C:\minio\start-minio.bat`：

```batch
@echo off
echo 启动 MinIO 服务器...

REM 设置MinIO环境变量
set MINIO_ROOT_USER=minioadmin
set MINIO_ROOT_PASSWORD=minioadmin123
set MINIO_CONSOLE_ADDRESS=:9001

REM 启动MinIO服务器
cd /d C:\minio
minio.exe server C:\minio\data --console-address ":9001"

pause
```

### 4. 启动MinIO服务

```powershell
# 方式1: 直接运行批处理文件
C:\minio\start-minio.bat

# 方式2: 使用PowerShell
cd C:\minio
$env:MINIO_ROOT_USER="minioadmin"
$env:MINIO_ROOT_PASSWORD="minioadmin123"  
$env:MINIO_CONSOLE_ADDRESS=":9001"
.\minio.exe server .\data --console-address ":9001"
```

### 5. 验证MinIO服务

启动成功后，您应该看到类似输出：
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ You are running an older version of MinIO released 6 months ago                                                      ┃
┃ Update: Run `mc admin update`                                                                                        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Status:         1 Online, 0 Offline. 
API: http://192.168.1.100:9000  http://127.0.0.1:9000
Console: http://192.168.1.100:9001 http://127.0.0.1:9001

Documentation: https://docs.min.io
```

### 6. 访问MinIO

- **MinIO Console (Web界面)**: http://localhost:9001
- **MinIO API**: http://localhost:9000
- 默认登录信息：
  - 用户名：`minioadmin`
  - 密码：`minioadmin123`

## 🔧 配置TeleMsg应用

### 1. 更新应用配置

在 `application-dev.properties` 中配置：

```properties
# MinIO配置 - Windows本地环境
minio.url=http://localhost:9000
minio.access-key=minioadmin
minio.secret-key=minioadmin123
minio.bucket-name=telemsg-files
minio.region=us-east-1

# 文件上传限制
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

### 2. 初始化存储桶

使用MinIO客户端工具初始化：

```powershell
# 配置mc客户端
C:\minio\mc.exe alias set local http://localhost:9000 minioadmin minioadmin123

# 创建telemsg-files存储桶
C:\minio\mc.exe mb local/telemsg-files

# 设置存储桶为公共读取 (可选，用于直接访问)
C:\minio\mc.exe policy set public local/telemsg-files
```

或者通过Web界面创建：
1. 访问 http://localhost:9001
2. 登录后点击 "Buckets"
3. 点击 "Create Bucket"
4. 输入 "telemsg-files" 作为桶名

## 🚀 启动完整开发环境

### 1. 创建启动脚本

创建 `start-dev-environment.bat`：

```batch
@echo off
echo 启动TeleMsg开发环境...

REM 启动MinIO (在新窗口中)
echo 启动MinIO服务器...
start "MinIO Server" cmd /k "cd /d C:\minio && start-minio.bat"

REM 等待MinIO启动
timeout /t 5 /nobreak

REM 启动TeleMsg应用 (假设您使用Gradle)
echo 启动TeleMsg应用...
cd /d "E:\project\TeleMsg\TeleMsg-SpringBoot"
start "TeleMsg App" cmd /k "gradlew.bat bootRun --args='--spring.profiles.active=dev'"

echo 开发环境启动完成！
echo MinIO Console: http://localhost:9001
echo TeleMsg API: http://localhost:8080/api
pause
```

### 2. 启动开发环境

```powershell
# 运行启动脚本
.\start-dev-environment.bat
```

## 🔧 开发工具和脚本

### 1. MinIO管理脚本

创建 `minio-tools.bat`：

```batch
@echo off
echo MinIO 管理工具
echo ===============

:menu
echo.
echo 请选择操作:
echo 1. 查看存储桶列表
echo 2. 查看telemsg-files内容
echo 3. 清空telemsg-files
echo 4. 创建测试文件
echo 5. 退出
echo.

set /p choice=请输入选项 (1-5): 

if %choice%==1 goto list_buckets
if %choice%==2 goto list_files
if %choice%==3 goto clear_bucket
if %choice%==4 goto create_test_file
if %choice%==5 goto end

:list_buckets
C:\minio\mc.exe ls local
goto menu

:list_files
C:\minio\mc.exe ls local/telemsg-files --recursive
goto menu

:clear_bucket
echo 确认要清空telemsg-files存储桶吗? (y/n)
set /p confirm=
if /i %confirm%==y (
    C:\minio\mc.exe rm local/telemsg-files --recursive --force
    echo 存储桶已清空
)
goto menu

:create_test_file
echo 创建测试文件...
echo This is a test file > test.txt
C:\minio\mc.exe cp test.txt local/telemsg-files/
del test.txt
echo 测试文件已上传
goto menu

:end
echo 再见！
pause
```

### 2. 快速重启脚本

创建 `restart-minio.bat`：

```batch
@echo off
echo 重启MinIO服务...

REM 查找并终止minio进程
taskkill /f /im minio.exe 2>nul

REM 等待进程终止
timeout /t 2 /nobreak

REM 重新启动MinIO
echo 重新启动MinIO...
start "MinIO Server" cmd /k "cd /d C:\minio && start-minio.bat"

echo MinIO已重启！
pause
```

## 🐛 故障排除

### 1. 端口冲突问题

如果9000或9001端口被占用：

```batch
REM 检查端口占用
netstat -ano | findstr :9000
netstat -ano | findstr :9001

REM 修改MinIO端口
set MINIO_ADDRESS=:9002
set MINIO_CONSOLE_ADDRESS=:9003
```

### 2. 权限问题

确保MinIO有权限访问数据目录：

```powershell
# 给MinIO数据目录设置完全权限
icacls C:\minio\data /grant Everyone:(OI)(CI)F
```

### 3. 防火墙设置

添加防火墙规则允许MinIO端口：

```powershell
# 允许MinIO API端口
netsh advfirewall firewall add rule name="MinIO API" dir=in action=allow protocol=TCP localport=9000

# 允许MinIO Console端口  
netsh advfirewall firewall add rule name="MinIO Console" dir=in action=allow protocol=TCP localport=9001
```

## 📝 开发提示

### 1. 集成开发环境

如果使用IntelliJ IDEA，可以创建运行配置：
- **MinIO Server**: External Tool配置指向 `start-minio.bat`
- **TeleMsg App**: Spring Boot运行配置

### 2. 自动启动 (可选)

将MinIO设置为Windows服务自动启动：

```powershell
# 使用NSSM工具将MinIO安装为服务
# 1. 下载NSSM: https://nssm.cc/download
# 2. 安装服务
nssm install MinIO C:\minio\minio.exe
nssm set MinIO Parameters "server C:\minio\data --console-address :9001"
nssm set MinIO AppDirectory C:\minio
nssm set MinIO AppEnvironmentExtra "MINIO_ROOT_USER=minioadmin" "MINIO_ROOT_PASSWORD=minioadmin123"
nssm start MinIO
```

## 🔄 更新和维护

### 更新MinIO

```powershell
# 下载新版本替换现有文件
cd C:\minio
curl -O https://dl.min.io/server/minio/release/windows-amd64/minio.exe

# 重启服务
.\restart-minio.bat
```

通过以上配置，您就可以在Windows上原生运行MinIO，无需Docker环境！这种方式特别适合开发和测试阶段使用。

