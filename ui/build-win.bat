@echo off
echo Building TeleMsg Desktop for Windows...
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM 检查依赖是否安装
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM 清理旧的构建文件
if exist "dist" (
    echo Cleaning old build files...
    rmdir /s /q dist
)
if exist "dist-electron" (
    echo Cleaning old electron build files...
    rmdir /s /q dist-electron
)

REM 构建应用
echo Building web application...
npm run build
if %errorlevel% neq 0 (
    echo Error: Failed to build web application
    pause
    exit /b 1
)

echo Building Windows executable...
npm run build:win
if %errorlevel% neq 0 (
    echo Error: Failed to build Windows executable
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo Output directory: dist-electron
echo.

REM 打开输出目录
if exist "dist-electron" (
    echo Opening output directory...
    explorer dist-electron
)

pause
