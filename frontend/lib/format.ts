export function formatTanggal(
  iso: string,
  opsi: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
): string {
  try {
    return new Date(iso).toLocaleDateString("id-ID", opsi);
  } catch {
    return iso;
  }
}

export function formatTanggalLengkap(iso: string): string {
  return formatTanggal(iso, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
