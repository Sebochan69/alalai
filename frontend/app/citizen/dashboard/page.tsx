import Link from "next/link";
import { getMyComplaints } from "@/lib/api";

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS: Record<string, { label: string; dot: string; badge: string }> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-400",
    badge:
      "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  },
  "under-review": {
    label: "Under Review",
    dot: "bg-violet-400",
    badge:
      "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800",
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-blue-400",
    badge:
      "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-emerald-400",
    badge:
      "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  },
  closed: {
    label: "Closed",
    dot: "bg-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
  },
};

const PRIORITY_COLOR: Record<string, string> = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-emerald-500",
};

const CATEGORY_ICON: Record<string, string> = {
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

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function today() {
  return new Date().toLocaleDateString("en-PH", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconClock() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CitizenDashboard() {
  const reports = await getMyComplaints();

  const total = reports.length;
  const pending = reports.filter((r) => r.status === "pending").length;
  const underReview = reports.filter((r) => r.status === "under-review").length;
  const inProgress = reports.filter((r) => r.status === "in-progress").length;
  const resolved = reports.filter(
    (r) => r.status === "resolved" || r.status === "closed",
  ).length;

  const statCards = [
    {
      label: "PENDING",
      value: pending,
      sub: "awaiting action",
      circle: "bg-amber-500",
      icon: <IconClock />,
      border: "border-amber-500/25 hover:border-amber-500/60",
      glow: "hover:shadow-[0_8px_32px_rgba(245,158,11,0.28)]",
      num: "group-hover:text-amber-400",
    },
    {
      label: "UNDER REVIEW",
      value: underReview,
      sub: "being assessed",
      circle: "bg-violet-600",
      icon: <IconSearch />,
      border: "border-violet-500/25 hover:border-violet-500/60",
      glow: "hover:shadow-[0_8px_32px_rgba(139,92,246,0.28)]",
      num: "group-hover:text-violet-400",
    },
    {
      label: "IN PROGRESS",
      value: inProgress,
      sub: "being handled",
      circle: "bg-blue-500",
      icon: <IconRefresh />,
      border: "border-blue-500/25 hover:border-blue-500/60",
      glow: "hover:shadow-[0_8px_32px_rgba(59,130,246,0.28)]",
      num: "group-hover:text-blue-400",
    },
    {
      label: "RESOLVED",
      value: resolved,
      sub: "completed",
      circle: "bg-emerald-500",
      icon: <IconCheck />,
      border: "border-emerald-500/25 hover:border-emerald-500/60",
      glow: "hover:shadow-[0_8px_32px_rgba(16,185,129,0.28)]",
      num: "group-hover:text-emerald-400",
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Fixed header + stat cards ────────────────────────────────── */}
      <div className="shrink-0 px-6 md:px-8 pt-6 pb-4">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Complaint Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time status tracking for your filed concerns.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-muted-foreground hidden lg:block">
              {today()}
            </span>
            <Link href="/citizen/file-concern">
              <button className="flex items-center gap-1.5 bg-accent text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-accent/90 transition-colors shadow-sm">
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
                File a Concern
              </button>
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((s) => (
            <div
              key={s.label}
              className={`group bg-card border rounded-2xl p-4 shadow-md cursor-default select-none transition-all duration-200 ease-out hover:scale-[1.03] hover:-translate-y-1 ${s.border} ${s.glow}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </p>
                  <p
                    className={`text-4xl font-black mt-1 leading-none transition-colors duration-200 text-foreground ${s.num}`}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                </div>
                <div
                  className={`w-10 h-10 rounded-full ${s.circle} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110`}
                >
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Reports section — fills remaining height, list scrolls ────── */}
      <div className="flex-1 flex flex-col overflow-hidden px-6 md:px-8 pb-4">
        {/* Section label */}
        <div className="shrink-0 mb-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent mb-2">
            My Reports
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "All", count: total, active: true, cls: "" },
              {
                label: "Pending",
                count: pending,
                active: false,
                cls: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
              },
              {
                label: "Under Review",
                count: underReview,
                active: false,
                cls: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
              },
              {
                label: "In Progress",
                count: inProgress,
                active: false,
                cls: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
              },
              {
                label: "Resolved",
                count: resolved,
                active: false,
                cls: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
              },
            ].map((f) => (
              <div
                key={f.label}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-default select-none ${f.active ? "bg-accent text-white border-accent" : "bg-card border-border text-muted-foreground"}`}
              >
                {f.label}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${f.active ? "bg-white/25 text-white" : f.cls}`}
                >
                  {f.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* Empty state */}
          {reports.length === 0 && (
            <div className="bg-card border border-border rounded-2xl p-14 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-muted-foreground"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="font-black text-base mb-1">No reports yet</p>
              <p className="text-muted-foreground text-sm mb-5">
                Be the first to raise a concern in your barangay.
              </p>
              <Link href="/citizen/file-concern">
                <button className="bg-accent text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-accent/90 transition-colors">
                  File a Concern
                </button>
              </Link>
            </div>
          )}

          {/* Report cards */}
          {reports.map((report) => {
            const s = STATUS[report.status] ?? STATUS.closed;
            const catIcon = CATEGORY_ICON[report.tagging] ?? "📋";
            const priorityCls = PRIORITY_COLOR[report.priority ?? "low"];
            return (
              <div
                key={report.id}
                className="bg-card border border-border/60 rounded-2xl shadow-md hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 hover:border-accent/30 transition-all duration-200 ease-out overflow-hidden group"
              >
                <div className="p-4 flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-xl shrink-0 mt-0.5">
                    {catIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                          {report.tagging} &nbsp;·&nbsp; #{report.id}
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
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1 truncate">
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
                    {report.adminComment && (
                      <div className="mt-2 bg-muted/50 border border-border/60 rounded-xl px-3 py-2 flex items-start gap-2">
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
                <div className="border-t border-border/50 bg-muted/20 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      <span className="text-muted-foreground">
                        {formatDate(report.created_at)}
                      </span>
                    </span>
                    <span
                      className={`text-xs font-bold capitalize ${priorityCls}`}
                    >
                      {report.priority ?? "low"} priority
                    </span>
                  </div>
                  <Link
                    href={`/citizen/reports/${report.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-accent hover:text-accent/80 transition-colors"
                  >
                    View details
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
