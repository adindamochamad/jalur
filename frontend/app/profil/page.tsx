"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Skeleton } from "@/components/ui/skeleton";
import { checkAuth, getAuthUser, ubahPassword } from "@/lib/api";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

const schemaUbahPassword = z
  .object({
    password_lama: z.string().min(1, "Password lama wajib diisi"),
    password_baru: z.string().min(8, "Password baru minimal 8 karakter"),
    password_baru_ulang: z.string().min(1, "Ulangi password baru"),
  })
  .refine((data) => data.password_baru === data.password_baru_ulang, {
    message: "Password baru dan ulangan tidak sama",
    path: ["password_baru_ulang"],
  });

type FormUbahPassword = z.infer<typeof schemaUbahPassword>;

export default function ProfilPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [errorProfil, setErrorProfil] = useState<string | null>(null);
  const [suksesPassword, setSuksesPassword] = useState(false);

  const form = useForm<FormUbahPassword>({
    resolver: zodResolver(schemaUbahPassword),
    defaultValues: {
      password_lama: "",
      password_baru: "",
      password_baru_ulang: "",
    },
  });

  useEffect(() => {
    checkAuth().then((ok) => {
      if (!ok) {
        router.replace(`/login?redirect=${encodeURIComponent("/profil")}`);
        return;
      }
      setAuthChecked(true);
      getAuthUser()
        .then(setUser)
        .catch(() => setErrorProfil("Gagal memuat data profil"));
    });
  }, [router]);

  const onSubmitPassword = async (data: FormUbahPassword) => {
    setSuksesPassword(false);
    try {
      await ubahPassword(data.password_lama, data.password_baru);
      setSuksesPassword(true);
      form.reset();
    } catch (err) {
      form.setError("password_lama", {
        type: "server",
        message: err instanceof Error ? err.message : "Gagal mengubah password",
      });
    }
  };

  if (!authChecked) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Profil</h1>
      <p className="text-muted-foreground text-sm">
        Data akun dan pengaturan keamanan.
      </p>

      {errorProfil && (
        <p className="text-destructive text-sm">{errorProfil}</p>
      )}

      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Nama:</span> {user.nama}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span> {user.email}
            </p>
            <p>
              <span className="text-muted-foreground">Role:</span> {user.role}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ubah Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitPassword)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="password_lama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password lama</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password_baru"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password baru</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password_baru_ulang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ulangi password baru</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {suksesPassword && (
                <p className={cn("text-green-600 dark:text-green-400 text-sm")}>
                  Password berhasil diubah.
                </p>
              )}
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Memproses..." : "Ubah Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
