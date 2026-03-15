# Deploy di VPS

Panduan singkat setelah Anda `git pull` di VPS. Semua nilai rahasia (password, JWT, dll.) **hanya** di file `.env` di server; jangan commit `.env`.

## 1. Siapkan environment

```bash
cd /path/ke/jalur
cp .env.example .env
nano .env   # atau vim / editor lain
```

**Wajib diisi di `.env`:**

| Variabel | Contoh | Keterangan |
|----------|--------|------------|
| `MYSQL_ROOT_PASSWORD` | string kuat | Password root MySQL |
| `MYSQL_PASSWORD` | string kuat | Password user `jalur` |
| `JWT_SECRET` | minimal 32 karakter acak | Untuk token login; gunakan `openssl rand -base64 32` |

**Untuk production (domain/HTTPS):**

| Variabel | Contoh | Keterangan |
|----------|--------|------------|
| `APP_BASE_URL` | `https://api.domain.com` | URL backend (jika beda dari akses publik) |
| `CORS_EXTRA_ORIGINS` | `https://domain.com` | Origin frontend (pisahkan koma jika lebih dari satu) |
| `NEXT_PUBLIC_API_URL` | *(biasanya kosong)* | Kosongkan agar request API lewat proxy same-origin; isi hanya jika frontend memanggil API langsung ke URL lain |

Simpan `.env` lalu pastikan tidak ikut commit: `git status` tidak boleh menampilkan `.env`.

## 2. Jalankan dengan Docker

```bash
docker compose up -d
docker compose exec backend php spark migrate
docker compose exec backend php spark db:seed AdminUserSeeder
```

- Frontend: port **3010**
- Backend API: port **8010**
- MySQL: port **3310** (hanya dari host jika perlu)

Login default: `admin@localhost` / `admin123` (ganti setelah pertama kali masuk).

## 3. (Opsional) Nginx & SSL

Contoh konfigurasi ada di `deploy/nginx/jalur.conf.example`. Reverse proxy ke `localhost:3010` (frontend) dan `localhost:8010` (API). Gunakan Certbot untuk HTTPS.

## 4. Model AI

- Model default YOLOv8n di-download otomatis saat container AI pertama kali jalan.
- Jika pakai model custom (pothole): letakkan `.pt` di `ai-service/models/` atau gunakan `ai-service/scripts/download_pothole_model.sh` jika tersedia.

---

**Ringkas:** Setelah pull di VPS → `cp .env.example .env` → isi password & JWT di `.env` → `docker compose up -d` → migrate & seed. Key dan secret hanya di `.env` di server.
