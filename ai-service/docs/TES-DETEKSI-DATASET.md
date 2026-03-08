# Tes Deteksi Pothole dengan Gambar Dataset

Cara menjalankan tes deteksi menggunakan gambar contoh dari dataset di `datasets/pothole-detection-dataset`.

## Prasyarat

1. **AI service harus jalan** (endpoint `/detect` aktif).

   Di terminal 1:

   ```bash
   cd ai-service
   source venv/bin/activate   # Windows: venv\Scripts\activate
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

   Atau dengan Docker: pastikan container AI service jalan (`docker compose up -d`), lalu gunakan `--url http://ai-service:8000` jika menjalankan skrip dari host (lihat di bawah).

2. **Model deteksi**

   - Jika ada file **`models/pothole_yolov8.pt`**, service akan memakai model pothole (deteksi lubang jalan).
   - Jika tidak ada, service memakai **yolov8n.pt** (COCO umum). Model COCO tidak punya kelas "pothole", jadi **jumlah_lubang** akan selalu 0. Untuk tes deteksi lubang nyata, gunakan model pothole yang sudah dilatih.

## Langkah 1: Jalankan skrip tes

Di terminal 2 (dari **root project jalur** atau dari **ai-service**):

```bash
cd ai-service
source venv/bin/activate
```

### Satu gambar

```bash
python scripts/test_detect.py datasets/pothole-detection-dataset/potholes/63.jpg
```

### Beberapa gambar

```bash
python scripts/test_detect.py \
  datasets/pothole-detection-dataset/potholes/63.jpg \
  datasets/pothole-detection-dataset/potholes/77.jpg
```

### Semua gambar di folder (batch)

```bash
python scripts/test_detect.py datasets/pothole-detection-dataset/potholes/
```

### Simpan gambar hasil deteksi (dengan kotak bbox)

```bash
python scripts/test_detect.py --output hasil_deteksi datasets/pothole-detection-dataset/potholes/63.jpg
```

Gambar hasil akan disimpan di folder `hasil_deteksi/` dengan nama seperti `out_63.jpg`.

### Tes gambar "normal" (tanpa lubang)

```bash
python scripts/test_detect.py datasets/pothole-detection-dataset/normal/
```

## Jika AI service jalan di Docker

Skrip dijalankan dari **host** (Mac), sedangkan service di container:

```bash
# Service biasanya di localhost:8000 jika port di-map di compose
python scripts/test_detect.py --url http://127.0.0.1:8000 datasets/pothole-detection-dataset/potholes/63.jpg
```

Jika port AI tidak di-expose ke host, jalankan skrip **di dalam container**:

```bash
docker compose exec ai-service python scripts/test_detect.py /app/datasets/pothole-detection-dataset/potholes/63.jpg
```

(Sesuaikan path jika di container dataset ada di path lain.)

## Output yang diharapkan

Contoh keluaran:

```
AI service: http://127.0.0.1:8000/detect
Jumlah gambar yang akan dites: 1

  [63.jpg] jumlah_lubang=2, keparahan=sedang, confidence 78.50%
           -> disimpan: hasil_deteksi/out_63.jpg

Ringkasan: 1 gambar dites, total deteksi lubang: 2
```

- **jumlah_lubang**: berapa objek pothole terdeteksi.
- **keparahan**: ringan / sedang / parah (dari aturan di `main.py`).
- **confidence**: rata-rata confidence deteksi (persen).

## Troubleshooting

| Masalah | Solusi |
|--------|--------|
| `Tidak bisa terhubung ke AI service` | Pastikan `uvicorn main:app --host 0.0.0.0 --port 8000` sudah jalan di ai-service. |
| `jumlah_lubang=0` untuk semua gambar | Pakai model pothole: letakkan `pothole_yolov8.pt` di `ai-service/models/` dan restart service. Dengan yolov8n.pt (COCO) kelas pothole tidak ada. |
| `Tidak ada file gambar yang ditemukan` | Cek path ke folder/file. Untuk folder, skrip hanya baca file dengan ekstensi .jpg, .jpeg, .png, .bmp, .webp. |
