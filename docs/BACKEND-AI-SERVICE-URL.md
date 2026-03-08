# Koneksi Backend ke AI Service

Saat warga upload foto lewat **frontend (Lapor)**, backend memanggil **AI service** untuk deteksi lubang. Jika backend **tidak bisa** mengakses AI (URL salah, AI mati, timeout), hasil yang tersimpan selalu **0 lubang, keparahan ringan** — dan di frontend tampil "0 lubang terdeteksi".

---

## Atur `AI_SERVICE_URL` sesuai cara Anda menjalankan app

| Backend jalan di | AI service jalan di | Atur `AI_SERVICE_URL` (di backend) |
|------------------|----------------------|------------------------------------|
| **Lokal** (php spark serve) | **Lokal** (uvicorn di Mac) | `http://127.0.0.1:8000` |
| **Docker** (container jalur-backend) | **Docker** (container jalur-ai-service) | `http://ai-service:8000` (default di docker-compose) |
| **Docker** (backend) | **Lokal** (uvicorn di Mac) | `http://host.docker.internal:8000` (Docker Desktop Mac/Windows) |

---

## Skenario 1: Semua jalan di **lokal** (tanpa Docker)

Anda jalankan:
- Frontend: `npm run dev` (port 3010 atau 3000)
- Backend: `php spark serve --port 8080` (atau 8010)
- AI: `uvicorn main:app --host 0.0.0.0 --port 8000`

**Langkah:** Di **backend**, set di file `.env`:

```env
AI_SERVICE_URL = http://127.0.0.1:8000
```

Simpan, lalu **restart backend** (hentikan `php spark serve`, jalankan lagi). Pastikan AI service sudah jalan di port 8000 sebelum tes upload dari frontend.

---

## Skenario 2: Semua jalan pakai **Docker** (`docker compose up`)

Backend dan AI sama-sama di container. Backend sudah pakai `AI_SERVICE_URL=http://ai-service:8000` dari docker-compose.

**Yang sering bikin “0 lubang”:** Container **ai-service** load model saat **startup**. Jika Anda menaruh `pothole_yolov8.pt` setelah container jalan, container masih pakai model lama (yolov8n) sampai di-restart.

**Langkah:**

1. Pastikan file ada: `ai-service/models/pothole_yolov8.pt`
2. Restart container AI agar load model pothole:
   ```bash
   docker compose restart ai-service
   ```
3. (Opsional) Cek log container:
   ```bash
   docker compose logs ai-service
   ```
   Harus ada baris: `Model loaded: .../pothole_yolov8.pt`

---

## Skenario 3: Backend di **Docker**, AI di **lokal** (Mac)

Anda jalankan AI manual di Mac (`uvicorn ... --port 8000`) supaya pakai model pothole yang sudah Anda tes, tapi frontend + backend dari Docker.

**Langkah:** Backend (container) harus memanggil **host Mac**, bukan container lain. Di **docker-compose.yml**, untuk service `backend`, set env:

```yaml
environment:
  - AI_SERVICE_URL=http://host.docker.internal:8000
```

Lalu:

```bash
docker compose up -d
# atau: docker compose restart backend
```

`host.docker.internal` = alamat “komputer host” dari dalam container (Docker Desktop Mac/Windows).

---

## Cek apakah backend berhasil panggil AI

1. **Log backend**  
   Saat upload dari frontend, jika koneksi ke AI gagal, di log backend (atau `writable/logs/`) akan muncul pesan error dari PotholeDetector (mis. "AI service mengembalikan HTTP ..." atau "respons AI bukan JSON valid").

2. **Tes manual**  
   Dari folder ai-service, jalankan:
   ```bash
   python scripts/test_detect.py datasets/pothole-detection-dataset/potholes/63.jpg
   ```
   Jika ini dapat “3 lubang” tapi di frontend tetap “0 lubang”, berarti backend **tidak** berhasil memanggil AI yang sama — periksa kembali `AI_SERVICE_URL` dan skenario di atas.
