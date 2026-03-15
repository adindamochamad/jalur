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
  const segmen = path.replace(/^\//, "");
  const isApi = segmen.startsWith("api/") || segmen === "api";
  if (typeof window !== "undefined" && isApi) {
    return `/${segmen}`;
  }
  const base = baseUrl.replace(/\/$/, "");
  return base ? `${base}/${segmen}` : `/${segmen}`;
}

function pesanErrorJaringan(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg === "Failed to fetch" || msg.includes("fetch") || msg.includes("NetworkError") || msg.includes("Load failed")) {
    return [
      "Tidak bisa terhubung ke server.",
      "Pastikan: (1) Buka aplikasi lewat http://localhost:3010",
      "(2) Semua layanan jalan: docker compose up -d",
    ].join(" ");
  }
  return msg;
}

const TOKEN_STORAGE_KEY = "jalur_token";
let authCache: boolean | null = null;
let tokenDiMemori: string | null = null;

function getToken(): string | null {
  if (tokenDiMemori) return tokenDiMemori;
  if (typeof sessionStorage !== "undefined") {
    const s = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (s) tokenDiMemori = s;
    return s;
  }
  return null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string>) };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(url(path), { ...options, credentials: "include", headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const pesan = data?.message ?? `HTTP ${res.status}`;
      if (res.status === 401) throw new Error(`401: ${pesan}`);
      throw new Error(pesan);
    }
    return data as T;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("HTTP ")) throw e;
    throw new Error(pesanErrorJaringan(e));
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(url(path), { method: "POST", credentials: "include", headers, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message ?? `HTTP ${res.status}`);
    return data as T;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("HTTP ")) throw e;
    throw new Error(pesanErrorJaringan(e));
  }
}

export async function login(email: string, password: string): Promise<ResponseLogin["data"]> {
  const hasil = await postJson<ResponseLogin>("/api/auth/login", { email, password });
  if (!hasil.status || !hasil.data) throw new Error(hasil.message ?? "Login gagal");
  if (hasil.data?.token) {
    tokenDiMemori = hasil.data.token;
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem(TOKEN_STORAGE_KEY, hasil.data.token);
  }
  authCache = true;
  return hasil.data;
}

export async function register(nama: string, email: string, password: string): Promise<void> {
  const hasil = await postJson<{ status: boolean; message: string }>("/api/auth/register", {
    nama: nama.trim(),
    email: email.trim(),
    password,
  });
  if (!hasil.status) throw new Error(hasil.message ?? "Registrasi gagal");
}

export async function logout(): Promise<void> {
  try {
    await fetch(url("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    });
  } finally {
    tokenDiMemori = null;
    if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    authCache = false;
  }
}

export async function checkAuth(): Promise<boolean> {
  try {
    const token = getToken();
    const res = await fetch(url("/api/auth/me"), {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    authCache = res.ok;
    return res.ok;
  } catch {
    authCache = false;
    return false;
  }
}

export async function getAuthUser(): Promise<import("./types").User> {
  const data = await request<{ status: boolean; data: import("./types").User }>("/api/auth/me");
  if (!data?.data) throw new Error("Data user tidak ditemukan");
  return data.data;
}

export async function ubahPassword(passwordLama: string, passwordBaru: string): Promise<void> {
  const data = await postJson<{ status: boolean; message: string }>("/api/auth/ubah-password", {
    password_lama: passwordLama,
    password_baru: passwordBaru,
  });
  if (!data.status) throw new Error(data.message ?? "Gagal mengubah password");
}

export function isLoggedIn(): boolean {
  return authCache === true;
}

export async function getLaporan(params?: { page?: number; per_page?: number; status?: string; keparahan?: string }): Promise<ResponseListLaporan> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.per_page != null) search.set("per_page", String(params.per_page));
  if (params?.status) search.set("status", params.status);
  if (params?.keparahan) search.set("keparahan", params.keparahan);
  const query = search.toString();
  return request<ResponseListLaporan>(`/api/laporan${query ? `?${query}` : ""}`);
}

export async function getLaporanById(id: number): Promise<ResponseSatuLaporan> {
  return request<ResponseSatuLaporan>(`/api/laporan/${id}`);
}

export type UpdateLaporanPayload = {
  status?: "terdeteksi" | "diproses" | "selesai";
  keparahan?: string;
  catatan?: string;
  alamat?: string;
};

export async function updateLaporan(id: number, payload: UpdateLaporanPayload): Promise<ResponseSatuLaporan> {
  const res = await fetch(url(`/api/laporan/${id}`), {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message ?? `HTTP ${res.status}`);
  return data as ResponseSatuLaporan;
}

export async function getDashboardStats(): Promise<ResponseDashboardStats> {
  return request<ResponseDashboardStats>("/api/dashboard/stats");
}

export async function getDashboardPeta(): Promise<ResponseDashboardPeta> {
  return request<ResponseDashboardPeta>("/api/dashboard/peta");
}

export interface ResponseCreateLaporanError {
  status: false;
  message: string;
  errors?: Record<string, string>;
}

export async function createLaporan(formData: FormData): Promise<ResponseSatuLaporan | ResponseCreateLaporanError> {
  try {
    const res = await fetch(url("/api/laporan"), { method: "POST", credentials: "include", body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { status: false, message: data?.message ?? `HTTP ${res.status}`, errors: data?.errors };
    }
    return data as ResponseSatuLaporan;
  } catch (e) {
    throw new Error(pesanErrorJaringan(e));
  }
}

export async function getStatusLaporanPublik(id: number): Promise<ResponseStatusLaporanPublik> {
  try {
    const res = await fetch(url(`/api/publik/laporan/${id}`), { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { status: false, message: data?.message ?? "Laporan tidak ditemukan" };
    return data as ResponseStatusLaporanPublik;
  } catch (e) {
    return { status: false, message: pesanErrorJaringan(e) };
  }
}

export async function getPetaPublik(): Promise<ResponseDashboardPeta> {
  return request<ResponseDashboardPeta>("/api/publik/peta");
}

export async function pingBackend(): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(url("/api/auth/ping"), { credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.status === true) return { ok: true, message: "Backend merespons." };
    return { ok: false, message: data?.message ?? `HTTP ${res.status}` };
  } catch (e) {
    return { ok: false, message: pesanErrorJaringan(e) };
  }
}

export { baseUrl };
