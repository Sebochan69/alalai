import Link from "next/link";
import { getMyComplaints } from "@/lib/api";
import { getCategoryEmoji } from "@/lib/utils";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; badge: string; bar: string }
> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-400",
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    bar: "bg-amber-400",
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-blue-400",
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
    bar: "bg-blue-400",
  },
  "for-review": {
    label: "For Review",
    dot: "bg-violet-400",
    badge:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
    bar: "bg-violet-400",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-emerald-400",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    bar: "bg-emerald-400",
  },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  high: { label: "High", color: "text-red-500", bg: "bg-red-500" },
  medium: { label: "Medium", color: "text-amber-500", bg: "bg-amber-500" },
  low: { label: "Low", color: "text-emerald-500", bg: "bg-emerald-500" },
};

const STATUS_ORDER = ["pending", "in-progress", "for-review", "resolved"];

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(iso: string) {
  const date = new Date(iso);
  if (!iso || isNaN(date.getTime())) return "Date unavailable";
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Status progress bar ──────────────────────────────────────────────────────

function StatusProgress({ status }: { status: string }) {
  const steps = [
    { key: "pending", label: "Filed" },
    { key: "in-progress", label: "Action" },
    { key: "for-review", label: "Review" },
    { key: "resolved", label: "Resolved" },
  ];
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((s, i) => {
        const done = STATUS_ORDER.indexOf(status) > STATUS_ORDER.indexOf(s.key);
        const current =
          s.key === status || (status === "resolved" && s.key === "resolved");
        return (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
                  done || current
                    ? `border-accent ${done ? "bg-accent" : "bg-accent animate-pulse"}`
                    : "border-border bg-background"
                }`}
              />
              <span
                className={`text-[9px] font-bold ${done || current ? "text-accent" : "text-muted-foreground/40"}`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mb-3 rounded-full transition-all ${done ? "bg-accent" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MyReportsPage() {
  const reports = await getMyComplaints();
  const sorted = [...reports].sort(
    (a, b) => {
      const bTime = new Date(b.created_at).getTime();
      const aTime = new Date(a.created_at).getTime();
      return (isNaN(bTime) ? 0 : bTime) - (isNaN(aTime) ? 0 : aTime);
    },
  );

  const counts = {
    all: sorted.length,
    pending: sorted.filter((r) => r.status === "pending").length,
    "for-review": sorted.filter((r) => r.status === "for-review").length,
    "in-progress": sorted.filter((r) => r.status === "in-progress").length,
    resolved: sorted.filter((r) => r.status === "resolved").length,
  };

  const tabs = [
    { key: "all", label: "All", count: counts.all },
    { key: "pending", label: "Pending", count: counts.pending },
    {
      key: "for-review",
      label: "For Review",
      count: counts["for-review"],
    },
    { key: "in-progress", label: "In Progress", count: counts["in-progress"] },
    { key: "resolved", label: "Resolved", count: counts.resolved },
  ];

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent mb-1">
            My Reports
          </p>
          <h1 className="text-2xl font-black tracking-tight">Report History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track all your filed concerns and their progress.
          </p>
        </div>
        <Link href="/citizen/file-concern" className="shrink-0">
          <button className="flex h-9 sm:h-10 items-center gap-1.5 bg-accent text-white text-xs sm:text-sm font-bold px-3 sm:px-4 rounded-xl hover:bg-accent/90 transition-all shadow-sm hover:shadow-md hover:shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer whitespace-nowrap">
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="sm:hidden">New</span>
            <span className="hidden sm:inline">New Report</span>
          </button>
        </Link>
      </div>

      {/* ── Stats strip ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { label: "Total Filed", value: counts.all, color: "text-foreground" },
          { label: "Pending", value: counts.pending, color: "text-amber-500" },
          {
            label: "In Progress",
            value: counts["in-progress"],
            color: "text-blue-500",
          },
          {
            label: "Resolved",
            value: counts.resolved,
            color: "text-emerald-500",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-2xl p-3 text-center shadow-sm"
          >
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tab chips ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        {tabs.map((t, i) => (
          <div
            key={t.key}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-default select-none transition-all ${
              i === 0
                ? "bg-accent text-white border-accent"
                : "bg-card border-border text-muted-foreground"
            }`}
          >
            {t.label}
            <span
              className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                i === 0
                  ? "bg-white/25 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {t.count}
            </span>
          </div>
        ))}
      </div>

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {sorted.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-3xl">
            📋
          </div>
          <p className="font-black text-lg mb-1">No reports yet</p>
          <p className="text-muted-foreground text-sm mb-6">
            Your filed concerns will appear here.
          </p>
          <Link href="/citizen/file-concern">
            <button className="bg-accent text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-accent/90 transition-colors cursor-pointer">
              File a Concern
            </button>
          </Link>
        </div>
      )}

      {/* ── Report cards ──────────────────────────────────────────────── */}
      <div className="space-y-4">
        {sorted.map((report) => {
          const s = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.pending;
          const p =
            PRIORITY_CONFIG[report.priority ?? "medium"] ??
            PRIORITY_CONFIG.medium;
          const emoji = getCategoryEmoji(report.tagging);
          const isActive =
            report.status === "in-progress" || report.status === "for-review";

          return (
            <Link
              key={report.id}
              href={`/citizen/reports/${report.id}`}
              className="block"
            >
              <div
                className={`group bg-card border rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 hover:border-accent/30 transition-all duration-200 overflow-hidden ${
                  isActive ? "border-accent/20" : "border-border/60"
                }`}
              >
                {/* Active indicator bar */}
                {isActive && <div className={`h-0.5 w-full ${s.bar}`} />}

                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Category icon */}
                    <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-xl shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200">
                      {emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                            {report.tagging} · #{report.id}
                          </p>
                          <p className="font-black text-sm leading-snug group-hover:text-accent transition-colors">
                            {report.title ?? report.description}
                          </p>
                        </div>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${s.badge}`}
                        >
                          {s.label}
                        </span>
                      </div>

                      {/* Location */}
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate mb-3">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="shrink-0 opacity-40"
                        >
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        {report.location}
                      </p>

                      {/* Progress tracker */}
                      <StatusProgress status={report.status} />

                      {/* Admin comment */}
                      {report.adminComment && (
                        <div className="mt-3 bg-muted/50 border border-border/60 rounded-xl px-3 py-2 flex items-start gap-2">
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-muted-foreground shrink-0 mt-0.5"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {report.adminComment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border/40 bg-muted/20 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {formatDate(report.created_at)}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(report.created_at)}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs font-bold ${p.color}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${p.bg}`} />
                      {p.label}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-accent group-hover:gap-2 transition-all">
                    View
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
