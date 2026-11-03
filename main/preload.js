const { contextBridge, ipcRenderer } = require('electron')

/**
 * 暴露安全的 API 给渲染进程
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // 监听翻译加载状态
  onTranslationLoading: (callback) => {
    ipcRenderer.on('translation-loading', (event, data) => callback(data))
  },
  
  // 监听翻译结果
  onShowTranslation: (callback) => {
    ipcRenderer.on('show-translation', (event, data) => callback(data))
  },
  
  // 监听翻译错误
  onTranslationError: (callback) => {
    ipcRenderer.on('translation-error', (event, data) => callback(data))
  },
  
  // 窗口控制
  minimizeWindow: () => {
    ipcRenderer.send('minimize-window')
  },
  
  closeWindow: () => {
    ipcRenderer.send('close-window')
  },

  // 历史记录
  listHistory: () => ipcRenderer.invoke('history:list'),
  removeHistory: id => ipcRenderer.invoke('history:remove', id),
  clearHistory: () => ipcRenderer.invoke('history:clear'),

  // 快捷键设置
  getShortcut: () => ipcRenderer.invoke('shortcut:get'),
  setShortcut: (action, accelerator) =>
    ipcRenderer.invoke('shortcut:set', action, accelerator)
})
