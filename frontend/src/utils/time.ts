// 获取北京时间的 datetime-local 格式字符串 (YYYY-MM-DDTHH:MM)
export function beijingNow(): string {
  const now = new Date()
  const beijing = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  const y = beijing.getUTCFullYear()
  const m = String(beijing.getUTCMonth() + 1).padStart(2, '0')
  const d = String(beijing.getUTCDate()).padStart(2, '0')
  const h = String(beijing.getUTCHours()).padStart(2, '0')
  const min = String(beijing.getUTCMinutes()).padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}

// 获取北京时间的日期字符串 (YYYY-MM-DD)
export function beijingDate(): string {
  return beijingNow().slice(0, 10)
}
