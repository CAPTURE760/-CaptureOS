import { copyFileSync, readdirSync, mkdirSync, unlinkSync, statSync } from 'fs'
import { join } from 'path'

const DB_PATH = process.env.DATABASE_URL || './data/captureos.db'
const BACKUP_DIR = './data/backups'
const RETENTION_DAYS = 7

export function startBackupScheduler() {
  // 创建备份目录
  mkdirSync(BACKUP_DIR, { recursive: true })

  // 立即执行一次备份
  doBackup()

  // 每 24 小时自动备份
  setInterval(doBackup, 24 * 60 * 60 * 1000)
}

function doBackup() {
  const date = new Date().toISOString().slice(0, 10)
  const dest = join(BACKUP_DIR, `captureos-${date}.db`)
  try {
    copyFileSync(DB_PATH, dest)
    console.log(`[Backup] 已备份: ${dest}`)
    cleanOldBackups()
  } catch (e) {
    console.error('[Backup] 备份失败:', e)
  }
}

function cleanOldBackups() {
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000
  try {
    const files = readdirSync(BACKUP_DIR)
    for (const file of files) {
      if (!file.endsWith('.db')) continue
      const filePath = join(BACKUP_DIR, file)
      const stat = statSync(filePath)
      if (stat.mtimeMs < cutoff) {
        unlinkSync(filePath)
        console.log(`[Backup] 已清理旧备份: ${file}`)
      }
    }
  } catch (e) {
    // ignore
  }
}
