# Cara Ngetes Aplikasi Jalur

Panduan singkat untuk menjalankan dan menguji frontend, backend, dan AI service.

---

## 1. Jalankan semua service (Docker)

Di **root project** `jalur`:

```bash
docker compose up -d
```

Tunggu sampai semua container jalan (frontend bisa agak lama saat `npm install` pertama kali).

| Layanan    | URL                    |
|------------|------------------------|
| **Frontend** | http://localhost:**3010** |
| **Backend API** | http://localhost:**8010** |

---

## 2. Migrasi & seed (sekali saja)

Kalau database masih kosong:

```bash
# Jalankan migrasi tabel
docker compose exec backend php spark migrate

# Seed user admin untuk login
docker compose exec backend php spark db:seed AdminUserSeeder
```

**Akun login (dari seed):**
- Email: `admin@localhost`
- Password: `admin123`

---

## 3. Ngetes dari browser

### A. Beranda & form lapor (tanpa login)

1. Buka **http://localhost:3010**
2. Klik **Buat Laporan** (atau menu **Lapor**).
3. Isi form:
   - **Foto**: pilih file gambar jalan (JPG/PNG, max 5MB).
   - Klik **Ambil lokasi saya** (izin akses lokasi di browser) atau isi latitude/longitude manual.
   - Alamat, nama pelapor, no. HP, catatan (opsional).
4. Klik **Kirim Laporan**.
5. Harus redirect ke halaman **Detail laporan** (foto asli + foto hasil deteksi AI).

### B. Login & daftar laporan

1. Buka **http://localhost:3010/login**
2. Login: email `admin@localhost`, password `admin123`.
3. Setelah login, akan redirect ke **Daftar Laporan**.
4. Di navbar harus muncul tombol **Logout** (bukan Login).
5. Klik **Daftar Laporan** → tabel berisi laporan (termasuk yang baru saja dibuat).
6. Klik **Detail** pada satu baris → halaman detail dengan foto asli dan foto hasil deteksi.

### C. Setelah login — checklist tes lengkap

Lakukan berurutan untuk memastikan semua flow jalan:

| No | Tes | Yang dicek |
|----|-----|------------|
| 1 | **Buat laporan (tanpa login)** | Beranda → Lapor → upload foto jalan, isi lokasi/nama/HP → Kirim. Harus redirect ke Detail; foto asli + foto hasil deteksi AI tampil. |
| 2 | **Login** | /login → admin@localhost / admin123. Redirect ke Daftar Laporan; navbar tampil **Logout**. |
| 3 | **Daftar laporan** | Tabel berisi laporan; kolom Tanggal, Pelapor, Lokasi, Keparahan, Status. Tombol **Detail** per baris. |
| 4 | **Detail laporan** | Klik Detail → halaman detail dengan foto asli & foto hasil deteksi, info keparahan/status. |
| 5 | **Paginasi** | Jika laporan > 10, tombol Sebelumnya/Selanjutnya berfungsi. |
| 6 | **Tanpa login** | Buka /laporan atau /laporan/1 di tab baru (logout dulu). Harus tampil "Silakan login untuk melihat..." + tombol Login. |
| 7 | **Logout** | Klik Logout → redirect ke Beranda; navbar tampil **Login** lagi. |

Setelah semua di atas OK, **Hari 4** selesai. Lanjut **Hari 5** (Dashboard statistik + peta + filter di daftar) bila ingin fitur tambahan.

### D. Cek API langsung (opsional)

- Health backend: http://localhost:8010/api/auth/ping  
  → Harus return JSON: `{"status":true,"message":"backend ok"}`
- Frontend memanggil API ke `http://localhost:8010` (lihat env `NEXT_PUBLIC_API_URL` di Docker).

---

## 4. Kalau jalan tanpa Docker (manual)

Jalankan terpisah di tiga terminal:

| Terminal | Perintah | Port |
|----------|----------|------|
| 1 (MySQL) | Pastikan MySQL jalan, database `jalur` + user `jalur`/`jalur_dev` | 3306 (atau 3310) |
| 2 (Backend) | `cd backend && php spark serve --port 8080` | 8080 |
| 3 (AI Service) | `cd ai-service && source venv/bin/activate && uvicorn main:app --port 8000` | 8000 |
| 4 (Frontend) | `cd frontend && npm run dev` | 3000 |

Di frontend buat/isi `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Buka frontend di **http://localhost:3000** (bukan 3010). Backend di 8080; sesuaikan jika pakai port lain.

---

## 5. Troubleshooting

### Module not found: recharts (build error)

- **Pakai Docker:** Volume `node_modules` di container bisa belum berisi recharts. Jalankan di dalam container:
  ```bash
  docker compose exec frontend npm install
  ```
  Lalu restart frontend: `docker compose restart frontend`.
- **Tanpa Docker:** Di folder `frontend` jalankan `npm install` (atau `npm install recharts`).

- **CORS error di browser**  
  Pastikan `backend/app/Config/Cors.php` punya `http://localhost:3010` (dan 3000 kalau dev tanpa Docker) di `allowedOrigins`, dan filter `cors` dipasang untuk `api/*`.

- **401 saat buka Daftar / Detail**  
  Harus login dulu di `/login`. Token disimpan di `localStorage` (key: `jalur_token`).

- **Foto hasil deteksi tidak muncul**  
  Pastikan container **ai-service** jalan dan backend bisa akses `http://ai-service:8000` (di Docker). Cek log backend saat submit laporan.

- **"Model belum siap" / error AI**  
  AI service pakai YOLO; pertama kali bisa download model. Cek log: `docker compose logs ai-service`.
