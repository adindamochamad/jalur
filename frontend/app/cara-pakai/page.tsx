"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const langkah = [
  {
    judul: "Buka halaman Lapor",
    isi: "Klik menu **Lapor** di navigasi. Form laporan jalan berlubang akan terbuka.",
  },
  {
    judul: "Ambil foto jalan",
    isi: "Gunakan kamera untuk memotret jalan yang berlubang. Pastikan area lubang terlihat jelas dan cahaya cukup. Format: JPG atau PNG, maksimal 5MB.",
  },
  {
    judul: "Izinkan akses lokasi (opsional)",
    isi: "Klik **Ambil lokasi saya** agar koordinat GPS otomatis terisi. Atau isi latitude/longitude manual jika Anda mengetahuinya.",
  },
  {
    judul: "Isi data pelapor & catatan",
    isi: "Nama, nomor HP, alamat lokasi, dan catatan (opsional) membantu tim verifikasi dan tindak lanjut.",
  },
  {
    judul: "Kirim laporan",
    isi: "Klik **Kirim**. Sistem akan menganalisis foto dengan AI untuk mendeteksi lubang. Anda akan diarahkan ke halaman sukses dengan **nomor laporan**.",
  },
  {
    judul: "Cek status kapan saja",
    isi: "Gunakan menu **Cek Status** dan masukkan nomor laporan untuk melihat status (Terdeteksi / Diproses / Selesai) tanpa perlu login.",
  },
];

export default function CaraPakaiPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Cara Pakai</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Panduan singkat mengirim laporan jalan berlubang dan melacak statusnya.
      </p>

      <div className="mt-6 space-y-4">
        {langkah.map((item, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {index + 1}. {item.judul}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm whitespace-pre-line">
                {item.isi.split("**").map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/lapor">Buat laporan</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/cek-status">Cek status laporan</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
