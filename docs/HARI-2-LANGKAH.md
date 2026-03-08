# Hari 2 — Step by Step (Backend CI4)

Kerjakan **satu langkah** lalu bilang **"done"** ke mentor untuk review dan lanjut langkah berikutnya.

**Cara menulis kode (urutan ngetik per file):** lihat **[HARI-2-CARA-TULIS-KODE.md](HARI-2-CARA-TULIS-KODE.md)** — di sana dijelaskan langkah konkret: perintah apa, file mana, property/method apa yang harus diisi.

**Docker:** Perintah `php spark ...` dan `composer ...` jalankan di dalam container backend:
```bash
docker compose exec backend bash
# lalu di dalam: php spark migrate, composer require ..., dll.
```

---

## Blok 2.1 — Migrasi & Model

### Step 2.1.1 — Migrasi tabel `users`

**Apa:** Buat satu file migrasi CI4 yang membuat tabel `users`.

**Di mana:** `backend/app/Database/Migrations/`  
Bisa pakai: `php spark make:migration CreateUsersTable` (di dalam container backend), lalu edit file yang muncul.

**Isi migrasi:**
- Method **`up()`**: buat tabel `users` dengan kolom:
  - `id` — INT, primary key, auto increment
  - `nama` — VARCHAR(100)
  - `email` — VARCHAR(100), UNIQUE
  - `password` — VARCHAR(255)
  - `role` — ENUM('admin','petugas'), default 'petugas'
  - `created_at` — DATETIME (bisa pakai helper CI4 untuk timestamp)
- Method **`down()`**: drop tabel `users`

**Cek:** `php spark migrate` (di container backend) tidak error. Cek di MySQL: tabel `users` ada dan strukturnya sesuai.

---

### Step 2.1.2 — Migrasi tabel `laporan_jalan`

**Apa:** Buat satu file migrasi lagi untuk tabel `laporan_jalan`.

**Di mana:** `backend/app/Database/Migrations/`  
Contoh: `php spark make:migration CreateLaporanJalanTable`

**Isi migrasi (sesuai cursorrules):**
- `id` — INT, PK, auto increment
- `foto_asli` — VARCHAR(255) NOT NULL
- `foto_hasil` — VARCHAR(255) nullable
- `latitude` — DECIMAL(10, 8) nullable
- `longitude` — DECIMAL(11, 8) nullable
- `alamat` — TEXT nullable
- `status` — ENUM('terdeteksi','diproses','selesai') default 'terdeteksi'
- `keparahan` — ENUM('ringan','sedang','parah') default 'ringan'
- `confidence` — FLOAT nullable
- `jumlah_lubang` — INT default 0
- `pelapor_nama` — VARCHAR(100) nullable
- `pelapor_hp` — VARCHAR(20) nullable
- `catatan` — TEXT nullable
- `created_at` — DATETIME
- `updated_at` — DATETIME (ON UPDATE CURRENT_TIMESTAMP)
- Di **`down()`**: drop tabel `laporan_jalan`

**Cek:** Jalankan migrasi lagi; tabel `laporan_jalan` ada di DB.

---

### Step 2.1.3 — Model User dan Laporan

**Apa:** Buat `UserModel.php` dan `LaporanModel.php`.

**Di mana:** `backend/app/Models/`

**UserModel:**
- Property: `$table = 'users'`, `$primaryKey = 'id'`, `$allowedFields` (nama, email, password, role, created_at), `$useTimestamps` jika pakai.
- Jangan pernah return/simpan password mentah ke client; untuk login pakai `password_verify()`.

**LaporanModel:**
- Property: `$table = 'laporan_jalan'`, `$primaryKey = 'id'`, `$allowedFields` (semua kolom yang boleh diisi mass assignment), `$useTimestamps = true` jika ada created_at/updated_at.

**Cek:** Di controller sementara (atau route test) panggil `$this->userModel->find(1)` dan `$this->laporanModel->findAll()` — tidak error (meski data kosong).

---

### Step 2.1.4 — Seed admin (opsional)

**Apa:** Buat seeder atau satu kali insert: satu user admin (email + password di-hash, role admin).

**Di mana:** Seeder di `app/Database/Seeds/` atau script sekali jalan. Password wajib pakai `password_hash($password, PASSWORD_DEFAULT)`.

**Cek:** Ada satu baris di tabel `users` yang bisa dipakai login nanti (email + password yang kamu tahu).

---

## Blok 2.2 — JWT & Filter

### Step 2.2.1 — Install JWT dan konfigurasi secret

**Apa:** Install `firebase/php-jwt` dan simpan secret di env.

**Di mana:**
- Di container backend: `composer require firebase/php-jwt`
- Di `backend/.env` tambah variabel: `JWT_SECRET=...` (string acak/kuat, jangan hardcode di kode)

**Cek:** Di controller/script sementara: baca secret dari env, encode payload (user_id, exp), decode lagi — dapat kembali user_id.

---

### Step 2.2.2 — JwtFilter

**Apa:** Buat Filter yang baca header `Authorization: Bearer <token>`, decode JWT, validasi; jika valid set user_id (atau user) ke request; jika tidak return 401 JSON.

**Di mana:** `backend/app/Filters/JwtFilter.php` (atau sesuai struktur Filter CI4)

**Isi:** Ambil token dari header, decode pakai JWT library, cek exp dan signature; set attribute di `$request` agar controller bisa baca user_id; jika gagal return 401 dengan body JSON.

**Cek:** Pasang filter ke satu route protected. Request tanpa token → 401. Dengan token valid → request sampai ke controller.

---

### Step 2.2.3 — Route API dan pasang filter

**Apa:** Definisikan semua route API dan pasang JwtFilter ke route yang butuh auth.

**Di mana:** `backend/app/Config/Routes.php`

**Route yang perlu ada:**
- `POST api/auth/login` → AuthController::login (tanpa filter)
- `POST api/auth/logout` → AuthController::logout (bisa pakai filter)
- `GET api/laporan` → LaporanController::index (filter)
- `GET api/laporan/(:num)` → LaporanController::show (filter)
- `POST api/laporan` → LaporanController::create (tanpa filter — public lapor)
- `PUT api/laporan/(:num)` → LaporanController::update (filter)
- `DELETE api/laporan/(:num)` → LaporanController::delete (filter)
- `GET api/dashboard/stats` → DashboardController::stats (filter)
- `GET api/dashboard/peta` → DashboardController::peta (filter)

**Cek:** GET `api/laporan` tanpa Bearer token → 401. Dengan token valid → 200 (atau data kosong).

---

## Blok 2.3 — AuthController

### Step 2.3.1 — POST login

**Apa:** AuthController method login: terima email & password, cek UserModel, `password_verify`, generate JWT, return JSON { status, message, data: { token, user } }. Jangan kirim password ke client.

**Di mana:** `backend/app/Controllers/Api/AuthController.php`

**Cek:** Postman POST `api/auth/login` body `{"email":"...", "password":"..."}` → dapat token dan user. Password salah → 401.

---

### Step 2.3.2 — POST logout

**Apa:** Endpoint logout: return 200 + message sukses (server tidak simpan token; client yang hapus token).

**Di mana:** Method di AuthController yang sama.

**Cek:** POST logout dengan Bearer token → 200.

---

## Blok 2.4 — LaporanController (CRUD + upload)

### Step 2.4.1 — GET list dan GET by id

**Apa:** LaporanController: method index (list dengan pagination + filter status/keparahan), method show($id) (detail by id, 404 jika tidak ada). Return JSON format konsisten (status, data, meta untuk list).

**Di mana:** `backend/app/Controllers/Api/LaporanController.php`

**Cek:** GET `api/laporan` → array + meta; GET `api/laporan/1` → 200 atau 404.

---

### Step 2.4.2 — POST laporan (upload foto)

**Apa:** Method create: terima multipart (file foto + latitude, longitude, pelapor_nama, pelapor_hp, catatan). Validasi: file jpg/jpeg/png, max 5MB. Simpan file ke `public/uploads/jalan/` nama unik, simpan path ke `foto_asli`. Insert record dengan nilai default untuk foto_hasil, jumlah_lubang, keparahan (PotholeDetector nanti di step berikutnya). Return 201 + data laporan.

**Di mana:** LaporanController::create

**Cek:** Postman POST multipart dengan field `foto` + field lain → file tersimpan, record masuk DB.

---

### Step 2.4.3 — PUT dan DELETE

**Apa:** Method update($id): terima body JSON (minimal status), update kolom yang diizinkan, return 200 + data terbaru. Method delete($id): hapus record, return 200.

**Di mana:** LaporanController

**Cek:** PUT `api/laporan/1` body `{"status":"diproses"}` → 200; DELETE `api/laporan/1` → 200; GET `api/laporan/1` setelah delete → 404.

---

### Step 2.4.4 — Library PotholeDetector + integrasi

**Apa:** Buat `app/Libraries/PotholeDetector.php` dengan method `detect(string $pathGambar): array`. Di dalam: baca file, encode base64, POST ke AI service (URL dari env, misal `AI_SERVICE_URL`) `/detect`, parse JSON. Jika error/timeout return default (jumlah_lubang 0, keparahan ringan). Di LaporanController setelah simpan foto: panggil PotholeDetector, dari hasil isi foto_hasil (simpan file base64 ke uploads), jumlah_lubang, keparahan, confidence ke record lalu update.

**Di mana:** `backend/app/Libraries/PotholeDetector.php` dan panggilan di LaporanController::create

**Cek:** POST laporan dengan foto → AI service (dummy) dipanggil, DB terisi foto_hasil/jumlah_lubang/keparahan. Matikan AI service → POST tetap sukses dengan nilai default (tidak 500).

---

## Blok 2.5 — DashboardController

### Step 2.5.1 — GET stats dan GET peta

**Apa:** DashboardController: GET stats (aggregasi: total laporan, per status, per keparahan). GET peta (list id, latitude, longitude, keparahan untuk marker). Return JSON.

**Di mana:** `backend/app/Controllers/Api/DashboardController.php`

**Cek:** GET `api/dashboard/stats` dan GET `api/dashboard/peta` return JSON (bisa kosong).

---

## Cek akhir Hari 2

- [ ] Migrasi jalan; User dan Laporan model dipakai di controller.
- [ ] JWT: login dapat token; route protected butuh Bearer token.
- [ ] Laporan: GET list & by id, POST dengan upload, PUT, DELETE. PotholeDetector terhubung ke AI service.
- [ ] Dashboard stats & peta return data.

Selesai Hari 2 → lanjut **Hari 3** (AI service real dengan YOLO).
