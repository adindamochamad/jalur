# Image Python 3.10 untuk layanan AI (FastAPI + YOLOv8)
FROM python:3.10-slim

# Dependensi sistem untuk OpenCV/Ultralytics (libgl1 = pengganti libgl1-mesa-glx di Debian baru)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependency Python dulu (agar layer cache dipakai saat kode berubah)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
