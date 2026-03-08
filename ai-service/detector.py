"""
Modul deteksi lubang jalan (YOLOv8).
Hari 3: load model, predict, hitung jumlah_lubang & keparahan.
Saat ini placeholder agar struktur siap.
"""

# Nanti: from ultralytics import YOLO
# model = YOLO("models/pothole_yolov8.pt") atau yolov8n.pt


def deteksi_lubang(_image_base64: str) -> dict:
    """
    Placeholder. Hari 3: decode base64 -> image, model.predict(), return
    { "jumlah_lubang", "keparahan", "confidence", "foto_hasil_base64", "deteksi" }.
    """
    return {
        "success": True,
        "jumlah_lubang": 0,
        "keparahan": "ringan",
        "confidence": 0.0,
        "message": "ok",
    }
