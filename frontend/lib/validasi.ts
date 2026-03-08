/**
 * Skema validasi Zod untuk form (konsisten dengan backend).
 */
import { z } from "zod";

/** Form login: email & password wajib. */
export const schemaLogin = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type FormLogin = z.infer<typeof schemaLogin>;

/** Form lapor: foto wajib di handler; field lain opsional, konsisten dengan backend. */
export const schemaLapor = z.object({
  latitude: z.string(),
  longitude: z.string(),
  alamat: z.string().max(500, "Alamat maksimal 500 karakter"),
  pelapor_nama: z.string().max(100, "Nama maksimal 100 karakter"),
  pelapor_hp: z.string().max(20, "No. HP maksimal 20 karakter"),
  catatan: z.string().max(2000, "Catatan maksimal 2000 karakter"),
});

export type FormLapor = z.infer<typeof schemaLapor>;

/** Validasi file foto: wajib, jpg/jpeg/png, max 5MB (sesuai backend). */
export function validasiFileFoto(file: File | null): string | null {
  if (!file) return "Pilih foto jalan terlebih dahulu";
  const ekstensi = file.name.split(".").pop()?.toLowerCase();
  if (!["jpg", "jpeg", "png"].includes(ekstensi ?? "")) {
    return "Format file harus JPG, JPEG, atau PNG";
  }
  if (file.size > 5 * 1024 * 1024) return "Ukuran file maksimal 5MB";
  return null;
}
