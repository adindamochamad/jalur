/**
 * Client API untuk komunikasi dengan backend CI4.
 * Base URL dari env; jangan hardcode.
 */

import type {
  ResponseListLaporan,
  ResponseSatuLaporan,
  ResponseLogin,
  ResponseDashboardStats,
  ResponseDashboardPeta,
  ResponseStatusLaporanPublik,
} from "./types";

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

function url(path: string): string {
  const base = baseUrl.replace(/\/$/, "");
  const segmen = path.replace(/^\//, "");
  return base ? `${base}/${segmen}` : segmen;
}

/** Pesan ramah saat request gagal (network/CORS). */
function pesanErrorJaringan(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (
    msg === "Failed to fetch" ||
    msg.includes("fetch") ||
    msg.includes("NetworkError") ||
    msg.includes("Load failed")
  ) {
    const u = typeof window !== "undefined" ? baseUrl || "NEXT_PUBLIC_API_URL" : baseUrl;
    return `Tidak bisa terhubung ke server. Pastikan backend API jalan (${u || "atur NEXT_PUBLIC_API_URL"}).`;
  }
  return msg;
}

/** Cache status login (di-set oleh checkAuth/login/logout). Token pakai httpOnly cookie jadi tidak dibaca di sini. */
let authCache: boolean | null = null;

/**
 * Request dengan auth: cookie httpOnly dikirim otomatis via credentials: 'include'.
 * Return body JSON atau throw.
 */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const res = await fetch(url(path), {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const pesan = data?.message ?? `HTTP ${res.status}`;
      if (res.status === 401) {
        throw new Error(`401: ${pesan}`);
      }
      throw new Error(pesan);
    }
    return data as T;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("HTTP ")) throw e;
    throw new Error(pesanErrorJaringan(e));
  }
}

/** POST JSON ke path (tanpa auth). */
async function postJson<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(url(path), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message ?? `HTTP ${res.status}`);
    }
    return data as T;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("HTTP ")) throw e;
    throw new Error(pesanErrorJaringan(e));
  }
}

/** Login: email + password. Backend set httpOnly cookie; tidak simpan token di client. */
export async function login(email: string, password: string): Promise<ResponseLogin["data"]> {
  const hasil = await postJson<ResponseLogin>("/api/auth/login", { email, password });
  if (!hasil.status || !hasil.data) {
    throw new Error(hasil.message ?? "Login gagal");
  }
  authCache = true;
  return hasil.data;
}

/** Logout: panggil API agar cookie di-clear, lalu reset cache. */
export async function logout(): Promise<void> {
  try {
    await fetch(url("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    authCache = false;
  }
}

/** Cek auth dengan memanggil GET /api/auth/me (cookie dikirim otomatis). Meng-update cache. */
export async function checkAuth(): Promise<boolean> {
  try {
    const res = await fetch(url("/api/auth/me"), { credentials: "include" });
    authCache = res.ok;
    return res.ok;
  } catch {
    authCache = false;
    return false;
  }
}

/** Data user yang sedang login (GET /api/auth/me). Throw jika belum login. */
export async function getAuthUser(): Promise<import("./types").User> {
  const data = await request<{ status: boolean; data: import("./types").User }>("/api/auth/me");
  if (!data?.data) throw new Error("Data user tidak ditemukan");
  return data.data;
}

/** Ubah password (POST /api/auth/ubah-password). Butuh login. */
export async function ubahPassword(passwordLama: string, passwordBaru: string): Promise<void> {
  const data = await postJson<{ status: boolean; message: string }>("/api/auth/ubah-password", {
    password_lama: passwordLama,
    password_baru: passwordBaru,
  });
  if (!data.status) throw new Error(data.message ?? "Gagal mengubah password");
}

/** Cek apakah user dianggap sudah login (cache dari checkAuth/login). Untuk render awal gunakan checkAuth(). */
export function isLoggedIn(): boolean {
  return authCache === true;
}

/** Daftar laporan dengan paginasi dan filter (butuh auth). */
export async function getLaporan(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  keparahan?: string;
}): Promise<ResponseListLaporan> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.per_page != null) search.set("per_page", String(params.per_page));
  if (params?.status) search.set("status", params.status);
  if (params?.keparahan) search.set("keparahan", params.keparahan);
  const query = search.toString();
  return request<ResponseListLaporan>(`/api/laporan${query ? `?${query}` : ""}`);
}

/** Detail satu laporan (butuh auth). */
export async function getLaporanById(id: number): Promise<ResponseSatuLaporan> {
  return request<ResponseSatuLaporan>(`/api/laporan/${id}`);
}

/** Data yang boleh diubah via PUT (admin). */
export type UpdateLaporanPayload = {
  status?: "terdeteksi" | "diproses" | "selesai";
  keparahan?: string;
  catatan?: string;
  alamat?: string;
};

/** Update laporan (admin, butuh auth). PUT /api/laporan/:id */
export async function updateLaporan(
  id: number,
  payload: UpdateLaporanPayload
): Promise<ResponseSatuLaporan> {
  const res = await fetch(url(`/api/laporan/${id}`), {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message ?? `HTTP ${res.status}`);
  }
  return data as ResponseSatuLaporan;
}

/** Statistik dashboard (butuh auth). */
export async function getDashboardStats(): Promise<ResponseDashboardStats> {
  return request<ResponseDashboardStats>("/api/dashboard/stats");
}

/** Data peta laporan untuk marker (butuh auth). */
export async function getDashboardPeta(): Promise<ResponseDashboardPeta> {
  return request<ResponseDashboardPeta>("/api/dashboard/peta");
}

/** Response error dari API create laporan (validasi backend). */
export interface ResponseCreateLaporanError {
  status: false;
  message: string;
  errors?: Record<string, string>;
}

/**
 * Buat laporan baru (multipart: foto + latitude, longitude, alamat, pelapor_nama, pelapor_hp, catatan).
 * Public, tidak butuh auth. Pada error validasi (400) mengembalikan objek error beserta errors, bukan throw.
 */
export async function createLaporan(
  formData: FormData
): Promise<ResponseSatuLaporan | ResponseCreateLaporanError> {
  try {
    const res = await fetch(url("/api/laporan"), {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: false,
        message: data?.message ?? `HTTP ${res.status}`,
        errors: data?.errors,
      };
    }
    return data as ResponseSatuLaporan;
  } catch (e) {
    throw new Error(pesanErrorJaringan(e));
  }
}

/** Status laporan untuk publik (tanpa login). GET api/publik/laporan/:id */
export async function getStatusLaporanPublik(
  id: number
): Promise<ResponseStatusLaporanPublik> {
  try {
    const res = await fetch(url(`/api/publik/laporan/${id}`), {
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: false,
        message: data?.message ?? "Laporan tidak ditemukan",
      };
    }
    return data as ResponseStatusLaporanPublik;
  } catch (e) {
    return {
      status: false,
      message: pesanErrorJaringan(e),
    };
  }
}

/** Data peta laporan untuk publik (tanpa login). GET api/publik/peta */
export async function getPetaPublik(): Promise<ResponseDashboardPeta> {
  return request<ResponseDashboardPeta>("/api/publik/peta");
}

/** Cek koneksi ke backend (GET /api/auth/ping, tanpa auth). */
export async function pingBackend(): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(url("/api/auth/ping"), { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.status === true) {
      return { ok: true, message: "Backend merespons." };
    }
    return { ok: false, message: data?.message ?? `HTTP ${res.status}` };
  } catch (e) {
    return {
      ok: false,
      message: pesanErrorJaringan(e),
    };
  }
}

export { baseUrl };
