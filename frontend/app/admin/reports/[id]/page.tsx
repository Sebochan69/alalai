import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminComplaint } from "@/lib/api";
import { AdminUpdateForm } from "@/components/forms/admin-update-form";
import { MediaViewer } from "@/components/ui/media-viewer";
import { ReportLocationMapClient } from "@/components/map/report-location-map-client";

const STATUS: Record<string, { label: string; dot: string; badge: string }> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-400",
    badge: "bg-amber-500/12 text-amber-400 border-amber-500/25",
  },
  "under-review": {
    label: "Under Review",
    dot: "bg-blue-400",
    badge: "bg-blue-500/12 text-blue-400 border-blue-500/25",
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-violet-400",
    badge: "bg-violet-500/12 text-violet-400 border-violet-500/25",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  },
  closed: {
    label: "Closed",
    dot: "bg-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
  },
};

const PRIORITY: Record<string, { label: string; chip: string }> = {
  high: { label: "High", chip: "text-red-400 bg-red-500/10 border-red-500/25" },
  medium: {
    label: "Medium",
    chip: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  },
  low: {
    label: "Low",
    chip: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getAdminComplaint(id);
  if (!report) notFound();

  const s = STATUS[report.status] ?? STATUS["pending"];
  const p = report.priority ? (PRIORITY[report.priority] ?? null) : null;

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto w-full">
      {/* Back */}
      <Link
        href="/admin/reports"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 group"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:-translate-x-0.5 transition-transform"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Reports
      </Link>

      {/* Hero card */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
              #{report.id}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 border border-border px-2.5 py-0.5 rounded-full">
              {report.tagging}
            </span>
            {p && (
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${p.chip}`}
              >
                {p.label} Priority
              </span>
            )}
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${s.badge} flex items-center gap-1.5 shrink-0`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${s.dot} ${report.status === "in-progress" || report.status === "pending" ? "animate-pulse" : ""}`}
            />
            {s.label}
          </span>
        </div>
        <h1 className="text-xl font-black tracking-tight mb-2 leading-snug">
          {report.title ?? report.description.slice(0, 80)}
        </h1>
        <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {report.citizenName ?? "Citizen"}
          </div>
          <div className="flex items-center gap-1.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Filed {formatDate(report.created_at)}
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm mb-4">
        <div className="px-5 py-3 border-b border-border/60 flex items-center gap-2">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Report Details
          </p>
        </div>
        <div className="divide-y divide-border/40">
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Address
              </p>
            </div>
            <p className="text-sm">{report.location}</p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Description
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.description}
            </p>
          </div>
        </div>
        <div className="px-5 py-3 bg-muted/20 border-t border-border/40 flex items-center gap-2">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-violet-400 shrink-0"
          >
            <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          <p className="text-[10px] text-muted-foreground">
            AI has auto-classified this report — category and priority set on
            the backend.
          </p>
        </div>
      </div>

      {/* Photo evidence */}
      {report.media && (
        <MediaViewer src={report.media} label="Photo Evidence" />
      )}

      {/* GPS Location map */}
      {report.lat && report.lng && (
        <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm mb-4">
          <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                GPS Location
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${report.lat},${report.lng}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg bg-violet-600 text-white text-[11px] font-bold hover:bg-violet-700 transition-colors"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              Get Directions
            </a>
          </div>
          <div style={{ height: "220px" }}>
            <ReportLocationMapClient
              lat={report.lat}
              lng={report.lng}
              title={report.title ?? report.description.slice(0, 60)}
            />
          </div>
          <div className="px-5 py-2 border-t border-border/40 bg-muted/20 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground font-mono">
              {report.lat.toFixed(6)}, {report.lng.toFixed(6)}
            </p>
            <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
              Exact Pin
            </span>
          </div>
        </div>
      )}

      {/* Update form */}
      <AdminUpdateForm report={report} />
    </div>
  );
}
