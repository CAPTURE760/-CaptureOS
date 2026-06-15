# 故障案例路由
# CRUD 操作，支持分页、搜索、按 tags 过滤

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.models.models import User, FaultCase
from app.schemas.schemas import FaultCaseCreate, FaultCaseUpdate, FaultCaseResponse
from app.services.crud import crud_fault_case

router = APIRouter(prefix="/fault-cases", tags=["故障案例"])


@router.get("", response_model=dict)
async def list_fault_cases(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(20, ge=1, le=100, description="每页记录数"),
    search: str | None = Query(None, description="搜索关键词"),
    tags: str | None = Query(None, description="按标签过滤（逗号分隔）"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取故障案例列表"""
    query = select(FaultCase)

    # 搜索过滤：标题、现象、原因、解决方案
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                FaultCase.title.ilike(search_filter),
                FaultCase.symptom.ilike(search_filter),
                FaultCase.root_cause.ilike(search_filter),
                FaultCase.solution.ilike(search_filter),
            )
        )

    # 按标签过滤
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        for tag in tag_list:
            query = query.where(FaultCase.tags.contains(tag))

    # 统计总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # 分页
    query = query.offset(skip).limit(limit).order_by(FaultCase.created_at.desc())
    result = await db.execute(query)
    items = [FaultCaseResponse.model_validate(row).model_dump() for row in result.scalars().all()]

    return {
        "code": 200,
        "message": "success",
        "data": {"items": items, "total": total, "skip": skip, "limit": limit},
    }


@router.post("", response_model=dict)
async def create_fault_case(
    case_in: FaultCaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建故障案例"""
    new_case = await crud_fault_case.create(case_in, db)
    return {
        "code": 200,
        "message": "创建成功",
        "data": FaultCaseResponse.model_validate(new_case).model_dump(),
    }


@router.get("/{id}", response_model=dict)
async def get_fault_case(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取故障案例详情"""
    case = await crud_fault_case.get(id, db)
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="案例不存在")
    return {
        "code": 200,
        "message": "success",
        "data": FaultCaseResponse.model_validate(case).model_dump(),
    }


@router.put("/{id}", response_model=dict)
async def update_fault_case(
    id: int,
    case_in: FaultCaseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新故障案例"""
    case = await crud_fault_case.update(id, case_in, db)
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="案例不存在")
    return {
        "code": 200,
        "message": "更新成功",
        "data": FaultCaseResponse.model_validate(case).model_dump(),
    }


@router.delete("/{id}", response_model=dict)
async def delete_fault_case(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除故障案例"""
    case = await crud_fault_case.delete(id, db)
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="案例不存在")
    return {"code": 200, "message": "删除成功", "data": None}
