const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFile } = require('child_process')

const SERVICE_NAME = '用 Dream Lingua 翻译'
const TEMPLATE_DIR = path.join(__dirname, 'quick-action')
const TEMPLATE_FILES = ['Info.plist', 'document.wflow']

/**
 * 安装 macOS 快速操作 (右键 → 服务 → 用 Dream Lingua 翻译)
 * 选中文本经 dreamlingua://translate?text=... 交给应用，不走剪贴板
 */
function installQuickAction() {
  if (process.platform !== 'darwin') return

  const contentsDir = path.join(
    os.homedir(),
    'Library/Services',
    `${SERVICE_NAME}.workflow`,
    'Contents'
  )

  try {
    let changed = false
    fs.mkdirSync(contentsDir, { recursive: true })
    for (const name of TEMPLATE_FILES) {
      // 模板位于 asar 内，只能 readFileSync 读出再写
      const content = fs.readFileSync(path.join(TEMPLATE_DIR, name), 'utf8')
      const target = path.join(contentsDir, name)
      if (fs.existsSync(target) && fs.readFileSync(target, 'utf8') === content) {
        continue
      }
      fs.writeFileSync(target, content)
      changed = true
    }

    if (changed) {
      // 刷新系统服务菜单
      execFile('/System/Library/CoreServices/pbs', ['-update'])
      console.log(`已安装快速操作: ${SERVICE_NAME}`)
    }
  } catch (error) {
    console.warn('快速操作安装失败:', error.message)
  }
}

module.exports = { installQuickAction, SERVICE_NAME }
