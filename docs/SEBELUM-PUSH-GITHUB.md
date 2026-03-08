# Sebelum Push ke GitHub

Agar **rahasia tidak ikut** ke repo (aman untuk portofolio + deploy VPS).

---

## Yang **tidak** boleh ikut commit

| File / isi | Alasan |
|------------|--------|
| `backend/.env` | Berisi JWT_SECRET, password database, AI_SERVICE_URL |
| `frontend/.env.local` / `frontend/.env` | Bisa berisi NEXT_PUBLIC_API_URL atau rahasia lain |
| File `.env` di mana pun | Selalu di-ignore; jangan paksa add |

Sudah diatur di **backend/.gitignore** dan **frontend/.gitignore** (dan root **.gitignore**). Jadi selama Anda tidak `git add -f backend/.env`, file itu **tidak akan ikut**.

---

## Cek sebelum push (sekali saja)

Di root project jalur, jalankan:

```bash
git status
```

Pastikan **tidak** ada yang muncul:
- `backend/.env`
- `frontend/.env.local` atau `frontend/.env`

Kalau muncul, jangan stage: `git reset HEAD backend/.env` (dan sejenisnya).

Cek juga file yang di-stage:

```bash
git diff --cached --name-only
```

Kalau ada `.env` di situ, unstage: `git reset HEAD path/ke/.env`

---

## Di VPS setelah clone

- **Jangan** clone file .env dari GitHub (memang tidak ada).
- Buat manual di server:
  - `backend/.env` — salin dari `backend/.env.example` (atau buat baru), isi database production, **JWT_SECRET baru** (string acak panjang), `app.baseURL` = https://jalur.adindamochamad.com, `AI_SERVICE_URL` sesuai setup.
  - `frontend/.env.local` — isi `NEXT_PUBLIC_API_URL=https://jalur.adindamochamad.com`.

---

## Ringkas

- Push ke GitHub **aman** asal file `.env` tidak ikut (sudah di-ignore).
- Repo bisa dipakai untuk **portofolio** (public) dan **deploy VPS** (clone lalu atur .env di server).
- Rahasia hanya ada di **.env di server/lokal**, bukan di Git.
