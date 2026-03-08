import Link from "next/link";
import { Camera, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary/80 px-6 py-10 text-primary-foreground sm:px-10 sm:py-14">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Jalur
          </h1>
          <p className="mt-2 max-w-xl text-lg opacity-95 sm:text-xl">
            Laporan Jalan Berlubang — laporkan kondisi jalan di sekitar Anda. Foto dianalisis AI untuk deteksi lubang otomatis.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="font-medium">
              <Link href="/lapor" className="inline-flex items-center gap-2">
                <Camera className="size-4" />
                Buat Laporan
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/peta" className="inline-flex items-center gap-2">
                <MapPin className="size-4" />
                Lihat Peta
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-primary-foreground/10 sm:size-56" />
        <div className="absolute -bottom-4 -right-4 size-32 rounded-full bg-primary-foreground/5 sm:size-40" />
      </section>

      {/* Kartu aksi */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Aksi Cepat</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/lapor" className="group block">
            <Card className="h-full border-border/80 shadow-card shadow-card-hover transition-all duration-200 group-hover:border-primary/30">
              <CardHeader className="pb-2">
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Camera className="size-5" />
                </div>
                <CardTitle className="text-lg">Lapor Jalan Berlubang</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Upload foto jalan, isi lokasi dan data pelapor. Sistem mendeteksi lubang dengan AI.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                  Buat laporan
                  <ChevronRight className="size-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/laporan" className="group block">
            <Card className="h-full border-border/80 shadow-card shadow-card-hover transition-all duration-200 group-hover:border-primary/30">
              <CardHeader className="pb-2">
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <MapPin className="size-5" />
                </div>
                <CardTitle className="text-lg">Daftar Laporan</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Lihat semua laporan yang masuk. Perlu login untuk mengakses daftar dan dashboard.
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:gap-2 group-hover:text-foreground transition-all">
                  Lihat daftar
                  <ChevronRight className="size-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
