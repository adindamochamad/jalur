import base64
import io
import logging
import os
import time
from typing import Optional

import cv2
import numpy as np
from fastapi import FastAPI, Request, UploadFile, File
from PIL import Image
from ultralytics import YOLO

try:
    from pi_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    pass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Jalur AI Service", version="0.1.0")

DIR_MODEL = os.path.join(os.path.dirname(__file__), "models")
PATH_MODEL_CUSTOM = os.path.join(DIR_MODEL, "pothole_yolov8.pt")
KELAS_POTHOLE_NAMES = {"pothole", "lubang", "hole"}

# Threshold deteksi: turunkan DETECT_CONF agar lebih banyak lubang terdeteksi (trade-off: false positive bisa naik)
DETECT_CONF = float(os.environ.get("DETECT_CONF", "0.2"))
DETECT_IOU = float(os.environ.get("DETECT_IOU", "0.7"))


@app.on_event("startup")
def load_model():
    if os.path.isfile(PATH_MODEL_CUSTOM):
        app.state.model = YOLO(PATH_MODEL_CUSTOM)
        app.state.model_path = PATH_MODEL_CUSTOM
    else:
        app.state.model = YOLO("yolov8n.pt")
        app.state.model_path = "yolov8n.pt"


def _raw_bytes_to_img(raw: bytes) -> Optional[np.ndarray]:
    if not raw:
        return None
    # Coba PIL dulu (lebih tahan terhadap variasi JPEG/PNG)
    try:
        pil_img = Image.open(io.BytesIO(raw))
        if pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")
        return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    except Exception:
        pass
    # Fallback: OpenCV dari buffer
    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is not None:
        return img
    img = cv2.imdecode(np.ascontiguousarray(arr), cv2.IMREAD_COLOR)
    if img is not None:
        return img
    return None


def _decode_image_base64(payload: str) -> Optional[np.ndarray]:
    if not payload or not isinstance(payload, str):
        return None
    s = payload.strip().replace("\r", "").replace("\n", "").replace(" ", "")
    if "," in s and s.startswith("data:"):
        s = s.split(",", 1)[1].strip()
    if not s:
        return None
    pad = 4 - (len(s) % 4)
    if pad != 4:
        s += "=" * pad
    try:
        raw = base64.b64decode(s, validate=False)
    except Exception:
        return None
    if not raw:
        return None

    arr = np.frombuffer(raw, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is not None:
        return img
    img = cv2.imdecode(np.ascontiguousarray(arr), cv2.IMREAD_COLOR)
    if img is not None:
        return img
    try:
        pil_img = Image.open(io.BytesIO(raw))
        if pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")
        return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    except Exception:
        return None


def _keparahan_dari_hasil(jumlah_lubang: int, confidence_rata: Optional[float]) -> str:
    if jumlah_lubang == 0:
        return "ringan"
    if jumlah_lubang >= 3:
        return "parah"
    if confidence_rata is not None and confidence_rata >= 0.7:
        return "parah"
    return "sedang"


@app.get("/")
def root(request: Request):
    model_path = getattr(request.app.state, "model_path", None)
    return {"service": "jalur-ai", "status": "ok", "model": model_path or "belum di-load"}


def _run_detection(img: np.ndarray, request: Request):
    mulai = time.perf_counter()
    model = getattr(request.app.state, "model", None)
    if model is None:
        return _respon_gagal("Model belum siap")

    try:
        results = model.predict(
            img,
            verbose=False,
            conf=DETECT_CONF,
            iou=DETECT_IOU,
        )
    except Exception as e:
        logger.exception("detect: inferensi gagal: %s", e)
        return _respon_gagal(f"Inferensi gagal: {e!s}")

    result = results[0]
    boxes = result.boxes
    names = result.names or {}

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
            if label_lower in KELAS_POTHOLE_NAMES or (len(names) == 1 and cls_id == 0):
                jumlah_lubang += 1
                conf = float(confs[i]) if i < len(confs) else 0.0
                conf_list.append(conf)
                deteksi_list.append({
                    "label": label,
                    "confidence": round(conf, 4),
                    "bbox": [round(x, 2) for x in xyxy[i].tolist()],
                })
        if conf_list:
            confidence_rata = float(np.mean(conf_list))

    keparahan = _keparahan_dari_hasil(jumlah_lubang, confidence_rata)

    foto_hasil_base64 = None
    try:
        img_plot = result.plot()
        if img_plot is not None:
            _, buf = cv2.imencode(".jpg", img_plot)
            if buf is not None:
                foto_hasil_base64 = base64.b64encode(buf.tobytes()).decode("ascii")
    except Exception:
        pass

    logger.info("detect: jumlah_lubang=%s keparahan=%s lama=%ss", jumlah_lubang, keparahan, round(time.perf_counter() - mulai, 3))
    return {
        "success": True,
        "message": "ok",
        "jumlah_lubang": jumlah_lubang,
        "keparahan": keparahan,
        "confidence": round(confidence_rata, 4) if confidence_rata is not None else None,
        "foto_hasil_base64": foto_hasil_base64,
        "deteksi": deteksi_list,
    }


@app.post("/detect")
async def detect(request: Request, image: UploadFile = File(..., alias="image")):
    raw = await image.read()
    img = _raw_bytes_to_img(raw)
    if img is None:
        return _respon_gagal("Gambar tidak valid")
    return _run_detection(img, request)


def _respon_gagal(message: str):
    return {
        "success": False,
        "message": message,
        "jumlah_lubang": 0,
        "keparahan": "ringan",
        "confidence": None,
        "foto_hasil_base64": None,
        "deteksi": [],
    }
