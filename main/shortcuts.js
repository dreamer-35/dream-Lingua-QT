const { globalShortcut, clipboard, screen } = require('electron')
const translate = require('../services/translate')
const robot = require('robotjs')

let mainWindow = null

/**
 * 注册全局快捷键
 * @param {BrowserWindow} win 
 */
function registerShortcuts(win) {
  mainWindow = win

  // 注册 Cmd+Shift+E (macOS) 或 Ctrl+Shift+E (Windows/Linux)
  const ret = globalShortcut.register('CommandOrControl+Shift+E', async () => {
    console.log('快捷键触发!')
    
    // 保存当前剪贴板内容
    const previousClipboard = clipboard.readText()
    
    // 模拟 Cmd+C / Ctrl+C 复制选中的文本
    const modifier = process.platform === 'darwin' ? 'command' : 'control'
    robot.keyTap('c', [modifier])
    
    // 等待剪贴板更新
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 读取新复制的内容
    const text = clipboard.readText().trim()
    
    // 如果没有新内容,恢复原剪贴板
    if (!text || text === previousClipboard) {
      console.log('没有选中文本')
      if (previousClipboard) {
        clipboard.writeText(previousClipboard)
      }
      return
    }

    console.log('待翻译文本:', text)

    // 显示窗口在鼠标附近
    showWindowNearCursor()

    // 发送加载状态
    mainWindow.webContents.send('translation-loading', { text })

    try {
      // 调用翻译服务
      const result = await translate(text)
      console.log('翻译结果:', result)

      // 发送翻译结果
      mainWindow.webContents.send('show-translation', { 
        text, 
        result 
      })
      
      // 恢复原剪贴板内容
      setTimeout(() => {
        if (previousClipboard) {
          clipboard.writeText(previousClipboard)
        }
      }, 500)
    } catch (error) {
      console.error('翻译失败:', error)
      mainWindow.webContents.send('translation-error', { 
        text, 
        error: error.message 
      })
      
      // 恢复原剪贴板内容
      if (previousClipboard) {
        clipboard.writeText(previousClipboard)
      }
    }
  })

  if (!ret) {
    console.error('快捷键注册失败!')
  } else {
    console.log('快捷键 CommandOrControl+Shift+E 注册成功!')
  }
}

/**
 * 在鼠标附近显示窗口
 */
function showWindowNearCursor() {
  const cursorPos = screen.getCursorScreenPoint()
  const display = screen.getDisplayNearestPoint(cursorPos)

  // 在鼠标右下方偏移一点
  let x = cursorPos.x + 20
  let y = cursorPos.y + 20

  // 防止超出屏幕边界
  if (x + 400 > display.bounds.x + display.bounds.width) {
    x = display.bounds.x + display.bounds.width - 420
  }
  if (y + 400 > display.bounds.y + display.bounds.height) {
    y = display.bounds.y + display.bounds.height - 420
  }

  mainWindow.setPosition(x, y)
  mainWindow.show()
}

/**
 * 注销全局快捷键
 */
function unregisterShortcuts() {
  globalShortcut.unregisterAll()
  console.log('快捷键已注销')
}

module.exports = { 
  registerShortcuts, 
  unregisterShortcuts 
}
