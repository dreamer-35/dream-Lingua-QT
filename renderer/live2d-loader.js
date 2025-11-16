/**
 * Live2D 模型加载器
 * 使用 pixi-live2d-display 库加载和管理 Live2D 模型
 */

class Live2DLoader {
  constructor(canvasId) {
    this.canvasId = canvasId  // 保存 canvas ID
    this.canvas = document.getElementById(canvasId)
    this.app = null
    this.model = null
    
    // 所有可用的 Live2D 模型配置 (统一 200×200 canvas,全身显示)
    this.availableModels = [
      {
        name: 'Hiyori',
        path: './live2d/hiyori_free_zh/runtime/hiyori_free_t08.model3.json',
        scale: 0.05,  // 全身显示
        anchor: { x: 0.5, y: 0 }  // 从头顶开始
      },
      {
        name: 'Mao',
        path: './live2d/mao_pro_zh/runtime/mao_pro.model3.json',
        scale: 0.08,
        anchor: { x: 0.5, y: 0.1 }
      },
      {
        name: 'Rice',
        path: './live2d/rice_pro_zh/runtime/rice_pro_t03.model3.json',
        scale: 0.06,
        anchor: { x: 0.5, y: 0.05 }
      }
    ]
    
    this.selectRandomModel()
  }

  /**
   * 随机选择一个模型
   */
  selectRandomModel() {
    this.currentModel = this.availableModels[Math.floor(Math.random() * this.availableModels.length)]
    this.modelPath = this.currentModel.path
    console.log('🎲 随机选择模型:', this.currentModel.name)
  }

  /**
   * 初始化 PIXI 应用和 Live2D 模型
   */
  async init() {
    try {
      console.log('🔍 开始初始化:', this.canvasId)
      
      // 尝试获取或创建 canvas
      this.canvas = document.getElementById(this.canvasId)
      
      // 如果 canvas 不存在,创建它
      if (!this.canvas) {
        console.log('Canvas 不存在,正在创建...')
        const parentClass = this.canvasId === 'home-live2d' ? 'character-showcase' : 'mini-character'
        const parent = document.querySelector(`.${parentClass}`)
        
        if (!parent) {
          throw new Error(`找不到父容器: ${parentClass}`)
        }
        
        // 创建新 canvas
        this.canvas = document.createElement('canvas')
        this.canvas.id = this.canvasId
        this.canvas.width = 200
        this.canvas.height = 200
        parent.appendChild(this.canvas)
        console.log('✓ 已创建 canvas:', this.canvasId)
      } else {
        console.log('✓ Canvas 已存在:', this.canvasId)
      }
      
      console.log('=== Live2D 初始化开始 ===')
      console.log('Canvas ID:', this.canvasId)
      console.log('模型路径:', this.modelPath)
      
      // 检查必需的库是否加载
      console.log('PIXI 状态:', typeof PIXI !== 'undefined' ? '✓ 已加载' : '✗ 未加载')
      console.log('PIXI.live2d 状态:', typeof PIXI !== 'undefined' && typeof PIXI.live2d !== 'undefined' ? '✓ 已加载' : '✗ 未加载')
      
      if (typeof PIXI === 'undefined') {
        throw new Error('PIXI.js 未加载')
      }
      
      // PIXI.live2d 可能需要时间注册,等待一下
      if (typeof PIXI.live2d === 'undefined') {
        console.log('等待 Live2D 插件注册...')
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (typeof PIXI.live2d === 'undefined') {
          throw new Error('PIXI Live2D 插件未加载。PIXI 对象:', Object.keys(PIXI))
        }
      }

      console.log('✓ PIXI.js 和 Live2D 库已加载')
      console.log('PIXI.live2d 对象:', PIXI.live2d)
      
      // 检查 Live2DModel 是否存在
      if (!PIXI.live2d.Live2DModel) {
        throw new Error('PIXI.live2d.Live2DModel 不存在。Live2D 对象keys:', Object.keys(PIXI.live2d))
      }

      // 创建 PIXI 应用 (让 PIXI 自动创建 WebGL 上下文)
      this.app = new PIXI.Application({
        view: this.canvas,
        width: this.canvas.width,
        height: this.canvas.height,
        transparent: true,
        autoStart: true,
        backgroundAlpha: 0,
        antialias: true,
        preserveDrawingBuffer: true  // 保留绘图缓冲区
      })

      console.log('✓ PIXI 应用创建成功')
      console.log('舞台尺寸:', this.app.screen.width, 'x', this.app.screen.height)

      // 加载 Live2D 模型
      console.log('开始加载模型...')
      console.log('使用方法:', PIXI.live2d.Live2DModel.from ? 'from' : 'fromSync')
      
      // 尝试使用 from 方法
      this.model = await PIXI.live2d.Live2DModel.from(this.modelPath, {
        autoInteract: false
      })
      
      console.log('✓ Live2D 模型加载成功!')
      console.log('模型对象:', this.model)
      console.log('模型尺寸:', this.model.width, 'x', this.model.height)

      // 设置模型位置和缩放 (统一全身显示配置)
      const scaleValue = this.currentModel.scale
      const anchorConfig = this.currentModel.anchor
      
      if (this.model.anchor) {
        this.model.anchor.set(anchorConfig.x, anchorConfig.y)
        console.log(`✓ 锚点: (${anchorConfig.x}, ${anchorConfig.y})`)
      }
      
      this.model.scale.set(scaleValue)
      
      // 位置: 稍微偏左一点,避免超出右侧边界
      this.model.x = this.canvas.width * 0.4  // 40% 位置,偏左
      this.model.y = 5  // 顶部留一点边距
      
      console.log(`配置: 模型=${this.currentModel.name}, scale=${scaleValue}, 位置=(${this.model.x}, ${this.model.y}), 全身显示`)

      // 添加到舞台
      this.app.stage.addChild(this.model)
      console.log('✓ 模型已添加到舞台')

      // 启用默认动画 (idle)
      this.startIdleMotion()

      console.log('=== ✓ Live2D 初始化完成 ===')
      return true
    } catch (error) {
      console.error('=== ✗ Live2D 初始化失败 ===')
      console.error('错误类型:', error.name)
      console.error('错误信息:', error.message)
      console.error('错误堆栈:', error.stack)
      return false
    }
  }

  /**
   * 完全销毁 Live2D 实例
   */
  destroy() {
    console.log('🗑️ 销毁 Live2D 实例...')
    
    try {
      // 移除并销毁模型
      if (this.model) {
        if (this.app && this.app.stage) {
          this.app.stage.removeChild(this.model)
        }
        this.model.destroy({ children: true, texture: true, baseTexture: true })
        this.model = null
        console.log('✓ 模型已销毁')
      }
      
      // 销毁 PIXI 应用 (会移除 canvas,但 init() 会重新创建)
      if (this.app) {
        this.app.destroy(true, { children: true, texture: true, baseTexture: true })
        this.app = null
        this.canvas = null
        console.log('✓ PIXI 应用已销毁')
      }
      
      console.log('✓ Live2D 实例完全销毁')
    } catch (error) {
      console.warn('销毁过程出现警告:', error)
    }
  }

  /**
   * 重新加载模型 (随机选择新模型)
   */
  async reload() {
    console.log('🔄 重新加载 Live2D 模型...')
    
    // 完全销毁旧实例
    this.destroy()
    
    // 随机选择新模型
    this.selectRandomModel()
    
    // 等待足够时间确保 WebGL 上下文完全释放
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 重新获取 canvas 引用 (确保不是 null)
    this.canvas = document.getElementById(this.canvasId)
    if (!this.canvas) {
      console.error('Canvas 元素不存在:', this.canvasId)
      return false
    }
    console.log('✓ Canvas 重新获取成功:', this.canvasId)
    
    // 重新初始化
    return await this.init()
  }

  /**
   * 播放待机动画
   */
  startIdleMotion() {
    try {
      const motions = this.model.internalModel.motionManager.definitions
      if (motions && motions.idle) {
        this.model.internalModel.motionManager.startRandomMotion('idle')
      }
    } catch (error) {
      console.warn('播放待机动画失败:', error)
    }
  }

  /**
   * 播放指定动作
   * @param {string} group - 动作组名称 (如 'idle', 'tap_body')
   * @param {number} index - 动作索引
   */
  playMotion(group, index = 0) {
    try {
      if (this.model && this.model.internalModel && this.model.internalModel.motionManager) {
        this.model.internalModel.motionManager.startMotion(group, index)
        return true
      }
      return false
    } catch (error) {
      console.warn(`播放动作失败 (${group}):`, error)
      return false
    }
  }

  /**
   * 销毁模型和应用
   */
  destroy() {
    try {
      if (this.model) {
        this.model.destroy()
        this.model = null
      }
      if (this.app) {
        this.app.destroy(true)
        this.app = null
      }
    } catch (error) {
      console.error('销毁 Live2D 失败:', error)
    }
  }
}

// 导出到全局
window.Live2DLoader = Live2DLoader

