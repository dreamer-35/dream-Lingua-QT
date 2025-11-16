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

let autoHideTimer = null
let isTranslating = false
// 全局只保持一个 Live2D 实例 (避免 WebGL 上下文冲突)
let currentLive2D = null
let currentCanvas = 'home-live2d'  // 当前使用的 canvas ID

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
 * 显示翻译加载状态
 */
window.electronAPI.onTranslationLoading((data) => {
  console.log('翻译加载中...', data)
  
  if (isTranslating) return
  isTranslating = true
  
  // 清除自动返回定时器
  if (autoHideTimer) {
    clearTimeout(autoHideTimer)
  }

  // 切换到翻译页面
  switchPage('translate')
  
  // 🎲 切换 Live2D 到翻译页 canvas (随机选择新角色)
  if (currentLive2D && window.Live2DLoader) {
    console.log('🎲 触发翻译,切换到翻译页并随机加载新角色...')
    currentCanvas = 'translate-live2d'
    
    // 销毁当前实例
    currentLive2D.destroy()
    
    // 等待足够时间确保页面切换和 DOM 更新完成
    setTimeout(async () => {
      currentLive2D = new window.Live2DLoader(currentCanvas)
      const success = await currentLive2D.init()
      if (!success) {
        console.warn('加载翻译页模型失败')
        fallbackToImage(currentCanvas)
      }
    }, 300)  // 300ms 足够
  }
  
  // 更新状态
  updateStatus('translating', '翻译中')
  updateFooter('⏳ AI 正在翻译...')
  
  // 显示加载动画
  loadingOverlay.classList.remove('hidden')
  
  // 显示原文
  sourceText.innerHTML = `<div class="text-content">${escapeHtml(data.text)}</div>`
  targetText.innerHTML = '<div class="loading-placeholder">AI 正在思考中,请稍候...</div>'
})

/**
 * 显示翻译结果
 */
window.electronAPI.onShowTranslation((data) => {
  console.log('显示翻译结果:', data)
  
  isTranslating = false
  
  // 隐藏加载动画
  loadingOverlay.classList.add('hidden')
  
  // 更新状态
  updateStatus('ready', '完成')
  updateFooter('✓ 翻译完成!')
  
  // 显示原文和译文
  sourceText.innerHTML = `<div class="text-content">${escapeHtml(data.text)}</div>`
  targetText.innerHTML = `<div class="text-content">${escapeHtml(data.result)}</div>`
  targetText.classList.remove('error')
  
  // 添加淡入动画
  sourceText.style.animation = 'fadeIn 0.4s ease-out'
  targetText.style.animation = 'fadeIn 0.6s ease-out'
  
  // 10秒后自动返回首页
  autoHideTimer = setTimeout(() => {
    returnToHome()
  }, 60000)
  
  // 2秒后恢复就绪状态
  setTimeout(() => {
    updateStatus('ready', '就绪')
    updateFooter('💡 选中文本按快捷键即可翻译')
  }, 1000)
})

/**
 * 显示翻译错误
 */
window.electronAPI.onTranslationError((data) => {
  console.error('翻译错误:', data)
  
  isTranslating = false
  
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
  
  // 5秒后自动返回首页
  autoHideTimer = setTimeout(() => {
    returnToHome()
    updateStatus('ready', '就绪')
    updateFooter('💡 选中文本按快捷键即可翻译')
  }, 5000)
})

/**
 * 返回首页
 */
function returnToHome() {
  console.log('🏠 返回首页...')
  
  // 先切换页面
  switchPage('home')
  
  // 延迟清空内容
  setTimeout(() => {
    sourceText.innerHTML = '<div class="loading-placeholder">等待翻译...</div>'
    targetText.innerHTML = '<div class="loading-placeholder">正在翻译中...</div>'
  }, 400)
  
  // 🎲 切换 Live2D 到首页 canvas (等待页面切换完成后再加载)
  if (currentLive2D && window.Live2DLoader) {
    console.log('切换到首页并随机加载新角色...')
    currentCanvas = 'home-live2d'
    
    // 销毁当前实例
    currentLive2D.destroy()
    
    // 等待足够时间确保页面切换和 DOM 更新完成
    setTimeout(async () => {
      currentLive2D = new window.Live2DLoader(currentCanvas)
      const success = await currentLive2D.init()
      if (!success) {
        console.warn('加载首页模型失败')
        fallbackToImage(currentCanvas)
      }
    }, 500)  // 增加到 500ms
  }
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * 返回按钮点击
 */
backBtn.addEventListener('click', () => {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer)
  }
  returnToHome()
})

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

// 初始化
console.log('✨ Dream Lingua QT 已启动')
console.log('💡 选中文本后按 Cmd+Shift+E (macOS) 或 Ctrl+Shift+E (Windows) 进行翻译')

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
