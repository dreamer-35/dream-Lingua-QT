const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const {
  registerShortcuts,
  unregisterShortcuts,
  setShortcut,
  getShortcutState,
  translateText
} = require('./shortcuts')
const history = require('./history')
const settings = require('./settings')
const { installQuickActions } = require('./quickAction')
const translate = require('../services/translate')

const PROTOCOL = 'dreamlingua'

let popupWindow = null
let rendererReady = false
// 渲染进程就绪前收到的右键翻译请求 (应用由服务菜单冷启动时)
const pendingRequests = []

/**
 * 右键服务: dreamlingua://translate?mode=explain&text=...
 * 必须在 ready 之前监听，否则冷启动时会丢失首个请求
 */
app.on('open-url', (event, url) => {
  event.preventDefault()
  try {
    const { hostname, searchParams } = new URL(url)
    const text = searchParams.get('text')
    const mode = searchParams.get('mode') || 'both'
    if (hostname !== 'translate' || !text) return
    if (rendererReady) {
      translateText(text, mode)
    } else {
      pendingRequests.push([text, mode])
    }
  } catch (error) {
    console.warn('无法解析 URL:', url, error.message)
  }
})

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
    rendererReady = true
    pendingRequests.splice(0).forEach(([text, mode]) => translateText(text, mode))
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

  // 历史记录
  ipcMain.handle('history:list', () => history.list())
  ipcMain.handle('history:remove', (event, id) => history.remove(id))
  ipcMain.handle('history:clear', () => history.clear())

  // 快捷键设置
  ipcMain.handle('shortcut:get', () => getShortcutState())
  ipcMain.handle('shortcut:set', (event, action, accelerator) => {
    if (!settings.isValidShortcut(action, accelerator)) {
      return { ok: false, actions: getShortcutState() }
    }
    const ok = setShortcut(action, accelerator)
    if (ok) settings.setShortcutSetting(action, accelerator)
    return { ok, actions: getShortcutState() }
  })

  // 开发模式下协议会注册到 Electron 本体，只在打包版启用右键服务
  if (app.isPackaged) {
    app.setAsDefaultProtocolClient(PROTOCOL)
    installQuickActions()
  }

  translate.warmup()

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
