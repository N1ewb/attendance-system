import logging
import time
import io
import base64

import socketio
import cv2
import numpy as np
from PIL import Image

from server.services.face_service import load_face_encodings, recognize_face

logger = logging.getLogger(__name__)

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
)

sessions = {}
active_streams = {}


def _decode_frame(data_uri: str):
    try:
        if "," in data_uri:
            encoded = data_uri.split(",", 1)[1]
        else:
            encoded = data_uri
        image_bytes = base64.b64decode(encoded)
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return np.array(pil_image)
    except Exception as exc:
        logger.error("Failed to decode frame: %s", exc)
        return None


@sio.event
async def connect(sid, environ, auth):
    logger.info("Client connected: %s", sid)


@sio.event
async def disconnect(sid):
    logger.info("Client disconnected: %s", sid)
    active_streams.pop(sid, None)
    sessions.pop(sid, None)


@sio.event
async def start_stream(sid, data):
    class_id = data.get("class_id")
    user_id = data.get("user_id")
    session_id = data.get("session_id")

    if not class_id or not user_id:
        await sio.emit("stream_error", {"message": "class_id and user_id required"}, to=sid)
        return

    try:
        encodings = load_face_encodings(class_id)
    except Exception as exc:
        logger.error("Failed to load face encodings: %s", exc)
        await sio.emit("stream_error", {"message": "Failed to load face encodings"}, to=sid)
        return

    active_streams[sid] = {
        "class_id": class_id,
        "user_id": user_id,
        "encodings": encodings,
        "session_id": session_id,
        "detected_ids": set(),
        "last_frame_time": 0.0,
    }

    logger.info(
        "Stream started for class %s by user %s (session %s)",
        class_id, user_id, session_id,
    )
    await sio.emit(
        "stream_started",
        {"status": "started", "session_id": session_id, "encodings_loaded": len(encodings)},
        to=sid,
    )


@sio.event
async def stop_stream(sid, data=None):
    stream = active_streams.pop(sid, None)
    if stream:
        logger.info(
            "Stream stopped for class %s, %d students detected",
            stream["class_id"], len(stream["detected_ids"]),
        )
    sessions.pop(sid, None)
    await sio.emit("stream_stopped", {"status": "stopped"}, to=sid)


@sio.event
async def frame(sid, data):
    stream = active_streams.get(sid)
    if not stream:
        return

    now = time.time()
    if now - stream["last_frame_time"] < 0.2:
        return
    stream["last_frame_time"] = now

    frame_data = data.get("data") if isinstance(data, dict) else data
    if not frame_data:
        return

    image = _decode_frame(frame_data)
    if image is None:
        return

    from server.services.model_loader import get_yunet_path, get_sface_path
    try:
        height, width = image.shape[:2]
        detector = cv2.FaceDetectorYN.create(get_yunet_path(), "", (width, height))
        detector.setInputSize((width, height))
        _, yunet_faces = detector.detect(image)
        if yunet_faces is None or len(yunet_faces) == 0:
            return
        face = yunet_faces[0]
    except Exception as exc:
        logger.error("Face detection error: %s", exc)
        return

    try:
        sface_path = get_sface_path()
        recognizer = cv2.FaceRecognizerSF.create(sface_path, "")
        x, y, w, h = map(int, face[:4])
        face_rect = cv2.Rect(x, y, w, h)
        aligned = recognizer.alignCrop(image, face_rect)
        unknown_encodings = [recognizer.feature(aligned).flatten()]
    except Exception as exc:
        logger.error("Face encoding error: %s", exc)
        return

    for unknown_encoding in unknown_encodings:
        student_id = recognize_face(unknown_encoding, stream["encodings"])
        if student_id and student_id not in stream["detected_ids"]:
            stream["detected_ids"].add(student_id)
            student_info = next(
                (e for e in stream["encodings"] if e["student_id"] == student_id),
                None,
            )
            if student_info:
                payload = {
                    "student_id": student_id,
                    "first_name": student_info["first_name"],
                    "last_name": student_info["last_name"],
                    "timestamp": time.time(),
                }
                await sio.emit("student_detected", payload, to=sid)
                logger.info(
                    "Detected %s %s (%s)",
                    student_info["first_name"], student_info["last_name"], student_id,
                )


@sio.event
async def load_student_data(sid, data):
    class_id = data.get("class_id") if isinstance(data, dict) else data
    if not class_id:
        return

    svc = get_service_client()
    result = (
        svc.table("students")
        .select("id, first_name, last_name, student_id, email, total_attendance, image_url")
        .eq("class_id", class_id)
        .execute()
    )
    await sio.emit("student_data_loaded", {"data": result.data or []}, to=sid)


@sio.event
async def load_images(sid, data=None):
    pass
