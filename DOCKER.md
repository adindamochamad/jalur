# Docker — Project Jalur (Deteksi Jalan Berlubang)

Setup Docker menggunakan **port yang tidak bentrok** dengan project lain di workspace ini.

## Port

| Layanan        | Port (host) | Keterangan                          |
|----------------|-------------|-------------------------------------|
| Frontend Next.js | **3010**  | http://localhost:3010               |
| Backend CI4 API  | **8010**  | http://localhost:8010               |
| MySQL            | **3310**  | Host 127.0.0.1, port 3310           |
| AI Service (FastAPI) | —     | Hanya internal (backend akses lewat `ai-service:8000`) |

Port lain yang sudah dipakai project lain: 8001, 8002, 8003, 8004, 8080, 8081, 8085, 3306–3309.

## Cara menjalankan

```bash
cd projects/jalur
docker compose up -d
```

- **Frontend:** http://localhost:3010  
- **API:** http://localhost:8010  
- **MySQL:** host `127.0.0.1`, port `3310`, user `root` / `jalur`, password `root` / `jalur_dev`, database `jalur`

## Persiapan sebelum pertama kali jalan

1. **Frontend** — pastikan folder `frontend/` sudah hasil `create-next-app` dan ada `package.json`.
2. **Backend** — di folder `backend/` harus sudah ada project CI4 (`composer create-project codeigniter4/appstarter .`). Buat file `backend/.env` dari template di bawah, dan jalankan `composer install` (bisa lewat container: `docker compose exec backend composer install`).
3. **AI Service** — folder `ai-service/` sudah berisi `main.py`, `requirements.txt`, dan nantinya `detector.py` + model YOLOv8.

### Contoh `backend/.env` (bagian penting)

```env
CI_ENVIRONMENT = development
app.baseURL = 'http://localhost:8010'

database.default.hostname = mysql
database.default.database = jalur
database.default.username = jalur
database.default.password = jalur_dev
database.default.DBDriver = MySQLi

# URL layanan AI (di dalam Docker pakai nama service)
# Di .env host bisa pakai: AI_SERVICE_URL = http://ai-service:8000
```

Backend mengakses AI service lewat variabel environment `AI_SERVICE_URL` (di compose sudah di-set `http://ai-service:8000`).

## Perintah berguna

```bash
# Lihat log
docker compose logs -f

# Masuk ke container backend (untuk composer install / spark migrate)
docker compose exec backend bash

# Masuk ke container AI
docker compose exec ai-service bash
```

## Stop

```bash
docker compose down
```

Data MySQL tetap tersimpan di volume `jalur-mysql-data` (akan dipakai lagi saat `up` berikutnya).
