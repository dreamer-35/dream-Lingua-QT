#!/bin/bash

echo "🌸 Dream Lingua QT 启动脚本"
echo "================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到 Node.js,请先安装 Node.js v16+"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 检查 Ollama
if ! command -v ollama &> /dev/null; then
    echo "❌ 未找到 Ollama,请访问 https://ollama.ai/download 下载"
    exit 1
fi

echo "✅ Ollama 已安装"

# 检查 Ollama 服务
if ! curl -s http://127.0.0.1:11434 &> /dev/null; then
    echo "⚠️  Ollama 服务未运行,正在启动..."
    ollama serve &
    sleep 3
fi

echo "✅ Ollama 服务运行中"

# 检查模型
if ! ollama list | grep -q "qwen3:0.6b"; then
    echo "⚠️  未找到 qwen3:0.6b 模型"
    read -p "是否现在下载? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ollama pull qwen3:0.6b
    else
        echo "❌ 需要下载模型才能使用翻译功能"
        exit 1
    fi
fi

echo "✅ AI 模型就绪"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    
    # 为 Electron 重新编译 robotjs
    echo "🔧 为 Electron 重新编译 robotjs..."
    npx electron-rebuild -f -w robotjs
    
    if [ $? -ne 0 ]; then
        echo "⚠️  robotjs 编译失败,请查看 INSTALL.md 获取帮助"
    fi
fi

# 启动应用
echo ""
echo "🚀 启动应用..."
echo "💡 提示: 选中文本后按 Cmd+Shift+E 进行翻译"
echo ""

npm start
