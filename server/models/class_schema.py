from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ClassCreate(BaseModel):
    subject_code: str
    offer_number: str
    description: Optional[str] = None
    units: int = 3


class ClassUpdate(BaseModel):
    subject_code: Optional[str] = None
    offer_number: Optional[str] = None
    description: Optional[str] = None
    units: Optional[int] = None


class ClassResponse(BaseModel):
    id: str
    user_id: str
    subject_code: str
    offer_number: str
    description: Optional[str] = None
    units: int
    created_at: datetime

    class Config:
        from_attributes = True
