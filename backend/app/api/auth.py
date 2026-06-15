# 认证路由
# 注册、登录、获取当前用户信息

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User
from app.schemas.schemas import UserCreate, UserResponse, TokenResponse
from app.services.crud import crud_user

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/register", response_model=dict)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """用户注册

    检查用户名是否已存在，创建用户并返回访问令牌
    """
    # 检查用户名是否已存在
    result = await db.execute(select(User).where(User.username == user_in.username))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在",
        )

    # 创建用户
    hashed_password = get_password_hash(user_in.password)
    new_user = User(username=user_in.username, hashed_password=hashed_password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # 生成 Token
    access_token = create_access_token(data={"sub": str(new_user.id)})
    return {
        "code": 200,
        "message": "注册成功",
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(new_user).model_dump(),
        },
    }


@router.post("/login", response_model=dict)
async def login(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """用户登录

    验证用户名和密码，返回访问令牌
    """
    # 查找用户
    result = await db.execute(select(User).where(User.username == user_in.username))
    user = result.scalars().first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )

    # 验证密码
    if not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )

    # 生成 Token
    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "code": 200,
        "message": "登录成功",
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user).model_dump(),
        },
    }


@router.get("/me", response_model=dict)
async def get_me(current_user: User = Depends(get_current_user)):
    """获取当前登录用户信息"""
    return {
        "code": 200,
        "message": "success",
        "data": UserResponse.model_validate(current_user).model_dump(),
    }
