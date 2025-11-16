@echo off
chcp 65001 >nul
echo 🌸 Dream Lingua QT 启动脚本
echo ================================

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未找到 Node.js,请先安装 Node.js v16+
    pause
    exit /b 1
)

echo ✅ Node.js 已安装

REM 检查 Ollama
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未找到 Ollama,请访问 https://ollama.ai/download 下载
    pause
    exit /b 1
)

echo ✅ Ollama 已安装

REM 检查 Ollama 服务
curl -s http://127.0.0.1:11434 >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Ollama 服务未运行,请手动运行 'ollama serve'
    echo 按任意键继续...
    pause >nul
)

echo ✅ Ollama 服务运行中

REM 检查依赖
if not exist "node_modules" (
    echo 📦 安装依赖...
    call npm install
)

REM 启动应用
echo.
echo 🚀 启动应用...
echo 💡 提示: 选中文本后按 Ctrl+Shift+E 进行翻译
echo.

call npm start

