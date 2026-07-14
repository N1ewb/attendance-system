from supabase import Client
from server.database import get_supabase
import logging

logger = logging.getLogger(__name__)


def upload_student_image(file_bytes: bytes, file_name: str, content_type: str) -> str:
    db = get_supabase()
    result = db.storage.from_("student-images").upload(
        path=file_name,
        file=file_bytes,
        file_options={"content-type": content_type},
    )
    public_url = db.storage.from_("student-images").get_public_url(file_name)
    return public_url


def delete_student_image(file_name: str) -> None:
    db = get_supabase()
    db.storage.from_("student-images").remove([file_name])


def get_signed_url(file_name: str, expiry: int = 3600) -> str:
    db = get_supabase()
    result = db.storage.from_("student-images").create_signed_url(
        path=file_name, expires_in=expiry
    )
    return result["signedURL"]
