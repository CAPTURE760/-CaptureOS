export function ok(data: any, message = 'success') {
  return { code: 200, message, data }
}

export function fail(message: string, code = 400) {
  return { code, message, data: null }
}

export function now() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

// 将 snake_case 数据库行转为 camelCase
export function toCamel(row: any): any {
  if (!row) return row
  const result: any = {}
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    result[camelKey] = key === 'tags' && typeof value === 'string' ? JSON.parse(value || '[]') : value
  }
  return result
}

// 将 camelCase 数据转为 snake_case 用于数据库插入
export function toSnake(data: any): any {
  if (!data) return data
  const result: any = {}
  for (const [key, value] of Object.entries(data)) {
    const snakeKey = key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)
    result[snakeKey] = Array.isArray(value) ? JSON.stringify(value) : value
  }
  return result
}
