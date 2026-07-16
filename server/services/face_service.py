import logging
import io
from typing import List, Optional, Any

import face_recognition
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


def load_face_encodings(class_id: str) -> List[dict]:
    from server.database import get_service_client

    db = get_service_client()
    result = (
        db.table("students")
        .select("id, first_name, last_name, face_encoding")
        .eq("class_id", class_id)
        .not_.is_("face_encoding", "null")
        .execute()
    )
    students = []
    for row in result.data or []:
        enc_data = row.get("face_encoding")
        if not enc_data:
            continue
        try:
            encoding = np.array(enc_data, dtype=np.float64)
            students.append({
                "student_id": row["id"],
                "encoding": encoding,
                "first_name": row.get("first_name", ""),
                "last_name": row.get("last_name", ""),
            })
        except Exception:
            logger.warning("Failed to parse face_encoding for student %s", row.get("id"))
    logger.info("Loaded %d face encodings for class %s", len(students), class_id)
    return students


def generate_face_encoding(image_bytes: bytes) -> Optional[List[float]]:
    try:
        image = face_recognition.load_image_file(io.BytesIO(image_bytes))
    except Exception:
        try:
            pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            image = np.array(pil_image)
        except Exception as exc:
            logger.error("Failed to decode image: %s", exc)
            return None

    try:
        encodings = face_recognition.face_encodings(image)
    except Exception as exc:
        logger.error("face_recognition.face_encodings failed: %s", exc)
        return None

    if not encodings:
        logger.warning("No face detected in image")
        return None

    encoding = encodings[0].tolist()
    logger.info("Generated face encoding with %d dimensions", len(encoding))
    return encoding


def recognize_face(
    unknown_encoding: Any,
    known_encodings: List[dict],
    tolerance: float = 0.6,
) -> Optional[str]:
    if not known_encodings:
        return None

    known_arrays = [e["encoding"] for e in known_encodings]

    if isinstance(unknown_encoding, list):
        unknown_array = np.array(unknown_encoding, dtype=np.float64)
    else:
        unknown_array = unknown_encoding

    try:
        face_distances = face_recognition.face_distance(known_arrays, unknown_array)
    except Exception as exc:
        logger.error("face_distance calculation failed: %s", exc)
        return None

    if len(face_distances) == 0:
        return None

    best_idx = int(np.argmin(face_distances))
    best_distance = float(face_distances[best_idx])

    if best_distance < tolerance:
        matched = known_encodings[best_idx]
        logger.info(
            "Matched %s %s with distance %.3f",
            matched["first_name"],
            matched["last_name"],
            best_distance,
        )
        return matched["student_id"]

    logger.debug("Closest match distance %.3f exceeds tolerance %.3f", best_distance, tolerance)
    return None
