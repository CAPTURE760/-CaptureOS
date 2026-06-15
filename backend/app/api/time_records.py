# 时间记录路由
# CRUD 操作，支持分页、按日期范围过滤

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.models.models import User, TimeRecord
from app.schemas.schemas import TimeRecordCreate, TimeRecordUpdate, TimeRecordResponse
from app.services.crud import crud_time_record

router = APIRouter(prefix="/time-records", tags=["时间记录"])


@router.get("", response_model=dict)
async def list_time_records(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(20, ge=1, le=100, description="每页记录数"),
    date_from: date | None = Query(None, description="开始日期"),
    date_to: date | None = Query(None, description="结束日期"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取时间记录列表"""
    query = select(TimeRecord)

    # 按日期范围过滤
    if date_from:
        query = query.where(TimeRecord.date >= date_from)
    if date_to:
        query = query.where(TimeRecord.date <= date_to)

    # 统计总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # 分页，按日期降序
    query = query.offset(skip).limit(limit).order_by(TimeRecord.date.desc())
    result = await db.execute(query)
    items = [TimeRecordResponse.model_validate(row).model_dump() for row in result.scalars().all()]

    return {
        "code": 200,
        "message": "success",
        "data": {"items": items, "total": total, "skip": skip, "limit": limit},
    }


@router.post("", response_model=dict)
async def create_time_record(
    record_in: TimeRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建时间记录"""
    # 检查该日期是否已有记录
    existing = await db.execute(select(TimeRecord).where(TimeRecord.date == record_in.date))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"日期 {record_in.date} 已存在时间记录",
        )

    new_record = await crud_time_record.create(record_in, db)
    return {
        "code": 200,
        "message": "创建成功",
        "data": TimeRecordResponse.model_validate(new_record).model_dump(),
    }


@router.get("/{id}", response_model=dict)
async def get_time_record(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取时间记录详情"""
    record = await crud_time_record.get(id, db)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="时间记录不存在")
    return {
        "code": 200,
        "message": "success",
        "data": TimeRecordResponse.model_validate(record).model_dump(),
    }


@router.put("/{id}", response_model=dict)
async def update_time_record(
    id: int,
    record_in: TimeRecordUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新时间记录"""
    record = await crud_time_record.update(id, record_in, db)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="时间记录不存在")
    return {
        "code": 200,
        "message": "更新成功",
        "data": TimeRecordResponse.model_validate(record).model_dump(),
    }


@router.delete("/{id}", response_model=dict)
async def delete_time_record(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除时间记录"""
    record = await crud_time_record.delete(id, db)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="时间记录不存在")
    return {"code": 200, "message": "删除成功", "data": None}
