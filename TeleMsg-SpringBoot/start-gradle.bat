@echo off
REM TeleMsg 快速启动脚本 - 使用 Gradle

echo ========================================
echo    TeleMsg SpringBoot Gradle 启动器
echo ========================================

REM 检查Java环境
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Java运行环境，请先安装Java 21+
    pause
    exit /b 1
)

REM 检查Gradle环境
gradle -v >nul 2>&1
if %errorlevel% neq 0 (
    echo 警告: 未找到Gradle，尝试使用gradlew...
    if exist "gradlew.bat" (
        set GRADLE_CMD=gradlew.bat
    ) else (
        echo 错误: 请先安装Gradle或配置Gradle Wrapper
        pause
        exit /b 1
    )
) else (
    set GRADLE_CMD=gradle
)

echo 使用Gradle命令: %GRADLE_CMD%
echo ========================================

:menu
echo.
echo 请选择启动方式:
echo 1. 开发环境运行 (H2���据库, DEBUG日志)
echo 2. 调试模式运行 (带调试端口5005)
echo 3. 快速启动 (最小日志)
echo 4. 生产环境运行 (MySQL数据库)
echo 5. 显示API测试命令
echo 6. 显示端口信息
echo 7. 显示所有Gradle任务
echo 0. 退出
echo.
set /p choice="请输入选项 (0-7): "

if "%choice%"=="1" goto runDev
if "%choice%"=="2" goto runDebug
if "%choice%"=="3" goto runQuick
if "%choice%"=="4" goto runProd
if "%choice%"=="5" goto testApi
if "%choice%"=="6" goto showPorts
if "%choice%"=="7" goto showTasks
if "%choice%"=="0" goto end
echo 无效选项，请重新选择
goto menu

:runDev
echo 🚀 启动开发环境服务器...
%GRADLE_CMD% runDev
goto menu

:runDebug
echo 🐛 启动调试模式服务器 (端口5005)...
%GRADLE_CMD% runDebug
goto menu

:runQuick
echo ⚡ 快速启动服务器...
%GRADLE_CMD% runQuick
goto menu

:runProd
echo 🏭 启动生产环境���务器...
%GRADLE_CMD% runProd
goto menu

:testApi
echo 📋 API测试命令:
%GRADLE_CMD% testApi
echo.
pause
goto menu

:showPorts
echo 🔌 端口信息:
%GRADLE_CMD% showPorts
echo.
pause
goto menu

:showTasks
echo 📋 所有可用任务:
%GRADLE_CMD% helpTeleMsg
echo.
pause
goto menu

:end
echo 感谢使用TeleMsg SpringBoot服务器！
pause
