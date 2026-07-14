from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class AttendanceSessionCreate(BaseModel):
    class_id: str
    session_name: str
    date: Optional[date] = None


class AttendanceSessionResponse(BaseModel):
    id: str
    class_id: str
    session_name: str
    date: date
    created_at: datetime

    class Config:
        from_attributes = True


class AttendanceRecordCreate(BaseModel):
    session_id: str
    student_id: str


class AttendanceRecordResponse(BaseModel):
    id: str
    session_id: str
    student_id: str
    time_in: datetime

    class Config:
        from_attributes = True
