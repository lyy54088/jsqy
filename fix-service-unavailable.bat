@echo off
echo ========================================
echo 健身教练应用 - 服务不可用问题修复工具
echo ========================================
echo.

echo [1/5] 停止可能运行的开发服务器...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] 清除 npm 缓存...
npm cache clean --force

echo [3/5] 清除 node_modules 并重新安装依赖...
if exist node_modules rmdir /s /q node_modules
npm install

echo [4/5] 清除浏览器缓存数据...
echo 请手动清除浏览器缓存，或使用 Ctrl+Shift+R 强制刷新

echo [5/5] 重新启动开发服务器...
echo 正在启动服务器，请稍候...
start cmd /k "npm run dev"

echo.
echo ========================================
echo 修复完成！
echo 应用将在新窗口中启动
echo 如果问题仍然存在，请检查：
echo 1. 网络连接是否正常
echo 2. 端口 5173 是否被其他程序占用
echo 3. 是否有防火墙阻止访问
echo ========================================
pause