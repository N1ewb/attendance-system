import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from socketio import ASGIApp
from server.config import get_settings
from server.routers import auth_routes, class_routes, student_routes, attendance_routes
from server.services.socket_manager import sio

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up Attendance System API")
    yield
    logger.info("Shutting down Attendance System API")


app = FastAPI(
    title="Attendance System API",
    description="FastAPI backend for the automated attendance system with face recognition",
    version="1.0.0",
    lifespan=lifespan,
)


@app.exception_handler(HTTPException)
async def structured_error_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "code": f"HTTP_{exc.status_code}",
        },
    )


@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception")
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "An unexpected error occurred",
            "code": "INTERNAL_ERROR",
        },
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(class_routes.router)
app.include_router(student_routes.router)
app.include_router(attendance_routes.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}


app = ASGIApp(sio, other_asgi_app=app)
