# Debug ECONNRESET — Backend 8010

**ECONNRESET** = koneksi diputus pihak server (biasanya proses PHP crash atau container mati).

---

## Tes: masalah di port/Docker atau di CI4?

Jalankan backend dengan **server PHP minimal** (tanpa CodeIgniter):

```bash
docker compose stop backend
docker compose -f docker-compose.yml -f docker-compose.debug.yml up -d backend
```

Lalu di Postman: **GET** `http://localhost:8010/ping.php`

- **Jika dapat** `{"status":true,"message":"php ok","tanpa_ci4":true}` → port 8010 dan Docker OK; masalah di **CI4 / php spark serve**. Lanjut: jalankan `docker compose up backend` (tanpa -d) dan lihat error saat request ke `/api/auth/ping`.
- **Jika tetap ECONNRESET** → masalah di **Docker atau jaringan** (port 8010 di Mac). Coba: Docker Desktop restart, atau cek firewall.

Kembali ke backend normal (CI4):

```bash
docker compose -f docker-compose.yml up -d backend
```

---

## Cek cepat (skrip)

Dari **root project jalur**:

```bash
chmod +x scripts/cek-backend.sh
./scripts/cek-backend.sh
```

Skrip akan: cek status container, tes GET ping dari dalam container, tes dari host, tampilkan log. Jika "dari DALAM container" OK tapi "dari HOST" gagal → masalah port/jaringan Mac–Docker.

---

## Langkah 1: Tes endpoint paling sederhana

Di Postman (atau browser):

**GET** `http://localhost:8010/api/auth/ping`

- **Jika dapat response** `{"status":true,"message":"backend ok"}` → backend jalan; masalah kemungkinan di **POST login** (DB, JWT, atau body).
- **Jika tetap ECONNRESET** → backend tidak merespons sama sekali; lanjut Langkah 2.

---

## Jika log /tmp/jalur-request-hit.log tidak ada

Artinya **request tidak sampai ke `public/index.php`** (atau backend belum di-restart setelah penambahan log). Lakukan:

1. **Restart backend**, lalu kirim lagi GET ke `http://localhost:8010/api/auth/ping`.
2. **Tes dari dalam container** (memastikan request benar-benar ke proses ini):
   ```bash
   docker compose exec backend curl -v http://127.0.0.1:8080/api/auth/ping
   ```
   - Jika dari dalam container **sukses** (HTTP 200) tapi dari Postman ke 8010 **ECONNRESET** → masalah di port/jaringan host–Docker.
   - Jika dari dalam container **juga ECONNRESET** → proses PHP crash saat menangani request. Wajib **Langkah 3** (foreground) untuk lihat error di terminal.
3. Atau jalankan skrip cek: `./scripts/cek-backend.sh` (lihat poin "Tes dari DALAM container" vs "Tes dari HOST").

---

## Langkah 2: Cek container backend

```bash
docker compose ps
```

- **jalur-backend** tidak ada atau status **Exited** → backend tidak jalan.
  - Jalankan: `docker compose up -d`
  - Cek lagi: `docker compose ps`
  - Jika tetap Exited, lihat log: `docker compose logs backend --tail 100`
- **jalur-backend** status **Up** → lanjut Langkah 3.

---

## Langkah 3: Jalankan backend di foreground (lihat error langsung)

Di terminal:

```bash
cd /path/ke/jalur
docker compose up backend
```

(Jangan pakai `-d`; biarkan output di terminal.)

Lalu di Postman:

1. **GET** `http://localhost:8010/api/auth/ping` → lihat terminal, ada error atau tidak.
2. **POST** `http://localhost:8010/api/auth/login` dengan body JSON `{"email":"admin@localhost","password":"admin123"}` → lihat lagi terminal.

Jika PHP error (Fatal error, Exception), pesan akan muncul di terminal. **Salin pesan error itu** untuk dipakai perbaikan.

---

## Langkah 4: Cek log backend

```bash
docker compose logs backend --tail 150
```

Cari baris yang berisi **Error**, **Fatal**, **Exception**, **PHP**. Itu penyebab proses mati dan koneksi reset.

---

## Ringkasan

| Tes | URL | Harapan |
|-----|-----|--------|
| Ping | GET `http://localhost:8010/api/auth/ping` | 200 + `{"status":true,"message":"backend ok"}` |
| Login | POST `http://localhost:8010/api/auth/login` + body JSON | 200 + token, atau 401/500 dengan body JSON (bukan ECONNRESET) |

Jika **ping** sudah 200 tapi **login** tetap ECONNRESET, kemungkinan crash di: koneksi DB, `UserModel`, atau `JWT::encode`. Lihat error di **Langkah 3** atau **Langkah 4**.
