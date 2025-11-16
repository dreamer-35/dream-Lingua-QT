// 悬浮窗逻辑
const bubble = document.getElementById('speech-bubble');
const originalText = document.getElementById('originalText');
const translationText = document.getElementById('translationText');
const loading = document.getElementById('loading');
const errorEl = document.getElementById('error');
const timestamp = document.getElementById('timestamp');
const closeBtn = document.getElementById('closeBtn');
const avatar = document.getElementById('avatar');

// 关闭按钮事件
closeBtn.addEventListener('click', () => {
  window.electronAPI.hidePopup();
});

// 监听加载状态
window.electronAPI.onTranslationLoading((data) => {
  console.log('开始翻译:', data.text);
  
  // 显示气泡
  bubble.classList.add('show');
  
  // 显示原文
  originalText.textContent = data.text;
  originalText.style.display = 'block';
  
  // 显示加载动画
  loading.classList.add('show');
  translationText.style.display = 'none';
  errorEl.style.display = 'none';
  
  // 更新时间戳
  updateTimestamp();
  
  // 角色动画 - 思考状态
  avatar.style.animation = 'idle 1s ease-in-out infinite';
});

// 监听翻译结果
window.electronAPI.onShowTranslation((data) => {
  console.log('收到翻译结果:', data.result);
  
  // 隐藏加载动画
  loading.classList.remove('show');
  
  // 显示翻译结果
  translationText.textContent = data.result;
  translationText.style.display = 'block';
  
  // 角色动画 - 愉快状态
  avatar.style.animation = 'idle 2s ease-in-out infinite';
  
  // 3秒后自动隐藏
  setTimeout(() => {
    hideBubble();
  }, 5000);
});

// 监听翻译错误
window.electronAPI.onTranslationError((data) => {
  console.error('翻译错误:', data.error);
  
  // 隐藏加载动画
  loading.classList.remove('show');
  
  // 显示错误信息
  errorEl.textContent = `❌ ${data.error}`;
  errorEl.style.display = 'block';
  translationText.style.display = 'none';
  
  // 角色动画 - 困惑状态
  avatar.style.animation = 'none';
  setTimeout(() => {
    avatar.style.animation = 'idle 2s ease-in-out infinite';
  }, 100);
  
  // 5秒后自动隐藏
  setTimeout(() => {
    hideBubble();
  }, 5000);
});

// 隐藏气泡
function hideBubble() {
  bubble.classList.remove('show');
  setTimeout(() => {
    window.electronAPI.hidePopup();
  }, 300);
}

// 更新时间戳
function updateTimestamp() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  timestamp.textContent = `${hours}:${minutes}`;
}

// ESC键关闭
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideBubble();
  }
});

// 初始化
console.log('悬浮窗已加载');

