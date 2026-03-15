# Jalur

Aplikasi laporan jalan berlubang: upload foto jalan, deteksi lubang (YOLOv8), dashboard & peta.

**Tech stack:** Next.js, CodeIgniter 4, MySQL, FastAPI + Ultralytics YOLOv8.

**Jalankan (Docker)**

```bash
docker compose up -d
docker compose exec backend php spark migrate
docker compose exec backend php spark db:seed AdminUserSeeder
```

Frontend: http://localhost:3010 — API: http://localhost:8010. Login: `admin@localhost` / `admin123`.

**Tanpa Docker:** Backend `php spark serve --port 8080`, AI `uvicorn main:app --port 8000` (dari `ai-service`), Frontend `npm run dev`. Atur `AI_SERVICE_URL` dan `NEXT_PUBLIC_API_URL` di env masing-masing.

Contoh Nginx & Supervisor di `deploy/`. **Deploy di VPS:** salin `.env.example` ke `.env`, isi password & `JWT_SECRET`, lalu `docker compose up -d` + migrate + seed. Panduan lengkap: [DEPLOY.md](DEPLOY.md).
