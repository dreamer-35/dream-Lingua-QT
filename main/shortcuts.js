const { globalShortcut, clipboard, screen } = require('electron')
const translate = require('../services/translate')
const history = require('./history')
const settings = require('./settings')
const robot = require('robotjs')

let mainWindow = null
// action → 当前已注册的 accelerator ('' 表示关闭)
const registered = {}

/**
 * 注册全局快捷键 (使用用户设置中的组合键)
 * @param {BrowserWindow} win
 */
function registerShortcuts(win) {
  mainWindow = win
  const { shortcuts } = settings.get()
  for (const [action, accelerator] of Object.entries(shortcuts)) {
    if (!setShortcut(action, accelerator)) {
      console.error(`快捷键 ${accelerator} 注册失败,可能已被其他应用占用`)
    }
  }
}

function register(action, accelerator) {
  return globalShortcut.register(accelerator, () => translateSelection(action))
}

/**
 * 切换某个功能的快捷键，注册失败时保留原快捷键
 * @returns {boolean} 是否注册成功
 */
function setShortcut(action, accelerator) {
  const previous = registered[action] || ''
  if (accelerator === previous && accelerator) return true
  if (previous) globalShortcut.unregister(previous)

  const ok = !accelerator || register(action, accelerator)
  if (ok) {
    registered[action] = accelerator
    if (accelerator) console.log(`快捷键 ${accelerator} (${action}) 注册成功!`)
  } else if (previous) {
    register(action, previous)
  }
  return ok
}

function getShortcutState() {
  return Object.entries(settings.SHORTCUT_ACTIONS).map(
    ([action, { label, presets }]) => ({
      action,
      label,
      current: registered[action] || '',
      options: [...presets, ''].map(accelerator => ({
        accelerator,
        label:
          settings.formatAccelerator(accelerator) +
          (settings.CONFLICT_HINTS[accelerator]
            ? ` (${settings.CONFLICT_HINTS[accelerator]})`
            : '')
      }))
    })
  )
}

/**
 * 快捷键触发: 模拟复制拿到选中文本后处理
 */
async function translateSelection(mode) {
  console.log(`快捷键触发! (${mode})`)

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

  await translateText(text, mode)

  // 恢复原剪贴板内容
  setTimeout(() => {
    if (previousClipboard) {
      clipboard.writeText(previousClipboard)
    }
  }, 500)
}

/**
 * 翻译 / 解释指定文本并展示 (快捷键 / 右键服务共用)
 * @param {'translate'|'explain'|'both'} mode
 */
async function translateText(text, mode = 'both') {
  text = text.trim()
  if (!text) return
  console.log(`待处理文本 (${mode}):`, text)

  // 显示窗口在鼠标附近
  showWindowNearCursor()

  // 发送加载状态
  mainWindow.webContents.send('translation-loading', { text, mode })

  try {
    // 调用翻译服务
    const result = await translate(text, mode)
    console.log('翻译结果:', result)

    const entry = history.add(text, result)

    // 发送翻译结果
    mainWindow.webContents.send('show-translation', entry)
  } catch (error) {
    console.error('翻译失败:', error)
    mainWindow.webContents.send('translation-error', {
      text,
      mode,
      error: error.message
    })
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
  unregisterShortcuts,
  setShortcut,
  getShortcutState,
  translateText
}
