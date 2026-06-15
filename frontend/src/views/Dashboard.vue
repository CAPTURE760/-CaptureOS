# 仪表盘路由
# 统计数据、趋势分析、风险预警

from datetime import date, timedelta, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.models.models import (
    User, WorkCase, FaultCase, Lab, KnowledgeCard,
    Project, DailyLog, TimeRecord, TimelineEvent,
)

router = APIRouter(prefix="/dashboard", tags=["仪表盘"])


@router.get("/stats", response_model=dict)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取所有资产计数统计"""
    wc = (await db.execute(select(func.count()).select_from(WorkCase))).scalar_one()
    fc = (await db.execute(select(func.count()).select_from(FaultCase))).scalar_one()
    lc = (await db.execute(select(func.count()).select_from(Lab))).scalar_one()
    kc = (await db.execute(select(func.count()).select_from(KnowledgeCard))).scalar_one()
    pc = (await db.execute(select(func.count()).select_from(Project))).scalar_one()

    return {
        "code": 200,
        "message": "success",
        "data": {
            "work_cases": wc,
            "fault_cases": fc,
            "labs": lc,
            "knowledge_cards": kc,
            "projects": pc,
            "total": wc + fc + lc + kc + pc,
        },
    }


@router.get("/today", response_model=dict)
async def get_today_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取今日新增资产统计"""
    today = date.today()
    today_start = datetime.combine(today, datetime.min.time())

    wc = (await db.execute(
        select(func.count()).select_from(WorkCase).where(WorkCase.created_at >= today_start)
    )).scalar_one()
    fc = (await db.execute(
        select(func.count()).select_from(FaultCase).where(FaultCase.created_at >= today_start)
    )).scalar_one()
    lc = (await db.execute(
        select(func.count()).select_from(Lab).where(Lab.created_at >= today_start)
    )).scalar_one()
    kc = (await db.execute(
        select(func.count()).select_from(KnowledgeCard).where(KnowledgeCard.created_at >= today_start)
    )).scalar_one()

    return {
        "code": 200,
        "message": "success",
        "data": {
            "date": str(today),
            "work_cases": wc,
            "fault_cases": fc,
            "labs": lc,
            "knowledge_cards": kc,
            "total": wc + fc + lc + kc,
        },
    }


@router.get("/streak", response_model=dict)
async def get_streak(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取连续记录天数"""
    result = await db.execute(
        select(DailyLog.date).order_by(DailyLog.date.desc())
    )
    dates = [row[0] for row in result.all()]

    if not dates:
        return {"code": 200, "message": "success", "data": {"streak": 0}}

    streak = 1
    for i in range(1, len(dates)):
        if dates[i - 1] - dates[i] == timedelta(days=1):
            streak += 1
        else:
            break

    if dates[0] < date.today() - timedelta(days=1):
        streak = 0

    return {
        "code": 200,
        "message": "success",
        "data": {"streak": streak, "last_date": str(dates[0]) if dates else None},
    }


@router.get("/stagnation", response_model=dict)
async def get_stagnation(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取资产停滞天数"""
    tables = [WorkCase, FaultCase, Lab, KnowledgeCard, Project]
    latest_dates = []

    for table in tables:
        result = await db.execute(
            select(func.max(table.created_at)).select_from(table)
        )
        max_date = result.scalar_one_or_none()
        if max_date:
            latest_dates.append(max_date.date())

    if not latest_dates:
        return {
            "code": 200,
            "message": "success",
            "data": {"stagnation_days": 999, "last_activity": None},
        }

    last_activity = max(latest_dates)
    stagnation_days = (date.today() - last_activity).days

    return {
        "code": 200,
        "message": "success",
        "data": {
            "stagnation_days": stagnation_days,
            "last_activity": str(last_activity),
        },
    }


@router.get("/monthly-trend", response_model=dict)
async def get_monthly_trend(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取最近12个月的资产增长趋势"""
    trend = []
    today = date.today()

    for i in range(11, -1, -1):
        month_date = today - timedelta(days=i * 30)
        year, month = month_date.year, month_date.month
        month_start = datetime(year, month, 1)
        if month == 12:
            month_end = datetime(year + 1, 1, 1)
        else:
            month_end = datetime(year, month + 1, 1)

        wc = (await db.execute(
            select(func.count()).select_from(WorkCase).where(
                and_(WorkCase.created_at >= month_start, WorkCase.created_at < month_end)
            )
        )).scalar_one()
        fc = (await db.execute(
            select(func.count()).select_from(FaultCase).where(
                and_(FaultCase.created_at >= month_start, FaultCase.created_at < month_end)
            )
        )).scalar_one()
        lc = (await db.execute(
            select(func.count()).select_from(Lab).where(
                and_(Lab.created_at >= month_start, Lab.created_at < month_end)
            )
        )).scalar_one()
        kc = (await db.execute(
            select(func.count()).select_from(KnowledgeCard).where(
                and_(KnowledgeCard.created_at >= month_start, KnowledgeCard.created_at < month_end)
            )
        )).scalar_one()

        trend.append({
            "month": f"{year}-{month:02d}",
            "work_cases": wc,
            "fault_cases": fc,
            "labs": lc,
            "knowledge_cards": kc,
            "total": wc + fc + lc + kc,
        })

    return {"code": 200, "message": "success", "data": trend}


@router.get("/category-ratio", response_model=dict)
async def get_category_ratio(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取资产分类占比"""
    wc = (await db.execute(select(func.count()).select_from(WorkCase))).scalar_one()
    fc = (await db.execute(select(func.count()).select_from(FaultCase))).scalar_one()
    lc = (await db.execute(select(func.count()).select_from(Lab))).scalar_one()
    kc = (await db.execute(select(func.count()).select_from(KnowledgeCard))).scalar_one()
    pc = (await db.execute(select(func.count()).select_from(Project))).scalar_one()
    total = wc + fc + lc + kc + pc

    return {
        "code": 200,
        "message": "success",
        "data": {
            "work_cases": {"count": wc, "ratio": round(wc / total, 4) if total else 0},
            "fault_cases": {"count": fc, "ratio": round(fc / total, 4) if total else 0},
            "labs": {"count": lc, "ratio": round(lc / total, 4) if total else 0},
            "knowledge_cards": {"count": kc, "ratio": round(kc / total, 4) if total else 0},
            "projects": {"count": pc, "ratio": round(pc / total, 4) if total else 0},
            "total": total,
        },
    }
