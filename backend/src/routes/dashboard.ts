import { Hono } from 'hono'
import { db } from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'
import { ok } from '../lib/utils.js'

const app = new Hono()
app.use('*', authMiddleware)

const assetTableNames = ['work_cases', 'fault_cases', 'knowledge_cards', 'projects'] as const
const assetLabels = ['workCases', 'faultCases', 'knowledgeCards', 'projects'] as const

// GET /stats
app.get('/stats', (c) => {
  const userId = c.get('userId') as number

  const counts: Record<string, number> = {}
  let total = 0
  for (const table of assetTableNames) {
    const row = db.prepare(`SELECT count(*) as count FROM ${table} WHERE user_id = ?`).get(userId) as any
    const count = row?.count || 0
    counts[table] = count
    total += count
  }

  return c.json(ok({
    workCases: counts['work_cases'],
    faultCases: counts['fault_cases'],
    knowledgeCards: counts['knowledge_cards'],
    projects: counts['projects'],
    total,
  }))
})

// GET /today
app.get('/today', (c) => {
  const userId = c.get('userId') as number

  const allTableNames = [...assetTableNames, 'daily_logs', 'time_records', 'timeline_events'] as const
  const allLabels = [...assetLabels, 'dailyLogs', 'timeRecords', 'timelineEvents'] as const

  const result: Record<string, number> = {}
  for (let i = 0; i < allTableNames.length; i++) {
    const row = db.prepare(
      `SELECT count(*) as count FROM ${allTableNames[i]} WHERE user_id = ? AND date(created_at) = date('now', '+8 hours')`
    ).get(userId) as any
    result[allLabels[i]] = row?.count || 0
  }

  return c.json(ok(result))
})

// GET /streak
app.get('/streak', (c) => {
  const userId = c.get('userId') as number

  const rows = db.prepare(
    'SELECT DISTINCT date FROM daily_logs WHERE user_id = ? ORDER BY date DESC'
  ).all(userId) as any[]

  const uniqueDates = rows.map(r => r.date).sort().reverse()

  let streak = 0
  // 获取北京时间的日期字符串
  const nowUtc = Date.now()
  const beijingNow = new Date(nowUtc + 8 * 60 * 60 * 1000)
  const todayStr = beijingNow.toISOString().slice(0, 10)
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(nowUtc + 8 * 60 * 60 * 1000 - i * 24 * 60 * 60 * 1000)
    const expectedStr = expected.toISOString().slice(0, 10)
    if (uniqueDates[i] === expectedStr) {
      streak++
    } else {
      break
    }
  }

  return c.json(ok({ streak }))
})

// GET /stagnation
app.get('/stagnation', (c) => {
  const userId = c.get('userId') as number

  let latestDate: string | null = null
  for (const table of assetTableNames) {
    const row = db.prepare(
      `SELECT created_at FROM ${table} WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
    ).get(userId) as any
    if (row && (!latestDate || row.created_at > latestDate)) {
      latestDate = row.created_at
    }
  }

  let stagnationDays = 0
  if (latestDate) {
    // created_at 是 UTC 时间，需要加 8 小时转换为北京时间
    const lastUtc = new Date(latestDate.replace(' ', 'T') + 'Z')
    const lastBeijing = new Date(lastUtc.getTime() + 8 * 60 * 60 * 1000)
    const nowUtc = Date.now()
    const nowBeijing = new Date(nowUtc + 8 * 60 * 60 * 1000)
    // 比较日期部分（不含时间）
    const lastDateStr = lastBeijing.toISOString().slice(0, 10)
    const nowDateStr = nowBeijing.toISOString().slice(0, 10)
    const lastDate = new Date(lastDateStr)
    const nowDate = new Date(nowDateStr)
    stagnationDays = Math.floor((nowDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
  } else {
    stagnationDays = 999
  }

  return c.json(ok({ stagnationDays, lastActivity: latestDate }))
})

// GET /monthly-trend
app.get('/monthly-trend', (c) => {
  const userId = c.get('userId') as number

  // 使用北京时间生成月份列表
  const nowUtc = Date.now()
  const beijingNow = new Date(nowUtc + 8 * 60 * 60 * 1000)
  const months: string[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(beijingNow.getFullYear(), beijingNow.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    months.push(`${y}-${m}`)
  }

  const trend: Record<string, Record<string, number>> = {}
  for (const month of months) {
    trend[month] = {}
    for (let i = 0; i < assetTableNames.length; i++) {
      // created_at 是 UTC 时间，需要加 8 小时转换为北京时间再提取月份
      const row = db.prepare(
        `SELECT count(*) as count FROM ${assetTableNames[i]} WHERE user_id = ? AND strftime('%Y-%m', datetime(created_at, '+8 hours')) = ?`
      ).get(userId, month) as any
      trend[month][assetLabels[i]] = row?.count || 0
    }
  }

  return c.json(ok(trend))
})

// GET /category-ratio
app.get('/category-ratio', (c) => {
  const userId = c.get('userId') as number

  const counts: number[] = []
  let total = 0
  for (const table of assetTableNames) {
    const row = db.prepare(`SELECT count(*) as count FROM ${table} WHERE user_id = ?`).get(userId) as any
    const count = row?.count || 0
    counts.push(count)
    total += count
  }

  const ratio: Record<string, { count: number; ratio: number }> = {}
  for (let i = 0; i < assetLabels.length; i++) {
    ratio[assetLabels[i]] = {
      count: counts[i],
      ratio: total > 0 ? +(counts[i] / total * 100).toFixed(1) : 0,
    }
  }

  return c.json(ok({ total, ratio }))
})

export default app
