# Changelog

All notable changes to Dream Lingua QT will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- [ ] 自定义快捷键
- [ ] 历史翻译记录
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
