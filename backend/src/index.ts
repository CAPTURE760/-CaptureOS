import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'

import auth from './routes/auth.js'
import dashboard from './routes/dashboard.js'
import workCases from './routes/work-cases.js'
import faultCases from './routes/fault-cases.js'
import labs from './routes/labs.js'
import knowledge from './routes/knowledge.js'
import projects from './routes/projects.js'
import dailyLogs from './routes/daily-logs.js'
import timeRecords from './routes/time-records.js'
import timeline from './routes/timeline.js'
import risk from './routes/risk.js'
import exportRoutes from './routes/export.js'
import { startBackupScheduler } from './lib/backup.js'

const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/', (c) => c.json({
  code: 200,
  message: 'CaptureOS API 运行中',
  data: { name: 'CaptureOS', version: '2.0.0' },
}))

app.get('/api/v1/health', (c) => c.json({
  code: 200, message: 'success', data: { status: 'healthy' },
}))

app.route('/api/v1/auth', auth)
app.route('/api/v1/dashboard', dashboard)
app.route('/api/v1/work-cases', workCases)
app.route('/api/v1/fault-cases', faultCases)
app.route('/api/v1/labs', labs)
app.route('/api/v1/knowledge-cards', knowledge)
app.route('/api/v1/projects', projects)
app.route('/api/v1/daily-logs', dailyLogs)
app.route('/api/v1/time-records', timeRecords)
app.route('/api/v1/timeline', timeline)
app.route('/api/v1/risk', risk)
app.route('/api/v1/export', exportRoutes)

const port = Number(process.env.PORT || 8000)
console.log(`🚀 CaptureOS API 启动在 http://localhost:${port}`)

serve({ fetch: app.fetch, port })

// 启动自动备份调度
startBackupScheduler()
