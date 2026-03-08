# Jalur — Laporan Jalan Berlubang

Aplikasi web untuk melaporkan dan memantau kondisi jalan berlubang. Warga dapat upload foto jalan; sistem mendeteksi lubang dengan AI (YOLOv8) dan menampilkan statistik serta peta di dashboard admin.

---

## Tech Stack

| Bagian      | Teknologi |
|------------|-----------|
| Frontend   | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI, Recharts, React Leaflet |
| Backend API| CodeIgniter 4 (PHP 8.1), MySQL, JWT |
| AI Service | Python, FastAPI, Ultralytics YOLOv8, OpenCV |

---

## Setup Lokal (Docker)

### Persyaratan

- Docker & Docker Compose
- (Opsional) Git

### Langkah

1. **Clone / masuk ke folder project**
   ```bash
   cd jalur
   ```

2. **Jalankan semua service**
   ```bash
   docker compose up -d
   ```
   Tunggu hingga semua container siap (frontend bisa lama saat `npm install` pertama kali).

3. **Migrasi database & seed user admin (sekali saja)**
   ```bash
   docker compose exec backend php spark migrate
   docker compose exec backend php spark db:seed AdminUserSeeder
   ```

4. **Akses**
   - **Frontend:** http://localhost:3010  
   - **Backend API:** http://localhost:8010  

5. **Login**
   - Email: `admin@localhost`  
   - Password: `admin123`

### Port (Docker)

| Layanan    | Port | Keterangan |
|-----------|------|------------|
| Frontend  | 3010 | Next.js |
| Backend   | 8010 | CI4 API |
| MySQL     | 3310 | User `jalur` / password `jalur_dev`, database `jalur` |
| AI Service| internal | Hanya diakses backend (tidak di-expose ke host) |

---

## Setup Lokal (Tanpa Docker)

1. **Backend (CI4)**  
   - PHP ≥ 8.1, Composer, MySQL  
   - `cd backend && composer install && cp env .env`  
   - Atur database di `.env`, lalu: `php spark migrate`, `php spark db:seed AdminUserSeeder`  
   - Jalankan: `php spark serve --port 8080`

2. **AI Service**  
   - Python 3.9+, venv  
   - `cd ai-service && python -m venv venv && source venv/bin/activate` (atau `venv\Scripts\activate` di Windows)  
   - `pip install -r requirements.txt`  
   - Jalankan: `uvicorn main:app --host 0.0.0.0 --port 8000`

3. **Frontend**  
   - Node 20+, npm  
   - `cd frontend && npm install`  
   - Buat `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8080`  
   - Jalankan: `npm run dev` (port 3000)

4. **Backend** harus bisa akses AI di `http://localhost:8000` (atur `AI_SERVICE_URL` di `.env` backend).

---

## Fitur

- **Publik:** Form lapor (upload foto + GPS), validasi form (Zod), deteksi lubang via AI.
- **Admin (setelah login):** Dashboard (statistik, grafik, peta), daftar laporan dengan filter status & keparahan, detail laporan (foto asli & hasil deteksi), logout.
- **Keamanan:** Guard route untuk `/dashboard`, `/laporan`, `/laporan/[id]`; JWT; validasi file (tipe, ukuran); CORS.

---

## Deploy ke VPS

- **Nginx:** Contoh config di `deploy/nginx/` (reverse proxy frontend + backend).
- **Supervisor:** Contoh config untuk FastAPI (AI) di `deploy/supervisor/`.
- **SSL:** Gunakan Certbot (Let's Encrypt); langkah ringkas di `docs/DEPLOY-SSL.md`.

Lihat juga `docs/CARA-NGETES.md` untuk checklist tes dan troubleshooting.

---

## Lisensi

Proyek ini untuk keperluan pembelajaran / internal.
