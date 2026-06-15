import { Hono } from 'hono'
import { z } from 'zod'
import bcryptjs from 'bcryptjs'
import { db } from '../db/index.js'
import { signToken, authMiddleware } from '../middleware/auth.js'
import { rateLimit } from '../middleware/rate-limit.js'
import { ok, fail } from '../lib/utils.js'

const auth = new Hono()

// 登录限流：每 IP 每分钟最多 10 次
auth.use('/login', rateLimit(10, 60000))
// 注册限流：每 IP 每分钟最多 5 次
auth.use('/register', rateLimit(5, 60000))

const registerSchema = z.object({
  username: z.string().min(2).max(20),
  password: z.string().min(6),
})

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

auth.post('/register', async (c) => {
  const body = await c.req.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) return c.json(fail(parsed.error.issues[0].message), 400)

  const { username, password } = parsed.data
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) return c.json(fail('用户名已存在'), 400)

  const passwordHash = bcryptjs.hashSync(password, 10)
  const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash)
  const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(result.lastInsertRowid) as any
  const token = await signToken(user.id)
  return c.json(ok({ access_token: token, user: { id: user.id, username: user.username } }))
})

auth.post('/login', async (c) => {
  const body = await c.req.json()
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) return c.json(fail('请输入用户名和密码'), 400)

  const { username, password } = parsed.data
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any
  if (!user || !bcryptjs.compareSync(password, user.password_hash)) {
    return c.json(fail('用户名或密码错误'), 401)
  }

  const token = await signToken(user.id)
  return c.json(ok({ access_token: token, user: { id: user.id, username: user.username } }))
})

auth.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId') as number
  const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(userId) as any
  if (!user) return c.json(fail('用户不存在'), 404)
  return c.json(ok({ id: user.id, username: user.username, created_at: user.created_at }))
})

export default auth
