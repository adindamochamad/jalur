# Jalur

Aplikasi laporan jalan berlubang: warga upload foto jalan, sistem deteksi lubang pakai YOLOv8, hasilnya tampil di dashboard dan peta. Dibuat full-stack (Next.js, CodeIgniter 4, Python/FastAPI) plus integrasi model deteksi objek untuk portofolio.

**Fitur singkat:** form lapor (foto + GPS, validasi Zod), deteksi AI, dashboard statistik & peta (Recharts, Leaflet), daftar laporan dengan filter, auth JWT, route guard, validasi file & CORS.

**Tech stack**

| Bagian   | Teknologi |
|----------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind, Shadcn UI, Recharts, React Leaflet |
| Backend  | CodeIgniter 4 (PHP 8.1), MySQL, JWT |
| AI       | Python, FastAPI, Ultralytics YOLOv8, OpenCV |

**Jalanin pakai Docker**

```bash
git clone https://github.com/adindamochamad/jalur.git
cd jalur
docker compose up -d
```

Tunggu sampai semua container ready (frontend pertama kali bisa lama karena `npm install`). Lalu migrasi + seed admin sekali:

```bash
docker compose exec backend php spark migrate
docker compose exec backend php spark db:seed AdminUserSeeder
```

Akses frontend di http://localhost:3010, API di http://localhost:8010. Login: `admin@localhost` / `admin123`.

Port: Frontend 3010, Backend 8010, MySQL 3310 (user `jalur`, password `jalur_dev`, database `jalur`). AI service jalan di dalam network Docker dan hanya dipanggil backend.

**Jalanin tanpa Docker**

Backend: PHP 8.1+, Composer, MySQL. Dari `backend`: `composer install`, copy `env` ke `.env`, atur DB, lalu `php spark migrate` dan `php spark db:seed AdminUserSeeder`, jalankan `php spark serve --port 8080`.

AI: dari `ai-service`, buat venv, `pip install -r requirements.txt`, jalankan `uvicorn main:app --host 0.0.0.0 --port 8000`. Di `.env` backend set `AI_SERVICE_URL=http://localhost:8000`.

Frontend: dari `frontend`, `npm install`, buat `.env.local` isi `NEXT_PUBLIC_API_URL=http://localhost:8080`, jalankan `npm run dev`.

**Deploy**

Contoh Nginx dan Supervisor ada di `deploy/`. SSL pakai Certbot; langkah singkat di `docs/DEPLOY-SSL.md`. Subdomain (mis. jalur.example.com) dijelaskan di `docs/DEPLOY-SUBDOMAIN.md`.

**Lain**

- Tes & troubleshooting: `docs/CARA-NGETES.md`
- Model deteksi pothole tidak ikut repo; unduh pakai `ai-service/scripts/download_pothole_model.sh` atau lihat `ai-service/docs/MODEL-POTHOLE.md`
