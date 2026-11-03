# Dream Lingua QT

<div align="center">

![Dream Lingua QT](https://img.shields.io/badge/Dream%20Lingua%20QT-v2.0.0-ff69b4?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-28.3.3-47848F?style=for-the-badge&logo=electron)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**🌸 AI-Powered Local Translation Desktop Assistant with Live2D Characters 🌸**

[English](#english) | [中文](#中文)

</div>

---

## 中文

### ✨ 特性

- 🎯 **全局快捷键翻译** - 选中文本后按 `Cmd+Shift+E` (macOS) 或 `Ctrl+Shift+E` (Windows/Linux) 即可翻译
- 💫 **Live2D 动态角色** - 精美的动画角色陪伴，支持多角色随机展示
- 🔒 **完全本地化** - 基于 Ollama，所有数据在本地处理，保护隐私安全
- 📚 **词条解释** - 单词/词组额外给出所属领域与简明解释，多义词分义项说明
- 🔊 **语音朗读** - 一键朗读原文/译文 (系统 TTS，离线可用)
- 🕘 **历史记录** - 本地保存翻译记录，侧栏随时查看、搜索、删除
- 🎨 **现代化 UI** - 黑白粉配色方案，磨砂玻璃效果，流畅动画
- ⚡ **零延迟** - 本地 AI 引擎，无需联网，即时响应
- 🌍 **跨平台** - 支持 macOS (Intel/Apple Silicon)、Windows、Linux

### 📸 预览

<div align="center">

**首页**

<img width="421" height="599" alt="首页" src="https://github.com/user-attachments/assets/756f6456-3b15-4525-8641-375b33dcd6c2" />

**翻译页面**

<img width="421" height="601" alt="翻译" src="https://github.com/user-attachments/assets/e2d2944e-9cbd-4e38-8cd9-05bb173db8c5" />

</div>

### 🚀 快速开始

#### 前置要求

1. **安装 Ollama**

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: 访问 https://ollama.com/download
```

2. **下载翻译模型**

```bash
ollama pull qwen3-vl:8b-instruct
```

3. **启动 Ollama 服务**

```bash
ollama serve
```

#### 安装应用

**方式一：下载预编译版本** (推荐)

前往 [Releases](https://github.com/dreamer-35/dream-Lingua-QT/releases) 页面下载对应平台的安装包：

- macOS (Intel): `Dream-Lingua-QT-2.0.0.dmg`
- macOS (Apple Silicon): `Dream-Lingua-QT-2.0.0-arm64.dmg`
- Windows: `Dream-Lingua-QT-Setup-2.0.0.exe`
- Linux: `Dream-Lingua-QT-2.0.0.AppImage`

**方式二：从源码构建**

```bash
# 克隆仓库
git clone https://github.com/dreamer-35/dream-Lingua-QT.git
cd dream-Lingua-QT

# 安装依赖
npm install

# 重新编译原生模块
npm run rebuild

# 启动开发模式
npm start

# 打包应用
npm run build          # 当前平台
npm run build:mac      # macOS (Intel)
npm run build:mac:arm64 # macOS (Apple Silicon)
npm run build:win      # Windows
npm run build:linux    # Linux
npm run build:all      # 所有平台
```

### 📖 使用方法

1. **启动应用** - 打开 Dream Lingua QT，你将看到欢迎页面
2. **选中文本** - 在任意应用中选中需要翻译的文本
3. **触发翻译** - 按下全局快捷键，或右键 → 服务 → **用 Dream Lingua 翻译** (macOS)
   - 默认 `Cmd/Ctrl+Shift+E`，可在首页下拉切换为 `⌘⇧1` / `⌘⇧2` / `⌃⌥T`
   - 右键服务也可在 系统设置 → 键盘 → 键盘快捷键 → 服务 中绑定任意快捷键
4. **查看结果** - 翻译结果将在弹窗中显示，并有可爱的 Live2D 角色陪伴
5. **返回首页** - 结果停留 3 分钟 (鼠标悬停时不计时) 后自动返回，或点击"返回"按钮
6. **历史记录** - 点击左上角 ☰ 打开历史侧栏

### ⚙️ macOS 权限设置

首次使用时，macOS 需要授予辅助功能权限：

1. 打开 **系统偏好设置** → **安全性与隐私** → **隐私** → **辅助功能**
2. 点击左下角锁图标解锁
3. 点击 `+` 添加 `Dream Lingua QT.app`
4. 勾选启用
5. 重启应用

详细说明：[PERMISSIONS_GUIDE.md](PERMISSIONS_GUIDE.md)

### 🎭 Live2D 角色

应用内置三个精美的 Live2D 角色，每次翻译时随机展示：

- **Hiyori** - 活泼可爱的少女
- **Mao** - 优雅知性的女性
- **Rice** - 清新自然的角色

> Live2D 模型来自 Live2D 官方免费资源

### 🛠️ 技术栈

- **框架**: Electron 28.3.3
- **AI 引擎**: Ollama (qwen3-vl:8b-instruct)
- **渲染引擎**: PIXI.js v7.4.2
- **Live2D**: pixi-live2d-display + Cubism 4 SDK
- **自动化**: robotjs
- **打包工具**: electron-builder

### 📁 项目结构

```
dream-Lingua-QT/
├── main/                    # Electron 主进程
│   ├── main.js             # 主进程入口
│   ├── shortcuts.js        # 全局快捷键管理
│   ├── history.js          # 本地历史记录
│   └── preload.js          # 预加载脚本
├── renderer/               # 渲染进程
│   ├── index.html          # 主页面
│   ├── app.js              # 前端逻辑
│   ├── style.css           # 样式表
│   ├── live2d-loader.js    # Live2D 加载器
│   └── live2d/             # Live2D 模型资源
├── services/               # 业务服务
│   └── translate.js        # 翻译服务
├── assets/                 # 静态资源
└── package.json            # 项目配置
```

### 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 📝 开发文档

- [完整开发总结](DEVELOPMENT_SUMMARY.md) - 开发历程和技术难点
- [权限配置指南](PERMISSIONS_GUIDE.md) - macOS 权限设置详解
- [打包发布指南](BUILD.md) - 构建和发布流程

### 🐛 已知问题

- macOS 首次使用需要手动配置权限
- Windows Defender 可能误报（请添加信任）
- Linux 需要安装 libxtst-dev 依赖

### 📄 许可证

本项目采用 [MIT](LICENSE) 许可证

### 🙏 致谢

- [Ollama](https://ollama.com/) - 本地 AI 引擎
- [Live2D](https://www.live2d.com/) - 2D 动画技术
- [PIXI.js](https://pixijs.com/) - 2D 渲染引擎
- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架

---

## English

### ✨ Features

- 🎯 **Global Hotkey Translation** - Select text and press `Cmd+Shift+E` (macOS) or `Ctrl+Shift+E` (Windows/Linux) to translate
- 💫 **Live2D Dynamic Characters** - Beautiful animated characters with random display support
- 🔒 **Fully Local** - Based on Ollama, all data processed locally for privacy protection
- 📚 **Term Explanations** - Words/phrases come with domain tag and concise explanation
- 🔊 **Text-to-Speech** - Read source/translation aloud (system TTS, offline)
- 🕘 **History** - Local translation history with searchable sidebar
- 🎨 **Modern UI** - Black, white, and pink color scheme with frosted glass effects and smooth animations
- ⚡ **Zero Latency** - Local AI engine, no internet required, instant response
- 🌍 **Cross-Platform** - Supports macOS (Intel/Apple Silicon), Windows, Linux

### 📸 Preview

<div align="center">

**Home Page**

<img width="421" height="599" alt="Home Page" src="https://github.com/user-attachments/assets/756f6456-3b15-4525-8641-375b33dcd6c2" />

**Translation Page**

<img width="421" height="601" alt="Translation Page" src="https://github.com/user-attachments/assets/e2d2944e-9cbd-4e38-8cd9-05bb173db8c5" />

</div>

### 🚀 Quick Start

#### Prerequisites

1. **Install Ollama**

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: Visit https://ollama.com/download
```

2. **Download Translation Model**

```bash
ollama pull qwen3-vl:8b-instruct
```

3. **Start Ollama Service**

```bash
ollama serve
```

#### Install Application

**Method 1: Download Pre-built Binaries** (Recommended)

Visit [Releases](https://github.com/dreamer-35/dream-Lingua-QT/releases) page to download the installer for your platform:

- macOS (Intel): `Dream-Lingua-QT-2.0.0.dmg`
- macOS (Apple Silicon): `Dream-Lingua-QT-2.0.0-arm64.dmg`
- Windows: `Dream-Lingua-QT-Setup-2.0.0.exe`
- Linux: `Dream-Lingua-QT-2.0.0.AppImage`

**Method 2: Build from Source**

```bash
# Clone repository
git clone https://github.com/dreamer-35/dream-Lingua-QT.git
cd dream-Lingua-QT

# Install dependencies
npm install

# Rebuild native modules
npm run rebuild

# Start development mode
npm start

# Build application
npm run build          # Current platform
npm run build:mac      # macOS (Intel)
npm run build:mac:arm64 # macOS (Apple Silicon)
npm run build:win      # Windows
npm run build:linux    # Linux
npm run build:all      # All platforms
```

### 📖 Usage

1. **Launch App** - Open Dream Lingua QT to see the welcome page
2. **Select Text** - Select text you want to translate in any application
3. **Trigger Translation** - Press the global hotkey, or right-click → Services → **用 Dream Lingua 翻译** (macOS)
   - Default `Cmd/Ctrl+Shift+E`, switchable on the home page to `⌘⇧1` / `⌘⇧2` / `⌃⌥T`
   - The Service can also be bound to any key in System Settings → Keyboard → Keyboard Shortcuts → Services
4. **View Results** - Translation results will appear in a popup with a cute Live2D character
5. **Return Home** - Result stays for 3 minutes (paused while hovering), or click "Back" button
6. **History** - Click ☰ at the top-left to open the history sidebar

### ⚙️ macOS Permissions Setup

When using for the first time, macOS requires accessibility permissions:

1. Open **System Preferences** → **Security & Privacy** → **Privacy** → **Accessibility**
2. Click the lock icon at bottom left to unlock
3. Click `+` to add `Dream Lingua QT.app`
4. Check to enable
5. Restart the application

For details: [PERMISSIONS_GUIDE.md](PERMISSIONS_GUIDE.md)

### 🎭 Live2D Characters

The app includes three beautiful Live2D characters that display randomly during translation:

- **Hiyori** - Lively and cute girl
- **Mao** - Elegant and intellectual woman
- **Rice** - Fresh and natural character

> Live2D models from Live2D official free resources

### 🛠️ Tech Stack

- **Framework**: Electron 28.3.3
- **AI Engine**: Ollama (qwen3-vl:8b-instruct)
- **Renderer**: PIXI.js v7.4.2
- **Live2D**: pixi-live2d-display + Cubism 4 SDK
- **Automation**: robotjs
- **Builder**: electron-builder

### 📁 Project Structure

```
dream-Lingua-QT/
├── main/                    # Electron main process
│   ├── main.js             # Main process entry
│   ├── shortcuts.js        # Global shortcut manager
│   ├── history.js          # Local history storage
│   └── preload.js          # Preload script
├── renderer/               # Renderer process
│   ├── index.html          # Main page
│   ├── app.js              # Frontend logic
│   ├── style.css           # Stylesheets
│   ├── live2d-loader.js    # Live2D loader
│   └── live2d/             # Live2D model assets
├── services/               # Business services
│   └── translate.js        # Translation service
├── assets/                 # Static assets
└── package.json            # Project config
```

### 🤝 Contributing

Contributions, issues and feature requests are welcome!

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📝 Documentation

- [Development Summary](DEVELOPMENT_SUMMARY.md) - Development journey and technical challenges
- [Permissions Guide](PERMISSIONS_GUIDE.md) - macOS permissions setup guide
- [Build Guide](BUILD.md) - Build and release process

### 🐛 Known Issues

- macOS requires manual permission configuration on first use
- Windows Defender may flag as false positive (please add to trusted)
- Linux requires libxtst-dev dependency

### 📄 License

This project is licensed under the [MIT](LICENSE) License

### 🙏 Acknowledgments

- [Ollama](https://ollama.com/) - Local AI engine
- [Live2D](https://www.live2d.com/) - 2D animation technology
- [PIXI.js](https://pixijs.com/) - 2D rendering engine
- [Electron](https://www.electronjs.org/) - Cross-platform desktop application framework

---

<div align="center">

**Made with ❤️ and Live2D**

Star ⭐ this repo if you like it!

</div>
