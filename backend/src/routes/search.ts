import { Hono } from 'hono'
import { db } from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'
import { ok, toCamel } from '../lib/utils.js'

const app = new Hono()
app.use('*', authMiddleware)

// 全局搜索：跨所有资产表搜索
app.get('/', (c) => {
  const userId = c.get('userId') as number
  const q = c.req.query('q')

  if (!q || q.trim().length === 0) {
    return c.json(ok({ results: [], total: 0 }))
  }

  const like = `%${q}%`
  const results: any[] = []

  // 搜索工作案例
  const workCases = db.prepare(
    `SELECT id, title, hospital_name as subtitle, 'work_case' as type, created_at FROM work_cases
     WHERE user_id = ? AND deleted_at IS NULL
     AND (title LIKE ? OR hospital_name LIKE ? OR system_type LIKE ? OR problem LIKE ? OR solution LIKE ?)
     ORDER BY created_at DESC LIMIT 5`
  ).all(userId, like, like, like, like, like)

  // 搜索故障案例
  const faultCases = db.prepare(
    `SELECT id, title, environment as subtitle, 'fault_case' as type, created_at FROM fault_cases
     WHERE user_id = ? AND deleted_at IS NULL
     AND (title LIKE ? OR symptom LIKE ? OR root_cause LIKE ? OR solution LIKE ?)
     ORDER BY created_at DESC LIMIT 5`
  ).all(userId, like, like, like, like)

  // 搜索知识卡片
  const knowledgeCards = db.prepare(
    `SELECT id, question as title, answer as subtitle, 'knowledge' as type, created_at FROM knowledge_cards
     WHERE user_id = ? AND deleted_at IS NULL
     AND (question LIKE ? OR answer LIKE ? OR category LIKE ?)
     ORDER BY created_at DESC LIMIT 5`
  ).all(userId, like, like, like)

  // 搜索项目
  const projects = db.prepare(
    `SELECT id, name as title, description as subtitle, 'project' as type, created_at FROM projects
     WHERE user_id = ? AND deleted_at IS NULL
     AND (name LIKE ? OR description LIKE ?)
     ORDER BY created_at DESC LIMIT 5`
  ).all(userId, like, like)

  // 搜索每日记录
  const dailyLogs = db.prepare(
    `SELECT id, content as title, asset_type as subtitle, 'daily_log' as type, created_at FROM daily_logs
     WHERE user_id = ? AND deleted_at IS NULL
     AND (content LIKE ? OR gain LIKE ? OR problem LIKE ?)
     ORDER BY created_at DESC LIMIT 5`
  ).all(userId, like, like, like)

  // 搜索时间轴
  const timelineEvents = db.prepare(
    `SELECT id, event_title as title, event_type as subtitle, 'timeline' as type, created_at FROM timeline_events
     WHERE user_id = ? AND deleted_at IS NULL
     AND (event_title LIKE ? OR description LIKE ?)
     ORDER BY created_at DESC LIMIT 5`
  ).all(userId, like, like)

  results.push(
    ...workCases.map(toCamel),
    ...faultCases.map(toCamel),
    ...knowledgeCards.map(toCamel),
    ...projects.map(toCamel),
    ...dailyLogs.map(toCamel),
    ...timelineEvents.map(toCamel),
  )

  // 按创建时间排序，取前 20 条
  results.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  const sliced = results.slice(0, 20)

  return c.json(ok({ results: sliced, total: sliced.length }))
})

export default app
