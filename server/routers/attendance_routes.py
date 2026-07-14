from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from server.database import get_supabase
from server.models.attendance_schema import (
    AttendanceSessionCreate,
    AttendanceSessionResponse,
    AttendanceRecordCreate,
    AttendanceRecordResponse,
)
from server.middleware.auth_middleware import get_current_user
from typing import List

router = APIRouter(prefix="/api/classes/{class_id}/attendance", tags=["attendance"])


@router.get("/sessions", response_model=List[AttendanceSessionResponse])
async def get_sessions(
    class_id: str,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    result = (
        db.table("attendance_sessions")
        .select("*")
        .eq("class_id", class_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.post("/sessions", response_model=AttendanceSessionResponse)
async def create_session(
    class_id: str,
    data: AttendanceSessionCreate,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    payload = data.model_dump()
    payload["class_id"] = class_id
    result = db.table("attendance_sessions").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create session")
    return result.data[0]


@router.get("/sessions/{session_id}", response_model=AttendanceSessionResponse)
async def get_session(
    class_id: str,
    session_id: str,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    result = (
        db.table("attendance_sessions")
        .select("*")
        .eq("id", session_id)
        .eq("class_id", class_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return result.data


@router.get("/sessions/{session_id}/records", response_model=List[AttendanceRecordResponse])
async def get_session_records(
    class_id: str,
    session_id: str,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    result = (
        db.table("attendance_records")
        .select("*, students(first_name, last_name, student_id)")
        .eq("session_id", session_id)
        .execute()
    )
    return result.data


@router.post("/sessions/{session_id}/records", response_model=AttendanceRecordResponse)
async def mark_attendance(
    class_id: str,
    session_id: str,
    data: AttendanceRecordCreate,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    payload = data.model_dump()
    payload["session_id"] = session_id
    result = db.table("attendance_records").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to mark attendance")
    return result.data[0]
