# CaptureOS — 个人职业资产操作系统

> 不是记录时间，而是记录职业资产。

## 这是什么

CaptureOS 是一个**个人职业资产管理平台**，用于系统化地记录、管理和回顾你在职业生涯中积累的各种"资产"——不只是工作经历，而是那些真正让你成长的东西。

**解决的问题：**
- 工作中做过的事、解决过的问题，过几个月就忘了
- 碎片化的知识和经验没有沉淀，下次遇到类似问题还得重新查
- 不知道自己时间花在了哪里，哪些事真正产生了价值
- 职业成长没有可视化的轨迹，年终总结全靠回忆

**核心理念：** 把日常工作中的每一个案例、每一次故障排除、每一个技术实验、每一条知识碎片都变成可检索、可回顾、可量化的"职业资产"。

## 功能模块

| 模块 | 用途 |
|---|---|
| 🏠 驾驶舱 Dashboard | 资产总览，一眼看清所有模块的数据概况 |
| 📝 今日记录 | 每日工作总结，记录当天做了什么 |
| 📋 工作案例库 | 医院实施案例等项目经验沉淀 |
| 🔧 故障库 | 技术故障的排查过程和解决方案 |
| 🧪 实验室 | 技术实验记录，验证想法的过程和结论 |
| 🃏 知识卡片库 | 碎片知识的结构化存储，随时查阅 |
| 📂 项目资产库 | 个人项目的管理与跟踪 |
| ⏰ 时间流向 | 时间分配记录，看清时间花在了哪里 |
| 📈 成长时间轴 | 职业成长的可视化时间线 |
| ⚠️ 风险中心 | 停滞检测，提醒你哪些方面需要关注 |

## 技术栈

| 层 | 技术 |
|---|---|
| 后端 | FastAPI + SQLAlchemy + SQLite |
| 前端 | Vue3 + Element Plus + Chart.js |
| 部署 | Docker Compose + Nginx 反向代理 |

## 快速开始

### Docker Compose 部署（推荐）

```bash
git clone git@github.com:CAPTURE760/-CaptureOS.git
cd CaptureOS
docker compose up -d --build
```

访问 http://localhost:3080

### 本地开发

> 需要 Python 3.10+ 和 Node.js 18+

#### Windows (PowerShell)

```powershell
# 后端
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 前端（另开一个终端）
cd frontend
npm install
npm run dev
```

#### Linux / macOS

```bash
# 后端
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 前端（另开一个终端）
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173（开发模式自动代理 API 到后端）

## 默认配置

| 项目 | 地址 |
|---|---|
| 生产环境 | http://localhost:3080 |
| API 文档 (Swagger) | http://localhost:8000/docs |
| API 文档 (ReDoc) | http://localhost:8000/redoc |
| 数据库 | `./data/captureos.db` (SQLite) |

## 环境变量

复制 `.env.example` 为 `.env`，可配置：

| 变量 | 说明 | 默认值 |
|---|---|---|
| `SECRET_KEY` | JWT 签名密钥（**生产环境务必修改**） | `captureos-secret-key-change-in-production` |
| `DATABASE_URL` | 数据库连接字符串 | `sqlite+aiosqlite:///./data/captureos.db` |

## 项目结构

```
CaptureOS/
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── api/             # API 路由（各模块）
│   │   ├── core/            # 配置、认证、依赖注入
│   │   ├── database/        # 数据库连接
│   │   ├── models/          # SQLAlchemy 模型
│   │   ├── schemas/         # Pydantic 数据结构
│   │   └── services/        # CRUD 业务逻辑
│   ├── main.py              # 应用入口
│   └── requirements.txt
├── frontend/                # Vue3 前端
│   ├── src/
│   │   ├── api/             # API 请求封装
│   │   ├── views/           # 页面组件
│   │   ├── router/          # 路由配置
│   │   └── stores/          # Pinia 状态管理
│   └── package.json
├── nginx/                   # Nginx 反向代理配置
├── data/                    # SQLite 数据库（持久化卷）
├── docker-compose.yml
└── .env.example
```
