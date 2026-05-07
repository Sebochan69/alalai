import re
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator, ConfigDict

def validate_password_complexity(v: str) -> str:
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r'[A-Z]', v):
        raise ValueError("Password must contain at least one uppercase letter (A-Z)")
    if not re.search(r'[a-z]', v):
        raise ValueError("Password must contain at least one lowercase letter (a-z)")
    if not re.search(r'\d', v):
        raise ValueError("Password must contain at least one number (0-9)")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
        raise ValueError("Password must contain at least one special character")
    return v


class UserCreate(BaseModel):
    username: str
    email_address: EmailStr
    password: str
    location_assigned: str

    @field_validator('password')
    @classmethod
    def check_password(cls, v: str) -> str:
        return validate_password_complexity(v)


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


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_new_password: str

    @field_validator('new_password')
    @classmethod
    def check_password(cls, v: str) -> str:
        return validate_password_complexity(v)

    @model_validator(mode='after')
    def check_passwords_match(self):
        if self.new_password != self.confirm_new_password:
            raise ValueError("New passwords do not match")
        return self

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    username: str
    email_address: EmailStr
    role: str
    location_assigned: Optional[str] = None



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
    media: Optional[str] = None
    ai_summary: Optional[str] = None
    dispatch_reason: Optional[str] = None
    ai_processed_complaint: Optional[str] = None
    possible_duplicate_report_id: Optional[int] = None
    status: str
    admin_comment: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


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
    message: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    reply: str


class ComplaintTaggingResult(BaseModel):
    tagging: str = Field(
        description="Category of the complaint (e.g., Waste, Pothole, Noise)")
    priority: str = Field(
        description="Priority level: Low, Medium, High, or Urgent")
    summary: str = Field(
        description="short summary shown to admins/citizens and used in analytics.")

    @field_validator('tagging')
    @classmethod
    def check_valid_tag(cls, v: str) -> str:
        valid_tags = [
            "garbage", "flooding", "noise", "road_damage", "illegal_parking",
            "vandalism", "street_light", "drainage_clog", "water_leak",
            "power_outage", "dangling_wires", "open_manhole", "broken_sidewalk",
            "sidewalk_obstruction", "abandoned_vehicle", "illegal_terminal",
            "traffic_congestion", "reckless_driving", "loitering", "curfew_violation",
            "public_intoxication", "drug_related_activity", "theft_robbery",
            "stray_animals", "burning_trash", "sewage_leak", "stagnant_water",
            "overgrown_vegetation", "illegal_dumping", "boundary_dispute",
            "illegal_construction", "verbal_harassment", "other"
        ]
        if v not in valid_tags:
            return "other"
        return v

    @field_validator('priority')
    @classmethod
    def check_valid_priority(cls, v: str) -> str:
        valid_priorities = {"low", "medium", "high", "urgent"}
        if v.lower() not in valid_priorities:
            raise ValueError(f"Priority must be one of {valid_priorities}")
        return v.lower()

class AdminCreate(BaseModel):
    username: str
    email_address: EmailStr
    password: str
    location_assigned: str

    @field_validator('password')
    @classmethod
    def check_password(cls, v: str) -> str:
        return validate_password_complexity(v)

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email_address: Optional[EmailStr] = None
    location_assigned: Optional[str] = None

UserCreate.model_rebuild()
AdminCreate.model_rebuild()
ChangePasswordRequest.model_rebuild()
UserUpdate.model_rebuild()
UserResponse.model_rebuild()
ReportOut.model_rebuild()
MonthlyReportOut.model_rebuild()
