"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { LogIn } from "lucide-react";
import { login } from "@/lib/api";
import { schemaLogin, type FormLogin } from "@/lib/validasi";
import { cn } from "@/lib/utils";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const baruDaftar = searchParams.get("registered") === "1";
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormLogin>({
    resolver: zodResolver(schemaLogin),
    defaultValues: { email: "", password: "" },
  });

  const loading = form.formState.isSubmitting;

  const onSubmit = async (data: FormLogin) => {
    setError(null);
    try {
      await login(data.email.trim(), data.password);
      const target = redirect.startsWith("/") ? redirect : "/dashboard";
      // Redirect penuh agar dashboard baca token dari sessionStorage di load bersih
      if (typeof window !== "undefined") {
        window.location.href = target;
      } else {
        router.push(target);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LogIn className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Akses daftar laporan dan dashboard.{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Daftar akun baru
            </Link>
          </p>
        </div>
      </div>

      <Card className="mt-6 border-border/80 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Masuk</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
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
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {baruDaftar && (
                <p className={cn("text-green-600 dark:text-green-400 text-sm")}>
                  Registrasi berhasil. Silakan login.
                </p>
              )}
              {error && (
                <p className={cn("text-destructive text-sm")}>{error}</p>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? "Memproses..." : "Login"}
              </Button>
              <p className="text-muted-foreground text-center text-sm">
                Belum punya akun?{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  Daftar di sini
                </Link>
              </p>
              <Link href="/register" className="block">
                <Button type="button" variant="outline" className="w-full" disabled={loading}>
                  Daftar akun baru
                </Button>
              </Link>
            </form>
          </Form>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm"><div className="h-8 w-48 animate-pulse rounded bg-muted" /><div className="mt-6 h-64 animate-pulse rounded bg-muted" /></div>}>
      <LoginPageInner />
    </Suspense>
  );
}
