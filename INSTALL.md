# 📦 安装指南

## 快速安装

```bash
# 1. 安装依赖
npm install

# 2. 为 Electron 重新编译 robotjs (必须!)
npx electron-rebuild -f -w robotjs

# 或者使用新版本命令
npx @electron/rebuild -f -w robotjs
```

**重要**: robotjs 是原生模块,必须为 Electron 重新编译才能使用!

## ⚠️ robotjs 安装问题

`robotjs` 是一个原生模块,需要编译。如果安装遇到问题:

### macOS

```bash
# 安装 Xcode Command Line Tools
xcode-select --install

# 然后重新安装
npm install
```

### Windows

1. 安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/)
2. 选择 "Desktop development with C++"
3. 重新运行 `npm install`

### Linux (Ubuntu/Debian)

```bash
# 安装编译依赖
sudo apt-get update
sudo apt-get install -y libxtst-dev libpng++-dev

# 重新安装
npm install
```

## 🔧 替代方案 (如果 robotjs 无法安装)

如果 robotjs 安装一直失败,可以使用简化版本 (手动复制文本):

### 方案 1: 使用 @nut-tree/nut-js (推荐)

```bash
npm uninstall robotjs
npm install @nut-tree/nut-js
```

然后修改 `main/shortcuts.js`:

```javascript
// 替换 robotjs
const { keyboard, Key } = require('@nut-tree/nut-js')

// 在快捷键回调中
const modifier = process.platform === 'darwin' ? Key.LeftSuper : Key.LeftControl
await keyboard.pressKey(modifier, Key.C)
await keyboard.releaseKey(modifier, Key.C)
```

### 方案 2: 回退到手动复制模式

如果上述方法都不行,可以使用简化版 (用户需要先手动复制):

修改 `main/shortcuts.js`,移除 robotjs 相关代码,回到原始的剪贴板读取方式。

## ✅ 验证安装

安装成功后,运行:

```bash
npm start
```

如果应用正常启动,说明安装成功!

## 🐛 常见问题

### Q: npm install 报错 "gyp ERR!"

**A**: 这是 robotjs 编译问题,按照上面的系统特定步骤安装编译工具。

### Q: macOS 提示 "xcrun: error"

**A**: 需要安装 Xcode Command Line Tools:
```bash
xcode-select --install
```

### Q: Windows 提示找不到 Python

**A**: robotjs 需要 Python 2.7 或 3.x:
```bash
npm install --global windows-build-tools
```

### Q: 还是无法安装?

**A**: 使用方案 2,回退到手动复制模式 (见上文)。

## 📚 更多帮助

- [robotjs 官方文档](https://github.com/octalmage/robotjs)
- [Electron 原生模块](https://www.electronjs.org/docs/latest/tutorial/using-native-node-modules)

