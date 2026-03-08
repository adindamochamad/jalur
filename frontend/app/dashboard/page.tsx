"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { checkAuth, getDashboardPeta, getDashboardStats } from "@/lib/api";
import type { DashboardStats, MarkerPeta } from "@/lib/types";

// Peta Leaflet hanya di-render di client (hindari "window is not defined")
const PetaLaporan = dynamic(
  () => import("@/components/PetaLaporan").then((m) => ({ default: m.PetaLaporan })),
  { ssr: false }
);

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [markerPeta, setMarkerPeta] = useState<MarkerPeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let dibatalkan = false;
    checkAuth().then((ok) => {
      if (!ok) {
        router.replace(`/login?redirect=${encodeURIComponent("/dashboard")}`);
        return;
      }
      setLoading(true);
      setError(null);
      Promise.all([getDashboardStats(), getDashboardPeta()])
        .then(([resStats, resPeta]) => {
          if (!dibatalkan) {
            if (resStats.data) setStats(resStats.data);
            if (resPeta.data) setMarkerPeta(resPeta.data);
          }
        })
        .catch((err) => {
          if (!dibatalkan) {
            setError(err instanceof Error ? err.message : "Gagal memuat data");
          }
        })
        .finally(() => {
          if (!dibatalkan) setLoading(false);
        });
    });
    return () => {
      dibatalkan = true;
    };
  }, [router]);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">{error ?? "Data tidak tersedia"}</p>
        <Button asChild variant="outline">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    );
  }

  const dataStatus = [
    { nama: "Terdeteksi", jumlah: stats.per_status.terdeteksi ?? 0 },
    { nama: "Diproses", jumlah: stats.per_status.diproses ?? 0 },
    { nama: "Selesai", jumlah: stats.per_status.selesai ?? 0 },
  ];

  const dataKeparahan = [
    { nama: "Ringan", jumlah: stats.per_keparahan.ringan ?? 0 },
    { nama: "Sedang", jumlah: stats.per_keparahan.sedang ?? 0 },
    { nama: "Parah", jumlah: stats.per_keparahan.parah ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Laporan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Terdeteksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.per_status.terdeteksi ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Diproses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.per_status.diproses ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.per_status.selesai ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Peta */}
      <Card className="border-border/80 shadow-card">
        <CardHeader>
          <CardTitle>Peta Laporan</CardTitle>
          <p className="text-muted-foreground text-sm">
            Marker: hijau = ringan, kuning = sedang, merah = parah. Klik marker untuk popup dan link detail.
          </p>
        </CardHeader>
        <CardContent>
          <PetaLaporan daftarMarker={markerPeta} />
        </CardContent>
      </Card>

      {/* Grafik */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-card">
          <CardHeader>
            <CardTitle>Laporan per Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataStatus} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="nama" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Bar dataKey="jumlah" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-card">
          <CardHeader>
            <CardTitle>Laporan per Keparahan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataKeparahan} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="nama" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Bar dataKey="jumlah" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button asChild variant="outline">
        <Link href="/laporan">Lihat Daftar Laporan</Link>
      </Button>
    </div>
  );
}
