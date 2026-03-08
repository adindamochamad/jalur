# Bimbingan Step-by-Step — Kamu Nulis, Saya Bimbing

Dokumen ini panduan **guru les**: kamu yang menulis kode, saya (Cursor) yang membimbing. Setiap langkah jelaskan **apa yang harus kamu lakukan**, **konsep yang perlu kamu pahami**, dan **bagaimana mengecek sendiri**. Kalau stuck, kirim pesan ke saya: "Saya di [Hari X, Langkah Y], error/bingung [jelaskan]" — nanti saya bantu tanpa mengerjakan semuanya untuk kamu.

**Cara pakai:** Kerjakan per hari, per blok. Selesaikan satu blok (dan cek sendiri) baru lanjut. Jangan loncat ke hari berikut sebelum hari ini benar-benar jalan.

---

## Cara Kerja Bimbingan

- **Langkah** = urutan yang kamu kerjakan.
- **Konsep** = hal yang perlu kamu pahami sebelum/saat nulis kode.
- **Yang kamu tulis** = gambaran apa yang harus ada di kode (bukan kode jadi).
- **Cek sendiri** = cara memastikan langkah ini sudah benar.
- **Kalau stuck** = contoh pertanyaan yang bisa kamu tanyakan ke saya.

---

# Hari 1 — Setup & Infrastruktur

Tujuan hari ini: **environment siap**. Kamu belum nulis logika bisnis; fokus instalasi, konfigurasi, dan struktur folder.

---

## Blok 1.1 — Frontend (Next.js + Shadcn)

### Langkah 1: Init Next.js

- **Yang kamu lakukan:** Jalankan perintah create-next-app. Pilih **App Router**, TypeScript, Tailwind, ESLint. Jangan pakai `src/` jika kamu ingin struktur flat (atau pakai kalau kamu lebih nyaman).
- **Konsep:** App Router artinya halaman ada di folder `app/`; `page.tsx` = halaman, `layout.tsx` = layout. Nanti semua halaman kita pakai pola ini.
- **Cek sendiri:** Masuk folder `frontend`, jalankan `npm run dev`, buka browser — halaman default Next.js tampil.
- **Kalau stuck:** "Next.js saya error [pesan error]" atau "Mau pakai App Router, opsi mana yang dipilih?"

### Langkah 2: Init Shadcn UI

- **Yang kamu lakukan:** Di dalam folder `frontend`, jalankan `npx shadcn@latest init`. Jawab pertanyaan (style, base color). Ini akan menambah file konfigurasi dan folder `components/ui`.
- **Konsep:** Shadcn bukan npm package satu paket; kita tambah komponen satu per satu dengan `npx shadcn@latest add <nama>`. Jadi bundle tetap kecil.
- **Cek sendiri:** Setelah init, coba buat file `app/page.tsx` yang import `Button` dari `@/components/ui/button` dan render satu `<Button>Klik</Button>`. Halaman tampil tanpa error.
- **Kalau stuck:** "Shadcn init gagal" atau "Import Button dari mana?"

### Langkah 3: Tambah komponen yang akan dipakai

- **Yang kamu lakukan:** Tambah satu per satu: `button`, `card`, `input`, `table`, `badge`, `dialog`, `skeleton`, `toast`, `form`, `label`, `textarea`. Jangan install semua komponen sekaligus.
- **Konsep:** Setiap `add` akan mengisi file di `components/ui/` dan memakai `lib/utils.ts` (fungsi `cn`). Pastikan `lib/utils.ts` sudah ada (biasanya dari init Shadcn).
- **Cek sendiri:** Import salah satu (misalnya `Card`) di `page.tsx`, render, tidak error.
- **Kalau stuck:** "Waktu add form, dependency error" — kirim pesan error.

### Langkah 4: Env dan file kosong untuk API

- **Yang kamu lakukan:** Buat `.env.local` di `frontend`. Isi satu baris: `NEXT_PUBLIC_API_URL=http://localhost:8080` (atau port yang akan dipakai CI4). Buat file kosong (atau isi minimal): `lib/api.ts`, `lib/types.ts`. Di `api.ts` nanti kamu pakai `process.env.NEXT_PUBLIC_API_URL` — jangan hardcode URL.
- **Konsep:** Di Next.js, env yang boleh dipakai di browser harus pakai prefix `NEXT_PUBLIC_`.
- **Cek sendiri:** Di suatu komponen, `console.log(process.env.NEXT_PUBLIC_API_URL)` — di browser console keluar URL yang kamu set.
- **Kalau stuck:** "Env tidak ke-load" — pastikan nama file `.env.local` dan variabel `NEXT_PUBLIC_*`.

---

## Blok 1.2 — Backend (CodeIgniter 4)

### Langkah 1: Init CI4

- **Yang kamu lakukan:** Di root project (sejajar dengan `frontend`), jalankan `composer create-project codeigniter4/appstarter backend`. Pastikan PHP ≥ 8.1 (`php -v`).
- **Konsep:** CI4 pakai folder `app/` untuk Controllers, Models, Config. Entry point web ada di `public/index.php`; document root harus mengarah ke folder `public/`.
- **Cek sendiri:** Masuk `backend`, jalankan `php spark serve`, buka `http://localhost:8080` — halaman welcome CI4.
- **Kalau stuck:** "Composer error" / "spark serve tidak ditemukan" — kirim pesan error.

### Langkah 2: Konfigurasi env dan database

- **Yang kamu lakukan:** Copy file `env` ke `.env`. Di `.env` set `CI_ENVIRONMENT = development`. Isi bagian database: host, nama database, username, password. Buat database di MySQL (nama bebas, misal `pothole_db`).
- **Konsep:** CI4 baca konfigurasi dari `.env`; file `env` hanya template, jangan dipakai langsung.
- **Cek sendiri:** Buat controller sederhana di `app/Controllers/` yang return JSON. Tambah route ke `app/Config/Routes.php` yang mengarah ke controller itu. Akses lewat browser — dapat JSON. (Ini memastikan routing dan env jalan.)
- **Kalau stuck:** "Database connection failed" — cek nama DB, user, password, dan bahwa MySQL sudah jalan.

### Langkah 3: Struktur API dan CORS

- **Yang kamu lakukan:** Buat folder `app/Controllers/Api/`. Nanti semua controller API kita taruh di sini. CORS: cari di dokumentasi CI4 cara enable CORS (bisa lewat Filter atau Config); allow origin `http://localhost:3000` (frontend).
- **Konsep:** CORS diperlukan agar browser mengizinkan frontend (port 3000) memanggil backend (port 8080). Tanpa CORS, request bisa diblok browser.
- **Cek sendiri:** Dari frontend, panggil endpoint JSON yang tadi pakai `fetch(NEXT_PUBLIC_API_URL + '/...')`. Tidak ada error CORS di console.
- **Kalau stuck:** "CORS error di browser" — kirim pesan error dan saya bantu cek header.

### Langkah 4: Folder upload

- **Yang kamu lakukan:** Buat folder `backend/public/uploads/jalan/`. Pastikan bisa ditulis (permission). Nanti file foto dari user akan disimpan di sini.
- **Cek sendiri:** Dari PHP (bisa lewat controller sementara) coba `file_put_contents` satu file dummy di folder itu. Berhasil tanpa error.
- **Kalau stuck:** "Permission denied" — cek ownership dan chmod folder.

---

## Blok 1.3 — AI Service (Python FastAPI)

### Langkah 1: Virtual env dan dependency

- **Yang kamu lakukan:** Di folder `ai-service`, buat virtual env: `python3 -m venv venv`. Aktifkan (`source venv/bin/activate` di Mac/Linux). Buat `requirements.txt` berisi: fastapi, uvicorn, ultralytics, opencv-python-headless, pillow, pydantic. Lalu `pip install -r requirements.txt`.
- **Konsep:** Virtual env mengisolasi dependency project ini dari Python global. Ultralytics = library YOLOv8; kita pakai nanti di Hari 3.
- **Cek sendiri:** `pip list` menampilkan fastapi, uvicorn, ultralytics.
- **Kalau stuck:** "ultralytics install gagal" — kadang butuh versi Python tertentu; kirim versi Python kamu.

### Langkah 2: FastAPI app dan endpoint dummy

- **Yang kamu lakukan:** Buat `main.py`. Di dalamnya buat instance FastAPI. Tambah satu route `POST /detect` yang: terima body JSON (misalnya satu field `image_base64`), tidak perlu diproses dulu; return JSON `{ "success": true, "jumlah_lubang": 0, "message": "ok" }`.
- **Konsep:** FastAPI otomatis baca body JSON; nanti kita validasi dengan Pydantic. Untuk sekarang tujuan kita hanya memastikan endpoint bisa dipanggil dari luar (misalnya CI4).
- **Cek sendiri:** Jalankan `uvicorn main:app --reload --host 127.0.0.1 --port 8000`. Pakai Postman atau curl: `POST http://127.0.0.1:8000/detect` dengan body `{"image_base64": "abc"}` — response JSON dengan `success: true`.
- **Kalau stuck:** "Route tidak ketemu" / "405 Method Not Allowed" — pastikan method POST dan path `/detect` persis.

### Langkah 3: Struktur untuk Hari 3

- **Yang kamu lakukan:** Buat file `detector.py` (kosong atau berisi satu function dummy). Buat folder `models/`. Nanti model YOLO (file `.pt`) akan ditaruh di sini. Jika belum punya model pothole, catat saja: "Hari 3 pakai yolov8n.pt dulu".
- **Cek sendiri:** Tidak ada yang harus "jalan" di sini; yang penting struktur siap.
- **Kalau stuck:** Tidak perlu — ini hanya persiapan.

---

## Blok 1.4 — Database (MySQL)

- **Yang kamu lakukan:** Buat database (sudah disebut di Blok 1.2). Pastikan credential di `.env` CI4 benar. Migrasi tabel **belum** wajib di Hari 1; bisa kamu lakukan di awal Hari 2.
- **Cek sendiri:** Dari CI4, coba koneksi ke DB (bisa lewat `php spark migrate` nanti setelah migrasi ada, atau script kecil yang hanya connect).
- **Kalau stuck:** "SQLSTATE connection refused" — cek MySQL jalan dan host/user/password.

---

## Cek Akhir Hari 1

- [ ] Frontend: `npm run dev` → halaman tampil, Shadcn Button/Card bisa dipakai, env API URL terbaca.
- [ ] Backend: `php spark serve` → welcome/JSON bisa diakses; CORS allow localhost:3000; folder upload ada.
- [ ] AI service: `uvicorn main:app --port 8000` → POST `/detect` return JSON.
- [ ] Database: Bisa connect dari CI4.

Kalau semua centang, kamu siap ke **Hari 2**. Kalau ada yang belum, jangan loncat — selesaikan dulu, atau tanya saya dengan menyebut blok dan langkah.

---

# Hari 2 — Backend CI4 (Kamu Nulis API)

Tujuan: **Kamu menulis** migrasi, JWT, Auth, Laporan CRUD, dan library PotholeDetector. Saya bimbing logika dan urutan.

---

## Blok 2.1 — Migrasi & Model

### Langkah 1: Migrasi tabel `users`

- **Konsep:** Di CI4, migrasi dipakai agar skema DB bisa diversioning dan dijalankan dengan `php spark migrate`. Satu file migrasi = satu perubahan (bisa lebih dari satu tabel).
- **Yang kamu tulis:** Satu file migrasi yang membuat tabel `users` dengan kolom: id (PK, auto increment), nama (varchar), email (varchar, unique), password (varchar 255), role (enum 'admin','petugas'), created_at. Gunakan format CI4 (method `up()` dan `down()`).
- **Cek sendiri:** `php spark migrate` — tidak error; cek di MySQL, tabel `users` ada dan strukturnya benar.
- **Kalau stuck:** "Cara buat migrasi CI4" / "Kolom enum di migrasi CI4" — tanya saya, saya jelaskan tanpa nuliskan seluruh file.

### Langkah 2: Migrasi tabel `laporan_jalan`

- **Yang kamu tulis:** Satu file migrasi lagi untuk tabel `laporan_jalan`. Kolom sesuai cursorrules: id, foto_asli, foto_hasil, latitude, longitude, alamat, status (enum terdeteksi/diproses/selesai), keparahan (enum ringan/sedang/parah), confidence, jumlah_lubang, pelapor_nama, pelapor_hp, catatan, created_at, updated_at. Tipe dan panjang ikuti skema di cursorrules.
- **Cek sendiri:** Jalankan migrasi lagi; tabel `laporan_jalan` muncul di DB.
- **Kalau stuck:** "Decimal untuk lat/long" — pakai DECIMAL(10,8) dan DECIMAL(11,8).

### Langkah 3: Model User dan Laporan

- **Yang kamu tulis:** `UserModel.php` dan `LaporanModel.php` di `app/Models/`. Set property `$table`, `$primaryKey`, `$allowedFields`, `$useTimestamps` jika pakai. Untuk User, jangan simpan/return password mentah; untuk keperluan login kamu akan pakai `password_verify()`.
- **Konsep:** Model CI4 untuk query builder dan representasi satu baris. `allowedFields` mengontrol mana kolom yang bisa diisi lewat mass assignment.
- **Cek sendiri:** Di controller sementara, pakai `$this->userModel->find(1)` atau `$this->laporanModel->findAll()` — tidak error (meski data kosong).
- **Kalau stuck:** "Cara pakai Model di CI4" — saya bisa kasih pola dasar tanpa mengerjakan seluruh controller.

### Langkah 4: Seed admin (opsional tapi berguna)

- **Yang kamu tulis:** Buat seeder atau satu kali insert: satu baris di `users` dengan email (misal admin@localhost), password di-hash pakai `password_hash($password, PASSWORD_DEFAULT)`, role admin. Simpan password hash, jangan plain text.
- **Cek sendiri:** Ada satu user yang bisa dipakai untuk login nanti.
- **Kalau stuck:** "Cara buat seed di CI4" — saya bimbing step-nya.

---

## Blok 2.2 — JWT & Filter

### Langkah 1: Install dan konfigurasi JWT

- **Yang kamu lakukan:** `composer require firebase/php-jwt`. Baca dokumentasi singkat: encode payload (misal user_id, email, exp), pakai secret. Simpan secret di `.env` (variabel misal `JWT_SECRET`), jangan di kode.
- **Konsep:** JWT = token yang berisi payload (claim) dan tanda tangan. Backend hanya perlu verify tanda tangan dan baca user_id; tidak perlu simpan token di DB (stateless).
- **Yang kamu tulis:** Di mana pun kamu akan generate token (nanti di AuthController), baca secret dari `getenv('JWT_SECRET')` atau lewat Config. Generate token dengan exp (misal 1 jam).
- **Cek sendiri:** Dari satu script/controller sementara, generate token dan decode lagi — dapat kembali user_id.
- **Kalau stuck:** "Contoh encode/decode firebase/php-jwt" — saya beri pola singkat.

### Langkah 2: JwtFilter

- **Konsep:** Filter di CI4 jalan sebelum/sesudah request masuk ke controller. Kita pakai filter yang: baca header `Authorization: Bearer <token>`, decode JWT, cek exp dan signature; jika valid, simpan user_id (atau object user) ke request agar controller bisa pakai. Jika tidak valid/tidak ada token, return 401 JSON.
- **Yang kamu tulis:** Satu class Filter (baca dokumentasi CI4 "Filters"). Di method filter-nya: ambil header, parse Bearer token, decode, validasi; set attribute di request (misal `$request->user_id = ...`). Return 401 dengan JSON body jika gagal.
- **Cek sendiri:** Pasang filter ke satu route yang "protected". Tanpa header → 401. Dengan token valid → request sampai ke controller (controller bisa baca user_id dari request).
- **Kalau stuck:** "Cara pasang Filter ke route di CI4" / "Cara return 401 dari Filter" — tanya saya.

### Langkah 3: Route dan pemasangan filter

- **Yang kamu tulis:** Di `Routes.php` definisikan route ke API: `post('api/auth/login', ...)`, `post('api/auth/logout', ...)`, `get('api/laporan', ...)`, `get('api/laporan/(:num)', ...)`, `post('api/laporan', ...)`, `put('api/laporan/(:num)', ...)`, `delete('api/laporan/(:num)', ...)`, dan dashboard. Pasang JwtFilter ke route yang butuh auth (semua kecuali login dan post laporan — post laporan biasanya public). Pastikan method HTTP sesuai (get/post/put/delete).
- **Cek sendiri:** Request GET `api/laporan` tanpa token → 401. Dengan token valid → 200 (atau 200 dengan data kosong).
- **Kalau stuck:** "Route group dengan filter" — saya bimbing.

---

## Blok 2.3 — AuthController

### Langkah 1: POST login

- **Yang kamu tulis:** AuthController dengan method login. Terima input `email` dan `password` (dari `$this->request->getJSON(true)` atau getPost). Cari user by email pakai UserModel. Jika tidak ada → return 401 JSON. Jika ada, pakai `password_verify($password, $user->password)`. Jika salah → 401. Jika benar: generate JWT (payload: user id, email, exp), return JSON `{ "status": true, "message": "Berhasil", "data": { "token": "...", "user": { "id", "nama", "email", "role" } } }`. Jangan kirim password ke client.
- **Cek sendiri:** Postman: POST body `{"email":"admin@...", "password":"..."}` → dapat token dan user. Password salah → 401.
- **Kalau stuck:** "Cara baca JSON body di CI4" / "Struktur response yang konsisten" — saya bantu.

### Langkah 2: POST logout

- **Yang kamu tulis:** Endpoint logout. Karena JWT stateless, "logout" di server = tidak melakukan apa-apa; client yang akan membuang token/cookie. Return 200 dengan message sukses saja.
- **Cek sendiri:** POST logout dengan Bearer token → 200. Setelah itu token yang sama tetap valid sampai exp (ini expected; client harus hapus token).
- **Kalau stuck:** Biasanya tidak; kalau mau "invalidate token" butuh blacklist di DB, itu opsional.

---

## Blok 2.4 — LaporanController (CRUD + upload)

### Langkah 1: GET list dan GET by id

- **Yang kamu tulis:** LaporanController. Method index: ambil query param untuk pagination (page, per_page) dan filter (status, keparahan). Pakai LaporanModel untuk query dengan limit/offset dan where. Return JSON: `{ "status": true, "data": [ ... ], "meta": { "total", "page", "per_page" } }`. Method show($id): find($id); jika null return 404 JSON; jika ada return 200 dengan data laporan.
- **Konsep:** Pagination = limit offset dari (page-1)*per_page. Total count pakai query terpisah atau method count.
- **Cek sendiri:** GET api/laporan → array (kosong atau berisi); GET api/laporan/1 → 404 jika tidak ada, 200 dengan object jika ada.
- **Kalau stuck:** "Query builder CI4 where + limit" — saya bimbing.

### Langkah 2: POST laporan (upload foto)

- **Konsep:** Upload file di CI4 lewat `$this->request->getFile('foto')`. Validasi: cek file ada, cek tipe (jpg, jpeg, png), cek size (max 5MB). Pindahkan file ke `FCPATH . 'uploads/jalan/'` dengan nama unik (uniqid() + ekstensi). Simpan path relatif (misal `uploads/jalan/xxx.jpg`) ke kolom `foto_asli`. Field lain (latitude, longitude, pelapor_nama, pelapor_hp, catatan) dari getPost/getJSON.
- **Yang kamu tulis:** Validasi input; simpan file; buat record di LaporanModel dengan foto_asli, koordinat, pelapor, catatan. Untuk `foto_hasil`, `jumlah_lubang`, `keparahan`, `confidence` — sementara isi default (misal null, 0, 'ringan', null) karena PotholeDetector akan kamu sambung di Langkah 4 atau Hari 3. Return 201 dengan data laporan yang baru dibuat.
- **Cek sendiri:** Postman: POST multipart dengan field `foto` (file) + field lain. Cek file ada di `public/uploads/jalan/`, record masuk DB.
- **Kalau stuck:** "Validasi file upload CI4" / "getFile vs getPost" — tanya saya.

### Langkah 3: PUT dan DELETE

- **Yang kamu tulis:** Update: terima id dari route, body JSON (minimal status). Cari laporan by id; jika tidak ada 404. Jika ada, update kolom yang diizinkan (misal status). Return 200 dengan data terbaru. Delete: cari by id; jika tidak ada 404; jika ada hapus (delete). Return 200. Nanti di Hari 6 kamu bisa tambah pengecekan role (hanya admin yang boleh put/delete).
- **Cek sendiri:** PUT api/laporan/1 dengan body `{"status":"diproses"}` → 200; GET api/laporan/1 → status berubah. DELETE api/laporan/1 → 200; GET api/laporan/1 → 404.
- **Kalau stuck:** "Update satu kolom di CI4 Model" — saya bimbing.

### Langkah 4: Library PotholeDetector

- **Konsep:** CI4 Library = class di `app/Libraries/` yang bisa di-inject atau di-load. PotholeDetector punya satu tanggung jawab: terima path file gambar, kirim ke Python `/detect`, terima JSON, return array hasil (jumlah_lubang, keparahan, confidence, foto_hasil_base64 atau path).
- **Yang kamu tulis:** Buat `app/Libraries/PotholeDetector.php`. Method misal `detect(string $pathGambar): array`. Di dalam: baca file, encode base64 (sesuai kontrak API Python di cursorrules). Pakai CURLRequest CI4 atau `curl` untuk POST ke `http://127.0.0.1:8000/detect` dengan body JSON. Set timeout (misal 30 detik). Parse response JSON. Jika error/timeout, return array default (jumlah_lubang 0, keparahan ringan, foto_hasil null). Jika sukses, return data yang diperlukan (jumlah_lubang, keparahan, confidence, foto_hasil_base64).
- **Integrasi:** Di LaporanController setelah simpan file, panggil PotholeDetector->detect(path file). Dari hasil: jika ada foto_hasil_base64, decode dan simpan ke `uploads/jalan/` dengan nama lain (misal uniqid()_hasil.jpg), isi kolom foto_hasil. Isi jumlah_lubang, keparahan, confidence ke record laporan lalu update.
- **Cek sendiri:** Pastikan AI service jalan (endpoint dummy Hari 1). POST laporan dengan foto → di DB terisi foto_hasil, jumlah_lubang, keparahan (dari response Python). Matikan Python → POST laporan tetap sukses dengan nilai default (tidak error 500).
- **Kalau stuck:** "CURLRequest CI4 ke URL lain" / "Cara baca file jadi base64 di PHP" — saya bimbing.

---

## Blok 2.5 — DashboardController

- **Yang kamu tulis:** GET stats: query aggregasi (COUNT total, COUNT per status, COUNT per keparahan). Return JSON. GET peta: list laporan dengan kolom id, latitude, longitude, keparahan (untuk marker). Return JSON array.
- **Cek sendiri:** GET api/dashboard/stats dan api/dashboard/peta return JSON yang masuk akal (bisa kosong).
- **Kalau stuck:** "Query group by di CI4" — saya bimbing.

---

## Cek Akhir Hari 2

- [ ] Migrasi jalan; User dan Laporan model dipakai di controller.
- [ ] JWT: login dapat token; route protected butuh Bearer token.
- [ ] Laporan: GET list & by id, POST dengan upload, PUT, DELETE. PotholeDetector terhubung ke Python (dummy atau real).
- [ ] Dashboard stats & peta return data.

Selesai Hari 2 → lanjut **Hari 3** (AI service real).

---

# Hari 3 — AI Service (Kamu Nulis Deteksi YOLO)

Tujuan: **Kamu menulis** endpoint `/detect` yang benar-benar pakai YOLOv8, load model sekali, dan return sesuai kontrak. CI4 sudah siap memanggil ini dari Hari 2.

---

## Blok 3.1 — Load model sekali di startup

- **Konsep:** Model YOLO besar; load sekali saat aplikasi start, simpan di variabel global atau state app. Jangan load di setiap request.
- **Yang kamu tulis:** Di `main.py`, pakai `@app.on_event("startup")` (atau lifespan FastAPI). Di dalamnya: load model `YOLO("models/pothole_yolov8.pt")` atau fallback `YOLO("yolov8n.pt")` jika file tidak ada. Simpan referensi model di variabel global (misal `model = None` lalu di startup `model = YOLO(...)`).
- **Cek sendiri:** Start uvicorn; di log atau print sekali "Model loaded". Restart, lagi sekali. Tidak load per request.
- **Kalau stuck:** "FastAPI startup event" / "ultralytics YOLO load" — saya bimbing.

---

## Blok 3.2 — Endpoint /detect lengkap

- **Konsep:** Request body: base64 image (boleh dengan prefix `data:image/...;base64,`). Decode → image. Predict pakai model. Parse hasil: bounding box, confidence. Hitung jumlah_lubang; tentukan keparahan (kamu definisikan rule: misal dari jumlah_lubang + confidence). Gambar hasil = gambar asli + overlay bbox (OpenCV/Pillow), encode lagi ke base64.
- **Yang kamu tulis:**  
  - Pydantic model untuk request (field image_base64 string).  
  - Decode base64 (buang prefix jika ada) → bytes → image (PIL atau cv2).  
  - Panggil `model.predict(image)`. Dari hasil ambil boxes, confidence, class.  
  - Hitung jumlah deteksi; tentukan keparahan (misal: 0 = ringan, 1–2 = sedang, 3+ = parah; atau pakai confidence rata-rata).  
  - Gambar hasil: draw rectangle di image, encode ke base64.  
  - Response JSON: success, message, jumlah_lubang, keparahan, confidence, foto_hasil_base64, deteksi (list of bbox + confidence).  
  - Pakai `logging` untuk log error dan lama inferensi; jangan print.
- **Cek sendiri:** POST dengan base64 foto jalan (atau foto apa saja) → response berisi jumlah_lubang (bisa 0), keparahan, foto_hasil_base64 yang bisa di-decode jadi gambar. Tidak error 500.
- **Kalau stuck:** "Cara parse hasil model.predict ultralytics" / "Draw bbox OpenCV" / "Rule keparahan" — saya bimbing step-nya tanpa nuliskan seluruh file.

---

## Blok 3.3 — Integrasi dengan CI4

- **Yang kamu tulis (di CI4):** Di PotholeDetector, pastikan format request sama dengan yang Python terima (image_base64). Di LaporanController setelah dapat foto_hasil_base64 dari Python: decode base64 ke file, simpan di `uploads/jalan/` dengan nama unik, simpan path ke kolom foto_hasil. Sudah kamu siapkan di Hari 2; sekarang pastikan format request/response match dan simpan file hasil.
- **Cek sendiri:** End-to-end: upload dari Postman/frontend → CI4 terima → kirim ke Python → Python return hasil deteksi → CI4 simpan foto_hasil dan update jumlah_lubang, keparahan, confidence. Cek di DB dan di folder uploads.
- **Kalau stuck:** "Base64 decode di PHP simpan ke file" — saya bimbing.

---

## Cek Akhir Hari 3

- [ ] Model load sekali; /detect jalan dengan YOLO.
- [ ] Response sesuai kontrak; foto_hasil_base64 valid.
- [ ] CI4 → Python → simpan hasil ke DB dan file.

Selesai → **Hari 4** (frontend).

---

# Hari 4 — Frontend Inti (Kamu Nulis Halaman & Form)

Tujuan: **Kamu menulis** types, API client, layout, form lapor, daftar laporan, dan detail laporan.

---

## Blok 4.1 — Types dan API client

- **Yang kamu tulis:** Di `lib/types.ts` definisikan interface TypeScript: User, Laporan (sesuai response API), Deteksi (jika ada), Stats, Meta pagination, dll. Sesuaikan dengan JSON yang backend return.
- **Yang kamu tulis:** Di `lib/api.ts` buat instance Axios dengan baseURL dari `process.env.NEXT_PUBLIC_API_URL`. Buat fungsi: login(body), logout(), getLaporan(params?), getLaporanById(id), createLaporan(formData), updateLaporan(id, body), deleteLaporan(id), getDashboardStats(), getDashboardPeta(). Untuk auth: jika pakai cookie, set credentials; jika pakai header, kamu bisa set token ke header di interceptor (token nanti dari state/cookie setelah login).
- **Konsep:** Satu tempat untuk semua panggilan API; komponen tidak fetch langsung. Type dari types.ts dipakai di seluruh app.
- **Cek sendiri:** Di halaman sementara panggil getLaporan() — tidak error (bisa data kosong). Cek network tab: request ke URL yang benar.
- **Kalau stuck:** "Axios interceptor untuk token" / "FormData untuk upload" — saya bimbing.

---

## Blok 4.2 — Layout dan Navbar

- **Yang kamu tulis:** Layout root (app/layout.tsx) dengan Navbar. Navbar berisi link: Beranda (/), Lapor (atau form lapor), Laporan (daftar), Dashboard (/dashboard), Login (/login). Pakai komponen Shadcn (Button, Link). Tidak perlu auth state dulu; cukup link.
- **Cek sendiri:** Semua link bisa diklik; halaman yang dikunjungi sesuai (boleh 404 dulu untuk halaman yang belum ada).
- **Kalau stuck:** "Next.js Link vs a" — pakai next/link untuk client-side navigation.

---

## Blok 4.3 — Form lapor

- **Konsep:** React Hook Form + Zod: schema validasi (file wajib, tipe jpg/png, max 5MB; nama, hp, catatan optional/required sesuai kebutuhan). GPS: navigator.geolocation.getCurrentPosition untuk dapat lat/lng; kirim ke API.
- **Yang kamu tulis:** Halaman (misal app/page.tsx atau app/lapor/page.tsx). Komponen form: input file, input nama, hp, textarea catatan. Tombol "Ambil GPS" atau auto saat mount; tampilkan lat/lng. Submit: bangun FormData (append file + field lain + latitude, longitude). Panggil createLaporan(formData). Loading state; on success redirect ke daftar atau detail; on error tampilkan toast.
- **Cek sendiri:** Isi form, pilih file, submit → di backend muncul laporan baru; redirect berhasil. Validasi: file > 5MB atau bukan image → error tampil.
- **Kalau stuck:** "React Hook Form dengan file upload" / "Zod schema file" — saya bimbing.

---

## Blok 4.4 — Daftar laporan

- **Yang kamu tulis:** Halaman app/laporan/page.tsx. Fetch getLaporan() (dengan param page jika ada). Tampilkan di Shadcn Table: kolom yang relevan (id, tanggal, pelapor, status, keparahan, jumlah_lubang). Status dan keparahan pakai Badge. Kolom aksi: link ke `/laporan/[id]`. Pagination: tombol prev/next atau nomor halaman; saat ganti halaman fetch lagi dengan page baru.
- **Cek sendiri:** Daftar tampil; klik ke detail membuka URL yang benar.
- **Kalau stuck:** "Dynamic route Next.js [id]" — saya bimbing.

---

## Blok 4.5 — Detail laporan

- **Yang kamu tulis:** app/laporan/[id]/page.tsx. Ambil id dari params, panggil getLaporanById(id). Tampilkan: foto asli vs foto hasil (jika ada); semua field (koordinat, alamat, status, keparahan, confidence, jumlah_lubang, pelapor, catatan, tanggal). Pakai Card dan layout yang rapi.
- **Cek sendiri:** Dari daftar klik satu laporan → detail tampil lengkap; foto hasil tampil jika ada.
- **Kalau stuck:** "Next.js 14 params di page" — params di server component bisa async; saya bimbing.

---

## Cek Akhir Hari 4

- [ ] Types dan api.ts dipakai; request ke backend benar.
- [ ] Form lapor submit berhasil; GPS dan validasi jalan.
- [ ] Daftar laporan + pagination; link ke detail.
- [ ] Detail menampilkan semua data dan foto.

Selesai → **Hari 5** (dashboard & peta).

---

# Hari 5 — Dashboard & Peta

Tujuan: **Kamu menulis** halaman dashboard (statistik + grafik), peta Leaflet, dan filter di daftar laporan.

---

## Blok 5.1 — Dashboard statistik

- **Yang kamu tulis:** app/dashboard/page.tsx. Fetch getDashboardStats(). Tampilkan beberapa Card: total laporan, per status (terdeteksi/diproses/selesai), per keparahan (ringan/sedang/parah). Install Recharts jika belum; tampilkan satu grafik (misal bar chart) distribusi status atau keparahan.
- **Konsep:** Data dari API stats; Recharts komponen butuh data array. Untuk hari ini halaman dashboard bisa belum protected (Hari 6 baru login).
- **Cek sendiri:** Angka dan grafik sesuai data di backend.
- **Kalau stuck:** "Recharts dengan Shadcn" — saya bimbing.

---

## Blok 5.2 — Peta Leaflet

- **Yang kamu tulis:** Komponen PetaLaporan. Install react-leaflet dan leaflet; ambil data dari getDashboardPeta(). Render MapContainer, TileLayer, dan untuk setiap item satu Marker. Warna/icon marker beda per keparahan (misal hijau/kuning/merah). Popup isi info singkat + link ke detail laporan.
- **Konsep:** Koordinat dari API (lat, lng); Leaflet butuh center map (bisa dari koordinat pertama atau default Indonesia).
- **Cek sendiri:** Peta tampil; marker muncul di posisi benar; klik popup bisa ke detail.
- **Kalau stuck:** "react-leaflet types" / "Marker dengan custom icon" — saya bimbing.

---

## Blok 5.3 — Filter dan search

- **Yang kamu tulis:** Di halaman daftar laporan tambah filter: dropdown atau select status dan keparahan. Saat pilih, panggil getLaporan({ status, keparahan }). Jika backend support search (nama/catatan), tambah input search dan kirim sebagai query param.
- **Cek sendiri:** Ubah filter → list berubah sesuai.
- **Kalau stuck:** "Query params di Next.js" — bisa pakai searchParams di page atau state + effect.

---

## Cek Akhir Hari 5

- [ ] Dashboard menampilkan stats dan grafik.
- [ ] Peta menampilkan marker per laporan; warna per keparahan.
- [ ] Filter daftar laporan berfungsi.

Selesai → **Hari 6** (login, polish, deploy).

---

# Hari 6 — Auth Admin, Polish & Deploy

Tujuan: **Kamu menulis** flow login di frontend, guard route, dan dokumentasi deploy; plus pengecekan akhir.

---

## Blok 6.1 — Login di frontend

- **Yang kamu tulis:** Halaman app/login/page.tsx. Form email + password. Submit panggil login(email, password). Jika sukses: simpan token (sesuai arsitektur: httpOnly cookie diset backend, atau simpan di memory/state). Simpan user ke state (Zustand atau Context). Redirect ke /dashboard. Jika gagal tampilkan pesan error.
- **Konsep:** JWT disimpan di httpOnly cookie lebih aman (backend set Set-Cookie di response login); frontend hanya kirim credentials. Jika pakai cookie, pastikan Axios pakai withCredentials dan backend CORS allow credentials.
- **Cek sendiri:** Login dengan kredensial benar → redirect dashboard. Salah → error tampil.
- **Kalau stuck:** "Set cookie dari backend CI4" / "Axios withCredentials" — saya bimbing.

---

## Blok 6.2 — Guard route & logout

- **Yang kamu tulis:** Auth state (Zustand/Context): user, token (atau "logged in"). Di layout atau di halaman dashboard/laporan: jika tidak login, redirect ke /login. Tombol Logout di Navbar: panggil logout() API, clear state/cookie, redirect ke /.
- **Cek sendiri:** Tanpa login, akses /dashboard → redirect ke /login. Setelah login bisa akses. Logout → state bersih, redirect ke home.
- **Kalau stuck:** "Redirect di Next.js client component" — pakai useRouter dan useEffect atau middleware.

---

## Blok 6.3 — Validasi & keamanan

- **Backend:** Pastikan validasi upload (tipe, size) di LaporanController; CORS hanya dari domain frontend; JWT secret kuat.
- **Frontend:** Validasi form (Zod) konsisten; tampilkan error dari API (toast).
- **Cek sendiri:** Upload file besar atau bukan image → ditolak. Request dari origin lain → CORS error (expected).

---

## Blok 6.4 — Deploy & README

- **Yang kamu tulis:** Di folder deploy (atau docs): config Nginx untuk frontend (proxy ke Next) dan backend (CI4); config Supervisor untuk FastAPI. Dokumentasi singkat: cara setup env, migrate, jalankan 3 service; cara deploy (Nginx, Supervisor, SSL dengan Certbot).
- **README:** Deskripsi project, tech stack, cara setup lokal, cara deploy, screenshot atau demo GIF.
- **Cek sendiri:** Seseorang (atau kamu di VPS) bisa ikuti README dan menjalankan app.
- **Kalau stuck:** "Nginx proxy Next.js" / "Supervisor uvicorn" — saya bimbing.

---

## Blok 6.5 — Testing flow

- **Yang kamu lakukan:** Test end-to-end: login → dashboard → lihat peta & statistik; buat laporan dari form → cek di daftar & detail; update status (jika ada UI); logout. Cek error handling (network error, 401, 404) tampil dengan baik. Cek tampilan di mobile (responsive).
- **Cek sendiri:** Semua flow utama jalan; tidak ada crash; pesan error jelas.
- **Kalau stuck:** "Responsive table Shadcn" — saya bimbing.

---

## Cek Akhir Hari 6

- [ ] Login & logout; guard route jalan.
- [ ] Validasi dan CORS sesuai.
- [ ] README dan config deploy ada.
- [ ] Test flow utama selesai.

---

# Cara Minta Bantuan ke Saya (Cursor)

Agar saya bisa bimbing tanpa mengerjakan semua kode untuk kamu, kirim pesan yang spesifik, misalnya:

- "Saya di Hari 2 Blok 2.2 Langkah 2, bingung cara return 401 dari Filter CI4."
- "Hari 3: cara ambil bounding box dari hasil model.predict ultralytics?"
- "Hari 4: React Hook Form dengan file upload dan validasi max 5MB gimana?"

Saya akan jelaskan konsep dan langkah, atau beri cuplikan kode kecil untuk pola tertentu, tanpa menuliskan seluruh file. Selamat belajar; kamu pasti bisa.
