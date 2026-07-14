from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from server.database import get_supabase
from server.models.class_schema import ClassCreate, ClassResponse, ClassUpdate
from server.middleware.auth_middleware import get_current_user
from typing import List

router = APIRouter(prefix="/api/classes", tags=["classes"])


@router.get("", response_model=List[ClassResponse])
async def get_classes(
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    result = db.table("classes").select("*").eq("user_id", user_id).execute()
    return result.data


@router.post("", response_model=ClassResponse)
async def create_class(
    data: ClassCreate,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    payload = data.model_dump()
    payload["user_id"] = user_id
    result = db.table("classes").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create class")
    return result.data[0]


@router.get("/{class_id}", response_model=ClassResponse)
async def get_class(
    class_id: str,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    result = (
        db.table("classes")
        .select("*")
        .eq("id", class_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Class not found")
    return result.data


@router.put("/{class_id}", response_model=ClassResponse)
async def update_class(
    class_id: str,
    data: ClassUpdate,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    payload = data.model_dump(exclude_unset=True)
    result = (
        db.table("classes")
        .update(payload)
        .eq("id", class_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Class not found")
    return result.data[0]


@router.delete("/{class_id}")
async def delete_class(
    class_id: str,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
):
    result = (
        db.table("classes")
        .delete()
        .eq("id", class_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"message": "Class deleted successfully"}
