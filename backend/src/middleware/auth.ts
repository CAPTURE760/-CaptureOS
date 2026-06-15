import { Context, Next } from 'hono'
import { SignJWT, jwtVerify } from 'jose'
import { fail } from '../lib/utils.js'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'captureos-secret-change-me')

export async function signToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return Number(payload.sub)
  } catch {
    return null
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json(fail('未登录', 401), 401)
  }

  const token = authHeader.slice(7)
  const userId = await verifyToken(token)
  if (!userId) {
    return c.json(fail('Token 无效或已过期', 401), 401)
  }

  c.set('userId', userId)
  await next()
}
