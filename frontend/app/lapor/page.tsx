"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";
import { createLaporan } from "@/lib/api";
import { validasiFileFoto } from "@/lib/validasi";
import { schemaLapor, type FormLapor } from "@/lib/validasi";
import { cn } from "@/lib/utils";

export default function LaporPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileFoto, setFileFoto] = useState<File | null>(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormLapor>({
    resolver: zodResolver(schemaLapor),
    defaultValues: {
      latitude: "",
      longitude: "",
      alamat: "",
      pelapor_nama: "",
      pelapor_hp: "",
      catatan: "",
    },
  });

  const loadingSubmit = form.formState.isSubmitting;

  const ambilLokasi = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung geolokasi");
      return;
    }
    // Geolocation hanya jalan di konteks aman: HTTPS atau localhost
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setError(
        "Akses lokasi hanya tersedia di HTTPS atau localhost. Buka lewat https://... atau http://localhost:3010, atau isi koordinat manual."
      );
      return;
    }
    setLoadingGps(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        form.setValue("latitude", String(pos.coords.latitude));
        form.setValue("longitude", String(pos.coords.longitude));
        setLoadingGps(false);
      },
      (err: GeolocationPositionError) => {
        setLoadingGps(false);
        const kode = err?.code;
        if (kode === 1) {
          setError("Akses lokasi ditolak. Izinkan lokasi untuk situs ini di pengaturan browser, lalu coba lagi atau isi manual.");
        } else if (kode === 2) {
          setError("Posisi tidak tersedia (GPS lemah atau mati). Coba di tempat terbuka atau isi koordinat manual.");
        } else if (kode === 3) {
          setError("Waktu tunggu lokasi habis. Coba lagi atau isi latitude/longitude manual.");
        } else {
          setError("Tidak bisa mengambil lokasi. Izinkan akses di pengaturan browser atau isi koordinat manual.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [form]);

  const onSubmit = async (data: FormLapor) => {
    setError(null);
    const errorFile = validasiFileFoto(fileFoto);
    if (errorFile) {
      setError(errorFile);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("foto", fileFoto!);
      formData.append("latitude", data.latitude);
      formData.append("longitude", data.longitude);
      formData.append("alamat", data.alamat);
      formData.append("pelapor_nama", data.pelapor_nama);
      formData.append("pelapor_hp", data.pelapor_hp);
      formData.append("catatan", data.catatan);

      const res = await createLaporan(formData);
      if (res.status && res.data) {
        router.push(`/lapor/sukses?id=${res.data.id}`);
        return;
      }
      const pesan = res.message ?? "Gagal membuat laporan";
      setError(pesan);
      toast.error(pesan);
      if ("errors" in res && res.errors && typeof res.errors === "object") {
        for (const [field, msg] of Object.entries(res.errors)) {
          if (["pelapor_nama", "pelapor_hp", "alamat", "catatan"].includes(field)) {
            form.setError(field as keyof FormLapor, { type: "server", message: msg as string });
          }
        }
      }
    } catch (err) {
      const pesan = err instanceof Error ? err.message : "Gagal mengirim laporan";
      setError(pesan);
      toast.error(pesan);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Camera className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lapor Jalan Berlubang</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Upload foto jalan. Sistem akan mendeteksi lubang secara otomatis.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
          <Card className="border-border/80 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Data Laporan</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Foto */}
              <div className="space-y-2">
                <Label>Foto jalan *</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  ref={fileInputRef}
                  onChange={(e) => setFileFoto(e.target.files?.[0] ?? null)}
                />
                {fileFoto && (
                  <p className="text-muted-foreground text-xs">
                    {fileFoto.name} ({(fileFoto.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* GPS */}
              <div className="space-y-2">
                <Label>Lokasi (GPS)</Label>
                <p className="text-muted-foreground text-xs">
                  Lokasi opsional. Jika tombol gagal (mis. akses dari HP tanpa HTTPS), isi latitude/longitude manual atau kosongkan.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={ambilLokasi}
                    disabled={loadingGps}
                  >
                    {loadingGps ? "Mengambil..." : "Ambil lokasi saya"}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Latitude</FormLabel>
                        <FormControl>
                          <Input placeholder="-6.xxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Longitude</FormLabel>
                        <FormControl>
                          <Input placeholder="106.xxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="alamat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat / keterangan lokasi</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Jl. Sudirman km 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="pelapor_nama"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama pelapor</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pelapor_hp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. HP</FormLabel>
                      <FormControl>
                        <Input placeholder="08xxxxxxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="catatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan (opsional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Kondisi jalan, waktu kejadian, dll."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            {error && (
              <p className={cn("text-destructive text-sm")}>{error}</p>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loadingSubmit}>
                {loadingSubmit ? "Mengirim..." : "Kirim Laporan"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
        </form>
      </Form>
    </div>
  );
}
