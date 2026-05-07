import Link from "next/link";
import { getMapData, getCurrentUser, geocodeLocation } from "@/lib/api";
import { BrgyMapClient } from "@/components/map/brgy-map-client";
import type { MapPin } from "@/components/map/brgy-map";
import type { Complaint } from "@/lib/types";

const LEGEND = [
  { color: "bg-amber-400", label: "Pending" },
  { color: "bg-blue-500", label: "In Progress" },
  { color: "bg-violet-500", label: "For Review" },
  { color: "bg-emerald-500", label: "Resolved" },
];

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400",
  "in-progress": "bg-blue-500",
  "for-review": "bg-violet-500",
  resolved: "bg-emerald-500",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  "for-review": "For Review",
  resolved: "Resolved",
};

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function reportTitle(report: Complaint) {
  return (
    report.title?.trim() ||
    report.description?.trim() ||
    report.summary?.trim() ||
    titleCase(report.tagging || "barangay report")
  );
}

export default async function BrgyMapPage() {
  const [complaints, user] = await Promise.all([getMapData(), getCurrentUser()]);

  const center = user?.location_assigned
    ? await geocodeLocation(user.location_assigned)
    : null;

  const withCoords = complaints.filter((c) => c.lat != null && c.lng != null);
  const noCoords = complaints.filter((c) => c.lat == null || c.lng == null);

  const pins: MapPin[] = withCoords.map((c) => ({
    id: c.id,
    lat: c.lat!,
    lng: c.lng!,
    title: reportTitle(c),
    status: c.status as MapPin["status"],
    tagging: c.tagging,
    summary: c.summary ?? c.description,
  }));

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Barangay Map
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live complaint locations across your barangay.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 bg-card border border-border rounded-full px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-muted-foreground">Live</span>
        </div>
      </div>

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
      </div>

      <div
        className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
        style={{ height: "calc(100vh - 280px)", minHeight: "420px" }}
      >
        {pins.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-30"
            >
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <p className="text-sm font-semibold">
              No complaints with GPS data yet
            </p>
            <p className="text-xs text-center max-w-xs">
              Pins will appear here once complaints are filed with a GPS
              location.
            </p>
          </div>
        ) : (
          <BrgyMapClient pins={pins} center={center ?? undefined} />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
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
        <span>
          Showing {pins.length} pinned reports
          {noCoords.length > 0 ? ` and ${noCoords.length} without GPS` : ""}.
        </span>
        <span>
          Powered by{" "}
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
        </span>
      </div>

      {complaints.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <p className="text-sm font-bold">Barangay reports</p>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {complaints.length}
            </span>
            {noCoords.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {noCoords.length} without GPS
              </span>
            )}
          </div>
          <div className="space-y-2">
            {complaints.map((c) => (
              <Link
                key={c.id}
                href={`/citizen/reports/${c.id}`}
                className="group bg-card border border-border/60 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[c.status] ?? "bg-slate-400"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate group-hover:text-accent transition-colors">
                    {reportTitle(c)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.location || "No address provided"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline text-[11px] text-muted-foreground">
                    {c.lat != null && c.lng != null ? "Pinned" : "No GPS"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {STATUS_LABEL[c.status] ?? c.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Reports with GPS coordinates appear as pins; the rest stay listed
            here for visibility.
          </p>
        </div>
      )}
    </div>
  );
}
