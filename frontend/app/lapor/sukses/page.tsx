"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function IsiSukses() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-green-600 dark:text-green-400">
          Laporan berhasil dibuat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {id && (
          <p className="text-muted-foreground text-sm">
            Nomor laporan: <strong>#{id}</strong>. Foto akan dianalisis untuk deteksi lubang.
          </p>
        )}
        <p className="text-muted-foreground text-sm">
          Login untuk melihat detail laporan, foto hasil deteksi, dan mengelola daftar laporan.
        </p>
        <div className="flex flex-wrap gap-2">
          {id && (
            <Button asChild>
              <Link href={`/laporan/${id}`}>Lihat detail</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/">Ke beranda</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/lapor">Buat laporan lagi</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LaporSuksesPage() {
  return (
    <div className="mx-auto max-w-md">
      <Suspense fallback={<Card><CardContent className="py-8">Memuat...</CardContent></Card>}>
        <IsiSukses />
      </Suspense>
    </div>
  );
}
