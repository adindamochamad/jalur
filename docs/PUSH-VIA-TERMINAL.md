# Push ke GitHub via Terminal

Jalankan perintah ini **satu per satu** dari folder project **jalur**.

---

## 1. Masuk ke folder project

```bash
cd /Users/mac/Development/docker-projects/projects/jalur
```

---

## 2. Hapus repo Git di dalam frontend (supaya file frontend ikut, bukan cuma 1 “submodule”)

Saat ini `frontend` punya `.git` sendiri, jadi Git menganggapnya submodule. Agar semua file frontend ikut ke repo utama:

```bash
rm -rf frontend/.git
```

---

## 3. Tambahkan semua file (file sensitif .env tetap tidak ikut)

```bash
git add .
```

---

## 4. Cek yang akan di-commit — pastikan tidak ada .env

```bash
git status
```

**Jangan** boleh ada:
- `backend/.env`
- `frontend/.env.local` atau `frontend/.env`

Kalau ada, batalkan: `git reset HEAD backend/.env`

---

## 5. Commit

```bash
git commit -m "Add frontend & update: Jalur - Laporan Jalan Berlubang (Next.js, CI4, YOLOv8)"
```

---

## 6. Push ke GitHub

Pastikan repo **jalur** sudah ada di GitHub (https://github.com/adindamochamad/jalur). Lalu:

```bash
git push -u origin main
```

Jika diminta login, pakai Personal Access Token (bukan password). Buat token di: GitHub → Settings → Developer settings → Personal access tokens.

---

## Ringkas (copy-paste berurutan)

```bash
cd /Users/mac/Development/docker-projects/projects/jalur
rm -rf frontend/.git
git add .
git status
git commit -m "Add frontend & update: Jalur - Laporan Jalan Berlubang (Next.js, CI4, YOLOv8)"
git push -u origin main
```

Setelah `git status`, cek dulu tidak ada .env yang ter-add, baru jalankan `git commit` dan `git push`.
