"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { UserPlus } from "lucide-react";
import { register as apiRegister } from "@/lib/api";
import { schemaRegister, type FormRegister } from "@/lib/validasi";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormRegister>({
    resolver: zodResolver(schemaRegister),
    defaultValues: {
      nama: "",
      email: "",
      password: "",
      konfirmasi_password: "",
    },
  });

  const loading = form.formState.isSubmitting;

  const onSubmit = async (data: FormRegister) => {
    setError(null);
    try {
      await apiRegister(data.nama, data.email, data.password);
      router.push("/login?registered=1");
      router.refresh();
    } catch (err) {
      const pesan = err instanceof Error ? err.message : "Registrasi gagal";
      setError(pesan);
    }
  };

  const errorKoneksi = error?.includes("tidak bisa terhubung") ?? false;

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserPlus className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Daftar Akun</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Buat akun untuk mengakses daftar laporan dan dashboard.
          </p>
        </div>
      </div>

      <Card className="mt-6 border-border/80 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Registrasi</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama lengkap"
                        autoComplete="name"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="anda@example.com"
                        autoComplete="email"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Minimal 8 karakter"
                        autoComplete="new-password"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="konfirmasi_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Ulangi password"
                        autoComplete="new-password"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <div className="space-y-2">
                  <p className={cn("text-destructive text-sm")}>{error}</p>
                  {errorKoneksi && (
                    <p className="text-muted-foreground text-xs">
                      Pastikan backend API jalan di port 8010. Di folder project: buat file <code className="rounded bg-muted px-1">.env</code> dari <code className="rounded bg-muted px-1">.env.example</code>, lalu jalankan <code className="rounded bg-muted px-1">docker compose up -d</code>. Cek: <code className="rounded bg-muted px-1">curl http://localhost:8010/api/auth/ping</code>
                    </p>
                  )}
                </div>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? "Memproses..." : "Daftar"}
              </Button>
            </form>
          </Form>
          <p className="text-muted-foreground mt-4 text-center text-sm">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
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
