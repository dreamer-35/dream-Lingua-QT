const fetch = require('node-fetch')

/**
 * 翻译文本
 * @param {string} text 待翻译文本
 * @returns {Promise<string>} 翻译结果
 */
async function translate(text) {
  // 自动检测语言方向
  const isChinese = /[\u4e00-\u9fa5]/.test(text)
  const targetLang = isChinese ? 'English' : 'Chinese'
  
  const prompt = `Translate the following text to ${targetLang}:\n\n${text}\n\nOnly provide the translation, no explanations.`

  try {
    const res = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        model: "qwen3:0.6b",   // 可以在这里替换其他模型
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9
        }
      }),
      timeout: 30000 // 30秒超时
    })

    if (!res.ok) {
      throw new Error(`Ollama API 返回错误: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    
    if (!data.response) {
      throw new Error('翻译结果为空')
    }

    return data.response.trim()
  } catch (error) {
    console.error('翻译服务错误:', error)
    
    // 友好的错误提示
    if (error.code === 'ECONNREFUSED') {
      throw new Error('无法连接到 Ollama,请确保 Ollama 服务已启动')
    }
    
    throw error
  }
}

module.exports = translate
