# Hari 2 — Cara Menulis Kode (Urutan Langkah)

Dokumen ini **urutan konkret** menulis kode: apa yang diketik, di file mana, langkah demi langkah. Kamu yang ngetik; panduan ini hanya memandu.

**Semua perintah `php spark` dan `composer` jalankan dari container:**  
`docker compose exec backend bash` lalu di dalam container jalankan perintah, **atau** langsung:  
`docker compose exec backend php spark migrate`

---

## Posisi saat ini & next step (Hari 2)

| Step | Status | Keterangan |
|------|--------|------------|
| 2.1.1–2.1.4 | ✅ Selesai | Migrasi users & laporan_jalan, Model, Seed |
| 2.2.x | ✅ Selesai | JWT, Filter, .env JWT_SECRET |
| 2.3.x | ✅ Selesai | AuthController login & logout |
| 2.4.1 (index & show) | 🔶 Sebagian | GET list & detail dari DB jalan; **belum** pagination & filter (page, per_page, status, keparahan, meta) |
| 2.4.2 (create upload) | ⏳ Next | POST dengan **multipart** (upload foto), validasi, simpan ke `uploads/jalan/` |
| 2.4.3 (update & delete) | ✅ Selesai | PUT & DELETE ke DB |
| 2.4.4 | ⏳ Nanti | PotholeDetector library + integrasi di create() |
| 2.5.1 | ⏳ Nanti | DashboardController stats & peta |

**Langkah berikutnya menurut planning:** **Step 2.4.1** — tambah pagination & filter di `index()` (query param `page`, `per_page`, `status`, `keparahan`; response pakai `meta`: total, page, per_page). Setelah itu **Step 2.4.2** — ubah `create()` terima multipart (file foto), validasi, simpan file.

---

## Step 2.1.1 — Migrasi tabel `users`

### Langkah 1: Buat file migrasi
Di terminal (dari folder project jalur):
```bash
docker compose exec backend php spark make:migration CreateUsersTable
```
Akan muncul pesan berisi path file, misal: `app/Database/Migrations/2025-03-01-123456_CreateUsersTable.php`

### Langkah 2: Buka file migrasi
Buka file tersebut di editor (path lengkap: `backend/app/Database/Migrations/YYYY-MM-DD-HHMMSS_CreateUsersTable.php`).  
Pastikan namespace-nya: `namespace App\Database\Migrations;` dan class extends `Migration`.

### Langkah 3: Isi method `up()`
Hapus isi default di `up()`. Ganti dengan:

1. Panggil **`$this->forge->addField([ ... ])`** dengan satu array berisi semua kolom. Format tiap kolom: `'nama_kolom' => ['type' => '...', 'constraint' => ..., ...]`.
   - **id:** `'type' => 'INT', 'unsigned' => true, 'auto_increment' => true`
   - **nama:** `'type' => 'VARCHAR', 'constraint' => 100`
   - **email:** `'type' => 'VARCHAR', 'constraint' => 100` — nanti tambah unique lewat addUniqueKey
   - **password:** `'type' => 'VARCHAR', 'constraint' => 255`
   - **role:** `'type' => 'ENUM', 'constraint' => ['admin', 'petugas'], 'default' => 'petugas'`
   - **created_at:** `'type' => 'DATETIME', 'null' => true` (atau pakai `'default' => null`)

2. Set primary key: **`$this->forge->addKey('id', true);`** (parameter true = primary key).

3. Set unique untuk email: **`$this->forge->addUniqueKey('email');`**

4. Buat tabel: **`$this->forge->createTable('users');`**

### Langkah 4: Isi method `down()`
Di dalam `down()`: **`$this->forge->dropTable('users');`**

### Langkah 5: Simpan dan jalankan migrasi
Simpan file. Lalu di terminal:
```bash
docker compose exec backend php spark migrate
```
Jika diminta konfirmasi, pilih yes. Cek: tidak error; di MySQL tabel `users` ada.

---

## Step 2.1.2 — Migrasi tabel `laporan_jalan`

### Langkah 1: Buat file migrasi
```bash
docker compose exec backend php spark make:migration CreateLaporanJalanTable
```

### Langkah 2: Buka file yang muncul
Path: `backend/app/Database/Migrations/YYYY-MM-DD-HHMMSS_CreateLaporanJalanTable.php`

### Langkah 3: Isi method `up()`
Pakai **`$this->forge->addField([ ... ])`** dengan kolom-kolom berikut (format sama seperti users: `'nama_kolom' => ['type' => '...', 'constraint' => ..., 'null' => true` jika nullable, `'default' => ...` jika ada default):

- **id** — INT, unsigned, auto_increment
- **foto_asli** — VARCHAR(255), **tidak** null
- **foto_hasil** — VARCHAR(255), null => true
- **latitude** — DECIMAL(10, 8), null => true
- **longitude** — DECIMAL(11, 8), null => true
- **alamat** — TEXT, null => true
- **status** — ENUM('terdeteksi','diproses','selesai'), default 'terdeteksi'
- **keparahan** — ENUM('ringan','sedang','parah'), default 'ringan'
- **confidence** — FLOAT, null => true
- **jumlah_lubang** — INT, default 0
- **pelapor_nama** — VARCHAR(100), null => true
- **pelapor_hp** — VARCHAR(20), null => true
- **catatan** — TEXT, null => true
- **created_at** — DATETIME, null => true
- **updated_at** — DATETIME, null => true

Lalu: **`$this->forge->addKey('id', true);`** dan **`$this->forge->createTable('laporan_jalan');`**

### Langkah 4: Isi method `down()`
**`$this->forge->dropTable('laporan_jalan');`**

### Langkah 5: Simpan dan jalankan migrasi
Simpan file. Jalankan:  
`docker compose exec backend php spark migrate`  
Tabel `laporan_jalan` harus muncul di DB.

---

## Step 2.1.3 — Model User dan Laporan

### UserModel

1. **Buat file:** `backend/app/Models/UserModel.php`
2. **Namespace:** `namespace App\Models;`
3. **Class:** `class UserModel extends CodeIgniter\Model` (gunakan `use CodeIgniter\Model;` di atas).
4. **Property yang wajib kamu isi:**
   - `protected $table = 'users';`
   - `protected $primaryKey = 'id';`
   - `protected $allowedFields = ['nama', 'email', 'password', 'role', 'created_at'];`
   - `protected $useTimestamps = true;` — hanya jika kamu pakai kolom created_at/updated_at (users hanya punya created_at; kalau tidak ada updated_at bisa set `false` atau sesuaikan).
   - Untuk hanya created_at: bisa pakai `protected $createdField = 'created_at';` dan tidak set updatedField.
5. Jangan ada method yang return password ke client; untuk login nanti pakai `password_verify()` di controller.

### LaporanModel

1. **Buat file:** `backend/app/Models/LaporanModel.php`
2. **Namespace:** `namespace App\Models;`
3. **Class:** `class LaporanModel extends CodeIgniter\Model`
4. **Property:**
   - `protected $table = 'laporan_jalan';`
   - `protected $primaryKey = 'id';`
   - `protected $allowedFields = ['foto_asli', 'foto_hasil', 'latitude', 'longitude', 'alamat', 'status', 'keparahan', 'confidence', 'jumlah_lubang', 'pelapor_nama', 'pelapor_hp', 'catatan', 'created_at', 'updated_at'];` (sesuaikan dengan kolom yang boleh diisi)
   - `protected $useTimestamps = true;`
   - `protected $createdField = 'created_at';`
   - `protected $updatedField = 'updated_at';`

---

## Step 2.1.4 — Seed admin (opsional)

1. Buat seeder: `docker compose exec backend php spark make:seeder AdminUserSeeder`  
   Atau buat manual file di `backend/app/Database/Seeds/AdminUserSeeder.php`.
2. Di method `run()`: pakai **query builder** atau **model** untuk insert satu baris ke tabel `users`.
3. Isi: **email** (misal `admin@localhost`), **password** pakai **`password_hash('password_rahasia', PASSWORD_DEFAULT)`**, **role** = `admin`, **nama** bebas.
4. Jalan kan seeder: `docker compose exec backend php spark db:seed AdminUserSeeder`  
   (atau perintah seed yang dipakai di CI4 versi kamu — cek dengan `php spark list`).

---

## Step 2.2.1 — JWT dan secret

1. **Install package:**  
   `docker compose exec backend composer require firebase/php-jwt`
2. **Buka file:** `backend/.env`  
   Tambah satu baris: **`JWT_SECRET=string_rahasia_acak_minimal_32_karakter`** (ganti dengan string kuat).
3. Di kode (nanti di AuthController): baca secret dengan **`getenv('JWT_SECRET')`** atau lewat Config; jangan hardcode.

---

## Step 2.2.2 — JwtFilter

1. **Buat file:** `backend/app/Filters/JwtFilter.php`
2. **Namespace:** `namespace App\Filters;`
3. **Class implements** interface Filter CI4 (baca dokumentasi CI4 "Filters" — biasanya method **`before(RequestInterface $request, ...)`** dan **`after(...)`**; untuk cek token pakai **before**).
4. **Di method before (atau method yang dipanggil sebelum controller):**
   - Ambil header: **`Authorization`**
   - Parse: ambil bagian setelah **`Bearer `** (spasi setelah Bearer).
   - Jika tidak ada token: return response 401 JSON (pakai **`return $response->setStatusCode(401)->setJSON([...])`** atau cara set response di CI4).
   - Jika ada: **decode JWT** pakai library firebase/php-jwt (baca secret dari env). Cek **exp** dan validitas.
   - Jika valid: simpan **user_id** (dari payload) ke **`$request->user_id`** atau attribute request agar controller bisa baca.
   - Jika decode gagal / expired: return 401 JSON.
5. **Daftarkan filter** di `app/Config/Filters.php` (array **$aliases** dan **$filters** / **$globals** sesuai dokumentasi CI4).

---

## Step 2.2.3 — Route dan filter

1. **Buka file:** `backend/app/Config/Routes.php`
2. **Tambah route** (urutan bisa pengaruh; route lebih spesifik biasanya di atas):
   - `$routes->post('api/auth/login', 'Api\AuthController::login');`
   - `$routes->post('api/auth/logout', 'Api\AuthController::logout', ['filter' => 'jwt']);` (nama filter sesuaikan alias yang kamu daftarkan)
   - `$routes->get('api/laporan', 'Api\LaporanController::index', ['filter' => 'jwt']);`
   - `$routes->get('api/laporan/(:num)', 'Api\LaporanController::show/$1', ['filter' => 'jwt']);`
   - `$routes->post('api/laporan', 'Api\LaporanController::create');` — tanpa filter (public)
   - `$routes->put('api/laporan/(:num)', 'Api\LaporanController::update/$1', ['filter' => 'jwt']);`
   - `$routes->delete('api/laporan/(:num)', 'Api\LaporanController::delete/$1', ['filter' => 'jwt']);`
   - `$routes->get('api/dashboard/stats', 'Api\DashboardController::stats', ['filter' => 'jwt']);`
   - `$routes->get('api/dashboard/peta', 'Api\DashboardController::peta', ['filter' => 'jwt']);`
3. Sesuaikan sintaks route CI4 versi kamu (bisa **placeholder** `(:num)` atau format lain).

---

## Step 2.3.1 — AuthController login

1. **Buat file:** `backend/app/Controllers/Api/AuthController.php`
2. **Namespace:** `namespace App\Controllers\Api;`
3. **Class extends BaseController** (atau controller base yang dipakai).
4. **Inject atau load UserModel** (lewat constructor atau property).
5. **Method login():**
   - Baca body JSON: **`$this->request->getJSON(true)`** → dapat array dengan key `email`, `password`.
   - Cari user by email: **`$user = $this->userModel->where('email', $email)->first();`**
   - Jika tidak ada: return 401 JSON.
   - Jika ada: **`password_verify($password, $user['password'])`**. Jika salah → 401.
   - Jika benar: generate JWT (payload: user id, email, exp misal 1 jam), baca **JWT_SECRET** dari env, encode pakai library.
   - Return response JSON: **`{ "status": true, "message": "Berhasil", "data": { "token": "...", "user": { "id", "nama", "email", "role" } }`** — jangan kirim **password** di `user`.

---

## Step 2.3.2 — AuthController logout

1. Di **AuthController** yang sama, tambah method **logout()**.
2. Isi: return response 200 dengan body JSON misal **`["message" => "Berhasil logout"]`**. Tidak perlu hapus token di server (client yang hapus).

---

## Step 2.4.1 — LaporanController index dan show

1. **Buat file:** `backend/app/Controllers/Api/LaporanController.php`
2. Load **LaporanModel**.
3. **Method index():**
   - Ambil query param: **page**, **per_page**, **status**, **keparahan** (dari **`$this->request->getGet()`**).
   - Query: **LaporanModel** dengan **where** (jika status/keparahan ada), **limit**, **offset** (offset = (page - 1) * per_page).
   - Hitung **total** (query terpisah atau count).
   - Return JSON: **`{ "status": true, "data": [ ... ], "meta": { "total", "page", "per_page" } }`**
4. **Method show($id):**
   - **`$laporan = $this->laporanModel->find($id);`**
   - Jika null: return 404 JSON.
   - Jika ada: return 200 JSON dengan data laporan.

---

## Step 2.4.2 — LaporanController create (upload foto)

1. Di **LaporanController**, method **create()**:
   - Ambil file: **`$this->request->getFile('foto');`**
   - Validasi: file ada, **isValid()**, cek **getClientExtension()** (jpg, jpeg, png), cek **getSize()** (max 5MB = 5*1024*1024).
   - Jika gagal: return 400 JSON.
   - Pindahkan file: **`$file->move(FCPATH . 'uploads/jalan/', $namaUnik);`** — nama unik bisa **uniqid() . '.' . $file->getClientExtension()**.
   - Ambil field lain dari **getPost()** atau **getJSON()**: latitude, longitude, pelapor_nama, pelapor_hp, catatan.
   - **Insert** ke LaporanModel: foto_asli = path relatif (misal `uploads/jalan/xxx.jpg`), field lain, foto_hasil/jumlah_lubang/keparahan/confidence sementara default (null, 0, 'ringan', null).
   - Return 201 JSON dengan data laporan yang baru dibuat.

---

## Step 2.4.3 — LaporanController update dan delete

1. **Method update($id):**
   - **`$laporan = $this->laporanModel->find($id);`** — jika null return 404.
   - Baca body JSON (misal **status**): **`$this->request->getJSON(true)`**.
   - Update kolom yang diizinkan: **`$this->laporanModel->update($id, ['status' => $data['status']]);`**
   - Return 200 JSON dengan data terbaru (**find($id)** lagi atau dari return update).
2. **Method delete($id):**
   - Cari by id; jika tidak ada return 404.
   - **`$this->laporanModel->delete($id);`**
   - Return 200 JSON (message sukses).

---

## Step 2.4.4 — PotholeDetector dan integrasi

1. **Buat file:** `backend/app/Libraries/PotholeDetector.php`
2. **Method detect($pathGambar):**
   - Baca file: **file_get_contents($pathGambar)** → encode **base64_encode()**.
   - URL AI: baca dari **getenv('AI_SERVICE_URL')** (misal `http://ai-service:8000`).
   - POST ke **`$url . '/detect'`** body JSON **`{"image_base64": "..."}`** pakai **CURLRequest** CI4 atau **curl**. Timeout 30 detik.
   - Parse response JSON. Jika error/timeout: return array default **['jumlah_lubang' => 0, 'keparahan' => 'ringan', 'foto_hasil_base64' => null, 'confidence' => null]**.
   - Jika sukses: return array berisi jumlah_lubang, keparahan, confidence, foto_hasil_base64 (dari response Python).
3. **Di LaporanController::create** setelah simpan file: load PotholeDetector, panggil **detect(path file asli)**. Dari hasil: jika ada **foto_hasil_base64**, decode dan simpan ke **uploads/jalan/** dengan nama lain (misal uniqid()_hasil.jpg), isi kolom **foto_hasil**; isi **jumlah_lubang**, **keparahan**, **confidence** lalu **update** record laporan.

### Cara ngetes integrasi PotholeDetector

1. **Jalankan stack** (backend + AI service harus hidup):
   ```bash
   docker compose up -d
   ```
   Pastikan di `backend/.env` ada **AI_SERVICE_URL** (di Docker: `http://ai-service:8000`).

2. **Siapkan satu file gambar** (jpg/png, max 5MB), misal: `~/Downloads/test-jalan.jpg`.

3. **Kirim POST multipart ke API create** (endpoint create tidak pakai JWT):
   ```bash
   curl -X POST http://localhost:8010/api/laporan \
     -F "foto=@/path/ke/gambar.jpg" \
     -F "latitude=-6.2" \
     -F "longitude=106.8" \
     -F "alamat=Jl Tes Deteksi" \
     -F "pelapor_nama=Tester" \
     -F "pelapor_hp=08123456789" \
     -F "catatan=Tes integrasi AI"
   ```
   Ganti `/path/ke/gambar.jpg` dengan path gambar kamu.

4. **Cek response:** HTTP 201, body berisi `data` laporan. Di dalam `data` harus ada **jumlah_lubang**, **keparahan**, **confidence** (dari AI atau default). Saat AI masih dummy, nilai yang kembali: `jumlah_lubang: 0`, `keparahan: ringan`, `confidence: null`.

5. **Cek di DB atau lewat GET detail:**  
   `GET http://localhost:8010/api/laporan/{id}` (perlu header JWT). Atau cek tabel `laporan_jalan`: baris baru dengan `foto_asli` terisi; jika AI mengembalikan `foto_hasil_base64` nanti, kolom `foto_hasil` juga terisi.

6. **Jika AI service mati atau timeout:** backend tetap mengembalikan 201; laporan tersimpan dengan nilai default (jumlah_lubang 0, keparahan ringan). Cek log backend: `docker compose logs backend`.

---

## Step 2.5.1 — DashboardController stats dan peta

1. **Buat file:** `backend/app/Controllers/Api/DashboardController.php`
2. **Method stats():**
   - Query: **COUNT(*) total**, **COUNT per status**, **COUNT per keparahan** (pakai **groupBy** atau beberapa query).
   - Return JSON: **`{ "status": true, "data": { "total", "per_status", "per_keparahan" } }`**
3. **Method peta():**
   - Query: **select id, latitude, longitude, keparahan** (dan kolom lain yang perlu untuk marker).
   - Return JSON array.

---

Setelah tiap blok, cek sesuai **Cek** di **HARI-2-LANGKAH.md**. Kalau satu step selesai, bilang **"done"** ke mentor untuk review dan lanjut.
