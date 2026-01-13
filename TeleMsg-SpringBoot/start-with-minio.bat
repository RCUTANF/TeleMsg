@echo off
echo ========================================
echo TeleMsg SpringBoot with MinIO - 快速启动
echo ========================================
echo.

echo [1/4] 检查Docker环境...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker未安装或未启动，请先安装Docker Desktop
    pause
    exit /b 1
)
echo ✅ Docker环境正常

echo.
echo [2/4] 构建TeleMsg应用...
call .\gradlew build -x test
if %errorlevel% neq 0 (
    echo ❌ 项目构建失败，���检查代码
    pause
    exit /b 1
)
echo ✅ 应用构建成功

echo.
echo [3/4] 启动MinIO和数据库服务...
docker-compose up -d mysql redis minio
echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

echo.
echo [4/4] 启动TeleMsg应用...
docker-compose up -d telemsg-server

echo.
echo ========================================
echo 🎉 启动完成！
echo ========================================
echo.
echo 📱 TeleMsg API: http://localhost:8080/api
echo 🗃️  MinIO Console: http://localhost:9001
echo 🗄️  MySQL: localhost:3306
echo 📊 Redis: localhost:6379
echo.
echo MinIO登录凭据:
echo   用户名: minioadmin
echo   密码: minioadmin123
echo.
echo 测试API:
echo   POST http://localhost:8080/api/auth/login
echo   Body: {"username": "admin", "password": "123456"}
echo.
echo 📖 完整文档:
echo   - README.md
echo   - API_DOCUMENTATION.md
echo   - MINIO_INTEGRATION_GUIDE.md
echo.
pause
