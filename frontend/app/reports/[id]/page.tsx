"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getComplaint } from "@/lib/api";
import { AdminUpdateForm } from "@/components/forms/admin-update-form";
import { CloseReportButton } from "@/components/forms/close-report-button";
import { MediaViewer } from "@/components/ui/media-viewer";
import { ReportLocationMapClient } from "@/components/map/report-location-map-client";
import type { Complaint, ReportStatus } from "@/lib/types";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; badge: string; bar: string; glow: string }
> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-400",
    badge: "bg-amber-500/12 text-amber-400 border-amber-500/25",
    bar: "bg-amber-400",
    glow: "",
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-blue-400",
    badge: "bg-blue-500/12 text-blue-400 border-blue-500/25",
    bar: "bg-blue-400",
    glow: "shadow-blue-500/15",
  },
  "for-review": {
    label: "For Review",
    dot: "bg-violet-400",
    badge: "bg-violet-500/12 text-violet-400 border-violet-500/25",
    bar: "bg-violet-400",
    glow: "shadow-violet-500/10",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
    bar: "bg-emerald-500",
    glow: "shadow-emerald-500/15",
  },
};

const PRIORITY_CONFIG: Record<string, { label: string; chip: string }> = {
  high: {
    label: "High",
    chip: "text-red-400 bg-red-500/10 border-red-500/25",
  },
  medium: {
    label: "Medium",
    chip: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  },
  low: {
    label: "Low",
    chip: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  },
};

const CATEGORY_EMOJI: Record<string, string> = {
  Infrastructure: "🏗️",
  Environment: "🌿",
  "Public Safety": "🛡️",
  Sanitation: "🗑️",
  "Noise Complaint": "🔊",
  "Illegal Construction": "🚧",
  Flooding: "🌊",
  "Animal Control": "🐕",
  Other: "📋",
};

const TIMELINE: { key: ReportStatus; label: string; desc: string }[] = [
  {
    key: "pending",
    label: "Filed",
    desc: "Your report was received by the system.",
  },
  {
    key: "in-progress",
    label: "In Progress",
    desc: "A team has been dispatched to act on it.",
  },
  {
    key: "for-review",
    label: "For Review",
    desc: "Admin has addressed the issue. Confirm below to resolve.",
  },
  {
    key: "resolved",
    label: "Resolved",
    desc: "You confirmed and resolved this report.",
  },
];

const STATUS_ORDER: ReportStatus[] = [
  "pending",
  "in-progress",
  "for-review",
  "resolved",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Complaint | null>(null);
  const [role, setRole] = useState<"admin" | "citizen">("citizen");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userRole: "admin" | "citizen" = "citizen";
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.role === "admin") userRole = "admin";
      }
    } catch {
      // ignore
    }
    setRole(userRole);
    getComplaint(id).then((r) => {
      setReport(r ?? null);
      setLoading(false);
    });
  }, [id]);

  const backHref = role === "admin" ? "/admin/reports" : "/citizen/reports";
  const backLabel = role === "admin" ? "Back to Reports" : "My Reports";

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-5 md:p-8 max-w-2xl mx-auto w-full">
        <div className="h-5 w-32 bg-muted/60 rounded-lg animate-pulse mb-6" />
        <div className="h-32 bg-muted/40 rounded-2xl animate-pulse mb-4" />
        <div className="h-48 bg-muted/40 rounded-2xl animate-pulse mb-4" />
        <div className="h-24 bg-muted/40 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!report) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Report not found.</p>
        <Link
          href={backHref}
          className="mt-4 inline-block text-sm text-accent hover:underline"
        >
          ← Go back
        </Link>
      </div>
    );
  }

  const s = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending;
  const p = report.priority ? (PRIORITY_CONFIG[report.priority] ?? null) : null;
  const emoji = CATEGORY_EMOJI[report.tagging] ?? "📋";
  const currentIdx = STATUS_ORDER.indexOf(report.status as ReportStatus);
  const isActive =
    report.status === "in-progress" || report.status === "for-review";

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto w-full">
      {/* Back nav */}
      <Link
        href={backHref}
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
        {backLabel}
      </Link>

      {/* Hero card */}
      <div
        className={`bg-card border rounded-2xl overflow-hidden shadow-lg mb-4 ${isActive ? "border-accent/30 " + s.glow : "border-border/60"}`}
      >
        {isActive && <div className={`h-1 w-full ${s.bar}`} />}
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-3xl shrink-0">
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {report.tagging} · #{report.id}
                  </p>
                  {p && (
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${p.chip}`}
                    >
                      {p.label} Priority
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 flex items-center gap-1.5 ${s.badge}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${s.dot} ${isActive ? "animate-pulse" : ""}`}
                  />
                  {s.label}
                </span>
              </div>
              <h1 className="text-lg font-black tracking-tight leading-snug mb-2">
                {report.title ?? report.description}
              </h1>
              {report.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {report.location}
                </p>
              )}
              {role === "admin" && report.citizenName && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <svg
                    width="10"
                    height="10"
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
                  Filed by {report.citizenName}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Filed {formatDate(report.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Citizen: Status timeline ──────────────────────────────────── */}
      {role === "citizen" && (
        <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Report Progress
          </p>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-0">
              {TIMELINE.map((t) => {
                const tIdx = STATUS_ORDER.indexOf(t.key);
                const done =
                  currentIdx > tIdx ||
                  (report.status === "resolved" && t.key === "resolved");
                const current =
                  currentIdx === tIdx && report.status !== "resolved";
                const future = !done && !current;
                return (
                  <div
                    key={t.key}
                    className="relative flex items-start gap-4 pb-5 last:pb-0"
                  >
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                        done
                          ? "bg-accent border-accent"
                          : current
                            ? "bg-accent/20 border-accent animate-pulse"
                            : "bg-muted border-border"
                      }`}
                    >
                      {done ? (
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : current ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    <div className="pt-1 min-w-0">
                      <p
                        className={`text-sm font-bold ${future ? "text-muted-foreground/40" : "text-foreground"}`}
                      >
                        {t.label}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${future ? "text-muted-foreground/30" : "text-muted-foreground"}`}
                      >
                        {t.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm mb-4">
        <div className="px-5 py-3 border-b border-border/50 bg-muted/30">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Description
          </p>
        </div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {report.description}
          </p>
        </div>
      </div>

      {/* AI Summary */}
      {report.summary && (
        <div className="bg-card border border-violet-500/20 rounded-2xl overflow-hidden shadow-sm mb-4">
          <div className="px-5 py-3 border-b border-violet-500/15 bg-violet-500/5">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400">
              AI Summary
            </p>
          </div>
          <div className="p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.summary}
            </p>
          </div>
        </div>
      )}

      {/* Photo evidence */}
      {report.media && (
        <MediaViewer src={report.media} label="Photo Evidence" />
      )}

      {/* ── Admin: GPS map ────────────────────────────────────────────── */}
      {role === "admin" && report.lat && report.lng && (
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

      {/* Meta grid */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm mb-4">
        <div className="px-5 py-3 border-b border-border/50 bg-muted/30">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Report Details
          </p>
        </div>
        <div className="divide-y divide-border/40">
          {[
            { label: "Filed on", value: formatDateTime(report.created_at) },
            { label: "Last updated", value: formatDateTime(report.updated_at) },
            {
              label: "Assigned to",
              value: report.adminName ?? "Pending assignment",
            },
            { label: "Location", value: report.location },
          ].map((row) => (
            <div
              key={row.label}
              className="px-5 py-3 flex items-start justify-between gap-4"
            >
              <span className="text-xs text-muted-foreground shrink-0">
                {row.label}
              </span>
              <span className="text-xs font-semibold text-right">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin comment */}
      {report.adminComment && (
        <div className="bg-card border border-accent/20 rounded-2xl overflow-hidden shadow-sm mb-4">
          <div className="px-5 py-3 border-b border-accent/15 bg-accent/5">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">
              Admin Update
            </p>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-black shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold">
                    {report.adminName ?? "Barangay Admin"}
                  </p>
                  {report.adminCommentDate && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatDate(
                        new Date(report.adminCommentDate).toISOString(),
                      )}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {report.adminComment}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Citizen: Resolve action ───────────────────────────────────── */}
      {role === "citizen" && report.status === "for-review" && (
        <div className="bg-emerald-500/5 border border-emerald-500/25 rounded-2xl p-5 mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
              Issue fully resolved?
            </p>
            <p className="text-xs text-muted-foreground">
              Confirm to mark this report as resolved.
            </p>
          </div>
          <CloseReportButton reportId={report.id} />
        </div>
      )}

      {/* ── Admin: Update form ────────────────────────────────────────── */}
      {role === "admin" && <AdminUpdateForm report={report} />}

      {/* ── Citizen: Bottom nav ───────────────────────────────────────── */}
      {role === "citizen" && (
        <div className="flex gap-3 pt-2">
          <Link href="/citizen/reports" className="flex-1">
            <button className="w-full h-11 rounded-xl border border-border text-sm font-semibold hover:bg-muted/40 transition-colors cursor-pointer">
              ← All Reports
            </button>
          </Link>
          <Link href="/citizen/dashboard" className="flex-1">
            <button className="w-full h-11 rounded-xl border border-border text-sm font-semibold hover:bg-muted/40 transition-colors cursor-pointer">
              Dashboard
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
