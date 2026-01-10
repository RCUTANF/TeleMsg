@echo off
REM TeleMsg SpringBoot Server Windows 启动脚本

echo ==========================================
echo     TeleMsg SpringBoot Server 启动中...
echo ==========================================

REM 检查Java环境
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Java运行环境，请先安装Java 21+
    pause
    exit /b 1
)

REM 设置环境变量
set JAVA_OPTS=-Xmx2048m -Xms512m -XX:+UseG1GC
if not defined SPRING_PROFILES_ACTIVE set SPRING_PROFILES_ACTIVE=dev

REM 输出配置信息
echo Java版本:
java -version
echo 运行环境: %SPRING_PROFILES_ACTIVE%
echo JVM参数: %JAVA_OPTS%
echo ==========================================

REM 构建项目
echo 正在构建项目...
call gradlew.bat build -q
if %errorlevel% neq 0 (
    echo 错误: 项目构建失败
    pause
    exit /b 1
)

REM 启动服务
echo 正在��动TeleMsg服务...
java %JAVA_OPTS% -jar build/libs/telemsg-server.jar --spring.profiles.active=%SPRING_PROFILES_ACTIVE% %*

pause
