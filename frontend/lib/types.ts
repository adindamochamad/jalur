export interface User {
  id: number;
  nama: string;
  email: string;
  role: string;
}

export interface Laporan {
  id: number;
  foto_asli: string | null;
  foto_hasil: string | null;
  foto_asli_data?: string | null;
  foto_hasil_data?: string | null;
  latitude: string | null;
  longitude: string | null;
  alamat: string | null;
  status: string;
  keparahan: string;
  confidence: number | null;
  jumlah_lubang: number;
  pelapor_nama: string | null;
  pelapor_hp: string | null;
  catatan: string | null;
  created_at: string;
  updated_at: string;
}

export interface Meta {
  total: number;
  page: number;
  per_page: number;
}

export interface ResponseListLaporan {
  status: boolean;
  message: string;
  data: Laporan[];
  meta: Meta;
}

export interface ResponseSatuLaporan {
  status: boolean;
  message: string;
  data: Laporan;
}

export interface ResponseLogin {
  status: boolean;
  message: string;
  data?: { token: string; user: User };
}

export interface DashboardStats {
  total: number;
  per_status: Record<string, number>;
  per_keparahan: Record<string, number>;
}

export interface ResponseDashboardStats {
  status: boolean;
  message: string;
  data: DashboardStats;
}

export interface MarkerPeta {
  id: number;
  latitude: number;
  longitude: number;
  keparahan: string;
  alamat: string | null;
  created_at: string;
}

export interface ResponseDashboardPeta {
  status: boolean;
  message: string;
  data: MarkerPeta[];
}

export interface StatusLaporanPublik {
  id: number;
  status: string;
  keparahan: string;
  jumlah_lubang: number;
  created_at: string;
}

export interface ResponseStatusLaporanPublik {
  status: boolean;
  message: string;
  data?: StatusLaporanPublik;
}
