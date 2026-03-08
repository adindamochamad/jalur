# Breakdown Pengerjaan 6 Hari — Deteksi Jalan Berlubang

Dokumen ini memecah project menjadi rencana 6 hari yang siap eksekusi, dengan task jelas, deliverable, dan dependensi.

---

## Gambaran Umum

| Hari | Fokus | Deliverable Utama |
|------|--------|-------------------|
| 1 | Setup & Infrastruktur | Next.js, Shadcn, CI4, FastAPI, DB, Docker/env siap dev |
| 2 | Backend CI4 | Migrasi, JWT, Auth, Laporan CRUD, Library PotholeDetector |
| 3 | AI Service Python | Endpoint `/detect`, YOLOv8, integrasi CI4 ↔ Python |
| 4 | Frontend Inti | Layout, Form lapor, Daftar & Detail laporan |
| 5 | Dashboard & Peta | Statistik, Recharts, Leaflet, filter & search |
| 6 | Auth Admin, Polish & Deploy | Login admin, validasi, SSL, README, testing |

---

# Hari 1 — Setup & Infrastruktur

**Tujuan:** Semua repo dan environment siap untuk development lokal; tidak perlu VPS dulu.

## 1.1 Frontend — Next.js + Shadcn

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Init Next.js | `npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir=false` (atau sesuaikan). Pastikan App Router. | [ ] |
| 2 | Init Shadcn | `cd frontend && npx shadcn@latest init`. Pilih style & base color sesuai branding. | [ ] |
| 3 | Tambah komponen Shadcn yang dipakai | `npx shadcn@latest add button card input table badge dialog skeleton toast form label textarea`. Jangan install semua. | [ ] |
| 4 | Env frontend | Buat `.env.local` dengan `NEXT_PUBLIC_API_URL=http://localhost:8080` (atau port backend CI4). | [ ] |
| 5 | Struktur folder | Pastikan ada `app/`, `components/`, `lib/`, `hooks/`. Buat placeholder kosong: `lib/api.ts`, `lib/types.ts`, `lib/utils.ts`. | [ ] |

**Acceptance:** `npm run dev` jalan, halaman default Next.js tampil, Shadcn button/card bisa di-import.

## 1.2 Backend — CodeIgniter 4

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Init CI4 | `composer create-project codeigniter4/appstarter backend`. Pastikan PHP ≥ 8.1. | [ ] |
| 2 | Env backend | Copy `env` ke `.env`, set `CI_ENVIRONMENT = development`, konfigurasi database (MySQL). | [ ] |
| 3 | Struktur API | Buat folder `app/Controllers/Api/`. Pastikan `public/` sebagai document root. | [ ] |
| 4 | CORS | Di `.env` atau Config, set CORS allow origin ke URL frontend (localhost:3000). | [ ] |
| 5 | Upload folder | `public/uploads/jalan/` ada dan writable (atau buat lewat migrasi/deploy script). | [ ] |

**Acceptance:** `php spark serve` jalan, akses `http://localhost:8080` tidak error.

## 1.3 AI Service — Python FastAPI

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Init project | Di `ai-service/`: `python -m venv venv`, aktifkan venv. | [ ] |
| 2 | Dependencies | Buat `requirements.txt`: `fastapi`, `uvicorn`, `ultralytics`, `opencv-python-headless`, `pillow`, `pydantic`. Lalu `pip install -r requirements.txt`. | [ ] |
| 3 | Struktur file | Buat `main.py` (FastAPI app), `detector.py` (placeholder untuk YOLO). Folder `models/` untuk `.pt`. | [ ] |
| 4 | Endpoint dummy | `POST /detect` yang terima JSON, return dummy `{ "success": true, "jumlah_lubang": 0 }` agar bisa di-hit dari CI4. | [ ] |
| 5 | Model YOLO | Download atau tempatkan `pothole_yolov8.pt` di `models/`. Jika belum ada, pakai `yolov8n.pt` sementara untuk development. | [ ] |

**Acceptance:** `uvicorn main:app --reload --host 127.0.0.1 --port 8000` jalan, `POST /detect` return JSON.

## 1.4 Database

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | MySQL | Buat database (nama misal `pothole_db`). User + password sesuai `.env` CI4. | [ ] |
| 2 | Migrasi CI4 | Belum wajib di Hari 1; bisa disiapkan skema SQL di dokumen atau file migrasi kosong. | [ ] |

**Acceptance:** Koneksi dari CI4 ke MySQL berhasil (bisa cek lewat `php spark migrate` nanti).

## 1.5 Development workflow (opsional)

- Docker Compose untuk MySQL + PHP + Python + Node agar satu perintah jalan (boleh ditunda ke Hari 6).
- Atau pastikan di README tercatat: jalankan backend port 8080, frontend 3000, ai-service 8000.

**Deliverable Hari 1:** Repo frontend, backend, ai-service jalan di lokal; env dan struktur folder sesuai cursorrules.

---

# Hari 2 — Backend CI4

**Tujuan:** REST API CI4 lengkap: migrasi, JWT, Auth, CRUD Laporan, upload foto, dan library pemanggilan Python.

## 2.1 Database & Migrasi

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Migrasi tabel `users` | Kolom: id, nama, email, password (hash), role (admin/petugas), created_at. | [ ] |
| 2 | Migrasi tabel `laporan_jalan` | Sesuai skema cursorrules: foto_asli, foto_hasil, latitude, longitude, alamat, status, keparahan, confidence, jumlah_lubang, pelapor_nama, pelapor_hp, catatan, created_at, updated_at. | [ ] |
| 3 | Seed (opsional) | Satu user admin untuk testing (email + password hash). | [ ] |

**Acceptance:** `php spark migrate` sukses, tabel ada di MySQL.

## 2.2 JWT & Filter

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Install JWT | `composer require firebase/php-jwt`. | [ ] |
| 2 | Konfigurasi secret | Simpan JWT secret di `.env` (jangan hardcode). | [ ] |
| 3 | JwtFilter | Buat Filter yang baca `Authorization: Bearer <token>`, decode, validasi, simpan user id ke request/attribute. Route yang butuh auth pakai filter ini. | [ ] |
| 4 | Routes | Apply filter ke route `/api/laporan` (GET/PUT/DELETE) dan `/api/dashboard/*`. POST login & POST laporan (public) tanpa filter. | [ ] |

**Acceptance:** Request tanpa token ke `/api/laporan` return 401; dengan token valid return 200 (atau 404 jika belum ada data).

## 2.3 AuthController

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | POST `/api/auth/login` | Terima `email`, `password`. Cek UserModel, verify password, generate JWT. Return `{ "status": true, "data": { "token", "user" } }`. | [ ] |
| 2 | POST `/api/auth/logout` | Invalidasi/tidak simpan token di server; response sukses. Client akan hapus cookie. | [ ] |
| 3 | Cookie (opsional untuk hari ini) | Jika pakai httpOnly cookie, set cookie di response login; dokumentasikan nama cookie. | [ ] |

**Acceptance:** Login dengan kredensial benar return token; salah return 401.

## 2.4 LaporanController

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | GET `/api/laporan` | List dengan pagination & filter (status, keparahan). Return JSON array + meta (total, page, per_page). | [ ] |
| 2 | GET `/api/laporan/{id}` | Detail satu laporan by id. 404 jika tidak ada. | [ ] |
| 3 | POST `/api/laporan` | Terima multipart: foto + koordinat + pelapor_nama, pelapor_hp, catatan. Validasi: hanya jpg/jpeg/png, max 5MB. Simpan file ke `public/uploads/jalan/` (nama uniqid). Panggil PotholeDetector (Hari 3 bisa mock dulu), simpan hasil ke DB. Return laporan yang baru dibuat. | [ ] |
| 4 | PUT `/api/laporan/{id}` | Update status (untuk admin). Validasi role di filter atau di controller. | [ ] |
| 5 | DELETE `/api/laporan/{id}` | Soft delete atau hard delete; hanya admin. | [ ] |

**Acceptance:** CRUD laporan bisa diuji via Postman/curl; upload foto tersimpan dan record masuk DB.

## 2.5 PotholeDetector Library

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Buat Library | `app/Libraries/PotholeDetector.php`. Method misal `detect(string $pathGambar): array`. | [ ] |
| 2 | Internal HTTP call | Pakai CURLRequest CI4 ke `http://127.0.0.1:8000/detect` dengan body base64 image (sesuai kontrak API Python). Parse JSON response. | [ ] |
| 3 | Error handling | Jika Python down atau timeout, return default aman (misal jumlah_lubang 0, keparahan ringan) dan log error. | [ ] |
| 4 | Integrasi di LaporanController | Setelah upload foto, panggil PotholeDetector, isi `foto_hasil`, `jumlah_lubang`, `keparahan`, `confidence` di DB. | [ ] |

**Acceptance:** POST laporan dengan foto memicu panggilan ke Python (mock atau real); response tersimpan di `laporan_jalan`.

## 2.6 DashboardController (skeleton)

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | GET `/api/dashboard/stats` | Aggregasi: total laporan, per status, per keparahan. Return JSON. | [ ] |
| 2 | GET `/api/dashboard/peta` | List id, latitude, longitude, keparahan (untuk marker peta). | [ ] |

**Acceptance:** Endpoint return data konsisten dengan isi tabel.

**Deliverable Hari 2:** API CI4 lengkap (auth, laporan CRUD, dashboard stub), JWT, migrasi, PotholeDetector library siap dipakai.

---

# Hari 3 — AI Service Python

**Tujuan:** Endpoint `/detect` real dengan YOLOv8; load model sekali saat startup; response sesuai kontrak; integrasi penuh dengan CI4.

## 3.1 Model & Startup

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Load model sekali | Di `main.py` gunakan `@app.on_event("startup")`, load YOLO model (misal `YOLO("models/pothole_yolov8.pt")`) dan simpan di state app/global. | [ ] |
| 2 | Fallback model | Jika file custom tidak ada, fallback ke `yolov8n.pt` untuk development. | [ ] |

**Acceptance:** Restart sekali, log menandakan model loaded; request berikutnya tidak load lagi.

## 3.2 Endpoint /detect

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Pydantic input | Request body: `image_base64: str` (optional prefix `data:image/...;base64,`). Validasi wajib ada. | [ ] |
| 2 | Decode & inferensi | Decode base64 ke image, simpan ke temp file atau pakai numpy; panggil `model.predict()`. | [ ] |
| 3 | Parsing hasil | Dari hasil YOLO ambil bounding box, confidence, hitung jumlah_lubang. Tentukan keparahan (rule: misal dari jumlah_lubang + confidence). | [ ] |
| 4 | Gambar hasil | Gambar dengan bounding box di-overlay (OpenCV/Pillow), encode ke base64. | [ ] |
| 5 | Response | Format: `{ "success": true, "message": "...", "jumlah_lubang": int, "keparahan": "ringan"|"sedang"|"parah", "confidence": float, "foto_hasil_base64": "...", "deteksi": [ { "label", "confidence", "bbox" } ] }`. | [ ] |
| 6 | Logging | Gunakan `logging`; jangan print. Log error dan lama inferensi. | [ ] |

**Acceptance:** POST dengan base64 foto jalan (ada lubang atau tidak) return JSON konsisten; `foto_hasil_base64` bisa di-decode jadi gambar dengan kotak.

## 3.3 Integrasi CI4 ↔ Python

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | PotholeDetector format request | Baca file upload, encode base64, kirim ke Python sesuai kontrak. | [ ] |
| 2 | Simpan foto_hasil | Terima base64 dari Python; decode dan simpan ke `public/uploads/jalan/` (nama unik), simpan path di kolom `foto_hasil`. | [ ] |
| 3 | Timeout & retry | Set timeout CURL (misal 30 detik); handle timeout dengan response default. | [ ] |

**Acceptance:** Dari frontend/Postman: upload foto → CI4 → Python → deteksi → DB terisi lengkap (foto_asli, foto_hasil, jumlah_lubang, keparahan, confidence).

**Deliverable Hari 3:** AI service production-ready untuk development; alur upload → deteksi → simpan berjalan end-to-end.

---

# Hari 4 — Frontend Inti

**Tujuan:** Layout, form lapor (upload + GPS), daftar laporan (table), dan detail laporan.

## 4.1 Foundation

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | `lib/types.ts` | Definisikan interface: User, Laporan, Deteksi, Stats, dll. sesuai API. | [ ] |
| 2 | `lib/api.ts` | Axios instance baseURL dari `process.env.NEXT_PUBLIC_API_URL`. Fungsi: login, logout, getLaporan, getLaporanById, createLaporan, updateLaporan, deleteLaporan, getDashboardStats, getDashboardPeta. Handle cookie untuk token jika pakai httpOnly. | [ ] |
| 3 | Layout & Navbar | Layout root dengan Navbar (Shadcn). Link: Beranda, Lapor, Laporan, Dashboard (nanti), Login. | [ ] |

**Acceptance:** Semua type dipakai di komponen; API call tidak hardcode URL.

## 4.2 Halaman Form Lapor

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Halaman | `app/lapor/page.tsx` atau `app/page.tsx` (landing + form). | [ ] |
| 2 | Komponen LaporanForm | React Hook Form + Zod. Field: file (foto), pelapor_nama, pelapor_hp, catatan. Validasi: file wajib, tipe jpg/png, max 5MB. | [ ] |
| 3 | GPS | Ambil koordinat dari browser Geolocation API (optional); tampilkan lat/lng atau "Tidak tersedia". Kirim ke API saat submit. | [ ] |
| 4 | Submit | Panggil `createLaporan` dengan FormData (foto + JSON/fields). Tampilkan loading; sukses redirect ke daftar atau detail, error tampil toast. | [ ] |

**Acceptance:** User bisa pilih foto, isi nama/HP/catatan, dapat GPS; submit berhasil dan laporan muncul di daftar.

## 4.3 Daftar Laporan

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Halaman | `app/laporan/page.tsx`. Fetch list dari API (paginated). | [ ] |
| 2 | Tabel | Shadcn Table: kolom id, tanggal, pelapor, status, keparahan, jumlah_lubang, aksi (link ke detail). Badge untuk status & keparahan. | [ ] |
| 3 | Pagination | Kontrol halaman (prev/next atau page number). | [ ] |

**Acceptance:** Daftar laporan tampil; klik aksi ke detail.

## 4.4 Detail Laporan

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Halaman | `app/laporan/[id]/page.tsx`. Fetch by id. | [ ] |
| 2 | Tampilan | Foto asli vs foto hasil deteksi (side-by-side atau tab). Tampilkan semua field: koordinat, alamat, status, keparahan, confidence, jumlah_lubang, pelapor, catatan, tanggal. | [ ] |

**Acceptance:** Detail lengkap terbaca dari API dan tampil rapi.

**Deliverable Hari 4:** User bisa lapor dari web, lihat daftar, dan buka detail laporan.

---

# Hari 5 — Dashboard & Peta

**Tujuan:** Dashboard statistik (Recharts), peta Leaflet dengan marker per keparahan, filter dan search laporan.

## 5.1 Dashboard Statistik

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Halaman | `app/dashboard/page.tsx`. Protected (cek auth); redirect ke login jika belum login. | [ ] |
| 2 | Stats cards | Shadcn Card: total laporan, per status (terdeteksi/diproses/selesai), per keparahan (ringan/sedang/parah). Data dari `GET /api/dashboard/stats`. | [ ] |
| 3 | Grafik | Recharts: bar/line chart untuk tren atau distribusi status/keparahan. | [ ] |

**Acceptance:** Dashboard menampilkan angka dan grafik sesuai data backend.

## 5.2 Peta

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Komponen PetaLaporan | react-leaflet + Leaflet. Data dari `GET /api/dashboard/peta`. | [ ] |
| 2 | Marker | Satu marker per laporan; warna atau icon berbeda per keparahan (misal hijau/kuning/merah). Popup: id, tanggal, keparahan, link ke detail. | [ ] |
| 3 | Tampilkan di dashboard | Satu section peta di halaman dashboard. | [ ] |

**Acceptance:** Peta menampilkan semua titik laporan; klik marker buka popup/link.

## 5.3 Filter & Search

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Di halaman daftar laporan | Filter: status, keparahan. Search: nama pelapor atau catatan (jika backend mendukung). Kirim query params ke GET `/api/laporan`. | [ ] |
| 2 | URL sync | Opsional: filter tercermin di URL (query params) agar bisa di-bookmark. | [ ] |

**Acceptance:** Filter mengubah hasil list; search (jika ada) berfungsi.

**Deliverable Hari 5:** Dashboard dengan statistik, grafik, dan peta; daftar laporan dengan filter.

---

# Hari 6 — Auth Admin, Polish & Deploy

**Tujuan:** Login admin di frontend, keamanan & validasi, dokumentasi, dan persiapan deploy (Nginx, Supervisor, SSL).

## 6.1 Login Admin (Frontend)

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Halaman login | `app/login/page.tsx`. Form email + password; panggil API login. | [ ] |
| 2 | Penyimpanan token | Simpan token di httpOnly cookie (backend set cookie) atau sesuaikan dengan arsitektur; jangan localStorage. | [ ] |
| 3 | Auth state | Zustand atau Context: user + token; redirect ke dashboard setelah login. | [ ] |
| 4 | Guard | Route dashboard & laporan (admin) cek auth; jika tidak login redirect ke `/login`. | [ ] |
| 5 | Logout | Tombol logout; panggil API logout dan clear state/cookie. | [ ] |

**Acceptance:** Hanya user login yang bisa akses dashboard; logout bersih.

## 6.2 Validasi & Keamanan

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Backend | Pastikan validasi file upload (tipe, size) di LaporanController; CORS hanya dari domain frontend. | [ ] |
| 2 | Frontend | Validasi form (Zod) konsisten dengan backend. | [ ] |
| 3 | Rate limit / captcha | Opsional: rate limit pada login atau POST laporan. | [ ] |

## 6.3 Deploy & Dokumentasi

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Nginx | Config frontend (proxy ke Next.js port 3000) dan backend (CI4, php-fpm). Simpan di `deploy/nginx/` atau doc. | [ ] |
| 2 | Supervisor | Config untuk FastAPI (uvicorn port 8000). Simpan di `deploy/supervisor/`. | [ ] |
| 3 | SSL | Langkah Certbot (Let's Encrypt) didokumentasikan. | [ ] |
| 4 | README | Isi: deskripsi project, tech stack, cara setup lokal (env, migrate, jalankan 3 service), cara deploy, screenshot/demo GIF. | [ ] |

**Acceptance:** Deploy bisa diikuti dari README; Nginx + Supervisor config siap dipakai.

## 6.4 Testing & Polish

| No | Task | Detail | Checklist |
|----|------|--------|-----------|
| 1 | Test flow | Login → dashboard → lihat peta & statistik; buat laporan dari form → cek di daftar & detail; update status dari daftar/detail (jika ada UI). | [ ] |
| 2 | Error handling | Pesan error dari API ditampilkan (toast/alert); halaman tidak crash. | [ ] |
| 3 | Responsif | Layout tetap usable di mobile (form, table, peta). | [ ] |

**Deliverable Hari 6:** Aplikasi siap demo dan siap deploy; README dan config server lengkap.

---

## Checklist Akhir per Hari

- [ ] **Hari 1:** Semua repo jalan di lokal; env & struktur sesuai.
- [ ] **Hari 2:** API CI4 lengkap; JWT; CRUD + upload + PotholeDetector.
- [ ] **Hari 3:** `/detect` real; integrasi CI4–Python end-to-end.
- [ ] **Hari 4:** Form lapor, daftar, detail laporan berfungsi.
- [ ] **Hari 5:** Dashboard, statistik, peta, filter.
- [ ] **Hari 6:** Login admin, polish, README & config deploy.

---

*Dokumen ini mengacu pada `cursorrules` di root project. Jika ada perbedaan (mis. nama route atau kolom DB), utamakan cursorrules.*
