# 知识卡片路由
# CRUD 操作，支持分页、搜索、按 category 过滤

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.models.models import User, KnowledgeCard
from app.schemas.schemas import KnowledgeCardCreate, KnowledgeCardUpdate, KnowledgeCardResponse
from app.services.crud import crud_knowledge_card

router = APIRouter(prefix="/knowledge-cards", tags=["知识卡片"])


@router.get("", response_model=dict)
async def list_knowledge_cards(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(20, ge=1, le=100, description="每页记录数"),
    search: str | None = Query(None, description="搜索关键词"),
    category: str | None = Query(None, description="按分类过滤"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取知识卡片列表"""
    query = select(KnowledgeCard)

    # 搜索过滤：问题、答案、场景
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                KnowledgeCard.question.ilike(search_filter),
                KnowledgeCard.answer.ilike(search_filter),
                KnowledgeCard.scenario.ilike(search_filter),
            )
        )

    # 按分类过滤
    if category:
        query = query.where(KnowledgeCard.category == category)

    # 统计总数
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # 分页
    query = query.offset(skip).limit(limit).order_by(KnowledgeCard.created_at.desc())
    result = await db.execute(query)
    items = [KnowledgeCardResponse.model_validate(row).model_dump() for row in result.scalars().all()]

    return {
        "code": 200,
        "message": "success",
        "data": {"items": items, "total": total, "skip": skip, "limit": limit},
    }


@router.post("", response_model=dict)
async def create_knowledge_card(
    card_in: KnowledgeCardCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """创建知识卡片"""
    new_card = await crud_knowledge_card.create(card_in, db)
    return {
        "code": 200,
        "message": "创建成功",
        "data": KnowledgeCardResponse.model_validate(new_card).model_dump(),
    }


@router.get("/{id}", response_model=dict)
async def get_knowledge_card(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取知识卡片详情"""
    card = await crud_knowledge_card.get(id, db)
    if card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="知识卡片不存在")
    return {
        "code": 200,
        "message": "success",
        "data": KnowledgeCardResponse.model_validate(card).model_dump(),
    }


@router.put("/{id}", response_model=dict)
async def update_knowledge_card(
    id: int,
    card_in: KnowledgeCardUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """更新知识卡片"""
    card = await crud_knowledge_card.update(id, card_in, db)
    if card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="知识卡片不存在")
    return {
        "code": 200,
        "message": "更新成功",
        "data": KnowledgeCardResponse.model_validate(card).model_dump(),
    }


@router.delete("/{id}", response_model=dict)
async def delete_knowledge_card(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除知识卡片"""
    card = await crud_knowledge_card.delete(id, db)
    if card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="知识卡片不存在")
    return {"code": 200, "message": "删除成功", "data": None}
