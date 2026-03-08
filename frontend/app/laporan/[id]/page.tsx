"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { checkAuth, getLaporanById, updateLaporan } from "@/lib/api";
import { baseUrl } from "@/lib/api";
import { formatTanggalLengkap } from "@/lib/format";
import type { Laporan } from "@/lib/types";

type StatusLaporan = "terdeteksi" | "diproses" | "selesai";

const OPSI_STATUS: { value: StatusLaporan; label: string }[] = [
  { value: "terdeteksi", label: "Terdeteksi" },
  { value: "diproses", label: "Diproses" },
  { value: "selesai", label: "Selesai" },
];

function urlFoto(path: string | null): string | null {
  if (!path) return null;
  const base = baseUrl.replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}/${path.replace(/^\//, "")}`;
}

export default function DetailLaporanPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [laporan, setLaporan] = useState<Laporan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [statusPilihan, setStatusPilihan] = useState<StatusLaporan>("terdeteksi");
  const [simpanStatusLoading, setSimpanStatusLoading] = useState(false);

  useEffect(() => {
    checkAuth().then((ok) => {
      if (!ok) {
        const path = typeof window !== "undefined" ? window.location.pathname : `/laporan/${id}`;
        router.replace(`/login?redirect=${encodeURIComponent(path)}`);
      } else {
        setAuthChecked(true);
      }
    });
  }, [router, id]);

  useEffect(() => {
    if (!authChecked || !id || Number.isNaN(id)) {
      if (!authChecked) return;
      setLoading(false);
      setError("ID tidak valid");
      return;
    }
    let dibatalkan = false;
    setLoading(true);
    setError(null);
    getLaporanById(id)
      .then((res) => {
        if (!dibatalkan && res.data) {
          setLaporan(res.data);
          setStatusPilihan(res.data.status as StatusLaporan);
        }
      })
      .catch((err) => {
        if (!dibatalkan) {
          setError(err instanceof Error ? err.message : "Gagal memuat detail");
        }
      })
      .finally(() => {
        if (!dibatalkan) setLoading(false);
      });
    return () => {
      dibatalkan = true;
    };
  }, [authChecked, id]);

  if (!authChecked) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const perluLogin =
    error &&
    (error.includes("401") ||
      error.includes("Token tidak ditemukan") ||
      error.includes("Token tidak valid") ||
      error.includes("Token kedaluwarsa"));
  if (perluLogin) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <p className="text-muted-foreground text-center">
            Silakan login untuk melihat detail laporan.
          </p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !laporan) {
    const pesan = error ?? "Laporan tidak ditemukan";
    const isKoneksi = pesan.includes("terhubung ke server") || pesan.includes("NEXT_PUBLIC");
    return (
      <div className="space-y-4">
        <p className="text-destructive">{pesan}</p>
        {isKoneksi && (
          <p className="text-muted-foreground text-sm">
            Jalankan backend: <code className="rounded bg-muted px-1">docker compose up -d</code> atau pastikan <code className="rounded bg-muted px-1">NEXT_PUBLIC_API_URL</code> di frontend mengarah ke http://localhost:8010
          </p>
        )}
        <Button asChild variant="outline">
          <Link href="/laporan">Kembali ke Daftar</Link>
        </Button>
      </div>
    );
  }

  const fotoAsliUrl = urlFoto(laporan.foto_asli);
  const fotoHasilUrl = urlFoto(laporan.foto_hasil);

  const handleSimpanStatus = async () => {
    if (statusPilihan === laporan.status) {
      toast.info("Status tidak berubah");
      return;
    }
    setSimpanStatusLoading(true);
    try {
      const res = await updateLaporan(id, { status: statusPilihan });
      if (res.data) {
        setLaporan(res.data);
        setStatusPilihan(res.data.status as StatusLaporan);
        toast.success("Status laporan berhasil diubah");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status");
    } finally {
      setSimpanStatusLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Detail Laporan #{laporan.id}</h1>
        <Button asChild variant="outline">
          <Link href="/laporan">Kembali ke Daftar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Info Laporan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Admin: ubah status */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">Status:</span>
            <select
              value={statusPilihan}
              onChange={(e) => setStatusPilihan(e.target.value as StatusLaporan)}
              disabled={simpanStatusLoading}
              className="h-9 w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {OPSI_STATUS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={handleSimpanStatus}
              disabled={simpanStatusLoading || statusPilihan === laporan.status}
            >
              {simpanStatusLoading ? "Menyimpan..." : "Simpan status"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{laporan.keparahan}</Badge>
            <Badge variant="secondary">{laporan.status}</Badge>
            {laporan.jumlah_lubang != null && (
              <span className="text-muted-foreground text-sm">
                {laporan.jumlah_lubang} lubang terdeteksi
                {laporan.confidence != null &&
                  ` (confidence ${(laporan.confidence * 100).toFixed(0)}%)`}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Dibuat: {formatTanggalLengkap(laporan.created_at)}
          </p>
          {laporan.pelapor_nama && (
            <p>
              <span className="text-muted-foreground">Pelapor:</span>{" "}
              {laporan.pelapor_nama}
              {laporan.pelapor_hp && ` — ${laporan.pelapor_hp}`}
            </p>
          )}
          {laporan.alamat && (
            <p>
              <span className="text-muted-foreground">Alamat:</span>{" "}
              {laporan.alamat}
            </p>
          )}
          {laporan.latitude != null && laporan.longitude != null && (
            <p className="text-muted-foreground text-sm">
              Koordinat: {laporan.latitude}, {laporan.longitude}
            </p>
          )}
          {laporan.catatan && (
            <p>
              <span className="text-muted-foreground">Catatan:</span>{" "}
              {laporan.catatan}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Foto Asli</CardTitle>
          </CardHeader>
          <CardContent>
            {fotoAsliUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                <img
                  src={fotoAsliUrl}
                  alt="Foto jalan asli"
                  className="object-contain w-full h-full"
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Tidak ada foto</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Foto Hasil Deteksi</CardTitle>
          </CardHeader>
          <CardContent>
            {fotoHasilUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                <img
                  src={fotoHasilUrl}
                  alt="Foto dengan deteksi lubang"
                  className="object-contain w-full h-full"
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Belum ada hasil deteksi
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
