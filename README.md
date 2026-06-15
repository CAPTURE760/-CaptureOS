# CaptureOS — 个人职业资产操作系统

> 不是记录时间，而是记录职业资产。

## 这是什么

CaptureOS 是一个**个人职业资产管理平台**，用于系统化地记录、管理和回顾你在职业生涯中积累的各种"资产"。

**解决的问题：**
- 工作中做过的事、解决过的问题，过几个月就忘了
- 碎片化的知识和经验没有沉淀
- 不知道自己时间花在了哪里
- 职业成长没有可视化的轨迹

## 技术栈

| 层 | 技术 |
|---|---|
| 后端 | Hono + Drizzle ORM + SQLite |
| 前端 | Vue 3 + Naive UI + Vite |
| 部署 | Docker Compose + Caddy |
| 语言 | TypeScript 全栈 |

## 功能模块

| 模块 | 用途 |
|---|---|
| 🏠 驾驶舱 | 资产总览、趋势分析 |
| 📝 今日记录 | 每日工作总结 |
| 📋 工作案例 | 项目经验沉淀 |
| 🔧 故障案例 | 故障排查记录 |
| 🧪 实验室 | 技术实验记录 |
| 🃏 知识卡片 | 碎片知识存储 |
| 📂 项目资产 | 个人项目管理 |
| ⏰ 时间流向 | 时间分配记录 |
| 📈 成长时间轴 | 职业历史时间线 |
| ⚠️ 风险中心 | 停滞检测预警 |

## 快速开始

### Docker Compose 部署（推荐）

```bash
git clone git@github.com:CAPTURE760/-CaptureOS.git
cd CaptureOS
docker compose up -d --build
```

访问 http://localhost:3080

### 本地开发

> 需要 Node.js 18+

**Windows (PowerShell)：**

```powershell
# 启动后端（终端 1）
cd D:\CaptureOS\backend
npm install
npm run dev

# 启动前端（终端 2）
cd D:\CaptureOS\frontend
npm install
npm run dev
```

**Linux / macOS：**

```bash
# 启动后端（终端 1）
cd ~/CaptureOS/backend
npm install
npm run dev

# 启动前端（终端 2）
cd ~/CaptureOS/frontend
npm install
npm run dev
```

访问 http://localhost:5173

## 环境变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| `JWT_SECRET` | JWT 签名密钥（**生产环境务必修改**） | `captureos-secret-change-in-production` |
| `DATABASE_URL` | SQLite 数据库路径 | `./data/captureos.db` |
| `PORT` | 后端端口 | `8000` |

## 项目结构

```
CaptureOS/
├── backend/                   # Hono 后端
│   ├── src/
│   │   ├── db/                # Drizzle schema + 数据库连接
│   │   ├── routes/            # API 路由（各模块 CRUD）
│   │   ├── middleware/        # JWT 认证中间件
│   │   ├── lib/               # 工具函数
│   │   └── index.ts           # 入口
│   └── package.json
├── frontend/                  # Vue 3 前端
│   ├── src/
│   │   ├── api/               # API 调用封装
│   │   ├── views/             # 页面组件
│   │   ├── router/            # 路由配置
│   │   └── stores/            # Pinia 状态管理
│   └── package.json
├── data/                      # SQLite 数据库（持久化）
├── docker-compose.yml
├── Caddyfile                  # Caddy 反向代理
└── .env.example
```
