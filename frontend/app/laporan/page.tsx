"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { checkAuth, getLaporan, pingBackend } from "@/lib/api";
import { formatTanggal } from "@/lib/format";
import type { Laporan } from "@/lib/types";
import { cn } from "@/lib/utils";

function BadgeKeparahan({ keparahan }: { keparahan: string }) {
  const varian =
    keparahan === "parah"
      ? "destructive"
      : keparahan === "sedang"
        ? "secondary"
        : "outline";
  return <Badge variant={varian}>{keparahan}</Badge>;
}

function BadgeStatus({ status }: { status: string }) {
  return <Badge variant="outline">{status}</Badge>;
}

const OPSI_STATUS = [
  { nilai: "", label: "Semua status" },
  { nilai: "terdeteksi", label: "Terdeteksi" },
  { nilai: "diproses", label: "Diproses" },
  { nilai: "selesai", label: "Selesai" },
];
const OPSI_KEPARAHAN = [
  { nilai: "", label: "Semua keparahan" },
  { nilai: "ringan", label: "Ringan" },
  { nilai: "sedang", label: "Sedang" },
  { nilai: "parah", label: "Parah" },
];

function DaftarLaporanPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [daftar, setDaftar] = useState<Laporan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams.get("page") ?? "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const [filterStatus, setFilterStatus] = useState(() => searchParams.get("status") ?? "");
  const [filterKeparahan, setFilterKeparahan] = useState(() => searchParams.get("keparahan") ?? "");
  const [hasilPing, setHasilPing] = useState<{ ok: boolean; message: string } | null>(null);
  const [loadingPing, setLoadingPing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const perPage = 10;

  // Guard: cek auth via cookie; redirect ke login dengan redirect URL jika belum login
  useEffect(() => {
    checkAuth().then((ok) => {
      if (!ok) {
        const path = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/laporan";
        router.replace(`/login?redirect=${encodeURIComponent(path)}`);
      } else {
        setAuthChecked(true);
      }
    });
  }, [router]);

  // Sinkronkan state dari URL saat user navigasi (mis. tombol Back)
  useEffect(() => {
    const s = searchParams.get("status") ?? "";
    const k = searchParams.get("keparahan") ?? "";
    const p = parseInt(searchParams.get("page") ?? "1", 10);
    setFilterStatus(s);
    setFilterKeparahan(k);
    setPage(isNaN(p) || p < 1 ? 1 : p);
  }, [searchParams]);

  const updateUrl = (status: string, keparahan: string, halaman: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (keparahan) params.set("keparahan", keparahan);
    if (halaman > 1) params.set("page", String(halaman));
    const query = params.toString();
    router.replace(query ? `/laporan?${query}` : "/laporan", { scroll: false });
  };

  const muatUlang = () => {
    setError(null);
    setLoading(true);
    getLaporan({
      page,
      per_page: perPage,
      status: filterStatus || undefined,
      keparahan: filterKeparahan || undefined,
    })
      .then((res) => {
        setDaftar(res.data ?? []);
        setTotal(res.meta?.total ?? 0);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal memuat daftar");
        setDaftar([]);
      })
      .finally(() => setLoading(false));
  };

  const cekKoneksi = () => {
    setHasilPing(null);
    setLoadingPing(true);
    pingBackend()
      .then(setHasilPing)
      .finally(() => setLoadingPing(false));
  };

  useEffect(() => {
    if (!authChecked) return;
    let dibatalkan = false;
    setLoading(true);
    setError(null);
    getLaporan({
      page,
      per_page: perPage,
      status: filterStatus || undefined,
      keparahan: filterKeparahan || undefined,
    })
      .then((res) => {
        if (!dibatalkan) {
          setDaftar(res.data ?? []);
          setTotal(res.meta?.total ?? 0);
        }
      })
      .catch((err) => {
        if (!dibatalkan) {
          setError(err instanceof Error ? err.message : "Gagal memuat daftar");
          setDaftar([]);
        }
      })
      .finally(() => {
        if (!dibatalkan) setLoading(false);
      });
    return () => {
      dibatalkan = true;
    };
  }, [authChecked, page, filterStatus, filterKeparahan]);

  const onFilterChange = (status: string, keparahan: string) => {
    setFilterStatus(status);
    setFilterKeparahan(keparahan);
    setPage(1);
    updateUrl(status, keparahan, 1);
  };

  const onPageChange = (halamanBaru: number) => {
    setPage(halamanBaru);
    updateUrl(filterStatus, filterKeparahan, halamanBaru);
  };

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
            Sesi habis. Silakan login lagi.
          </p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Daftar Laporan</h1>

      <Card className="border-border/80 shadow-card">
        <CardHeader>
          <CardTitle>Laporan Jalan Berlubang</CardTitle>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => onFilterChange(e.target.value, filterKeparahan)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                {OPSI_STATUS.map((o) => (
                  <option key={o.nilai || "semua"} value={o.nilai}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Keparahan:</span>
              <select
                value={filterKeparahan}
                onChange={(e) => onFilterChange(filterStatus, e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                {OPSI_KEPARAHAN.map((o) => (
                  <option key={o.nilai || "semua"} value={o.nilai}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardHeader>
        <CardContent>
          {error && !perluLogin && (
            <div className="mb-4 space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-destructive text-sm">{error}</p>
              {(error.includes("terhubung ke server") || error.includes("NEXT_PUBLIC")) && (
                <>
                  <p className="text-muted-foreground text-xs">
                    Pastikan backend jalan: <code className="rounded bg-muted px-1">docker compose up -d</code>. Lalu cek di terminal: <code className="rounded bg-muted px-1">curl http://localhost:8010/api/auth/ping</code>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={cekKoneksi} disabled={loadingPing}>
                      {loadingPing ? "Mengecek..." : "Cek koneksi"}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={muatUlang} disabled={loading}>
                      Muat ulang
                    </Button>
                  </div>
                  {hasilPing && (
                    <p className={cn("text-sm", hasilPing.ok ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                      {hasilPing.ok ? "✓ " : "✗ "}{hasilPing.message}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelapor</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Keparahan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {daftar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground text-center py-8">
                        Belum ada laporan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    daftar.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell>{formatTanggal(l.created_at)}</TableCell>
                        <TableCell>{l.pelapor_nama ?? "-"}</TableCell>
                        <TableCell className="max-w-[180px] truncate">
                          {l.alamat || (l.latitude && l.longitude) ? (
                            l.alamat || `${l.latitude}, ${l.longitude}`
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <BadgeKeparahan keparahan={l.keparahan} />
                        </TableCell>
                        <TableCell>
                          <BadgeStatus status={l.status} />
                        </TableCell>
                        <TableCell>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/laporan/${l.id}`}>Detail</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {total > perPage && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Total {total} laporan
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => onPageChange(Math.max(1, page - 1))}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page * perPage >= total}
                      onClick={() => onPageChange(page + 1)}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DaftarLaporanPage() {
  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>}>
      <DaftarLaporanPageInner />
    </Suspense>
  );
}
