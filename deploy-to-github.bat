@echo off
echo ========================================
echo 部署健身教练应用到 GitHub Pages
echo ========================================
echo.

:: 检查是否已初始化Git仓库
if not exist ".git" (
    echo 初始化 Git 仓库...
    git init
    echo.
)

:: 添加所有文件
echo 添加文件到暂存区...
git add .
echo.

:: 提交代码
set /p commit_msg=请输入提交信息 (默认: 更新健身教练应用): 
if "%commit_msg%"=="" set commit_msg=更新健身教练应用
echo 提交代码: %commit_msg%
git commit -m "%commit_msg%"
echo.

:: 检查是否已添加远程仓库
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo 请输入您的 GitHub 用户名:
    set /p username=用户名: 
    echo 添加远程仓库...
    git remote add origin https://github.com/!username!/jsqy.git
    echo.
)

:: 设置主分支并推送
echo 推送到 GitHub...
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ 推送失败！请检查:
    echo 1. GitHub 仓库是否已创建
    echo 2. 用户名是否正确
    echo 3. 是否有推送权限
    echo.
    echo 手动推送命令:
    echo git remote set-url origin https://github.com/YOUR_USERNAME/jsqy.git
    echo git push -u origin main
) else (
    echo.
    echo ✅ 部署成功！
    echo.
    echo 🌐 您的应用将在几分钟后可用:
    echo https://YOUR_USERNAME.github.io/jsqy/
    echo.
    echo 📋 后续更新只需运行:
    echo git add . && git commit -m "更新" && git push
)

echo.
echo 按任意键退出...
pause >nul