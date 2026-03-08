#!/usr/bin/env python3
"""
Evaluasi model YOLO pada dataset pothole: hitung mAP50, mAP50-95, precision, recall.

Cara pakai (dari folder ai-service):
  1. Pastikan dataset sudah ada di datasets/pothole-yolov8/ (lihat datasets/README.md).
  2. Sesuaikan data/pothole.yaml jika struktur folder dataset berbeda.
  3. Jalankan:
       python scripts/evaluate.py
       python scripts/evaluate.py --model models/pothole_yolov8.pt
       python scripts/evaluate.py --data data/pothole.yaml
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

DIR_AI_SERVICE = Path(__file__).resolve().parent.parent
DIR_MODEL = DIR_AI_SERVICE / "models"
PATH_MODEL_CUSTOM = DIR_MODEL / "pothole_yolov8.pt"
PATH_DATA_YAML = DIR_AI_SERVICE / "data" / "pothole.yaml"


def main():
    parser = argparse.ArgumentParser(description="Evaluasi model YOLO pada dataset pothole")
    parser.add_argument(
        "--model",
        type=str,
        default=str(PATH_MODEL_CUSTOM) if PATH_MODEL_CUSTOM.exists() else "yolov8n.pt",
        help="Path ke model .pt atau nama model (default: models/pothole_yolov8.pt atau yolov8n.pt)",
    )
    parser.add_argument(
        "--data",
        type=str,
        default=str(PATH_DATA_YAML),
        help="Path ke data.yaml (default: data/pothole.yaml)",
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help="Ukuran gambar untuk validasi (default: 640)",
    )
    args = parser.parse_args()

    os.chdir(DIR_AI_SERVICE)
    sys.path.insert(0, str(DIR_AI_SERVICE))

    if not Path(args.data).exists():
        print(f"File data tidak ditemukan: {args.data}")
        print("Letakkan dataset di datasets/pothole-yolov8/ (lihat ai-service/datasets/README.md)")
        print("Lalu sesuaikan path train/val di data/pothole.yaml sesuai struktur folder.")
        sys.exit(1)

    from ultralytics import YOLO

    print(f"Memuat model: {args.model}")
    model = YOLO(args.model)
    print(f"Validasi dengan data: {args.data}")
    metrics = model.val(data=args.data, imgsz=args.imgsz, verbose=True)

    # metrics: DetMetrics, punya .box (Metric) dengan .mp, .mr, .map50, .map
    box = metrics.box
    mean = metrics.mean_results()  # [precision, recall, mAP50, mAP50-95]
    print("\n" + "=" * 50)
    print("HASIL EVALUASI (validation set)")
    print("=" * 50)
    print(f"  Precision:  {mean[0]:.4f}")
    print(f"  Recall:     {mean[1]:.4f}")
    print(f"  mAP50:      {mean[2]:.4f}")
    print(f"  mAP50-95:   {mean[3]:.4f}")
    print("=" * 50)
    print("\nKeterangan: mAP50 = mean Average Precision @ IoU 0.5, mAP50-95 = rata-rata mAP untuk IoU 0.5 s.d. 0.95.")


if __name__ == "__main__":
    main()
