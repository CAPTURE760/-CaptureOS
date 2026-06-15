# CaptureOS 后端入口
# FastAPI 应用创建、CORS 配置、路由注册、数据库初始化

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import init_db
from app.api import (
    auth,
    dashboard,
    work_cases,
    fault_cases,
    labs,
    knowledge_cards,
    projects,
    daily_logs,
    time_records,
    timeline,
    risk,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时初始化数据库"""
    await init_db()
    yield


# 创建 FastAPI 应用
app = FastAPI(
    title="CaptureOS API",
    description="CaptureOS 个人知识资产管理系统后端 API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS 中间件 - 开发阶段允许所有来源
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册所有路由 - 统一使用 /api/v1 前缀
app.include_router(auth.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(work_cases.router, prefix="/api/v1")
app.include_router(fault_cases.router, prefix="/api/v1")
app.include_router(labs.router, prefix="/api/v1")
app.include_router(knowledge_cards.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(daily_logs.router, prefix="/api/v1")
app.include_router(time_records.router, prefix="/api/v1")
app.include_router(timeline.router, prefix="/api/v1")
app.include_router(risk.router, prefix="/api/v1")


@app.get("/", tags=["系统"])
async def root():
    """根路径 - 系统信息"""
    return {
        "code": 200,
        "message": "CaptureOS API 运行中",
        "data": {
            "name": "CaptureOS",
            "version": "0.1.0",
            "docs": "/docs",
        },
    }


@app.get("/api/v1/health", tags=["系统"])
async def health_check():
    """健康检查接口"""
    return {"code": 200, "message": "success", "data": {"status": "healthy"}}
