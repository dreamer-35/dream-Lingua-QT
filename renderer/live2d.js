// Live2D 版本的悬浮窗逻辑
let live2dModel = null;

// 初始化 Live2D
async function initLive2D() {
  const canvas = document.getElementById('live2d-canvas');
  
  try {
    // 创建 PIXI Application
    const app = new PIXI.Application({
      view: canvas,
      width: 300,
      height: 300,
      transparent: true,
      autoStart: true
    });

    // 加载 Live2D 模型
    // 注意: 需要将你的 Live2D 模型文件放在 renderer/live2d/ 目录下
    live2dModel = await PIXI.live2d.Live2DModel.from('live2d/model.json');
    
    // 设置模型属性
    live2dModel.scale.set(0.15); // 根据你的模型调整缩放
    live2dModel.x = 150;
    live2dModel.y = 250;
    
    // 添加到舞台
    app.stage.addChild(live2dModel);
    
    // 启用自动呼吸动画
    live2dModel.internalModel.motionManager.startRandomMotion('idle');
    
    console.log('Live2D 模型加载成功');
  } catch (error) {
    console.error('Live2D 加载失败,降级使用默认图片:', error);
    // 降级方案: 显示静态图片
    useFallbackImage();
  }
}

// 降级方案: 使用静态图片
function useFallbackImage() {
  const canvas = document.getElementById('live2d-canvas');
  const container = canvas.parentElement;
  
  // 创建 img 元素替代 canvas
  const img = document.createElement('img');
  img.src = './assets/character.png';
  img.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 200px;
    object-fit: contain;
    animation: idle 2s ease-in-out infinite;
  `;
  
  // 添加 idle 动画
  const style = document.createElement('style');
  style.textContent = `
    @keyframes idle {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(-10px); }
    }
  `;
  document.head.appendChild(style);
  
  canvas.style.display = 'none';
  container.appendChild(img);
}

// 播放表情/动作
function playMotion(motionGroup, motionIndex = 0) {
  if (live2dModel && live2dModel.internalModel) {
    live2dModel.internalModel.motionManager.startMotion(motionGroup, motionIndex);
  }
}

// DOM 元素
const bubble = document.getElementById('speech-bubble');
const originalText = document.getElementById('originalText');
const translationText = document.getElementById('translationText');
const loading = document.getElementById('loading');
const errorEl = document.getElementById('error');
const timestamp = document.getElementById('timestamp');
const closeBtn = document.getElementById('closeBtn');

// 关闭按钮
closeBtn.addEventListener('click', () => {
  window.electronAPI.hidePopup();
});

// 监听加载状态
window.electronAPI.onTranslationLoading((data) => {
  console.log('开始翻译:', data.text);
  
  bubble.classList.add('show');
  originalText.textContent = data.text;
  originalText.style.display = 'block';
  loading.classList.add('show');
  translationText.style.display = 'none';
  errorEl.style.display = 'none';
  updateTimestamp();
  
  // Live2D 动作: 思考
  playMotion('idle');
});

// 监听翻译结果
window.electronAPI.onShowTranslation((data) => {
  console.log('收到翻译结果:', data.result);
  
  loading.classList.remove('show');
  translationText.textContent = data.result;
  translationText.style.display = 'block';
  
  // Live2D 动作: 开心
  playMotion('tap_body');
  
  setTimeout(() => {
    hideBubble();
  }, 5000);
});

// 监听翻译错误
window.electronAPI.onTranslationError((data) => {
  console.error('翻译错误:', data.error);
  
  loading.classList.remove('show');
  errorEl.textContent = `❌ ${data.error}`;
  errorEl.style.display = 'block';
  translationText.style.display = 'none';
  
  // Live2D 动作: 困惑
  playMotion('shake');
  
  setTimeout(() => {
    hideBubble();
  }, 5000);
});

function hideBubble() {
  bubble.classList.remove('show');
  setTimeout(() => {
    window.electronAPI.hidePopup();
  }, 300);
}

function updateTimestamp() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  timestamp.textContent = `${hours}:${minutes}`;
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideBubble();
  }
});

// 初始化
window.addEventListener('DOMContentLoaded', () => {
  initLive2D();
});

