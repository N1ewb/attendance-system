from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    student_id: str
    image_url: Optional[str] = None


class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    student_id: Optional[str] = None
    image_url: Optional[str] = None


class StudentResponse(BaseModel):
    id: str
    class_id: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    student_id: str
    image_url: Optional[str] = None
    face_encoding: Optional[Any] = None
    total_attendance: int
    last_attendance_time: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
