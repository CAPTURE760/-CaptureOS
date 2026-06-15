import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'fs'
import { dirname } from 'path'

const DB_PATH = process.env.DATABASE_URL || './data/captureos.db'

mkdirSync(dirname(DB_PATH), { recursive: true })

const db = new DatabaseSync(DB_PATH)

// 启用 WAL 模式和外键约束
db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

// 创建表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now', '+8 hours')) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS work_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    hospital_name TEXT NOT NULL,
    system_type TEXT NOT NULL,
    problem TEXT NOT NULL,
    reason TEXT NOT NULL,
    solution TEXT NOT NULL,
    cost_time TEXT,
    tags TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now', '+8 hours')) NOT NULL,
    updated_at TEXT DEFAULT (datetime('now', '+8 hours')) NOT NULL,
    deleted_at TEXT DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS fault_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    environment TEXT NOT NULL,
    symptom TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    solution TEXT NOT NULL,
    prevention TEXT,
    tags TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now', '+8 hours')) NOT NULL,
    updated_at TEXT DEFAULT (datetime('now', '+8 hours')) NOT NULL,
    deleted_at TEXT DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS knowledge_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    scenario TEXT,
    category TEXT,
    created_at TEXT DEFAULT (datetime('now', '+8 hours')) NOT NULL,
    updated_at TEXT DEFAULT (datetime('now', '+8 hours')) NOT NULL,
    deleted_at TEXT DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    github_url TEXT,
    status TEXT DEFAULT '进行中',
    version TEXT,
    next_plan TEXT,
    created_at TEXT DEFAULT (datetime('now', '+8 hours')) NOT NULL,
    updated_at TEXT DEFAULT (datetime('now', '+8 hours')) NOT NULL,
    deleted_at TEXT DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    asset_type TEXT,
    content TEXT,
    gain TEXT,
    problem TEXT,
    created_at TEXT DEFAULT (datetime('now', '+8 hours')) NOT NULL,
    deleted_at TEXT DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS time_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    work_hours REAL DEFAULT 0,
    study_hours REAL DEFAULT 0,
    project_hours REAL DEFAULT 0,
    entertainment_hours REAL DEFAULT 0,
    other_hours REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now', '+8 hours')) NOT NULL,
    deleted_at TEXT DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS timeline_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    event_title TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_type TEXT,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now', '+8 hours')) NOT NULL,
    deleted_at TEXT DEFAULT NULL
  );
`)

// 迁移：为已有表添加 deleted_at 列（如果不存在）
const tables = ['work_cases', 'fault_cases', 'knowledge_cards', 'projects', 'daily_logs', 'time_records', 'timeline_events']
for (const table of tables) {
  try {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c: any) => c.name)
    if (!cols.includes('deleted_at')) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN deleted_at TEXT DEFAULT NULL`)
      console.log(`✅ 迁移: ${table} 表已添加 deleted_at 列`)
    }
  } catch (err: any) {
    console.error(`❌ 迁移失败 ${table}:`, err.message)
  }
}

export { db }
