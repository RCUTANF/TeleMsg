@echo off
echo ================================
echo  启动 Mediasoup 音视频服务器
echo ================================
echo.

cd /d "%~dp0mediasoup-server"

:: 检查是否已安装依赖
if not exist "node_modules\" (
    echo [信息] 首次运行，正在安装依赖...
    echo.
    call npm install
    echo.
)

:: 启动服务器
echo [信息] 启动 Mediasoup 服务器...
echo.
call npm start

pause

