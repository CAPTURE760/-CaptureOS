import type { Context, Next } from 'hono'

const attempts = new Map<string, { count: number; resetAt: number }>()

// 定期清理过期记录（每 5 分钟）
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of attempts) {
    if (now >= record.resetAt) {
      attempts.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * 简易内存限流中间件
 * @param maxAttempts 窗口期内最大请求数
 * @param windowMs 时间窗口（毫秒）
 */
export function rateLimit(maxAttempts = 10, windowMs = 60000) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
    const now = Date.now()
    const key = `${ip}:${c.req.path}`
    const record = attempts.get(key)

    if (record && now < record.resetAt) {
      if (record.count >= maxAttempts) {
        const retryAfter = Math.ceil((record.resetAt - now) / 1000)
        c.header('Retry-After', String(retryAfter))
        return c.json({
          code: 429,
          message: `请求过于频繁，请 ${retryAfter} 秒后再试`,
          data: null,
        }, 429)
      }
      record.count++
    } else {
      attempts.set(key, { count: 1, resetAt: now + windowMs })
    }

    await next()
  }
}
