@echo off
chcp 65001 >nul
cd /d "%~dp0"
set PORT=5173

where node >nul 2>nul
if %errorlevel%==0 goto use_node

where python >nul 2>nul
if %errorlevel%==0 goto use_python

echo.
echo 没有找到 Node.js 或 Python。
echo 安装其中一个后，再双击这个脚本即可。
echo.
pause
exit /b 1

:use_node
echo 正在启动本地服务器（Node.js）...
start "" /b node server.mjs
timeout /t 2 >nul
start "" http://localhost:%PORT%/
echo 已打开 http://localhost:%PORT%/ ，关闭此窗口即停止服务。
pause
exit /b 0

:use_python
echo 正在启动本地服务器（Python）...
start "" /b python -m http.server %PORT%
timeout /t 2 >nul
start "" http://localhost:%PORT%/
echo 已打开 http://localhost:%PORT%/ ，关闭此窗口即停止服务。
pause
exit /b 0
