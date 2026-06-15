import { Hono } from 'hono'
import { db } from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'
import { toCamel, toSnake } from '../lib/utils.js'

const app = new Hono()
app.use('*', authMiddleware)

// 导出所有用户数据为 JSON
app.get('/json', (c) => {
  const userId = c.get('userId') as number

  const data = {
    exportDate: new Date().toISOString(),
    workCases: db.prepare('SELECT * FROM work_cases WHERE user_id = ? AND deleted_at IS NULL').all(userId).map(toCamel),
    faultCases: db.prepare('SELECT * FROM fault_cases WHERE user_id = ? AND deleted_at IS NULL').all(userId).map(toCamel),
    knowledgeCards: db.prepare('SELECT * FROM knowledge_cards WHERE user_id = ? AND deleted_at IS NULL').all(userId).map(toCamel),
    projects: db.prepare('SELECT * FROM projects WHERE user_id = ? AND deleted_at IS NULL').all(userId).map(toCamel),
    dailyLogs: db.prepare('SELECT * FROM daily_logs WHERE user_id = ? AND deleted_at IS NULL').all(userId).map(toCamel),
    timeRecords: db.prepare('SELECT * FROM time_records WHERE user_id = ? AND deleted_at IS NULL').all(userId).map(toCamel),
    timelineEvents: db.prepare('SELECT * FROM timeline_events WHERE user_id = ? AND deleted_at IS NULL').all(userId).map(toCamel),
  }

  const json = JSON.stringify(data, null, 2)
  const filename = `captureos-export-${new Date().toISOString().slice(0, 10)}.json`

  return new Response(json, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
})

// 从 JSON 导入数据
app.post('/import', async (c) => {
  const userId = c.get('userId') as number

  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ code: 400, message: '无效的 JSON 格式', data: null }, 400)
  }

  // 校验导出格式
  const requiredKeys = [
    'workCases', 'faultCases', 'knowledgeCards',
    'projects', 'dailyLogs', 'timeRecords', 'timelineEvents',
  ]
  for (const key of requiredKeys) {
    if (!Array.isArray(body[key])) {
      return c.json({ code: 400, message: `缺少或无效的字段: ${key}`, data: null }, 400)
    }
  }

  const counts: Record<string, number> = {}
  let total = 0

  // 表名 -> 插入字段列表（不含 id 和 user_id）
  const tableMap: Record<string, { table: string; columns: string[]; dedupKey: string }> = {
    workCases: {
      table: 'work_cases',
      columns: ['title', 'hospital_name', 'system_type', 'problem', 'reason', 'solution', 'cost_time', 'tags'],
      dedupKey: 'title',
    },
    faultCases: {
      table: 'fault_cases',
      columns: ['title', 'environment', 'symptom', 'root_cause', 'solution', 'prevention', 'tags'],
      dedupKey: 'title',
    },
    knowledgeCards: {
      table: 'knowledge_cards',
      columns: ['question', 'answer', 'scenario', 'category'],
      dedupKey: 'question',
    },
    projects: {
      table: 'projects',
      columns: ['name', 'description', 'github_url', 'status', 'version', 'next_plan'],
      dedupKey: 'name',
    },
    dailyLogs: {
      table: 'daily_logs',
      columns: ['date', 'asset_type', 'content', 'gain', 'problem'],
      dedupKey: 'date',
    },
    timeRecords: {
      table: 'time_records',
      columns: ['date', 'work_hours', 'study_hours', 'project_hours', 'entertainment_hours', 'other_hours'],
      dedupKey: 'date',
    },
    timelineEvents: {
      table: 'timeline_events',
      columns: ['event_title', 'event_date', 'event_type', 'description'],
      dedupKey: 'event_title',
    },
  }

  // 使用事务包裹整个导入过程
  const importAll = db.transaction(() => {
    for (const key of requiredKeys) {
      const { table, columns, dedupKey } = tableMap[key]
      const rows = body[key] as any[]
      let inserted = 0

      for (const row of rows) {
        const snake = toSnake(row)
        const dedupValue = snake[dedupKey]

        // 去重检查：如果已存在相同记录则跳过
        if (dedupValue !== undefined && dedupValue !== null) {
          const exists = db.prepare(
            `SELECT 1 FROM ${table} WHERE user_id = ? AND ${dedupKey} = ?`
          ).get(userId, dedupValue)
          if (exists) continue
        }

        const placeholders = columns.map(() => '?').join(', ')
        const values = columns.map((col) => {
          const val = snake[col]
          // tags 字段需要序列化为 JSON 字符串
          if (col === 'tags' && Array.isArray(val)) return JSON.stringify(val)
          return val ?? null
        })

        try {
          db.prepare(
            `INSERT INTO ${table} (user_id, ${columns.join(', ')}) VALUES (?, ${placeholders})`
          ).run(userId, ...values)
          inserted++
        } catch {
          // 跳过单条插入失败（如唯一约束冲突）
        }
      }

      counts[key] = inserted
      total += inserted
    }
  })

  importAll()

  return c.json({
    code: 200,
    message: `导入完成，共导入 ${total} 条记录`,
    data: { total, counts },
  })
})

export default app
