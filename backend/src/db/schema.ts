import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// ==================== 用户 ====================
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').default('datetime("now")').notNull(),
})

// ==================== 工作案例 ====================
export const workCases = sqliteTable('work_cases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  hospitalName: text('hospital_name').notNull(),
  systemType: text('system_type').notNull(),
  problem: text('problem').notNull(),
  reason: text('reason').notNull(),
  solution: text('solution').notNull(),
  costTime: text('cost_time'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
  createdAt: text('created_at').default('datetime("now")').notNull(),
  updatedAt: text('updated_at').default('datetime("now")').notNull(),
})

// ==================== 故障案例 ====================
export const faultCases = sqliteTable('fault_cases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  environment: text('environment').notNull(),
  symptom: text('symptom').notNull(),
  rootCause: text('root_cause').notNull(),
  solution: text('solution').notNull(),
  prevention: text('prevention'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
  createdAt: text('created_at').default('datetime("now")').notNull(),
  updatedAt: text('updated_at').default('datetime("now")').notNull(),
})

// ==================== 知识卡片 ====================
export const knowledgeCards = sqliteTable('knowledge_cards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  scenario: text('scenario'),
  category: text('category'),
  createdAt: text('created_at').default('datetime("now")').notNull(),
  updatedAt: text('updated_at').default('datetime("now")').notNull(),
})

// ==================== 项目 ====================
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  githubUrl: text('github_url'),
  status: text('status').default('进行中'),
  version: text('version'),
  nextPlan: text('next_plan'),
  createdAt: text('created_at').default('datetime("now")').notNull(),
  updatedAt: text('updated_at').default('datetime("now")').notNull(),
})

// ==================== 每日日志 ====================
export const dailyLogs = sqliteTable('daily_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),
  assetType: text('asset_type'),
  content: text('content'),
  gain: text('gain'),
  problem: text('problem'),
  createdAt: text('created_at').default('datetime("now")').notNull(),
})

// ==================== 时间记录 ====================
export const timeRecords = sqliteTable('time_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),
  workHours: real('work_hours').default(0),
  studyHours: real('study_hours').default(0),
  projectHours: real('project_hours').default(0),
  entertainmentHours: real('entertainment_hours').default(0),
  otherHours: real('other_hours').default(0),
  createdAt: text('created_at').default('datetime("now")').notNull(),
})

// ==================== 时间线事件 ====================
export const timelineEvents = sqliteTable('timeline_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  eventTitle: text('event_title').notNull(),
  eventDate: text('event_date').notNull(),
  eventType: text('event_type'),
  description: text('description'),
  createdAt: text('created_at').default('datetime("now")').notNull(),
})
