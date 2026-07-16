import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"

YUNET_URL = (
    "https://huggingface.co/opencv/face_detection_yunet/resolve/main/"
    "face_detection_yunet_2023mar.onnx"
)
YUNET_FILENAME = "yunet.onnx"

SFACE_URL = (
    "https://huggingface.co/opencv/face_recognition_sface/resolve/main/"
    "face_recognition_sface_2021dec.onnx"
)
SFACE_FILENAME = "sface.onnx"


def _ensure_model_dir():
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    return MODEL_DIR


def _download(url: str, dest: Path, label: str):
    if dest.exists():
        return
    logger.info("Downloading %s from Hugging Face...", label)
    import httpx
    resp = httpx.get(url, follow_redirects=True, timeout=120)
    resp.raise_for_status()
    with open(dest, "wb") as f:
        f.write(resp.content)
    logger.info("%s downloaded: %s (%.1f MB)", label, dest, len(resp.content) / 1e6)


def get_yunet_path() -> str:
    path = _ensure_model_dir() / YUNET_FILENAME
    _download(YUNET_URL, path, "YuNet face detection model")
    return str(path)


def get_sface_path() -> str:
    path = _ensure_model_dir() / SFACE_FILENAME
    _download(SFACE_URL, path, "SFace face recognition model")
    return str(path)
