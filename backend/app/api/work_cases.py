# 工作案例路由
# CRUD 操作，支持分页、搜索、按 system_type/tags 过滤

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.models.models import User, WorkCase
from app.schemas.schemas import WorkCaseCreate, WorkCaseUpdate, WorkCaseResponse
from app.services.crud import crud_work_case

router = APIRouter(prefix="/work-cases", tags=["工作案例"])


@router.get("", response_model=dict)
async def list_work_cases(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(20, ge=1, le=100, description="每页记录数"),
    search: str | None = Query(None, description="搜索关键词"),
    system_type: str | None = Query(None, description="按系统类型过滤"),
    tags: str | None = Query(None, description="按标签过滤（逗号分隔）"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取工作案例列表"""
    query = select(WorkCase)

    # 搜索过滤：标题、问题描述、解决方案
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                WorkCase.title.ilike(search_filter),
                WorkCase.problem.ilike(search_filter),
                WorkCase.solution.ilike(search_filter),
                WorkCase.hospital_name.ilike(search_filter),
            )
        )

    # 按系统类型过滤
    if system_type:
        query = query.where(WorkCase.system_type == system_type)

    # 按标签过滤（JSON 字段包含）
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        # SQLite JSON 查询：简单匹配
        for tag in tag_list:
            query = query.where(WorkCase.tags.contains(tag))

    # 统计总数
    from sqlalchemy import func
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # 分页
    query = query.offset(skip).limit(limit).order_by(WorkCase.created_at.desc())
    result = await db.execute(query)
    items = [WorkCaseResponse.model_validate(row).model_dump() for row in result.scalars().all()]

    return {
        "code": 200,
        "message": "success",
        "data": {"items": items, "total": total, "skip": skip, "limit": limit},
    }


@router.post("", response_model=dict)
async def create_work_case(
    case_in: WorkCaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建工作案例"""
    new_case = await crud_work_case.create(case_in, db)
    return {
        "code": 200,
        "message": "创建成功",
        "data": WorkCaseResponse.model_validate(new_case).model_dump(),
    }


@router.get("/{id}", response_model=dict)
async def get_work_case(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取工作案例详情"""
    case = await crud_work_case.get(id, db)
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="案例不存在")
    return {
        "code": 200,
        "message": "success",
        "data": WorkCaseResponse.model_validate(case).model_dump(),
    }


@router.put("/{id}", response_model=dict)
async def update_work_case(
    id: int,
    case_in: WorkCaseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新工作案例"""
    case = await crud_work_case.update(id, case_in, db)
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="案例不存在")
    return {
        "code": 200,
        "message": "更新成功",
        "data": WorkCaseResponse.model_validate(case).model_dump(),
    }


@router.delete("/{id}", response_model=dict)
async def delete_work_case(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除工作案例"""
    case = await crud_work_case.delete(id, db)
    if case is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="案例不存在")
    return {"code": 200, "message": "删除成功", "data": None}
