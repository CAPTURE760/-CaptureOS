# 通用 CRUD 操作类
# 为每个模型提供 get / get_multi / create / update / delete / count 方法

from typing import TypeVar, Generic, Type, Optional
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.models import (
    User, WorkCase, FaultCase, Lab, KnowledgeCard,
    Project, DailyLog, TimeRecord, TimelineEvent,
)

ModelType = TypeVar("ModelType", bound=object)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType]):
    """通用 CRUD 基类，提供基本的数据库操作"""

    def __init__(self, model: Type[ModelType]):
        """初始化 CRUD 实例

        Args:
            model: SQLAlchemy 模型类
        """
        self.model = model

    async def get(self, id: int, db: AsyncSession) -> Optional[ModelType]:
        """根据 ID 获取单条记录"""
        result = await db.execute(select(self.model).where(self.model.id == id))
        return result.scalars().first()

    async def get_multi(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 20
    ) -> list[ModelType]:
        """获取多条记录（分页）"""
        result = await db.execute(
            select(self.model).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def create(self, schema: CreateSchemaType, db: AsyncSession) -> ModelType:
        """创建新记录"""
        obj_data = schema.model_dump()
        db_obj = self.model(**obj_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self, id: int, schema: UpdateSchemaType, db: AsyncSession
    ) -> Optional[ModelType]:
        """更新记录（只更新非 None 字段）"""
        db_obj = await self.get(id, db)
        if db_obj is None:
            return None
        update_data = schema.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, id: int, db: AsyncSession) -> Optional[ModelType]:
        """删除记录"""
        db_obj = await self.get(id, db)
        if db_obj is None:
            return None
        await db.delete(db_obj)
        await db.commit()
        return db_obj

    async def count(self, db: AsyncSession) -> int:
        """统计记录总数"""
        result = await db.execute(select(func.count()).select_from(self.model))
        return result.scalar_one()


# 为每个模型创建 CRUD 实例
crud_user = CRUDBase[User](User)
crud_work_case = CRUDBase[WorkCase](WorkCase)
crud_fault_case = CRUDBase[FaultCase](FaultCase)
crud_lab = CRUDBase[Lab](Lab)
crud_knowledge_card = CRUDBase[KnowledgeCard](KnowledgeCard)
crud_project = CRUDBase[Project](Project)
crud_daily_log = CRUDBase[DailyLog](DailyLog)
crud_time_record = CRUDBase[TimeRecord](TimeRecord)
crud_timeline_event = CRUDBase[TimelineEvent](TimelineEvent)
