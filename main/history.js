const { app } = require('electron')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const MAX_ENTRIES = 1000

let filePath = null
let entries = null

function load() {
  if (entries) return entries
  filePath = path.join(app.getPath('userData'), 'history.json')
  try {
    entries = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    if (!Array.isArray(entries)) entries = []
  } catch {
    entries = []
  }
  return entries
}

function save() {
  // 先写临时文件再 rename，避免写一半崩溃导致历史文件损坏
  const tmp = `${filePath}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(entries))
  fs.renameSync(tmp, filePath)
}

/**
 * 新增记录 (同一原文 + 同一模式只保留最新一条，置顶)
 */
function add(text, result) {
  load()
  const mode = result.mode || 'both'
  entries = entries.filter(e => !(e.text === text && (e.mode || 'both') === mode))
  const entry = {
    id: crypto.randomUUID(),
    text,
    ...result,
    createdAt: Date.now()
  }
  entries.unshift(entry)
  if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES
  save()
  return entry
}

function list() {
  return load()
}

function remove(id) {
  load()
  entries = entries.filter(e => e.id !== id)
  save()
}

function clear() {
  load()
  entries = []
  save()
}

module.exports = { add, list, remove, clear }
