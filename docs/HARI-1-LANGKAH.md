# Hari 1 — Checklist & Langkah yang Perlu Kamu Jalankan

Dokumen ini ringkasan apa yang **sudah disiapkan** dan apa yang **harus kamu lakukan sendiri**.

---

## 🐳 Jalankan pakai Docker (tanpa install PHP/Composer di Mac)

Kalau kamu pakai **Docker**, PHP dan Composer tidak perlu di-install di Mac. CI4 bisa dibuat sekali pakai **container Composer**, lalu semua service jalan dengan `docker compose`.

### Port (sesuai `docker-compose.yml`)

| Layanan   | URL / akses              |
|----------|---------------------------|
| Frontend | http://localhost:**3010** |
| Backend API | http://localhost:**8010** |
| MySQL    | host `127.0.0.1`, port **3310**, user `jalur`, password `jalur_dev`, database `jalur` |

### Langkah 1: Buat project CI4 ke folder `backend` (sekali saja, pakai container)

Di **root project** `jalur`:

```bash
# 1. Backup isi backend yang ada (Dockerfile, .env.example), lalu pastikan folder backend KOSONG
mv backend backend_backup
mkdir backend
# Penting: create-project menolak jika direktori tidak kosong. Cek dengan: ls backend (harus kosong)

# 2. Buat project CI4 dengan container Composer (tanpa install PHP/Composer di Mac)
# --ignore-platform-reqs: image composer:2 tidak punya ext-intl; backend nanti jalan di image kita (PHP 8.1 + intl)
docker run --rm -v "$(pwd)/backend:/app" -w /app composer:2 create-project codeigniter4/appstarter . --no-interaction --ignore-platform-reqs

# 4. Kembalikan Dockerfile kita (image PHP 8.1 + spark serve)
cp backend_backup/Dockerfile backend/

# Jika dapat error "Project directory is not empty": hapus isi backend lalu ulang dari langkah 2:
#   rm -rf backend && mkdir backend
#   (lalu jalankan lagi docker run ... create-project ...)

# 5. File .env untuk Docker (database pakai service MySQL di compose)
cp backend_backup/.env.example backend/.env
# Sesuaikan jika perlu; untuk Docker biasanya sudah benar: hostname=mysql, database=jalur, user=jalur, password=jalur_dev, app.baseURL=http://localhost:8010
```

### Langkah 2: Controller API, route, CORS, folder upload

```bash
# Controller test JSON
cp -r docs/hari1-backend-files/app/Controllers/Api backend/app/Controllers/

# Folder upload (writable di container)
mkdir -p backend/public/uploads/jalan
```

Lalu **edit** `backend/app/Config/Routes.php` — tambahkan:

```php
$routes->get('api/test', 'Api\TestController::index');
```

**CORS:** Buka `backend/app/Config/Cors.php` (jika ada). Di `allowedOrigins` tambahkan **`http://localhost:3010`** (asal frontend saat kamu buka di browser). Kalau pakai filter, aktifkan untuk path `api/*`.

### Langkah 3: Jalankan semua service

```bash
docker compose up -d
```

- Frontend: http://localhost:3010  
- API: http://localhost:8010 (welcome CI4) dan http://localhost:8010/api/test (JSON)  
- MySQL sudah jalan; migrasi nanti di Hari 2 lewat: `docker compose exec backend php spark migrate`

### Cek dari frontend (CORS)

Buka http://localhost:3010, buka console browser, jalankan:

```js
fetch('http://localhost:8010/api/test').then(r => r.json()).then(console.log)
```

Harus dapat JSON tanpa error CORS.

**Catatan:** Di Docker, env frontend `NEXT_PUBLIC_API_URL` di-set oleh `docker-compose.yml` ke `http://localhost:8010`. File `frontend/.env.local` dipakai kalau kamu jalankan frontend lokal (`npm run dev`); untuk Docker tidak perlu diubah.

---

## ✅ Sudah selesai (di repo)

### Blok 1.1 — Frontend
- Next.js (App Router, TypeScript, Tailwind, ESLint) sudah di-init di `frontend/`.
- Shadcn UI sudah init; komponen terpasang: button, card, input, table, badge, dialog, skeleton, form, label, textarea, sonner.
- File `.env.local` dengan `NEXT_PUBLIC_API_URL=http://localhost:8080`.
- File `lib/api.ts` dan `lib/types.ts` (placeholder).
- Halaman `app/page.tsx` memakai Button dan Card untuk cek.

**Cek sendiri:**  
`cd frontend && npm run dev` → buka http://localhost:3000 → halaman "Jalur — Hari 1" dengan tombol "Klik" dan card tampil. Di browser console: `console.log(process.env.NEXT_PUBLIC_API_URL)` → keluar URL yang kamu set.

### Blok 1.3 — AI Service
- Endpoint `POST /detect` dummy di `ai-service/main.py`: terima JSON `image_base64`, return `{ "success": true, "jumlah_lubang": 0, "message": "ok" }`.
- File `detector.py` (placeholder untuk Hari 3).
- Folder `ai-service/models/` (untuk file .pt nanti).

**Cek sendiri:**  
`cd ai-service && source venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --reload --host 127.0.0.1 --port 8000`. Lalu:

```bash
curl -X POST http://127.0.0.1:8000/detect -H "Content-Type: application/json" -d '{"image_base64":"abc"}'
```

Response harus JSON dengan `success: true`.

---

## 🔧 Yang harus kamu lakukan (Backend & Database)

### Blok 1.2 — Backend (CodeIgniter 4)

**Prasyarat:** PHP ≥ 8.1, Composer terpasang. Cek: `php -v` dan `composer -v`.

**Kalau `composer` atau `php` belum ada (misalnya "command not found"):**

- **macOS (Homebrew):**
  1. Install PHP: `brew install php` (versi terbaru biasanya ≥ 8.1).
  2. Install Composer: `brew install composer`.
  3. Cek: `php -v` dan `composer -v`.
- **Tanpa Homebrew:** Download PHP dari [php.net](https://www.php.net/downloads) dan Composer dari [getcomposer.org](https://getcomposer.org/download/). Ikuti instruksi di sana.

Setelah PHP dan Composer jalan, lanjut langkah di bawah.

1. **Init CI4**  
   Di root project (sejajar dengan `frontend`, `ai-service`):

   ```bash
   # Backup isi backend yang ada (Dockerfile, .env.example)
   mv backend backend_backup

   composer create-project codeigniter4/appstarter backend
   ```

2. **Env dan database**  
   - Copy template: `cp backend/env backend/.env` (atau di CI4 biasanya file bernama `env`, copy jadi `.env`).
   - Buka `.env`, set:
     - `CI_ENVIRONMENT = development`
     - Bagian database: host, database name, username, password (sesuai MySQL kamu).
   - Untuk development lokal (tanpa Docker): `app.baseURL = 'http://localhost:8080'` dan host database biasanya `localhost` atau `127.0.0.1`.

3. **Copy file yang sudah disiapkan**  
   - Controller API:  
     `cp -r docs/hari1-backend-files/app/Controllers/Api backend/app/Controllers/`  
     (atau copy isi folder `docs/hari1-backend-files/app/Controllers/Api/` ke `backend/app/Controllers/Api/`).
   - Folder upload:  
     `mkdir -p backend/public/uploads/jalan`  
     Pastikan writable: `chmod 755 backend/public/uploads/jalan` (atau 775 jika perlu).

4. **Route JSON**  
   Di `backend/app/Config/Routes.php` tambahkan (sebelum atau sesudah route default):

   ```php
   $routes->get('api/test', 'Api\TestController::index');
   ```

5. **CORS**  
   Agar frontend (localhost:3000) bisa panggil backend (8080), aktifkan CORS di CI4:
   - Buka `app/Config/Cors.php` (jika ada di appstarter). Di `allowedOrigins` tambahkan `http://localhost:3000`.
   - Atau di `app/Config/Filters.php` daftarkan filter `cors` untuk path `api/*` (lihat dokumentasi CI4 CORS). Pastikan OPTIONS preflight bisa lewat (bisa pakai filter bawaan CI4 jika ada).

6. **Jalankan backend**  
   ```bash
   cd backend && php spark serve --port 8080
   ```  
   Buka http://localhost:8080 → halaman welcome CI4. Lalu http://localhost:8080/api/test → JSON `{"status":true,"message":"API CI4 jalan",...}`.

7. **Cek CORS dari frontend**  
   Di halaman Next.js (atau console browser), jalankan:
   `fetch(process.env.NEXT_PUBLIC_API_URL + '/api/test').then(r => r.json()).then(console.log)`  
   Harus dapat JSON tanpa error CORS di console.

### Blok 1.4 — Database (MySQL)

- Buat database (misal nama: `jalur` atau `pothole_db`).
- User dan password MySQL harus sama dengan yang di `.env` CI4.
- **Cek sendiri:** Setelah migrasi ada (Hari 2), jalankan `php spark migrate` dari folder `backend`. Untuk Hari 1 cukup pastikan kredensial di `.env` benar; bisa uji koneksi dengan script kecil atau nanti lewat migrate.

---

## Cek akhir Hari 1

**Pakai Docker:**
- [ ] `docker compose up -d` → Frontend http://localhost:3010, API http://localhost:8010 tampil.
- [ ] GET http://localhost:8010/api/test → JSON. Dari browser (http://localhost:3010) fetch ke 8010 tanpa error CORS.
- [ ] Folder `backend/public/uploads/jalan` ada.

**Tanpa Docker (jalan lokal):**
- [ ] Frontend: `npm run dev` → halaman tampil; Backend: `php spark serve` → welcome + api/test JSON; CORS allow origin frontend; AI: uvicorn → POST /detect JSON; Database: kredensial .env benar.

Kalau semua centang, siap lanjut **Hari 2**.
