import { Hono } from 'hono'
import { db } from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'
import { ok } from '../lib/utils.js'

const app = new Hono()
app.use('*', authMiddleware)

const assetTableNames = ['work_cases', 'fault_cases', 'labs', 'knowledge_cards', 'projects'] as const
const assetLabels = ['workCases', 'faultCases', 'labs', 'knowledgeCards', 'projects'] as const

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
    labs: counts['labs'],
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
      `SELECT count(*) as count FROM ${allTableNames[i]} WHERE user_id = ? AND date(created_at) = date('now')`
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
  const today = new Date()
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)
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
    const last = new Date(latestDate.replace(' ', 'T'))
    const nowDate = new Date()
    stagnationDays = Math.floor((nowDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  } else {
    stagnationDays = 999
  }

  return c.json(ok({ stagnationDays, lastActivity: latestDate }))
})

// GET /monthly-trend
app.get('/monthly-trend', (c) => {
  const userId = c.get('userId') as number

  const months: string[] = []
  const nowDate = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(nowDate.getFullYear(), nowDate.getMonth() - i, 1)
    months.push(d.toISOString().slice(0, 7))
  }

  const trend: Record<string, Record<string, number>> = {}
  for (const month of months) {
    trend[month] = {}
    for (let i = 0; i < assetTableNames.length; i++) {
      const row = db.prepare(
        `SELECT count(*) as count FROM ${assetTableNames[i]} WHERE user_id = ? AND strftime('%Y-%m', created_at) = ?`
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
