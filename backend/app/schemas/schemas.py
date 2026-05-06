from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[EmailStr] = None
    user_id: Optional[int] = None
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email_address: EmailStr
    role: str
    location_assigned: Optional[str] = None

    class Config:
        from_attributes = True


class ReportBase(BaseModel):
    address: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ReportStatusUpdate(BaseModel):
    status: str
    admin_comment: Optional[str] = None


class ReportOut(BaseModel):
    id: int
    address: str
    description: str
    location_area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    tag: Optional[str] = None
    priority: Optional[str] = None
    ai_summary: Optional[str] = None
    dispatch_reason: Optional[str] = None
    ai_processed_complaint: Optional[str] = None
    possible_duplicate_report_id: Optional[int] = None
    status: str
    admin_comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MonthlyReportOut(BaseModel):
    id: int
    month: str
    overall_complaint_count: int
    overall_completion_rate: int
    forecast: Optional[str] = None
    suggest_actions: list[str] = Field(default_factory=list)
    avg_solution_days: int
    category_breakdown: dict[str, int] = Field(default_factory=dict)
    created_at: datetime


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str