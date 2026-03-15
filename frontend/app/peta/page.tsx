"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPetaPublik } from "@/lib/api";
import type { MarkerPeta } from "@/lib/types";

const PetaLaporan = dynamic(
  () => import("@/components/PetaLaporan").then((m) => ({ default: m.PetaLaporan })),
  { ssr: false }
);

const urlApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8010";

export default function PetaPublikPage() {
  const [markerPeta, setMarkerPeta] = useState<MarkerPeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const muatPeta = useCallback(() => {
    setLoading(true);
    setError(null);
    getPetaPublik()
      .then((res) => {
        if (res.data) setMarkerPeta(res.data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal memuat peta");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    muatPeta();
  }, [muatPeta]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Peta Laporan</h1>
      <p className="text-muted-foreground text-sm">
        Titik lokasi laporan jalan berlubang. Klik marker untuk detail. Data dapat diakses tanpa login.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lokasi Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <Skeleton className="h-[400px] w-full rounded-lg" />
          )}
          {error && (
            <div className="space-y-3">
              <p className="text-destructive text-sm">{error}</p>
              <p className="text-muted-foreground text-xs">
                Pastikan backend API jalan di {urlApi}. Jika pakai Docker:{" "}
                <code className="rounded bg-muted px-1">docker compose up -d</code>, lalu cek{" "}
                <code className="rounded bg-muted px-1">curl {urlApi}/api/auth/ping</code>.
              </p>
              <Button variant="outline" size="sm" onClick={muatPeta}>
                Coba lagi
              </Button>
            </div>
          )}
          {!loading && !error && (
            <PetaLaporan daftarMarker={markerPeta} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
