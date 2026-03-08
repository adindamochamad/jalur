"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Tentang Jalur</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Aplikasi laporan jalan berlubang dengan deteksi berbasis AI.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Apa itu Jalur?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Jalur memungkinkan warga mengirim laporan jalan berlubang dengan foto. Sistem akan menganalisis foto menggunakan model deteksi objek (YOLO) untuk mendeteksi lubang dan memperkirakan tingkat keparahan (ringan, sedang, parah). Hasil deteksi membantu tim verifikasi dan prioritas penanganan.
          </p>
          <p>
            Fitur: kirim laporan (foto + lokasi GPS), cek status laporan tanpa login, peta lokasi laporan, dashboard statistik dan daftar laporan untuk admin.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Akurasi deteksi AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Deteksi lubang memakai model YOLO (Ultralytics). Jika tersedia model yang sudah dilatih khusus untuk lubang jalan (<code className="rounded bg-muted px-1">pothole_yolov8.pt</code>), akurasi bergantung pada data latih dan evaluasi (biasanya diukur dengan mAP pada dataset uji). Jika model custom tidak ada, sistem memakai model default (<code className="rounded bg-muted px-1">yolov8n.pt</code>) yang tidak dikhususkan untuk lubang—hasil deteksi hanya perkiraan dan dapat tidak akurat.
          </p>
          <p>
            Untuk angka akurasi resmi (mis. mAP, precision, recall), lakukan evaluasi pada dataset uji Anda dan cantumkan di dokumentasi atau halaman ini.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Kontak</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Untuk pertanyaan atau bantuan, hubungi administrator sistem. Jika Anda pengelola, tambahkan email atau nomor kontak di sini.
          </p>
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/">Beranda</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/cara-pakai">Cara Pakai</Link>
        </Button>
      </div>
    </div>
  );
}
