#!/usr/bin/env python3
"""
Skrip untuk tes deteksi pothole dengan gambar dari dataset (atau path lain).
Mengirim gambar ke endpoint /detect AI service dan menampilkan hasil.

Contoh:
  # Satu gambar
  python scripts/test_detect.py datasets/pothole-detection-dataset/potholes/63.jpg

  # Beberapa gambar
  python scripts/test_detect.py datasets/pothole-detection-dataset/potholes/63.jpg datasets/.../77.jpg

  # Semua gambar di folder potholes (batch)
  python scripts/test_detect.py datasets/pothole-detection-dataset/potholes/

  # Simpan gambar hasil deteksi ke folder
  python scripts/test_detect.py --output hasil_deteksi datasets/pothole-detection-dataset/potholes/63.jpg

Prasyarat: AI service harus sudah jalan (uvicorn main:app --host 0.0.0.0 --port 8000).
"""

import argparse
import base64
import json
import os
import sys
from pathlib import Path
from typing import Optional
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# Supaya bisa import dari parent (opsional, untuk script lain)
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# URL AI service (bisa di-override env AI_SERVICE_URL)
BASE_URL = os.environ.get("AI_SERVICE_URL", "http://127.0.0.1:8000")
DETECT_URL = f"{BASE_URL.rstrip('/')}/detect"

# Ekstensi gambar yang didukung
EKSTENSI_GAMBAR = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def baca_gambar_encode_base64(path: str) -> Optional[str]:
    """Baca file gambar dan return string base64."""
    path_obj = Path(path)
    if not path_obj.is_file():
        return None
    if path_obj.suffix.lower() not in EKSTENSI_GAMBAR:
        return None
    try:
        with open(path_obj, "rb") as f:
            data = f.read()
        return base64.b64encode(data).decode("ascii")
    except Exception:
        return None


def panggil_detect(image_base64: str, timeout: int = 60) -> dict:
    """POST gambar base64 ke /detect, return response JSON."""
    body = json.dumps({"image_base64": image_base64}).encode("utf-8")
    req = Request(DETECT_URL, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    with urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())


def simpan_gambar_hasil(base64_str: Optional[str], path_keluaran: str) -> bool:
    """Decode base64 ke gambar dan simpan ke path_keluaran."""
    if not base64_str:
        return False
    try:
        raw = base64.b64decode(base64_str)
        with open(path_keluaran, "wb") as f:
            f.write(raw)
        return True
    except Exception:
        return False


def kumpulkan_file_gambar(folder_atau_file: str) -> list[str]:
    """Return daftar path file gambar. Jika argumen file, return [path]. Jika folder, list semua gambar di dalamnya."""
    p = Path(folder_atau_file)
    if p.is_file():
        if p.suffix.lower() in EKSTENSI_GAMBAR:
            return [str(p)]
        return []
    if p.is_dir():
        return [
            str(f)
            for f in sorted(p.iterdir())
            if f.is_file() and f.suffix.lower() in EKSTENSI_GAMBAR
        ]
    return []


def main():
    parser = argparse.ArgumentParser(
        description="Tes deteksi pothole dengan gambar dari dataset (POST ke AI service /detect)."
    )
    parser.add_argument(
        "paths",
        nargs="+",
        help="Path ke file gambar atau folder berisi gambar (contoh: datasets/pothole-detection-dataset/potholes/63.jpg atau .../potholes/)",
    )
    parser.add_argument(
        "--output",
        "-o",
        metavar="DIR",
        help="Folder untuk menyimpan gambar hasil deteksi (opsional).",
    )
    parser.add_argument(
        "--url",
        default=BASE_URL,
        help=f"URL dasar AI service (default: {BASE_URL})",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=60,
        help="Timeout request detik (default: 60)",
    )
    args = parser.parse_args()

    global DETECT_URL
    DETECT_URL = f"{args.url.rstrip('/')}/detect"

    # Kumpulkan semua file gambar dari argumen
    semua_path: list[str] = []
    for pa in args.paths:
        semua_path.extend(kumpulkan_file_gambar(pa))

    if not semua_path:
        print("Tidak ada file gambar yang ditemukan. Berikan path ke .jpg/.png atau folder berisi gambar.")
        sys.exit(1)

    # Buat folder output jika dipakai
    dir_output = None
    if args.output:
        dir_output = Path(args.output)
        dir_output.mkdir(parents=True, exist_ok=True)
        print(f"Gambar hasil deteksi akan disimpan ke: {dir_output}\n")

    print(f"AI service: {DETECT_URL}")
    print(f"Jumlah gambar yang akan dites: {len(semua_path)}\n")

    # Cek koneksi dulu
    try:
        with urlopen(args.url.rstrip("/") + "/", timeout=5) as r:
            if r.status != 200:
                print(f"Peringatan: GET {args.url} mengembalikan {r.status}")
    except (URLError, OSError) as e:
        print(f"Error: Tidak bisa terhubung ke AI service di {args.url}")
        print("  Pastikan service jalan: cd ai-service && uvicorn main:app --host 0.0.0.0 --port 8000")
        print(f"  Detail: {e}")
        sys.exit(1)

    total_lubang = 0
    total_gambar = 0

    for path_gambar in semua_path:
        nama = Path(path_gambar).name
        print(f"  [{nama}] ", end="", flush=True)

        b64 = baca_gambar_encode_base64(path_gambar)
        if not b64:
            print("Gagal baca gambar / format tidak didukung")
            continue

        try:
            hasil = panggil_detect(b64, timeout=args.timeout)
        except (HTTPError, URLError, OSError) as e:
            print(f"Request gagal: {e}")
            continue

        total_gambar += 1
        jumlah = hasil.get("jumlah_lubang", 0)
        keparahan = hasil.get("keparahan", "?")
        confidence = hasil.get("confidence")
        total_lubang += jumlah

        conf_str = f", confidence {confidence:.2%}" if confidence is not None else ""
        print(f"jumlah_lubang={jumlah}, keparahan={keparahan}{conf_str}")

        if dir_output and hasil.get("foto_hasil_base64"):
            out_path = dir_output / f"out_{Path(path_gambar).stem}.jpg"
            if simpan_gambar_hasil(hasil["foto_hasil_base64"], str(out_path)):
                print(f"           -> disimpan: {out_path}")

    print()
    print(f"Ringkasan: {total_gambar} gambar dites, total deteksi lubang: {total_lubang}")


if __name__ == "__main__":
    main()
