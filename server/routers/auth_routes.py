from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from server.database import get_service_client

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str


class SignupResponse(BaseModel):
    id: str
    email: str


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    user: dict


@router.post("/signup", response_model=SignupResponse)
async def signup(data: SignupRequest):
    db = get_service_client()
    auth_result = db.auth.sign_up({"email": data.email, "password": data.password})
    user = auth_result.user
    if not user:
        raise HTTPException(status_code=400, detail="Failed to create user")

    profile = {
        "id": user.id,
        "first_name": data.first_name,
        "last_name": data.last_name,
    }
    db.table("profiles").insert(profile).execute()

    return SignupResponse(id=user.id, email=user.email)


@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    db = get_service_client()
    try:
        auth_result = db.auth.sign_in_with_password(
            {"email": data.email, "password": data.password}
        )
        session = auth_result.session
        user = auth_result.user
        return LoginResponse(
            access_token=session.access_token,
            user={"id": user.id, "email": user.email},
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/logout")
async def logout():
    db = get_service_client()
    db.auth.sign_out()
    return {"message": "Logged out successfully"}
