import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db/index.js'
import { authMiddleware } from '../middleware/auth.js'
import { ok, fail, now, toCamel, toSnake } from '../lib/utils.js'

const app = new Hono()
app.use('*', authMiddleware)

const schema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  scenario: z.string().optional(),
  category: z.string().optional(),
})

// 列表
app.get('/', (c) => {
  const userId = c.get('userId') as number
  const skip = Number(c.req.query('skip') || 0)
  const limit = Math.min(Number(c.req.query('limit') || 20), 100)
  const search = c.req.query('search')

  let where = 'WHERE user_id = ? AND deleted_at IS NULL'
  const params: any[] = [userId]
  if (search) {
    where += ' AND (question LIKE ? OR answer LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  const countRow = db.prepare(`SELECT count(*) as count FROM knowledge_cards ${where}`).get(...params) as any
  const items = db.prepare(`SELECT * FROM knowledge_cards ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, limit, skip)

  return c.json(ok({ items: items.map(toCamel), total: countRow?.count || 0 }))
})

// 创建
app.post('/', async (c) => {
  const userId = c.get('userId') as number
  const body = await c.req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return c.json(fail(parsed.error.issues[0].message), 400)

  const data = toSnake(parsed.data)
  const cols = Object.keys(data).join(', ')
  const placeholders = Object.keys(data).map(() => '?').join(', ')
  const values = Object.values(data)

  const result = db.prepare(`INSERT INTO knowledge_cards (${cols}, user_id) VALUES (${placeholders}, ?)`).run(...values, userId)
  const item = db.prepare('SELECT * FROM knowledge_cards WHERE id = ?').get(result.lastInsertRowid)
  return c.json(ok(toCamel(item)))
})

// 更新
app.put('/:id', async (c) => {
  const userId = c.get('userId') as number
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const parsed = schema.partial().safeParse(body)
  if (!parsed.success) return c.json(fail(parsed.error.issues[0].message), 400)

  const existing = db.prepare('SELECT * FROM knowledge_cards WHERE id = ? AND user_id = ?').get(id, userId)
  if (!existing) return c.json(fail('记录不存在'), 404)

  const data = toSnake({ ...parsed.data, updatedAt: now() })
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ')
  const values = Object.values(data)

  db.prepare(`UPDATE knowledge_cards SET ${sets} WHERE id = ? AND user_id = ?`).run(...values, id, userId)
  const item = db.prepare('SELECT * FROM knowledge_cards WHERE id = ?').get(id)
  return c.json(ok(toCamel(item)))
})

// 删除（软删除）
app.delete('/:id', (c) => {
  const userId = c.get('userId') as number
  const id = Number(c.req.param('id'))
  const existing = db.prepare('SELECT * FROM knowledge_cards WHERE id = ? AND user_id = ? AND deleted_at IS NULL').get(id, userId)
  if (!existing) return c.json(fail('记录不存在'), 404)
  db.prepare("UPDATE knowledge_cards SET deleted_at = datetime('now', '+8 hours') WHERE id = ? AND user_id = ?").run(id, userId)
  return c.json(ok(null, '删除成功'))
})

// 恢复软删除记录
app.post('/:id/restore', (c) => {
  const userId = c.get('userId') as number
  const id = Number(c.req.param('id'))
  const existing = db.prepare('SELECT * FROM knowledge_cards WHERE id = ? AND user_id = ? AND deleted_at IS NOT NULL').get(id, userId)
  if (!existing) return c.json(fail('记录不存在或未被删除'), 404)
  db.prepare('UPDATE knowledge_cards SET deleted_at = NULL WHERE id = ? AND user_id = ?').run(id, userId)
  const item = db.prepare('SELECT * FROM knowledge_cards WHERE id = ?').get(id)
  return c.json(ok(toCamel(item), '恢复成功'))
})

export default app
