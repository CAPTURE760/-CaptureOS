# 实验记录路由
# CRUD 操作，支持分页、搜索

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.models.models import User, Lab
from app.schemas.schemas import LabCreate, LabUpdate, LabResponse
from app.services.crud import crud_lab

router = APIRouter(prefix="/labs", tags=["实验记录"])


@router.get("", response_model=dict)
async def list_labs(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(20, ge=1, le=100, description="每页记录数"),
    search: str | None = Query(None, description="搜索关键词"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取实验记录列表"""
    query = select(Lab)

    # 搜索过滤：标题、目标、结果
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                Lab.title.ilike(search_filter),
                Lab.goal.ilike(search_filter),
                Lab.result.ilike(search_filter),
            )
        )

    # 统计总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # 分页
    query = query.offset(skip).limit(limit).order_by(Lab.created_at.desc())
    result = await db.execute(query)
    items = [LabResponse.model_validate(row).model_dump() for row in result.scalars().all()]

    return {
        "code": 200,
        "message": "success",
        "data": {"items": items, "total": total, "skip": skip, "limit": limit},
    }


@router.post("", response_model=dict)
async def create_lab(
    lab_in: LabCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建实验记录"""
    new_lab = await crud_lab.create(lab_in, db)
    return {
        "code": 200,
        "message": "创建成功",
        "data": LabResponse.model_validate(new_lab).model_dump(),
    }


@router.get("/{id}", response_model=dict)
async def get_lab(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取实验记录详情"""
    lab = await crud_lab.get(id, db)
    if lab is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="实验记录不存在")
    return {
        "code": 200,
        "message": "success",
        "data": LabResponse.model_validate(lab).model_dump(),
    }


@router.put("/{id}", response_model=dict)
async def update_lab(
    id: int,
    lab_in: LabUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新实验记录"""
    lab = await crud_lab.update(id, lab_in, db)
    if lab is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="实验记录不存在")
    return {
        "code": 200,
        "message": "更新成功",
        "data": LabResponse.model_validate(lab).model_dump(),
    }


@router.delete("/{id}", response_model=dict)
async def delete_lab(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除实验记录"""
    lab = await crud_lab.delete(id, db)
    if lab is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="实验记录不存在")
    return {"code": 200, "message": "删除成功", "data": None}
