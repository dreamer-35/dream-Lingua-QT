# Changelog

All notable changes to Dream Lingua QT will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-11-03

### ✨ 新增功能
- **翻译 / 解释分离** - 三种模式各自独立快捷键 (首页下拉切换，可关闭)
  - 翻译 (只出译文)：`⌘⇧1` (默认) / `⌘⇧2` / `⌘⇧3` / `⌃⌥T`
  - 解释 / 理解 (中文讲解含义、关键概念、言外之意)：`⌘⇧8` (默认) / `⌘⇧9` / `⌘⇧0`
  - 翻译 + 解释 (整句也附带解释)：`⌘⇧E` (默认) / `⌃⌥E`
- **右键「用 Dream Lingua 解释」** - 新增解释服务；「用 Dream Lingua 翻译」对应翻译 + 解释

### 🔧 改进
- 有解释内容时原文面板自动收缩，留出空间给解释
- 历史记录按「原文 + 模式」去重，解释记录带「解」标签，搜索覆盖解释内容

## [2.0.0] - 2026-10-30

### ✨ 新增功能
- **词条解释** - 单词/词组 (英文 ≤4 词、中文 ≤8 字且无句读) 在译文下方显示所属领域与 1-2 句解释，多义词分义项说明
- **语音朗读** - 原文/译文面板新增 🔊 按钮，使用系统 TTS (婷婷 / Samantha)，再次点击停止
- **本地历史记录** - 自动保存至 `userData/history.json` (上限 1000 条，同原文去重置顶)
- **历史侧栏** - 标题栏 ☰ 按钮打开 (默认隐藏)，支持搜索、回看、单条删除、清空
- **右键翻译 (macOS)** - 自动安装快速操作「用 Dream Lingua 翻译」，选中文本 → 右键 → 服务 即可翻译；经 `dreamlingua://` 协议传文本，不占用剪贴板，应用未运行时自动启动
- **快捷键可切换** - 首页下拉选择 `⌘⇧E` / `⌘⇧1` / `⌘⇧2` / `⌃⌥T`，被占用时自动保留原快捷键并提示

### 🔧 改进
- **翻译模型升级** - 默认 `qwen3-vl:8b-instruct`，按 `qwen3:8b` → `qwen2.5:1.5b` 自动降级；启动预加载并常驻 30 分钟
- **翻译鲁棒性** - 改用 `/api/chat` + JSON Schema 结构化输出，关闭思考模式；原文以 `<text>` 包裹防止指令注入；中译英残留中文时自动换模型重试
- **语言检测** - 按中文字符占比判断，中英混排不再误判
- **停留时长** - 翻译结果停留 3 分钟 (原 60 秒)、错误 15 秒 (原 5 秒)，鼠标悬停时暂停计时

## [1.0.0] - 2025-11-15

### 🎉 初始版本

这是 Dream Lingua QT 的第一个正式版本！

### ✨ 新增功能

#### 核心功能
- **全局快捷键翻译** - 支持 `Cmd+Shift+E` (macOS) 和 `Ctrl+Shift+E` (Windows/Linux)
- **自动文本捕获** - 无需手动复制，选中文本后直接翻译
- **剪贴板保护** - 自动保存并恢复原始剪贴板内容
- **本地 AI 翻译** - 基于 Ollama 的 qwen3:0.6b 模型

#### UI/UX
- **现代化首页** - 包含使用说明、快捷键提示、状态显示
- **翻译面板** - 原文和译文分栏展示，清晰易读
- **黑白粉配色方案** - 精心设计的配色，磨砂玻璃效果
- **流畅动画** - 页面切换、加载状态、按钮交互动画
- **窗口控制** - 最小化、关闭按钮

#### Live2D
- **多角色支持** - 内置 3 个精美 Live2D 角色（Hiyori, Mao, Rice）
- **随机展示** - 首页和翻译页随机切换角色
- **全身显示** - 优化的缩放和位置配置，展示完整角色
- **动态交互** - 呼吸动画、表情变化

#### 跨平台
- **macOS 支持** - Intel (x64) 和 Apple Silicon (arm64)
- **Windows 支持** - x64 架构
- **Linux 支持** - AppImage 和 deb 包

### 🔧 技术实现

- **Electron 28.3.3** - 跨平台桌面应用框架
- **PIXI.js v7.4.2** - 高性能 2D 渲染引擎
- **pixi-live2d-display** - Live2D Cubism 4 集成
- **robotjs** - 系统级自动化操作
- **electron-builder** - 多平台打包工具

### 🐛 已解决的问题

#### WebGL 上下文管理
- 修复多个 PIXI 实例导致的 WebGL 上下文冲突
- 实现单实例策略，确保任意时刻只有一个 Live2D 实例
- 解决 `bindTexture`, `bindBuffer`, `drawElements` 错误

#### Canvas 元素管理
- 修复 PIXI destroy 后 Canvas 元素丢失问题
- 实现动态 Canvas 创建机制
- 确保 init/destroy 循环的稳定性

#### 库加载与兼容性
- 修复 PIXI.js v8 不兼容问题，降级到 v7.4.2
- 正确加载 Cubism Core SDK
- 调整库加载顺序，避免依赖错误

#### 原生模块编译
- 配置 electron-rebuild 自动重新编译 robotjs
- 解决打包后找不到原生模块的问题
- 支持跨平台原生模块编译

#### macOS 权限
- 提供详细的辅助功能权限配置指南
- 自动检测权限状态并提示用户

### 📚 文档

- **README.md** - 项目介绍、快速开始、使用指南
- **DEVELOPMENT_SUMMARY.md** - 完整开发历程和技术难点总结
- **PERMISSIONS_GUIDE.md** - macOS 权限配置详细说明
- **BUILD.md** - 构建和打包指南
- **RELEASE_GUIDE.md** - 发布流程和版本管理
- **CHANGELOG.md** - 版本更新记录（本文件）

### 🚀 CI/CD

- 配置 GitHub Actions 自动构建工作流
- 支持 Tag 推送自动发布
- 并行构建 macOS, Windows, Linux 三个平台
- 自动生成 Release Notes

### 📦 发布产物

- `Dream-Lingua-QT-1.0.0.dmg` (macOS Intel)
- `Dream-Lingua-QT-1.0.0-arm64.dmg` (macOS Apple Silicon)
- `Dream-Lingua-QT-Setup-1.0.0.exe` (Windows 安装包)
- `Dream-Lingua-QT-1.0.0.exe` (Windows 便携版)
- `Dream-Lingua-QT-1.0.0.AppImage` (Linux AppImage)
- `dream-lingua-qt_1.0.0_amd64.deb` (Linux deb 包)

---

## [Unreleased]

### 计划中的功能

- [ ] 更多 Live2D 角色
- [x] 自定义快捷键 (v2.0.0 / v2.1.0)
- [x] 历史翻译记录 (v2.0.0)
- [ ] 多语言界面
- [ ] 翻译引擎切换（支持多个 Ollama 模型）
- [ ] 主题自定义
- [ ] 插件系统

---

## 版本对比

### [1.0.0] vs 初始开发版

#### 新增
- ✅ 完整的 UI/UX 设计
- ✅ Live2D 角色集成
- ✅ 多平台打包支持
- ✅ GitHub Actions CI/CD
- ✅ 完善的文档系统

#### 改进
- 🔧 WebGL 性能优化
- 🔧 内存管理优化
- 🔧 错误处理增强
- 🔧 用户体验提升

#### 修复
- 🐛 8+ 个重大 Bug 修复
- 🐛 跨平台兼容性问题
- 🐛 原生模块编译问题

---

**注**: 版本号格式为 `[主版本号.次版本号.修订号]`

- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增  
- **修订号**: 向下兼容的问题修正

[Unreleased]: https://github.com/dreamer-35/dream-Lingua-QT/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/dreamer-35/dream-Lingua-QT/releases/tag/v1.0.0
