# SSL dengan Certbot (Let's Encrypt)

Langkah ringkas untuk mengamankan domain dengan HTTPS.

## Persyaratan

- Domain mengarah ke IP VPS Anda (DNS A record).
- Nginx (atau web server lain) sudah terpasang.

## 1. Install Certbot

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

## 2. Dapatkan sertifikat

```bash
sudo certbot --nginx -d nama-domain-anda.com
```

Ikuti prompt (email, setuju terms). Certbot akan mengubah config Nginx dan mengaktifkan HTTPS.

## 3. Perpanjang otomatis

Certbot menambah cron/systemd timer. Cek:
```bash
sudo certbot renew --dry-run
```

## 4. Setelah SSL

- Ubah `NEXT_PUBLIC_API_URL` di frontend ke `https://nama-domain-anda.com` (atau subdomain API).
- Di backend CI4, set `app.baseURL` dan CORS `allowedOrigins` ke URL frontend production (https).
- JWT dan cookie aman dikirim hanya lewat HTTPS.
