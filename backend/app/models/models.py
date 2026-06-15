# SQLAlchemy 数据库模型定义
# 所有表使用 SQLite 数据库，datetime 默认值使用 func.now()

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON, Date, UniqueConstraint
from sqlalchemy.sql import func
from app.database.db import Base


class User(Base):
    """用户表"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class WorkCase(Base):
    """工作案例表 - 记录工作项目中的案例"""
    __tablename__ = "work_cases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    hospital_name = Column(String(200), nullable=False, comment="医院名称")
    system_type = Column(String(100), nullable=False, comment="系统类型")
    problem = Column(Text, nullable=False, comment="问题描述")
    reason = Column(Text, nullable=False, comment="原因分析")
    solution = Column(Text, nullable=False, comment="解决方案")
    cost_time = Column(String(100), comment="耗时")
    tags = Column(JSON, default=list, comment="标签列表")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class FaultCase(Base):
    """故障案例表 - 记录故障排查过程"""
    __tablename__ = "fault_cases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    environment = Column(Text, nullable=False, comment="环境信息")
    symptom = Column(Text, nullable=False, comment="故障现象")
    root_cause = Column(Text, nullable=False, comment="根本原因")
    solution = Column(Text, nullable=False, comment="解决方案")
    prevention = Column(Text, comment="预防措施")
    tags = Column(JSON, default=list, comment="标签列表")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Lab(Base):
    """实验记录表 - 记录技术实验"""
    __tablename__ = "labs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    goal = Column(Text, nullable=False, comment="实验目标")
    environment = Column(Text, comment="实验环境")
    steps = Column(Text, comment="实验步骤")
    result = Column(Text, comment="实验结果")
    pitfalls = Column(Text, comment="踩坑记录")
    summary = Column(Text, comment="总结")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class KnowledgeCard(Base):
    """知识卡片表 - 问答式知识记录"""
    __tablename__ = "knowledge_cards"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    question = Column(Text, nullable=False, comment="问题")
    answer = Column(Text, nullable=False, comment="答案")
    scenario = Column(Text, comment="应用场景")
    category = Column(String(100), comment="分类")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Project(Base):
    """项目表 - 管理个人项目"""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, comment="项目描述")
    github_url = Column(String(500), comment="GitHub 地址")
    status = Column(String(50), default="进行中", comment="项目状态")
    version = Column(String(50), comment="当前版本")
    next_plan = Column(Text, comment="下一步计划")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class DailyLog(Base):
    """每日日志表"""
    __tablename__ = "daily_logs"
    __table_args__ = (UniqueConstraint("date", name="uq_daily_logs_date"),)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(Date, nullable=False, comment="日志日期")
    asset_type = Column(String(50), comment="资产类型")
    content = Column(Text, comment="日志内容")
    gain = Column(Text, comment="收获")
    problem = Column(Text, comment="遇到的问题")
    created_at = Column(DateTime, server_default=func.now())


class TimeRecord(Base):
    """时间记录表 - 每日时间分配"""
    __tablename__ = "time_records"
    __table_args__ = (UniqueConstraint("date", name="uq_time_records_date"),)

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(Date, nullable=False, comment="记录日期")
    work_hours = Column(Float, default=0.0, comment="工作时长")
    study_hours = Column(Float, default=0.0, comment="学习时长")
    project_hours = Column(Float, default=0.0, comment="项目时长")
    entertainment_hours = Column(Float, default=0.0, comment="娱乐时长")
    other_hours = Column(Float, default=0.0, comment="其他时长")
    created_at = Column(DateTime, server_default=func.now())


class TimelineEvent(Base):
    """时间线事件表"""
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_title = Column(String(200), nullable=False, comment="事件标题")
    event_date = Column(Date, nullable=False, comment="事件日期")
    event_type = Column(String(50), comment="事件类型")
    description = Column(Text, comment="事件描述")
    created_at = Column(DateTime, server_default=func.now())
