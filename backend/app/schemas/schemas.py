# Pydantic v2 Schema 定义
# 所有模型的 Create / Update / Response 版本

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ==================== 通用响应 ====================

class ResponseBase(BaseModel):
    """统一 API 响应格式"""
    code: int = 200
    message: str = "success"
    data: Optional[dict | list | None] = None


# ==================== 用户 ====================

class UserCreate(BaseModel):
    username: str
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Token 响应"""
    access_token: str
    token_type: str = "bearer"


# ==================== 工作案例 ====================

class WorkCaseCreate(BaseModel):
    title: str
    hospital_name: str
    system_type: str
    problem: str
    reason: str
    solution: str
    cost_time: Optional[str] = None
    tags: list[str] = []


class WorkCaseUpdate(BaseModel):
    title: Optional[str] = None
    hospital_name: Optional[str] = None
    system_type: Optional[str] = None
    problem: Optional[str] = None
    reason: Optional[str] = None
    solution: Optional[str] = None
    cost_time: Optional[str] = None
    tags: Optional[list[str]] = None


class WorkCaseResponse(BaseModel):
    id: int
    title: str
    hospital_name: str
    system_type: str
    problem: str
    reason: str
    solution: str
    cost_time: Optional[str] = None
    tags: Optional[list[str]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== 故障案例 ====================

class FaultCaseCreate(BaseModel):
    title: str
    environment: str
    symptom: str
    root_cause: str
    solution: str
    prevention: Optional[str] = None
    tags: list[str] = []


class FaultCaseUpdate(BaseModel):
    title: Optional[str] = None
    environment: Optional[str] = None
    symptom: Optional[str] = None
    root_cause: Optional[str] = None
    solution: Optional[str] = None
    prevention: Optional[str] = None
    tags: Optional[list[str]] = None


class FaultCaseResponse(BaseModel):
    id: int
    title: str
    environment: str
    symptom: str
    root_cause: str
    solution: str
    prevention: Optional[str] = None
    tags: Optional[list[str]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== 实验记录 ====================

class LabCreate(BaseModel):
    title: str
    goal: str
    environment: Optional[str] = None
    steps: Optional[str] = None
    result: Optional[str] = None
    pitfalls: Optional[str] = None
    summary: Optional[str] = None


class LabUpdate(BaseModel):
    title: Optional[str] = None
    goal: Optional[str] = None
    environment: Optional[str] = None
    steps: Optional[str] = None
    result: Optional[str] = None
    pitfalls: Optional[str] = None
    summary: Optional[str] = None


class LabResponse(BaseModel):
    id: int
    title: str
    goal: str
    environment: Optional[str] = None
    steps: Optional[str] = None
    result: Optional[str] = None
    pitfalls: Optional[str] = None
    summary: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== 知识卡片 ====================

class KnowledgeCardCreate(BaseModel):
    question: str
    answer: str
    scenario: Optional[str] = None
    category: Optional[str] = None


class KnowledgeCardUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    scenario: Optional[str] = None
    category: Optional[str] = None


class KnowledgeCardResponse(BaseModel):
    id: int
    question: str
    answer: str
    scenario: Optional[str] = None
    category: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== 项目 ====================

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    github_url: Optional[str] = None
    status: Optional[str] = "进行中"
    version: Optional[str] = None
    next_plan: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    github_url: Optional[str] = None
    status: Optional[str] = None
    version: Optional[str] = None
    next_plan: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    github_url: Optional[str] = None
    status: Optional[str] = None
    version: Optional[str] = None
    next_plan: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== 每日日志 ====================

class DailyLogCreate(BaseModel):
    date: date
    asset_type: Optional[str] = None
    content: Optional[str] = None
    gain: Optional[str] = None
    problem: Optional[str] = None


class DailyLogUpdate(BaseModel):
    date: Optional[date] = None
    asset_type: Optional[str] = None
    content: Optional[str] = None
    gain: Optional[str] = None
    problem: Optional[str] = None


class DailyLogResponse(BaseModel):
    id: int
    date: Optional[date] = None
    asset_type: Optional[str] = None
    content: Optional[str] = None
    gain: Optional[str] = None
    problem: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== 时间记录 ====================

class TimeRecordCreate(BaseModel):
    date: date
    work_hours: float = 0.0
    study_hours: float = 0.0
    project_hours: float = 0.0
    entertainment_hours: float = 0.0
    other_hours: float = 0.0


class TimeRecordUpdate(BaseModel):
    date: Optional[date] = None
    work_hours: Optional[float] = None
    study_hours: Optional[float] = None
    project_hours: Optional[float] = None
    entertainment_hours: Optional[float] = None
    other_hours: Optional[float] = None


class TimeRecordResponse(BaseModel):
    id: int
    date: Optional[date] = None
    work_hours: float = 0.0
    study_hours: float = 0.0
    project_hours: float = 0.0
    entertainment_hours: float = 0.0
    other_hours: float = 0.0
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== 时间线事件 ====================

class TimelineEventCreate(BaseModel):
    event_title: str
    event_date: date
    event_type: Optional[str] = None
    description: Optional[str] = None


class TimelineEventUpdate(BaseModel):
    event_title: Optional[str] = None
    event_date: Optional[date] = None
    event_type: Optional[str] = None
    description: Optional[str] = None


class TimelineEventResponse(BaseModel):
    id: int
    event_title: str
    event_date: Optional[date] = None
    event_type: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
