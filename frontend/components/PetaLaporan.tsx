"use client";

import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { formatTanggal } from "@/lib/format";
import type { MarkerPeta } from "@/lib/types";
import "leaflet/dist/leaflet.css";

const CENTER_INDONESIA: [number, number] = [-6.2, 106.8];
const ZOOM_DEFAULT = 6;

function warnaKeparahan(keparahan: string): string {
  switch (keparahan) {
    case "parah":
      return "#dc2626"; // red
    case "sedang":
      return "#ca8a04"; // amber
    default:
      return "#16a34a"; // green (ringan)
  }
}

interface PetaLaporanProps {
  daftarMarker: MarkerPeta[];
}

export function PetaLaporan({ daftarMarker }: PetaLaporanProps) {
  return (
    <div className="h-[400px] w-full overflow-hidden rounded-lg border">
      <MapContainer
        center={CENTER_INDONESIA}
        zoom={ZOOM_DEFAULT}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {daftarMarker.map((m) => (
          <CircleMarker
            key={m.id}
            center={[m.latitude, m.longitude]}
            radius={8}
            pathOptions={{
              fillColor: warnaKeparahan(m.keparahan),
              color: "#1f2937",
              weight: 1.5,
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-medium">Laporan #{m.id}</p>
                <p className="text-muted-foreground text-sm">
                  {formatTanggal(m.created_at)} · {m.keparahan}
                </p>
                {m.alamat && (
                  <p className="text-muted-foreground mt-1 truncate text-xs">
                    {m.alamat}
                  </p>
                )}
                <Link
                  href={`/laporan/${m.id}`}
                  className="text-primary mt-2 inline-block text-sm font-medium hover:underline"
                >
                  Buka detail →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
