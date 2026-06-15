# 项目路由
# CRUD 操作，支持分页、搜索、按 status 过滤

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.models.models import User, Project
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services.crud import crud_project

router = APIRouter(prefix="/projects", tags=["项目"])


@router.get("", response_model=dict)
async def list_projects(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(20, ge=1, le=100, description="每页记录数"),
    search: str | None = Query(None, description="搜索关键词"),
    status_filter: str | None = Query(None, alias="status", description="按状态过滤"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取项目列表"""
    query = select(Project)

    # 搜索过滤：名称、描述
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                Project.name.ilike(search_filter),
                Project.description.ilike(search_filter),
            )
        )

    # 按状态过滤
    if status_filter:
        query = query.where(Project.status == status_filter)

    # 统计总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # 分页
    query = query.offset(skip).limit(limit).order_by(Project.created_at.desc())
    result = await db.execute(query)
    items = [ProjectResponse.model_validate(row).model_dump() for row in result.scalars().all()]

    return {
        "code": 200,
        "message": "success",
        "data": {"items": items, "total": total, "skip": skip, "limit": limit},
    }


@router.post("", response_model=dict)
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建项目"""
    new_project = await crud_project.create(project_in, db)
    return {
        "code": 200,
        "message": "创建成功",
        "data": ProjectResponse.model_validate(new_project).model_dump(),
    }


@router.get("/{id}", response_model=dict)
async def get_project(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取项目详情"""
    project = await crud_project.get(id, db)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")
    return {
        "code": 200,
        "message": "success",
        "data": ProjectResponse.model_validate(project).model_dump(),
    }


@router.put("/{id}", response_model=dict)
async def update_project(
    id: int,
    project_in: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新项目"""
    project = await crud_project.update(id, project_in, db)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")
    return {
        "code": 200,
        "message": "更新成功",
        "data": ProjectResponse.model_validate(project).model_dump(),
    }


@router.delete("/{id}", response_model=dict)
async def delete_project(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除项目"""
    project = await crud_project.delete(id, db)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="项目不存在")
    return {"code": 200, "message": "删除成功", "data": None}
