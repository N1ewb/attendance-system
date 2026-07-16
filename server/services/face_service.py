import logging
import io
from typing import List, Optional, Any

import cv2
import numpy as np
from PIL import Image

from server.services.model_loader import get_yunet_path, get_sface_path

logger = logging.getLogger(__name__)

_face_detector = None
_face_recognizer = None


def _get_detector():
    global _face_detector
    if _face_detector is None:
        path = get_yunet_path()
        _face_detector = cv2.FaceDetectorYN.create(path, "", (320, 240))
    return _face_detector


def _get_recognizer():
    global _face_recognizer
    if _face_recognizer is None:
        path = get_sface_path()
        _face_recognizer = cv2.FaceRecognizerSF.create(path, "")
    return _face_recognizer


def _decode_image(image_bytes: bytes) -> Optional[np.ndarray]:
    try:
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return np.array(pil_image)[:, :, ::-1]
    except Exception as exc:
        logger.error("Failed to decode image: %s", exc)
        return None


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
            encoding = np.array(enc_data, dtype=np.float32)
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
    image = _decode_image(image_bytes)
    if image is None:
        return None

    height, width = image.shape[:2]
    detector = _get_detector()
    detector.setInputSize((width, height))
    _, faces = detector.detect(image)

    if faces is None or len(faces) == 0:
        logger.warning("No face detected in image")
        return None

    face = faces[0]
    x, y, w, h = map(int, face[:4])
    face_rect = cv2.Rect(x, y, w, h)

    try:
        recognizer = _get_recognizer()
        aligned = recognizer.alignCrop(image, face_rect)
        features = recognizer.feature(aligned)
        encoding = features.flatten().tolist()
        logger.info("Generated face encoding with %d dimensions", len(encoding))
        return encoding
    except Exception as exc:
        logger.error("Face encoding failed: %s", exc)
        return None


def recognize_face(
    unknown_encoding: Any,
    known_encodings: List[dict],
    tolerance: float = 0.6,
) -> Optional[str]:
    if not known_encodings:
        return None

    if isinstance(unknown_encoding, list):
        unknown_array = np.array(unknown_encoding, dtype=np.float32)
    else:
        unknown_array = unknown_encoding

    if unknown_array.ndim == 1:
        unknown_array = unknown_array.reshape(1, -1)

    best_id = None
    best_distance = float("inf")

    for entry in known_encodings:
        known = entry["encoding"]
        if known.ndim == 1:
            known = known.reshape(1, -1)
        try:
            distance = np.linalg.norm(unknown_array - known)
        except Exception:
            continue

        if distance < best_distance:
            best_distance = distance
            best_id = entry["student_id"]

    if best_distance < tolerance:
        logger.info("Matched student %s with distance %.3f", best_id, best_distance)
        return best_id

    logger.debug("Closest match distance %.3f exceeds tolerance %.3f", best_distance, tolerance)
    return None
