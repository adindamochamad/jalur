"""
Layanan AI deteksi jalan berlubang — FastAPI.
Endpoint /detect akan dipanggil oleh backend CI4 (internal only).
"""
import base64
import logging
import os
import time
from typing import Optional

import cv2
import numpy as np
from fastapi import FastAPI, Request
from pydantic import BaseModel
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Jalur AI Service", version="0.1.0")

# Path model custom; jika tidak ada, pakai yolov8n.pt (di-download otomatis)
DIR_MODEL = os.path.join(os.path.dirname(__file__), "models")
PATH_MODEL_CUSTOM = os.path.join(DIR_MODEL, "pothole_yolov8.pt")

# Hanya hitung deteksi yang kelasnya pothole (nama bisa "pothole", "lubang", atau class_id 0 jika model 1 kelas)
# Model custom pothole biasanya 1 kelas (pothole). Model COCO (yolov8n) tidak punya pothole — semua deteksi diabaikan.
KELAS_POTHOLE_NAMES = {"pothole", "lubang", "hole"}


@app.on_event("startup")
def load_model():   
    """Load model YOLO sekali saat startup, simpan di app.state."""
    if os.path.isfile(PATH_MODEL_CUSTOM):
        model = YOLO(PATH_MODEL_CUSTOM)
        app.state.model = model
        app.state.model_path = PATH_MODEL_CUSTOM
        logger.info("Model loaded: %s", PATH_MODEL_CUSTOM)
    else:
        # Fallback untuk development: model nano (ringan, di-download otomatis)
        model = YOLO("yolov8n.pt")
        app.state.model = model
        app.state.model_path = "yolov8n.pt"
        logger.info("Model custom tidak ditemukan, pakai fallback: yolov8n.pt")


class DetectRequest(BaseModel):
    """Body request POST /detect. image_base64 boleh dengan prefix data:image/...;base64,."""
    image_base64: str = ""


def _decode_image_base64(payload: str) -> Optional[np.ndarray]:
    """Decode string base64 jadi gambar (BGR numpy). Mengabaikan prefix data:image/...;base64,."""
    if not payload or not payload.strip():
        return None
    s = payload.strip()
    if "," in s and s.startswith("data:"):
        s = s.split(",", 1)[1]
    try:
        raw = base64.b64decode(s)
    except Exception:
        return None
    if not raw:
        return None
    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    return img


def _keparahan_dari_hasil(jumlah_lubang: int, confidence_rata: Optional[float]) -> str:
    """Tentukan keparahan dari jumlah deteksi dan confidence (rule sederhana)."""
    if jumlah_lubang == 0:
        return "ringan"
    if jumlah_lubang >= 3:
        return "parah"
    if confidence_rata is not None and confidence_rata >= 0.7:
        return "parah"
    return "sedang"


@app.get("/")
def root(request: Request):
    """Info service dan model yang sedang dipakai (untuk cek apakah pothole model ter-load)."""
    model_path = getattr(request.app.state, "model_path", None)
    return {
        "service": "jalur-ai",
        "status": "ok",
        "model": model_path or "belum di-load",
    }


@app.post("/detect")
def detect(body: DetectRequest, request: Request):
    """
    Terima gambar base64, jalankan inferensi YOLO, return jumlah_lubang, keparahan,
    confidence, foto_hasil_base64, dan daftar deteksi (label, confidence, bbox).
    """
    mulai = time.perf_counter()

    if not body.image_base64 or not body.image_base64.strip():
        logger.warning("detect: image_base64 kosong")
        return {
            "success": False,
            "message": "image_base64 wajib diisi",
            "jumlah_lubang": 0,
            "keparahan": "ringan",
            "confidence": None,
            "foto_hasil_base64": None,
            "deteksi": [],
        }

    img = _decode_image_base64(body.image_base64)
    if img is None:
        logger.warning("detect: decode base64 gagal")
        return {
            "success": False,
            "message": "Gambar tidak valid atau base64 gagal decode",
            "jumlah_lubang": 0,
            "keparahan": "ringan",
            "confidence": None,
            "foto_hasil_base64": None,
            "deteksi": [],
        }

    model = getattr(request.app.state, "model", None)
    if model is None:
        logger.error("detect: model belum di-load")
        return {
            "success": False,
            "message": "Model belum siap",
            "jumlah_lubang": 0,
            "keparahan": "ringan",
            "confidence": None,
            "foto_hasil_base64": None,
            "deteksi": [],
        }

    try:
        results = model.predict(img, verbose=False)
    except Exception as e:
        logger.exception("detect: inferensi gagal: %s", e)
        return {
            "success": False,
            "message": f"Inferensi gagal: {e!s}",
            "jumlah_lubang": 0,
            "keparahan": "ringan",
            "confidence": None,
            "foto_hasil_base64": None,
            "deteksi": [],
        }

    result = results[0]
    boxes = result.boxes
    names = result.names or {}

    # Hanya hitung deteksi yang kelasnya pothole; abaikan kelas lain (mobil, orang, dll.)
    jumlah_lubang = 0
    confidence_rata = None
    deteksi_list: list[dict] = []

    if boxes is not None and len(boxes.data) > 0:
        confs = boxes.conf
        if hasattr(confs, "cpu"):
            confs = confs.cpu().numpy()
        xyxy = boxes.xyxy
        cls_arr = boxes.cls
        if hasattr(xyxy, "cpu"):
            xyxy = xyxy.cpu().numpy()
        if hasattr(cls_arr, "cpu"):
            cls_arr = cls_arr.cpu().numpy()

        conf_list: list[float] = []
        for i in range(len(boxes.data)):
            cls_id = int(cls_arr[i]) if i < len(cls_arr) else 0
            label = names.get(cls_id, f"class_{cls_id}")
            label_lower = label.lower() if isinstance(label, str) else ""
            # Hitung hanya jika kelas termasuk pothole, atau model 1 kelas (id 0 = pothole)
            if label_lower in KELAS_POTHOLE_NAMES or (len(names) == 1 and cls_id == 0):
                jumlah_lubang += 1
                conf = float(confs[i]) if i < len(confs) else 0.0
                conf_list.append(conf)
                bbox = xyxy[i].tolist()
                deteksi_list.append({
                    "label": label,
                    "confidence": round(conf, 4),
                    "bbox": [round(x, 2) for x in bbox],
                })
        if conf_list:
            confidence_rata = float(np.mean(conf_list))

    keparahan = _keparahan_dari_hasil(jumlah_lubang, confidence_rata)

    # Gambar dengan bbox overlay, encode ke base64
    foto_hasil_base64 = None
    try:
        img_plot = result.plot()
        if img_plot is not None:
            _, buf = cv2.imencode(".jpg", img_plot)
            if buf is not None:
                foto_hasil_base64 = base64.b64encode(buf.tobytes()).decode("ascii")
    except Exception as e:
        logger.warning("detect: plot/g encode gagal: %s", e)

    lama_detik = round(time.perf_counter() - mulai, 3)
    logger.info("detect: jumlah_lubang=%s keparahan=%s lama=%ss", jumlah_lubang, keparahan, lama_detik)

    return {
        "success": True,
        "message": "ok",
        "jumlah_lubang": jumlah_lubang,
        "keparahan": keparahan,
        "confidence": round(confidence_rata, 4) if confidence_rata is not None else None,
        "foto_hasil_base64": foto_hasil_base64,
        "deteksi": deteksi_list,
    }
