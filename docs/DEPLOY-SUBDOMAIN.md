# Deploy ke Subdomain (jalur.adindamochamad.com)

Panduan singkat: cabang domain **adindamochamad.com** jadi **jalur.adindamochamad.com** untuk aplikasi Jalur.

---

## 1. DNS: Arahkan subdomain ke VPS

Di pengelola DNS domain Anda (Cloudflare, Namecheap, Niagahoster, dll.):

| Tipe | Name / Host | Value / Target | TTL |
|------|-------------|----------------|-----|
| **A** | `jalur` | **IP VPS Anda** | 300 (atau auto) |

Artinya: **jalur.adindamochamad.com** → mengarah ke IP server.

- Jika pakai **Cloudflare**: buat A record, name = `jalur`, content = IP VPS, proxy bisa nyala (orange cloud) untuk CDN + SSL.
- Jika pakai **CNAME** (mis. ke domain lain): Name = `jalur`, Target = `adindamochamad.com` atau `www.adindamochamad.com` — hanya jika Anda mau subdomain mengikuti target yang sama. Untuk VPS, lebih umum pakai **A** ke IP.

Tunggu propagasi DNS (biasanya 5–15 menit). Cek:
```bash
ping jalur.adindamochamad.com
```
Harus mengembalikan IP VPS Anda.

---

## 2. Persiapan di VPS

- Nginx terpasang.
- Aplikasi Jalur (frontend + backend + AI + MySQL) jalan di VPS (tanpa Docker atau pakai Docker; sesuaikan port).

Contoh jika **tanpa Docker** (langsung di server):
- Frontend: `npm run build && npm start` (port 3000).
- Backend: php-fpm atau `php spark serve --port 8080`.
- AI: uvicorn di port 8000.

Contoh jika **pakai Docker**: jalankan `docker compose` dan pastikan port frontend/backend ter-expose atau di-reverse proxy oleh Nginx.

---

## 3. Nginx untuk jalur.adindamochamad.com

Gunakan contoh di `deploy/nginx/jalur.conf.example`, ganti `YOUR_DOMAIN` dengan **jalur.adindamochamad.com**:

```nginx
server {
    listen 80;
    server_name jalur.adindamochamad.com;

    location / {
        proxy_pass http://127.0.0.1:3000;   # Next.js
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://127.0.0.1:8080;   # Backend CI4
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
    }
}
```

Simpan di `/etc/nginx/sites-available/jalur`, aktifkan, tes, reload:

```bash
sudo ln -s /etc/nginx/sites-available/jalur /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 4. SSL (HTTPS) dengan Certbot

```bash
sudo certbot --nginx -d jalur.adindamochamad.com
```

Ikuti prompt (email, setuju terms). Certbot akan mengatur HTTPS di Nginx. Setelah itu akses: **https://jalur.adindamochamad.com**.

Detail lanjut: `docs/DEPLOY-SSL.md`.

---

## 5. Environment production

**Frontend** (build untuk production):

- `NEXT_PUBLIC_API_URL=https://jalur.adindamochamad.com`  
  (Frontend memanggil `/api/...` ke host yang sama, jadi cukup domain saja.)

**Backend** (CI4):

- `app.baseURL = https://jalur.adindamochamad.com`
- CORS: izinkan origin `https://jalur.adindamochamad.com`
- `AI_SERVICE_URL` = URL internal ke AI (mis. `http://127.0.0.1:8000` jika satu server)

**Cookie / JWT:** Pastikan dikirim hanya lewat HTTPS; dengan domain dan Nginx di atas, sudah aman.

---

## Ringkas

| Langkah | Yang dilakukan |
|--------|-----------------|
| 1. DNS | A record: `jalur` → IP VPS |
| 2. VPS | Nginx + app jalan (Docker atau native) |
| 3. Nginx | `server_name jalur.adindamochamad.com`, proxy ke frontend & backend |
| 4. SSL | `certbot --nginx -d jalur.adindamochamad.com` |
| 5. Env | `NEXT_PUBLIC_API_URL` dan baseURL/CORS pakai `https://jalur.adindamochamad.com` |

Setelah itu push ke repo dan deploy di VPS; akses aplikasi lewat **https://jalur.adindamochamad.com**.
