import { Hono } from 'hono'
import { db } from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'
import { ok } from '../lib/utils.js'

const app = new Hono()
app.use('*', authMiddleware)

function calcStagnation(lastActivity: string | null): number {
  if (!lastActivity) return 999
  // created_at 是 UTC 时间，需要加 8 小时转换为北京时间
  const lastUtc = new Date(lastActivity.replace(' ', 'T') + 'Z')
  const lastBeijing = new Date(lastUtc.getTime() + 8 * 60 * 60 * 1000)
  const nowUtc = Date.now()
  const nowBeijing = new Date(nowUtc + 8 * 60 * 60 * 1000)
  // 比较日期部分（不含时间）
  const lastDateStr = lastBeijing.toISOString().slice(0, 10)
  const nowDateStr = nowBeijing.toISOString().slice(0, 10)
  const lastDate = new Date(lastDateStr)
  const nowDate = new Date(nowDateStr)
  return Math.floor((nowDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
}

function riskLevel(days: number): string {
  if (days <= 2) return '正常'
  if (days <= 6) return '黄色预警'
  if (days <= 13) return '橙色预警'
  return '红色预警'
}

const assetTableNames = ['work_cases', 'fault_cases', 'knowledge_cards', 'projects'] as const
const assetLabels = ['workCases', 'faultCases', 'knowledgeCards', 'projects'] as const

// GET /status
app.get('/status', (c) => {
  const userId = c.get('userId') as number

  const results = assetTableNames.map((table, i) => {
    const row = db.prepare(
      `SELECT MAX(created_at) as last_activity FROM ${table} WHERE user_id = ?`
    ).get(userId) as any
    const lastActivity = row?.last_activity ?? null
    const stagnationDays = calcStagnation(lastActivity)
    return {
      assetType: assetLabels[i],
      last_activity: lastActivity,
      stagnation_days: stagnationDays,
      risk: riskLevel(stagnationDays),
    }
  })

  const maxDays = Math.max(...results.map(r => r.stagnation_days))
  const overallRisk = riskLevel(maxDays)

  return c.json(ok({ overall_risk: overallRisk, assets: results }))
})

// GET /alerts
app.get('/alerts', (c) => {
  const userId = c.get('userId') as number

  const alerts = assetTableNames.map((table, i) => {
    const row = db.prepare(
      `SELECT MAX(created_at) as last_activity FROM ${table} WHERE user_id = ?`
    ).get(userId) as any
    const lastActivity = row?.last_activity ?? null
    const stagnationDays = calcStagnation(lastActivity)
    return {
      assetType: assetLabels[i],
      stagnation_days: stagnationDays,
      last_activity: lastActivity,
      status: stagnationDays <= 2 ? '活跃' : '停滞',
      risk: riskLevel(stagnationDays),
    }
  })

  return c.json(ok(alerts))
})

export default app
