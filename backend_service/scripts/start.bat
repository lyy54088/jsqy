@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo 🏋️  健身教练应用后端服务
echo ================================
echo.

REM 检查 Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Docker 未安装，请先安装 Docker Desktop
    pause
    exit /b 1
)

REM 检查 Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Docker Compose 未安装，请先安装 Docker Compose
    pause
    exit /b 1
)

REM 检查环境变量文件
if not exist .env (
    echo 📝 创建环境变量文件...
    copy .env.example .env >nul
    echo ✅ 已创建 .env 文件，请根据需要修改配置
    echo.
)

REM 选择启动模式
echo 请选择启动模式:
echo 1^) 开发模式 ^(development^)
echo 2^) 生产模式 ^(production^)
echo.
set /p choice="请输入选择 (1-2): "

if "%choice%"=="1" (
    echo 🚀 启动开发环境...
    docker-compose --profile development up -d
) else if "%choice%"=="2" (
    echo 🚀 启动生产环境...
    docker-compose up -d
) else (
    echo 无效选择，默认启动开发环境
    docker-compose --profile development up -d
)

echo.
echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

REM 检查服务状态
curl -f http://localhost:3000/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️  服务可能还在启动中，请稍后访问 http://localhost:3000/health 检查状态
) else (
    echo ✅ 服务启动成功！
    echo.
    echo 📋 服务信息:
    echo   🌐 应用地址: http://localhost:3000
    echo   ❤️  健康检查: http://localhost:3000/health
    echo   📚 API 文档: http://localhost:3000/api-docs
    echo.
    echo 🔧 管理命令:
    echo   📊 查看日志: docker-compose logs -f
    echo   🛑 停止服务: docker-compose down
    echo   🔄 重启服务: docker-compose restart
    echo.
)

pause