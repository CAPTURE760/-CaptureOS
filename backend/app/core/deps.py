# 依赖注入模块
# 数据库会话、当前用户等 FastAPI 依赖

from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import SECRET_KEY, ALGORITHM
from app.database.db import async_session
from app.models.models import User
from app.services.crud import crud_user

# Bearer Token 认证方案
security = HTTPBearer()


async def get_db() -> AsyncGenerator:
    """获取异步数据库会话的依赖"""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db),
) -> User:
    """从 Authorization header 解析 JWT，返回当前用户

    Raises:
        HTTPException: 401 - Token 无效或用户不存在
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await crud_user.get(int(user_id), db)
    if user is None:
        raise credentials_exception
    return user
