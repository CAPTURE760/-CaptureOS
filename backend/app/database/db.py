# 数据库初始化与连接配置
# 异步 SQLAlchemy 引擎、会话工厂、Base 类

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config import DATABASE_URL

# 确保 data 目录存在
data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
os.makedirs(data_dir, exist_ok=True)

# 声明式基类
Base = declarative_base()

# 异步引擎
engine = create_async_engine(DATABASE_URL, echo=False)

# 异步会话工厂
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db() -> None:
    """初始化数据库 - 创建所有表"""
    async with engine.begin() as conn:
        # 导入所有模型以确保表定义被加载
        from app.models import models  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
