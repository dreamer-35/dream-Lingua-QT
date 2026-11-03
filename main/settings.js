const { app } = require('electron')
const fs = require('fs')
const path = require('path')

const isMac = process.platform === 'darwin'

// ⌘⇧3/4/5 是 macOS 截屏快捷键，不提供
const SHORTCUT_PRESETS = [
  'CommandOrControl+Shift+E',
  'CommandOrControl+Shift+1',
  'CommandOrControl+Shift+2',
  'Control+Alt+T'
]

const DEFAULTS = {
  shortcut: SHORTCUT_PRESETS[0]
}

let filePath = null
let settings = null

function load() {
  if (settings) return settings
  filePath = path.join(app.getPath('userData'), 'settings.json')
  try {
    settings = { ...DEFAULTS, ...JSON.parse(fs.readFileSync(filePath, 'utf8')) }
  } catch {
    settings = { ...DEFAULTS }
  }
  return settings
}

function get() {
  return load()
}

function set(patch) {
  settings = { ...load(), ...patch }
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2))
  return settings
}

/**
 * Electron accelerator → 展示用文本，如 ⌘ ⇧ E / Ctrl Shift E
 */
function formatAccelerator(accelerator) {
  const map = isMac
    ? { CommandOrControl: '⌘', Command: '⌘', Control: '⌃', Alt: '⌥', Shift: '⇧' }
    : { CommandOrControl: 'Ctrl', Control: 'Ctrl', Alt: 'Alt', Shift: 'Shift' }
  return accelerator
    .split('+')
    .map(key => map[key] || key)
    .join(isMac ? ' ' : ' + ')
}

module.exports = { get, set, formatAccelerator, SHORTCUT_PRESETS }
