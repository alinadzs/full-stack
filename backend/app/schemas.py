from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime


# ---------- USERS ----------
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3)
    email: Optional[EmailStr] = None


class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

# ---------- MEETINGS ----------
class MeetingBase(BaseModel):
    title: str = Field(..., min_length=3)
    description: Optional[str] = None
    meeting_date: Optional[date] = None
    owner_id: Optional[int] = None


class MeetingCreate(MeetingBase):
    pass


class MeetingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3)
    description: Optional[str] = None
    meeting_date: Optional[date] = None


class MeetingResponse(MeetingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ---------- TASKS ----------
class TaskBase(BaseModel):
    title: str = Field(..., min_length=3)
    description: Optional[str] = None
    status: Optional[str] = "pending"
    deadline: Optional[date] = None
    meeting_id: int
    assigned_to: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3)
    description: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[date] = None


class TaskResponse(TaskBase):
    id: int

    class Config:
        from_attributes = True