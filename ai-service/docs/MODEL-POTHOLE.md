# Model Deteksi Pothole

Service AI akan mendeteksi lubang jalan hanya jika ada **model pothole** di `models/pothole_yolov8.pt`. Tanpa file ini, service memakai fallback `yolov8n.pt` (COCO) yang **tidak punya kelas pothole** → `jumlah_lubang` selalu 0.

---

## Opsi 1: Pakai model pre-trained (rekomendasi dulu)

Paling cepat: unduh model yang sudah dilatih untuk pothole, taruh di `models/`, restart service.

### Langkah

**1. Unduh model** (dari folder `ai-service`):

```bash
cd ai-service
chmod +x scripts/download_pothole_model.sh
./scripts/download_pothole_model.sh
```

Atau manual:

```bash
mkdir -p models
curl -L -o models/pothole_yolov8.pt "https://huggingface.co/peterhdd/pothole-detection-yolov8/resolve/main/best.pt"
```

**2. Restart AI service**

Hentikan uvicorn (Ctrl+C), lalu jalankan lagi:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Di log harus muncul: `Model loaded: .../models/pothole_yolov8.pt`.

**3. Tes deteksi**

```bash
python scripts/test_detect.py datasets/pothole-detection-dataset/potholes/63.jpg
```

Jika model cocok, Anda akan melihat `jumlah_lubang` > 0 dan `keparahan`/`confidence` terisi.

### Sumber model

| Sumber | Keterangan |
|--------|------------|
| [peterhdd/pothole-detection-yolov8](https://huggingface.co/peterhdd/pothole-detection-yolov8) | YOLOv8s, 1 kelas (pothole), ~22 MB. Dipakai skrip unduh di atas. |
| [Harisanth/Pothole-Finetuned-YOLOv8](https://huggingface.co/Harisanth/Pothole-Finetuned-YOLOv8) | YOLOv8 medium. Unduh dari Hugging Face lalu rename/copy `best.pt` → `models/pothole_yolov8.pt`. |

---

## Opsi 2: Training sendiri

Berguna jika gambar Anda sangat berbeda (mis. kamera lain, kondisi jalan lain) dan model pre-trained kurang akurat.

### Yang dibutuhkan

1. **Dataset berlabel YOLO**: setiap gambar punya file `.txt` dengan format  
   `class_id x_center y_center width height` (normalisasi 0–1).  
   Dataset Anda saat ini (`potholes/` + `normal/`) hanya berisi gambar; untuk YOLO perlu **bounding box** tiap lubang.

2. **Labeling**: pakai [Roboflow](https://roboflow.com/), [LabelImg](https://github.com/HumanSignal/labelImg), atau [CVAT](https://www.cvat.ai/).  
   Atau pakai dataset pothole yang sudah berlabel (mis. dari Roboflow Universe) lalu train.

3. **Training** (contoh dengan Ultralytics):

   ```bash
   yolo detect train data=data.yaml model=yolov8n.pt epochs=50 imgsz=640
   ```

   Hasil di `runs/detect/train/weights/best.pt` → copy ke `ai-service/models/pothole_yolov8.pt`.

### Kapan memilih training

- Sudah coba model pre-trained tapi deteksi sering salah/melewatkan lubang di gambar Anda.
- Punya banyak gambar khas (kota/lokasi Anda) yang sudah dilabel.
- Siap meluangkan waktu untuk labeling dan eksperimen training.

---

## Ringkas

| Situasi | Tindakan |
|--------|----------|
| Mau cek alur deteksi cepat | Opsi 1: unduh model pre-trained, restart service, tes. |
| Model pre-trained kurang cocok | Opsi 2: siapkan dataset berlabel YOLO, train, ganti `pothole_yolov8.pt`. |

Mulai dengan **Opsi 1**; lanjut ke Opsi 2 jika hasil deteksi belum memuaskan untuk kasus Anda.
