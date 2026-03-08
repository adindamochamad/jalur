"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getStatusLaporanPublik } from "@/lib/api";
import { formatTanggal } from "@/lib/format";
import type { StatusLaporanPublik } from "@/lib/types";
import { cn } from "@/lib/utils";

const labelStatus: Record<string, string> = {
  terdeteksi: "Terdeteksi",
  diproses: "Diproses",
  selesai: "Selesai",
};

const labelKeparahan: Record<string, string> = {
  ringan: "Ringan",
  sedang: "Sedang",
  parah: "Parah",
};

export default function CekStatusPage() {
  const [nomorId, setNomorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<StatusLaporanPublik | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCek = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(nomorId.trim(), 10);
    if (Number.isNaN(id) || id < 1) {
      setError("Masukkan nomor laporan yang valid (angka).");
      setHasil(null);
      return;
    }
    setError(null);
    setHasil(null);
    setLoading(true);
    const res = await getStatusLaporanPublik(id);
    setLoading(false);
    if (res.status && res.data) {
      setHasil(res.data);
    } else {
      setError(res.message ?? "Laporan tidak ditemukan.");
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">Cek Status Laporan</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Masukkan nomor laporan (ID) yang Anda dapat setelah mengirim laporan.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Nomor Laporan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleCek} className="flex flex-col gap-3">
            <div className="space-y-2">
              <Label htmlFor="nomor">Nomor / ID Laporan</Label>
              <Input
                id="nomor"
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 5"
                value={nomorId}
                onChange={(e) => setNomorId(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && (
              <p className={cn("text-destructive text-sm")}>{error}</p>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Mengecek..." : "Cek Status"}
            </Button>
          </form>

          {hasil && (
            <div className="border-t pt-4 space-y-2">
              <p className="font-medium">Laporan #{hasil.id}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {labelStatus[hasil.status] ?? hasil.status}
                </Badge>
                <Badge
                  variant={
                    hasil.keparahan === "parah"
                      ? "destructive"
                      : hasil.keparahan === "sedang"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {labelKeparahan[hasil.keparahan] ?? hasil.keparahan}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Jumlah lubang terdeteksi: <strong>{hasil.jumlah_lubang}</strong>
              </p>
              <p className="text-muted-foreground text-sm">
                Dibuat: {formatTanggal(hasil.created_at)}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href={`/laporan/${hasil.id}`}>Lihat detail (perlu login)</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-4 text-center">
        <Link href="/" className="text-muted-foreground text-sm hover:underline">
          Kembali ke Beranda
        </Link>
      </p>
    </div>
  );
}
