#!/usr/bin/env bash
# Unduh model pothole YOLOv8 (pre-trained) ke folder models/.
# Sumber: Hugging Face - peterhdd/pothole-detection-yolov8 (YOLOv8s, 1 kelas: pothole)

set -e
DIR_SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIR_AI="$(dirname "$DIR_SCRIPT")"
DIR_MODEL="${DIR_AI}/models"
FILE_MODEL="${DIR_MODEL}/pothole_yolov8.pt"
URL="https://huggingface.co/peterhdd/pothole-detection-yolov8/resolve/main/best.pt"

echo "Folder model: $DIR_MODEL"
mkdir -p "$DIR_MODEL"

if [ -f "$FILE_MODEL" ]; then
  echo "File sudah ada: $FILE_MODEL"
  echo "Hapus dulu jika ingin unduh ulang: rm $FILE_MODEL"
  exit 0
fi

echo "Mengunduh dari: $URL"
curl -L -o "$FILE_MODEL" "$URL"

if [ -f "$FILE_MODEL" ]; then
  echo "Selesai. Model disimpan di: $FILE_MODEL"
  echo "Restart AI service agar model diload: uvicorn main:app --host 0.0.0.0 --port 8000"
else
  echo "Gagal mengunduh."
  exit 1
fi
