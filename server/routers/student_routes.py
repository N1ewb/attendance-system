from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from server.database import get_supabase
from server.models.student_schema import StudentCreate, StudentResponse, StudentUpdate
from server.middleware.auth_middleware import get_current_user
from typing import List

router = APIRouter(prefix="/api/classes/{class_id}/students", tags=["students"])


@router.get("", response_model=List[StudentResponse])
async def get_students(
    class_id: str,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    result = (
        db.table("students")
        .select("*")
        .eq("class_id", class_id)
        .execute()
    )
    return result.data


@router.post("", response_model=StudentResponse)
async def add_student(
    class_id: str,
    data: StudentCreate,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    payload = data.model_dump()
    payload["class_id"] = class_id
    result = db.table("students").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to add student")
    return result.data[0]


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    class_id: str,
    student_id: str,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    result = (
        db.table("students")
        .select("*")
        .eq("id", student_id)
        .eq("class_id", class_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return result.data


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    class_id: str,
    student_id: str,
    data: StudentUpdate,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    payload = data.model_dump(exclude_unset=True)
    result = (
        db.table("students")
        .update(payload)
        .eq("id", student_id)
        .eq("class_id", class_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return result.data[0]


@router.delete("/{student_id}")
async def delete_student(
    class_id: str,
    student_id: str,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    result = (
        db.table("students")
        .delete()
        .eq("id", student_id)
        .eq("class_id", class_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"}
