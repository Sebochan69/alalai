import Link from "next/link";
import { notFound } from "next/navigation";
import { getComplaint } from "@/lib/api";
import { CloseReportButton } from "@/components/forms/close-report-button";
import { MediaViewer } from "@/components/ui/media-viewer";
import type { ReportStatus } from "@/lib/types";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; glow: string; bar: string }
> = {
  pending: {
    label: "Pending",
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    glow: "",
    bar: "bg-amber-400",
  },
  "in-progress": {
    label: "In Progress",
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
    glow: "shadow-blue-500/15",
    bar: "bg-blue-400",
  },
  "for-review": {
    label: "For Review",
    badge:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
    glow: "shadow-violet-500/10",
    bar: "bg-violet-400",
  },
  resolved: {
    label: "Resolved",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    glow: "shadow-emerald-500/15",
    bar: "bg-emerald-500",
  },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  high: {
    label: "High Priority",
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/30",
  },
  medium: {
    label: "Medium Priority",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
  },
  low: {
    label: "Low Priority",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
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

export default async function CitizenReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getComplaint(id);
  if (!report) notFound();

  const s = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.resolved;
  const p = PRIORITY_CONFIG[report.priority ?? "low"];
  const emoji = CATEGORY_EMOJI[report.tagging] ?? "📋";
  const currentIdx = STATUS_ORDER.indexOf(report.status as ReportStatus);
  const isActive =
    report.status === "in-progress" || report.status === "for-review";

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto w-full">
      {/* Back nav */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/citizen/reports"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          My Reports
        </Link>
        <span className="text-muted-foreground/40 text-xs">/</span>
        <span className="text-xs text-muted-foreground font-mono">
          #{report.id}
        </span>
      </div>

      {/* ── Hero card ────────────────────────────────────────────────── */}
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {report.tagging} · #{report.id}
                </p>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${s.badge}`}
                >
                  {s.label}
                </span>
              </div>
              <h1 className="text-lg font-black tracking-tight leading-snug mb-2">
                {report.title ?? report.description}
              </h1>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="opacity-40"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {report.location}
                </span>
                <span
                  className={`flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full border ${p.bg} ${p.color}`}
                >
                  {p.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status timeline ───────────────────────────────────────────── */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Report Progress
        </p>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-0">
            {TIMELINE.map((t, i) => {
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
                  {/* Circle */}
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
                  {/* Content */}
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
                    {current && report.adminCommentDate && (
                      <p className="text-[10px] text-accent font-semibold mt-1">
                        {formatDate(
                          new Date(report.adminCommentDate).toISOString(),
                        )}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Description ───────────────────────────────────────────────── */}
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

      {/* ── AI Summary ────────────────────────────────────────────────── */}
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

      {/* ── Photo evidence ─────────────────────────────────────────── */}
      {report.media && (
        <MediaViewer src={report.media} label="Your Submitted Photo" />
      )}

      {/* ── Meta grid ─────────────────────────────────────────────────── */}
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

      {/* ── Admin comment ─────────────────────────────────────────────── */}
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

      {/* ── Resolve action (for-review only) ────────────────────── */}
      {report.status === "for-review" && (
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

      {/* ── Bottom nav ────────────────────────────────────────────────── */}
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
    </div>
  );
}
