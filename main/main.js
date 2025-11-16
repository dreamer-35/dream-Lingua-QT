const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { registerShortcuts, unregisterShortcuts } = require('./shortcuts')

let popupWindow = null

/**
 * 创建悬浮窗口
 */
function createPopupWindow() {
  popupWindow = new BrowserWindow({
    width: 420,
    height: 600,
    frame: false,
    transparent: false,
    alwaysOnTop: false, // 改为不总是置顶,更友好
    resizable: false,
    skipTaskbar: false, // 显示在任务栏
    show: true, // 启动时显示
    hasShadow: true,
    backgroundColor: '#f8f9fa',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  popupWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  
  // 确保窗口在就绪后可以显示
  popupWindow.webContents.on('did-finish-load', () => {
    console.log('渲染进程加载完成')
  })

  // 开发模式打开调试工具
  if (process.argv.includes('--enable-logging')) {
    popupWindow.webContents.openDevTools({ mode: 'detach' })
  }

  return popupWindow
}

/**
 * 应用准备就绪
 */
app.whenReady().then(() => {
  const win = createPopupWindow()
  registerShortcuts(win)

  // 监听窗口控制事件
  ipcMain.on('minimize-window', () => {
    if (popupWindow) {
      popupWindow.minimize()
    }
  })

  ipcMain.on('close-window', () => {
    if (popupWindow) {
      popupWindow.hide() // 隐藏而不是关闭,保持应用运行
    }
  })

  // macOS 需要激活窗口显示
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createPopupWindow()
    }
  })
})

/**
 * 所有窗口关闭时
 */
app.on('window-all-closed', () => {
  // macOS 保持应用运行
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * 应用退出前清理
 */
app.on('will-quit', () => {
  unregisterShortcuts()
})
