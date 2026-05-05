import { getMapData } from "@/lib/api";
import { BrgyMapClient } from "@/components/map/brgy-map-client";
import type { MapPin } from "@/components/map/brgy-map";

const LEGEND = [
  { color: "bg-amber-400", label: "Pending" },
  { color: "bg-purple-500", label: "Under Review" },
  { color: "bg-blue-500", label: "In Progress" },
  { color: "bg-emerald-500", label: "Resolved" },
  { color: "bg-slate-400", label: "Closed" },
];

export default async function BrgyMapPage() {
  const complaints = await getMapData();

  const pins: MapPin[] = complaints.map((c) => ({
    id: c.id,
    lat: c.lat!,
    lng: c.lng!,
    title: c.title,
    status: c.status as MapPin["status"],
    tagging: c.tagging,
    summary: c.description,
  }));
  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Barangay Map
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live complaint locations across Brgy. San Isidro.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 bg-card border border-border rounded-full px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {LEGEND.map((l) => (
          <div
            key={l.label}
            className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${l.color} shrink-0`} />
            <span className="text-xs font-semibold text-muted-foreground">
              {l.label}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
          <span className="text-xs font-semibold text-muted-foreground">
            Brgy. Hall
          </span>
        </div>
      </div>

      {/* Map container */}
      <div
        className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
        style={{ height: "calc(100vh - 280px)", minHeight: "420px" }}
      >
        <BrgyMapClient pins={pins} />
      </div>

      {/* Info note */}
      <div className="mt-4 flex items-start gap-2.5 text-xs text-muted-foreground">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 mt-0.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Pins appear when a complaint is filed with GPS location. Powered by{" "}
        <a
          href="https://www.maptiler.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline font-medium"
        >
          MapTiler
        </a>{" "}
        +{" "}
        <a
          href="https://maplibre.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline font-medium"
        >
          MapLibre
        </a>
        .
      </div>
    </div>
  );
}
