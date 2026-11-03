// 获取 DOM 元素
const homePage = document.getElementById('home-page')
const translatePage = document.getElementById('translate-page')
const sourceText = document.getElementById('source-text')
const targetText = document.getElementById('target-text')
const loadingOverlay = document.getElementById('loading-overlay')
const statusDot = document.querySelector('.status-dot')
const statusText = document.querySelector('.status-text')
const footerText = document.querySelector('.footer-text')
const backBtn = document.getElementById('back-btn')
const minimizeBtn = document.getElementById('minimize-btn')
const closeBtn = document.getElementById('close-btn')
const speakSourceBtn = document.getElementById('speak-source-btn')
const speakTargetBtn = document.getElementById('speak-target-btn')
const historyBtn = document.getElementById('history-btn')
const historySidebar = document.getElementById('history-sidebar')
const historyBackdrop = document.getElementById('history-backdrop')
const historyList = document.getElementById('history-list')
const historyCount = document.getElementById('history-count')
const historySearch = document.getElementById('history-search')
const historyClearBtn = document.getElementById('history-clear-btn')

// 翻译结果停留时长 (鼠标悬停在翻译页时暂停计时)
const RESULT_STAY_MS = 3 * 60 * 1000
const ERROR_STAY_MS = 15 * 1000

let autoHideTimer = null
let autoHideDelay = 0
let isTranslating = false
// 当前展示的条目 (用于朗读)
let currentEntry = null
let historyCache = []
// 全局只保持一个 Live2D 实例 (避免 WebGL 上下文冲突)
let currentLive2D = null
let currentCanvas = 'home-live2d' // 当前使用的 canvas ID

/**
 * 切换页面
 */
function switchPage(page) {
  if (page === 'home') {
    homePage.classList.add('active')
    translatePage.classList.remove('active')
  } else if (page === 'translate') {
    homePage.classList.remove('active')
    translatePage.classList.add('active')
  }
}

/**
 * 更新状态
 */
function updateStatus(status, text) {
  statusDot.className = `status-dot ${status}`
  statusText.textContent = text
}

/**
 * 更新底部提示
 */
function updateFooter(text) {
  footerText.textContent = text
}

/**
 * 切换 Live2D 到指定 canvas (随机选择新角色)
 */
function switchLive2D(canvasId, delay) {
  if (!currentLive2D || !window.Live2DLoader) return
  currentCanvas = canvasId
  currentLive2D.destroy()

  // 等待页面切换和 DOM 更新完成
  setTimeout(async () => {
    currentLive2D = new window.Live2DLoader(canvasId)
    const success = await currentLive2D.init()
    if (!success) {
      console.warn(`加载 ${canvasId} 模型失败`)
      fallbackToImage(canvasId)
    }
  }, delay)
}

/**
 * 进入翻译页
 */
function enterTranslatePage() {
  switchPage('translate')
  switchLive2D('translate-live2d', 300)
}

/**
 * 自动返回首页定时器
 */
function startAutoHide(delay) {
  stopAutoHide()
  autoHideDelay = delay
  if (delay > 0) {
    autoHideTimer = setTimeout(returnToHome, delay)
  }
}

function stopAutoHide() {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer)
    autoHideTimer = null
  }
}

translatePage.addEventListener('mouseenter', stopAutoHide)
translatePage.addEventListener('mouseleave', () => {
  if (translatePage.classList.contains('active') && !isTranslating) {
    startAutoHide(autoHideDelay)
  }
})

/**
 * 渲染翻译结果 (译文 + 单词/词组的领域解释)
 */
function renderEntry(entry) {
  currentEntry = entry
  // 词条模式: 原文面板收缩，把空间留给译文 + 解释
  translatePage.classList.toggle('term-mode', entry.type === 'term')
  sourceText.innerHTML = `<div class="text-content">${escapeHtml(entry.text)}</div>`

  let html = `<div class="text-content">${escapeHtml(entry.translation)}</div>`
  if (entry.type === 'term' && (entry.domain || entry.explanation)) {
    html += '<div class="term-meta">'
    if (entry.domain) {
      html += `<span class="term-domain">${escapeHtml(entry.domain)}</span>`
    }
    if (entry.explanation) {
      html += `<div class="term-explanation">${escapeHtml(entry.explanation)}</div>`
    }
    html += '</div>'
  }
  targetText.innerHTML = html
  targetText.classList.remove('error')

  // 添加淡入动画
  sourceText.style.animation = 'fadeIn 0.4s ease-out'
  targetText.style.animation = 'fadeIn 0.6s ease-out'
}

/**
 * 显示翻译加载状态
 */
window.electronAPI.onTranslationLoading(data => {
  console.log('翻译加载中...', data)

  if (isTranslating) return
  isTranslating = true

  stopAutoHide()
  stopSpeaking()
  closeHistory()
  currentEntry = null
  translatePage.classList.remove('term-mode')

  console.log('🎲 触发翻译,切换到翻译页并随机加载新角色...')
  enterTranslatePage()

  // 更新状态
  updateStatus('translating', '翻译中')
  updateFooter('⏳ AI 正在翻译...')

  // 显示加载动画
  loadingOverlay.classList.remove('hidden')

  // 显示原文
  sourceText.innerHTML = `<div class="text-content">${escapeHtml(data.text)}</div>`
  targetText.innerHTML =
    '<div class="loading-placeholder">AI 正在思考中,请稍候...</div>'
})

/**
 * 显示翻译结果
 */
window.electronAPI.onShowTranslation(entry => {
  console.log('显示翻译结果:', entry)

  isTranslating = false

  // 隐藏加载动画
  loadingOverlay.classList.add('hidden')

  // 更新状态
  updateStatus('ready', '完成')
  updateFooter(`✓ 翻译完成 · ${entry.model}`)

  renderEntry(entry)
  refreshHistory()

  startAutoHide(RESULT_STAY_MS)

  // 恢复就绪状态
  setTimeout(() => {
    updateStatus('ready', '就绪')
    updateFooter('💡 选中文本按快捷键即可翻译')
  }, 3000)
})

/**
 * 显示翻译错误
 */
window.electronAPI.onTranslationError(data => {
  console.error('翻译错误:', data)

  isTranslating = false
  currentEntry = null

  // 隐藏加载动画
  loadingOverlay.classList.add('hidden')

  // 更新状态
  updateStatus('error', '错误')
  updateFooter('✗ 翻译失败')

  // 显示错误信息
  sourceText.innerHTML = `<div class="text-content">${escapeHtml(data.text)}</div>`
  targetText.innerHTML = `
    <div class="error-message">
      <div style="font-size: 24px; margin-bottom: 8px;">❌</div>
      <div style="font-weight: 600; margin-bottom: 4px;">翻译失败</div>
      <div style="font-size: 12px; color: #999;">${escapeHtml(data.error)}</div>
      <div style="font-size: 11px; color: #999; margin-top: 8px;">请确保 Ollama 服务正在运行</div>
    </div>
  `
  targetText.classList.add('error')

  startAutoHide(ERROR_STAY_MS)
})

/**
 * 返回首页
 */
function returnToHome() {
  console.log('🏠 返回首页...')

  stopAutoHide()
  stopSpeaking()
  currentEntry = null

  // 先切换页面
  switchPage('home')

  // 延迟清空内容
  setTimeout(() => {
    sourceText.innerHTML = '<div class="loading-placeholder">等待翻译...</div>'
    targetText.innerHTML = '<div class="loading-placeholder">正在翻译中...</div>'
  }, 400)

  console.log('切换到首页并随机加载新角色...')
  switchLive2D('home-live2d', 500)
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// ========== 语音朗读 (系统 TTS，离线可用) ==========

let voices = []
function loadVoices() {
  voices = speechSynthesis.getVoices()
}
loadVoices()
speechSynthesis.addEventListener('voiceschanged', loadVoices)

// macOS 的 en-US 列表里混有 Albert / Bahh 等搞怪音色，按名字优先挑标准音色
const PREFERRED_VOICES = {
  zh: ['婷婷', 'Tingting', 'Flo (中文（中国大陆）)'],
  en: ['Samantha', 'Alex', 'Daniel', 'Karen']
}

function pickVoice(lang) {
  const prefix = lang === 'zh' ? 'zh' : 'en'
  const candidates = voices.filter(v => v.lang.toLowerCase().startsWith(prefix))
  for (const name of PREFERRED_VOICES[lang] || []) {
    const voice = candidates.find(v => v.name.startsWith(name))
    if (voice) return voice
  }
  return candidates[0]
}

function speak(text, lang, btn) {
  if (!text) return
  // 再次点击同一按钮 = 停止
  if (speechSynthesis.speaking && btn.classList.contains('speaking')) {
    stopSpeaking()
    return
  }
  stopSpeaking()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang === 'zh' ? 'zh-CN' : 'en-US'
  const voice = pickVoice(lang)
  if (voice) utterance.voice = voice
  utterance.rate = lang === 'zh' ? 1 : 0.95
  utterance.onend = utterance.onerror = () => btn.classList.remove('speaking')

  btn.classList.add('speaking')
  speechSynthesis.speak(utterance)
}

function stopSpeaking() {
  speechSynthesis.cancel()
  speakSourceBtn.classList.remove('speaking')
  speakTargetBtn.classList.remove('speaking')
}

speakTargetBtn.addEventListener('click', () => {
  if (!currentEntry) return
  speak(currentEntry.translation, currentEntry.targetLang, speakTargetBtn)
})

speakSourceBtn.addEventListener('click', () => {
  if (!currentEntry) return
  const sourceLang = currentEntry.targetLang === 'zh' ? 'en' : 'zh'
  speak(currentEntry.text, sourceLang, speakSourceBtn)
})

// ========== 历史记录侧栏 ==========

function formatTime(ts) {
  const d = new Date(ts)
  const pad = n => String(n).padStart(2, '0')
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return time
  return `${d.getMonth() + 1}/${d.getDate()} ${time}`
}

function renderHistory() {
  const keyword = historySearch.value.trim().toLowerCase()
  const items = keyword
    ? historyCache.filter(
        e =>
          e.text.toLowerCase().includes(keyword) ||
          e.translation.toLowerCase().includes(keyword)
      )
    : historyCache

  historyCount.textContent = historyCache.length ? `(${historyCache.length})` : ''

  if (!items.length) {
    historyList.innerHTML = `<li class="history-empty">${keyword ? '没有匹配的记录' : '还没有翻译记录'}</li>`
    return
  }

  historyList.innerHTML = items
    .map(
      e => `<li class="history-item" data-id="${e.id}">
  <div class="history-source">${e.type === 'term' ? '<span class="history-tag">词</span>' : ''}${escapeHtml(e.text)}</div>
  <div class="history-target">${escapeHtml(e.translation)}</div>
  <div class="history-meta">${formatTime(e.createdAt)}</div>
  <button class="history-delete" title="删除">×</button>
</li>`
    )
    .join('')
}

async function refreshHistory() {
  historyCache = await window.electronAPI.listHistory()
  if (historySidebar.classList.contains('open')) renderHistory()
}

async function openHistory() {
  await refreshHistory()
  renderHistory()
  historySidebar.classList.add('open')
  historyBackdrop.classList.add('show')
  historySearch.focus()
}

function closeHistory() {
  historySidebar.classList.remove('open')
  historyBackdrop.classList.remove('show')
}

historyBtn.addEventListener('click', () => {
  historySidebar.classList.contains('open') ? closeHistory() : openHistory()
})
historyBackdrop.addEventListener('click', closeHistory)
historySearch.addEventListener('input', renderHistory)

historyList.addEventListener('click', async e => {
  const item = e.target.closest('.history-item')
  if (!item) return
  const { id } = item.dataset

  if (e.target.closest('.history-delete')) {
    await window.electronAPI.removeHistory(id)
    historyCache = historyCache.filter(h => h.id !== id)
    renderHistory()
    return
  }

  const entry = historyCache.find(h => h.id === id)
  if (!entry || isTranslating) return
  closeHistory()
  stopSpeaking()
  if (!translatePage.classList.contains('active')) enterTranslatePage()
  renderEntry(entry)
  updateFooter(`🕘 历史记录 · ${formatTime(entry.createdAt)}`)
  // 主动查看历史时不自动返回
  startAutoHide(0)
})

historyClearBtn.addEventListener('click', async () => {
  if (!historyCache.length || !confirm('确定清空全部历史记录?')) return
  await window.electronAPI.clearHistory()
  historyCache = []
  renderHistory()
})

// ========== 快捷键设置 ==========

const shortcutKey = document.getElementById('shortcut-key')
const shortcutSelect = document.getElementById('shortcut-select')

function renderShortcut({ current, presets }) {
  const preset = presets.find(p => p.accelerator === current)
  const keys = preset ? preset.label.split(/\s*\+\s*|\s+/) : ['未设置']
  shortcutKey.innerHTML = keys.map(k => `<kbd>${escapeHtml(k)}</kbd>`).join(' ')
  shortcutSelect.innerHTML = presets
    .map(
      p =>
        `<option value="${p.accelerator}"${p.accelerator === current ? ' selected' : ''}>${escapeHtml(p.label)}</option>`
    )
    .join('')
}

async function initShortcut() {
  renderShortcut(await window.electronAPI.getShortcut())
}

shortcutSelect.addEventListener('change', async () => {
  const state = await window.electronAPI.setShortcut(shortcutSelect.value)
  renderShortcut(state)
  updateFooter(
    state.ok ? '✓ 快捷键已更新' : '✗ 该快捷键已被其他应用占用,请换一个'
  )
  setTimeout(() => updateFooter('💡 选中文本按快捷键即可翻译'), 3000)
})

initShortcut()

/**
 * 返回按钮点击
 */
backBtn.addEventListener('click', returnToHome)

/**
 * 窗口控制 - 最小化
 */
minimizeBtn.addEventListener('click', () => {
  window.electronAPI.minimizeWindow?.()
})

/**
 * 窗口控制 - 关闭
 */
closeBtn.addEventListener('click', () => {
  window.electronAPI.closeWindow?.()
})

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && historySidebar.classList.contains('open')) {
    closeHistory()
  }
})

// 初始化
console.log('✨ Dream Lingua QT 已启动')
console.log(
  '💡 选中文本后按 Cmd+Shift+E (macOS) 或 Ctrl+Shift+E (Windows) 进行翻译'
)

// 初始化 Live2D 模型
async function initLive2DModels() {
  try {
    if (window.Live2DLoader) {
      console.log('初始化首页 Live2D 模型...')
      currentCanvas = 'home-live2d'
      currentLive2D = new window.Live2DLoader(currentCanvas)
      const success = await currentLive2D.init()

      if (success) {
        console.log('✓ 首页 Live2D 加载成功')
      } else {
        console.warn('⚠ 首页 Live2D 加载失败,使用降级方案')
        fallbackToImage('home-live2d')
      }
    } else {
      console.warn('⚠ Live2D 库未加载,使用降级方案')
      fallbackToImage('home-live2d')
    }
  } catch (error) {
    console.error('Live2D 初始化错误:', error)
    fallbackToImage('home-live2d')
  }
}

// 降级方案: 使用静态图片
function fallbackToImage(canvasId) {
  const canvas = document.getElementById(canvasId)
  if (!canvas) return

  const container = canvas.parentElement
  canvas.style.display = 'none'

  const img = document.createElement('img')
  img.src = './character/idle.png'
  img.style.cssText = `
    width: ${canvasId === 'home-live2d' ? '160px' : '70px'};
    height: ${canvasId === 'home-live2d' ? '160px' : '70px'};
    object-fit: contain;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
    animation: float 3s ease-in-out infinite;
  `
  container.appendChild(img)
}

// 确保首页显示
switchPage('home')

// DOM 加载完成后初始化 Live2D
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLive2DModels)
} else {
  initLive2DModels()
}
