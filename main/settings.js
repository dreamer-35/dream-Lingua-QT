const { app } = require('electron')
const fs = require('fs')
const path = require('path')

const isMac = process.platform === 'darwin'

/**
 * 每个功能一组可选快捷键 (各组互不重叠)，空字符串表示关闭
 * ⌘⇧3 是 macOS 截屏快捷键，系统可能优先拦截
 */
const SHORTCUT_ACTIONS = {
  translate: {
    label: '翻译',
    presets: [
      'CommandOrControl+Shift+1',
      'CommandOrControl+Shift+2',
      'CommandOrControl+Shift+3',
      'Control+Alt+T'
    ]
  },
  explain: {
    label: '解释',
    presets: [
      'CommandOrControl+Shift+8',
      'CommandOrControl+Shift+9',
      'CommandOrControl+Shift+0'
    ]
  },
  both: {
    label: '翻译+解释',
    presets: ['CommandOrControl+Shift+E', 'Control+Alt+E']
  }
}

const CONFLICT_HINTS = {
  'CommandOrControl+Shift+3': '可能与截屏冲突'
}

const DEFAULTS = {
  shortcuts: Object.fromEntries(
    Object.entries(SHORTCUT_ACTIONS).map(([action, { presets }]) => [
      action,
      presets[0]
    ])
  )
}

let filePath = null
let settings = null

function load() {
  if (settings) return settings
  filePath = path.join(app.getPath('userData'), 'settings.json')
  let saved = {}
  try {
    saved = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {}
  settings = {
    shortcuts: { ...DEFAULTS.shortcuts, ...saved.shortcuts }
  }
  return settings
}

function get() {
  return load()
}

function setShortcutSetting(action, accelerator) {
  load()
  settings.shortcuts = { ...settings.shortcuts, [action]: accelerator }
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2))
  return settings
}

function isValidShortcut(action, accelerator) {
  const config = SHORTCUT_ACTIONS[action]
  return !!config && (accelerator === '' || config.presets.includes(accelerator))
}

/**
 * Electron accelerator → 展示用文本，如 ⌘ ⇧ E / Ctrl + Shift + E
 */
function formatAccelerator(accelerator) {
  if (!accelerator) return '关闭'
  const map = isMac
    ? { CommandOrControl: '⌘', Command: '⌘', Control: '⌃', Alt: '⌥', Shift: '⇧' }
    : { CommandOrControl: 'Ctrl', Control: 'Ctrl', Alt: 'Alt', Shift: 'Shift' }
  return accelerator
    .split('+')
    .map(key => map[key] || key)
    .join(isMac ? ' ' : ' + ')
}

module.exports = {
  get,
  setShortcutSetting,
  isValidShortcut,
  formatAccelerator,
  SHORTCUT_ACTIONS,
  CONFLICT_HINTS
}
