# 每日日志路由
# CRUD 操作，支持分页、按日期范围过滤

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.models.models import User, DailyLog
from app.schemas.schemas import DailyLogCreate, DailyLogUpdate, DailyLogResponse
from app.services.crud import crud_daily_log

router = APIRouter(prefix="/daily-logs", tags=["每日日志"])


@router.get("", response_model=dict)
async def list_daily_logs(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(20, ge=1, le=100, description="每页记录数"),
    date_from: date | None = Query(None, description="开始日期"),
    date_to: date | None = Query(None, description="结束日期"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取每日日志列表"""
    query = select(DailyLog)

    # 按日期范围过滤
    if date_from:
        query = query.where(DailyLog.date >= date_from)
    if date_to:
        query = query.where(DailyLog.date <= date_to)

    # 统计总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # 分页，按日期降序
    query = query.offset(skip).limit(limit).order_by(DailyLog.date.desc())
    result = await db.execute(query)
    items = [DailyLogResponse.model_validate(row).model_dump() for row in result.scalars().all()]

    return {
        "code": 200,
        "message": "success",
        "data": {"items": items, "total": total, "skip": skip, "limit": limit},
    }


@router.post("", response_model=dict)
async def create_daily_log(
    log_in: DailyLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建每日日志"""
    # 检查该日期是否已有日志
    existing = await db.execute(select(DailyLog).where(DailyLog.date == log_in.date))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"日期 {log_in.date} 已存在日志记录",
        )

    new_log = await crud_daily_log.create(log_in, db)
    return {
        "code": 200,
        "message": "创建成功",
        "data": DailyLogResponse.model_validate(new_log).model_dump(),
    }


@router.get("/{id}", response_model=dict)
async def get_daily_log(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取每日日志详情"""
    log = await crud_daily_log.get(id, db)
    if log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="日志不存在")
    return {
        "code": 200,
        "message": "success",
        "data": DailyLogResponse.model_validate(log).model_dump(),
    }


@router.put("/{id}", response_model=dict)
async def update_daily_log(
    id: int,
    log_in: DailyLogUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新每日日志"""
    log = await crud_daily_log.update(id, log_in, db)
    if log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="日志不存在")
    return {
        "code": 200,
        "message": "更新成功",
        "data": DailyLogResponse.model_validate(log).model_dump(),
    }


@router.delete("/{id}", response_model=dict)
async def delete_daily_log(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除每日日志"""
    log = await crud_daily_log.delete(id, db)
    if log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="日志不存在")
    return {"code": 200, "message": "删除成功", "data": None}
