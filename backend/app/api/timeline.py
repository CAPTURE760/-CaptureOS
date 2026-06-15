# 时间线路由
# CRUD 操作，支持分页、按 event_type 过滤

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.models.models import User, TimelineEvent
from app.schemas.schemas import TimelineEventCreate, TimelineEventUpdate, TimelineEventResponse
from app.services.crud import crud_timeline_event

router = APIRouter(prefix="/timeline", tags=["时间线"])


@router.get("", response_model=dict)
async def list_timeline_events(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(20, ge=1, le=100, description="每页记录数"),
    event_type: str | None = Query(None, description="按事件类型过滤"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取时间线事件列表"""
    query = select(TimelineEvent)

    # 按事件类型过滤
    if event_type:
        query = query.where(TimelineEvent.event_type == event_type)

    # 统计总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # 分页，按事件日期降序
    query = query.offset(skip).limit(limit).order_by(TimelineEvent.event_date.desc())
    result = await db.execute(query)
    items = [TimelineEventResponse.model_validate(row).model_dump() for row in result.scalars().all()]

    return {
        "code": 200,
        "message": "success",
        "data": {"items": items, "total": total, "skip": skip, "limit": limit},
    }


@router.post("", response_model=dict)
async def create_timeline_event(
    event_in: TimelineEventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建时间线事件"""
    new_event = await crud_timeline_event.create(event_in, db)
    return {
        "code": 200,
        "message": "创建成功",
        "data": TimelineEventResponse.model_validate(new_event).model_dump(),
    }


@router.get("/{id}", response_model=dict)
async def get_timeline_event(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取时间线事件详情"""
    event = await crud_timeline_event.get(id, db)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="时间线事件不存在")
    return {
        "code": 200,
        "message": "success",
        "data": TimelineEventResponse.model_validate(event).model_dump(),
    }


@router.put("/{id}", response_model=dict)
async def update_timeline_event(
    id: int,
    event_in: TimelineEventUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新时间线事件"""
    event = await crud_timeline_event.update(id, event_in, db)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="时间线事件不存在")
    return {
        "code": 200,
        "message": "更新成功",
        "data": TimelineEventResponse.model_validate(event).model_dump(),
    }


@router.delete("/{id}", response_model=dict)
async def delete_timeline_event(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除时间线事件"""
    event = await crud_timeline_event.delete(id, db)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="时间线事件不存在")
    return {"code": 200, "message": "删除成功", "data": None}
