# 应用配置
# 数据库连接、JWT 密钥等配置项

import os

# 数据库 URL - SQLite 异步驱动（优先读取环境变量）
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./data/captureos.db")

# JWT 配置
SECRET_KEY = os.getenv("SECRET_KEY", "captureos-secret-key-change-in-production")
ALGORITHM = "HS256"
# Token 过期时间：24 小时
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
