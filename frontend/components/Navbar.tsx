"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkAuth, logout } from "@/lib/api";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/lapor", label: "Lapor" },
  { href: "/cek-status", label: "Cek Status" },
  { href: "/peta", label: "Peta" },
  { href: "/cara-pakai", label: "Cara Pakai" },
  { href: "/tentang", label: "Tentang" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/laporan", label: "Daftar Laporan" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sudahLogin, setSudahLogin] = useState(false);
  const [menuTerbuka, setMenuTerbuka] = useState(false);

  useEffect(() => {
    checkAuth().then(setSudahLogin);
  }, [pathname]);

  useEffect(() => {
    setMenuTerbuka(false);
  }, [pathname]);

  const handleLogout = () => {
    logout().then(() => {
      setSudahLogin(false);
      router.push("/");
      router.refresh();
    });
  };

  const linkClass = (href: string) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
      pathname === href
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 font-semibold text-lg tracking-tight text-foreground"
        >
          Jalur
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span className={linkClass(item.href)}>{item.label}</span>
            </Link>
          ))}
          {sudahLogin ? (
            <>
              <Link href="/profil">
                <span className={linkClass("/profil")}>Profil</span>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2">
                Logout
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="ml-2">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </nav>

        {/* Mobile: tombol menu */}
        <div className="flex items-center gap-2 md:hidden">
          {sudahLogin && (
            <Button asChild size="sm" variant="ghost">
              <Link href="/profil">Profil</Link>
            </Button>
          )}
          {!sudahLogin && (
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={menuTerbuka ? "Tutup menu" : "Buka menu"}
            onClick={() => setMenuTerbuka(!menuTerbuka)}
          >
            {menuTerbuka ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuTerbuka && (
        <div className="border-t border-border/80 bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="block">
                <span className={linkClass(item.href)}>{item.label}</span>
              </Link>
            ))}
            {sudahLogin && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
