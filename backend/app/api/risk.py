# 风险状态路由
# 基于资产停滞天数评估风险等级

from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.models.models import (
    User, WorkCase, FaultCase, Lab, KnowledgeCard, Project,
)

router = APIRouter(prefix="/risk", tags=["风险预警"])


def _calculate_risk_level(stagnation_days: int) -> dict:
    """根据停滞天数计算风险等级

    风险等级规则：
    - 0-2 天：正常（绿色）
    - 3-6 天：黄色预警
    - 7-13 天：橙色预警
    - 14+ 天：红色预警
    """
    if stagnation_days <= 2:
        return {
            "level": "正常",
            "color": "green",
            "emoji": "🟢",
            "message": "资产积累正常，继续保持！",
        }
    elif stagnation_days <= 6:
        return {
            "level": "黄色预警",
            "color": "yellow",
            "emoji": "🟡",
            "message": "已经有几天没有新增资产了，建议记录一下最近的工作。",
        }
    elif stagnation_days <= 13:
        return {
            "level": "橙色预警",
            "color": "orange",
            "emoji": "🟠",
            "message": "资产积累停滞较久，知识资产正在贬值，尽快补充！",
        }
    else:
        return {
            "level": "红色预警",
            "color": "red",
            "emoji": "🔴",
            "message": "严重停滞！知识资产大量贬值，必须立即行动！",
        }


@router.get("/status", response_model=dict)
async def get_risk_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取当前风险状态

    基于资产停滞天数评估风险等级：正常/黄色/橙色/红色
    """
    # 查询所有资产表中最近创建时间
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
        stagnation_days = 999
    else:
        last_activity = max(latest_dates)
        stagnation_days = (date.today() - last_activity).days

    risk = _calculate_risk_level(stagnation_days)

    return {
        "code": 200,
        "message": "success",
        "data": {
            "stagnation_days": stagnation_days,
            **risk,
        },
    }


@router.get("/alerts", response_model=dict)
async def get_risk_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """获取风险详情

    分资产类别显示各类资产的停滞情况
    """
    alerts = []
    today = date.today()

    # 检查各资产类别的停滞情况
    asset_checks = [
        ("工作案例", WorkCase),
        ("故障案例", FaultCase),
        ("实验记录", Lab),
        ("知识卡片", KnowledgeCard),
        ("项目", Project),
    ]

    for asset_name, model in asset_checks:
        result = await db.execute(
            select(func.max(model.created_at)).select_from(model)
        )
        last_date = result.scalar_one_or_none()

        if last_date is None:
            alerts.append({
                "asset_type": asset_name,
                "stagnation_days": None,
                "status": "从未记录",
                "risk": _calculate_risk_level(999),
            })
        else:
            stagnation = (today - last_date.date()).days
            alerts.append({
                "asset_type": asset_name,
                "stagnation_days": stagnation,
                "last_activity": str(last_date.date()),
                "status": _calculate_risk_level(stagnation)["level"],
                "risk": _calculate_risk_level(stagnation),
            })

    # 整体风险
    all_stagnation = [a["stagnation_days"] for a in alerts if a["stagnation_days"] is not None]
    max_stagnation = max(all_stagnation) if all_stagnation else 999
    overall_risk = _calculate_risk_level(max_stagnation)

    return {
        "code": 200,
        "message": "success",
        "data": {
            "overall_risk": overall_risk,
            "max_stagnation_days": max_stagnation,
            "alerts": alerts,
        },
    }
