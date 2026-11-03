const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFile } = require('child_process')

const TEMPLATE_DIR = path.join(__dirname, 'quick-action')
const TEMPLATE_FILES = ['Info.plist', 'document.wflow']

// 右键 → 服务 中显示的菜单项
const QUICK_ACTIONS = [
  { name: '用 Dream Lingua 翻译', mode: 'both' },
  { name: '用 Dream Lingua 解释', mode: 'explain' }
]

/**
 * 安装 macOS 快速操作 (右键 → 服务 → 用 Dream Lingua 翻译/解释)
 * 选中文本经 dreamlingua://translate?mode=...&text=... 交给应用，不走剪贴板
 */
function installQuickActions() {
  if (process.platform !== 'darwin') return

  let changed = false
  for (const { name, mode } of QUICK_ACTIONS) {
    try {
      changed = installOne(name, mode) || changed
    } catch (error) {
      console.warn(`快速操作 ${name} 安装失败:`, error.message)
    }
  }

  if (changed) {
    // 刷新系统服务菜单
    execFile('/System/Library/CoreServices/pbs', ['-update'])
  }
}

function installOne(name, mode) {
  const contentsDir = path.join(
    os.homedir(),
    'Library/Services',
    `${name}.workflow`,
    'Contents'
  )
  fs.mkdirSync(contentsDir, { recursive: true })

  let changed = false
  for (const file of TEMPLATE_FILES) {
    // 模板位于 asar 内，只能 readFileSync 读出再写
    const content = fs
      .readFileSync(path.join(TEMPLATE_DIR, file), 'utf8')
      .replace('{{NAME}}', name)
      .replace('{{MODE}}', mode)
    const target = path.join(contentsDir, file)
    if (fs.existsSync(target) && fs.readFileSync(target, 'utf8') === content) {
      continue
    }
    fs.writeFileSync(target, content)
    changed = true
  }
  if (changed) console.log(`已安装快速操作: ${name}`)
  return changed
}

module.exports = { installQuickActions }
