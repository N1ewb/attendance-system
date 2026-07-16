import httpx
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from server.database import get_supabase
from server.models.student_schema import StudentCreate, StudentResponse, StudentUpdate
from server.middleware.auth_middleware import get_current_user, get_access_token
from server.services.face_service import generate_face_encoding
from server.services.storage_service import get_signed_url
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


@router.post("/{student_id}/encode")
async def encode_student_face(
    class_id: str,
    student_id: str,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
    token: str = Depends(get_access_token),
):
    db.auth.set_session(token, "")

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

    student = result.data
    image_url = student.get("image_url")
    if not image_url:
        return {
            "status": "success",
            "encoding_generated": False,
            "message": "Student has no image.",
        }

    signed = get_signed_url(image_url)
    if not signed:
        return {
            "status": "success",
            "encoding_generated": False,
            "message": "Could not retrieve student image.",
        }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(signed)
        resp.raise_for_status()
        image_bytes = resp.content

    encoding = generate_face_encoding(image_bytes)
    if encoding is None:
        return {
            "status": "success",
            "encoding_generated": False,
            "message": "No face detected in image.",
        }

    db.table("students").update({"face_encoding": encoding}).eq("id", student_id).execute()

    return {
        "status": "success",
        "encoding_generated": True,
        "message": f"Face encoding generated for {student.get('first_name')} {student.get('last_name')}.",
    }


@router.post("/encode-all")
async def encode_all_students(
    class_id: str,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user),
    token: str = Depends(get_access_token),
):
    db.auth.set_session(token, "")

    result = (
        db.table("students")
        .select("id, first_name, last_name, image_url")
        .eq("class_id", class_id)
        .is_("face_encoding", "null")
        .execute()
    )
    students = result.data or []
    total = len(students)
    success = 0
    failed = 0
    errors = []

    for student in students:
        try:
            image_url = student.get("image_url")
            if not image_url:
                failed += 1
                errors.append(f"{student.get('first_name')} {student.get('last_name')}: no image")
                continue

            signed = get_signed_url(image_url)
            if not signed:
                failed += 1
                errors.append(f"{student.get('first_name')} {student.get('last_name')}: could not retrieve image")
                continue

            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.get(signed)
                resp.raise_for_status()
                image_bytes = resp.content

            encoding = generate_face_encoding(image_bytes)
            if encoding is None:
                failed += 1
                errors.append(f"{student.get('first_name')} {student.get('last_name')}: no face detected")
                continue

            db.table("students").update({"face_encoding": encoding}).eq("id", student["id"]).execute()
            success += 1
        except Exception as exc:
            failed += 1
            errors.append(f"{student.get('first_name')} {student.get('last_name')}: {exc}")

    return {
        "total": total,
        "success": success,
        "failed": failed,
        "errors": errors,
    }
