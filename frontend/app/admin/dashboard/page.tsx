import Link from "next/link";
import { getAdminComplaints } from "@/lib/api";
import { AdminStats, AdminAIBadge } from "@/components/admin-stats";
import type { StatItem } from "@/components/admin-stats";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS: Record<string, { label: string; dot: string; badge: string }> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-400",
    badge: "bg-amber-500/12 text-amber-400 border-amber-500/25",
  },
  "in-progress": {
    label: "In Progress",
    dot: "bg-blue-400",
    badge: "bg-blue-500/12 text-blue-400 border-blue-500/25",
  },
  "for-review": {
    label: "For Review",
    dot: "bg-violet-400",
    badge: "bg-violet-500/12 text-violet-400 border-violet-500/25",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25",
  },
};

const PRIORITY_CHIP: Record<string, string> = {
  high: "text-red-400 bg-red-500/10 border-red-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

function IconTotal() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}
function IconPending() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconProgress() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function IconResolved() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default async function AdminDashboard() {
  const reports = await getAdminComplaints();
  const total = reports.length;
  const pending = reports.filter((r) => r.status === "pending").length;
  const inProgress = reports.filter(
    (r) => r.status === "in-progress" || r.status === "for-review",
  ).length;
  const resolved = reports.filter((r) => r.status === "resolved").length;

  const stats: StatItem[] = [
    {
      label: "Total Assigned",
      value: total,
      sub: "across zones A–C",
      colorClass: "text-foreground",
      circleBg: "bg-violet-600",
      border: "border-violet-500/25 hover:border-violet-500/50",
      glow: "hover:shadow-[0_8px_32px_rgba(139,92,246,0.22)]",
      icon: <IconTotal />,
    },
    {
      label: "Pending",
      value: pending,
      sub: "needs attention",
      colorClass: "text-amber-400",
      circleBg: "bg-amber-500",
      border: "border-amber-500/25 hover:border-amber-500/50",
      glow: "hover:shadow-[0_8px_32px_rgba(245,158,11,0.22)]",
      icon: <IconPending />,
    },
    {
      label: "In Progress",
      value: inProgress,
      sub: "being handled",
      colorClass: "text-blue-400",
      circleBg: "bg-blue-500",
      border: "border-blue-500/25 hover:border-blue-500/50",
      glow: "hover:shadow-[0_8px_32px_rgba(59,130,246,0.22)]",
      icon: <IconProgress />,
    },
    {
      label: "Resolved",
      value: resolved,
      sub: "completed",
      colorClass: "text-emerald-400",
      circleBg: "bg-emerald-500",
      border: "border-emerald-500/25 hover:border-emerald-500/50",
      glow: "hover:shadow-[0_8px_32px_rgba(16,185,129,0.22)]",
      icon: <IconResolved />,
    },
  ];

  const recent = reports.slice(0, 6);

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-1">
            Admin Dashboard
          </p>
          <h1 className="text-2xl font-black tracking-tight">
            Good day, Admin 1 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Managing{" "}
            <span className="text-violet-500 dark:text-violet-400 font-semibold">
              Zones A, B, C
            </span>{" "}
            — May 2026
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/admin/map">
            <button className="h-9 px-3.5 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:bg-muted/60 hover:text-foreground transition-colors flex items-center gap-1.5">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" y1="3" x2="9" y2="18" />
                <line x1="15" y1="6" x2="15" y2="21" />
              </svg>
              Map
            </button>
          </Link>
          <Link href="/admin/monthly-report">
            <button className="h-9 px-3.5 rounded-xl border border-violet-500/30 text-violet-500 dark:text-violet-400 text-sm font-semibold hover:bg-violet-500/8 transition-colors flex items-center gap-1.5">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Monthly
            </button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <AdminStats stats={stats} />

      {/* AI backend badge */}
      <AdminAIBadge />

      {/* Recent reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Recent Reports
            </p>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {recent.length}
            </span>
          </div>
          <Link
            href="/admin/reports"
            className="text-xs text-violet-500 dark:text-violet-400 font-semibold hover:underline flex items-center gap-1"
          >
            View all
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
          </Link>
        </div>

        <div className="space-y-2">
          {recent.map((report) => {
            const s = STATUS[report.status] ?? STATUS["pending"];
            return (
              <Link
                key={report.id}
                href={`/admin/reports/${report.id}`}
                className="block group"
              >
                <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:border-violet-500/30 hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    {/* Left: status dot */}
                    <div className="pt-1 shrink-0">
                      <span className={`w-2 h-2 rounded-full block ${s.dot}`} />
                    </div>
                    {/* Center: info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          #{report.id}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                          {report.tagging}
                        </span>
                        {report.priority && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${PRIORITY_CHIP[report.priority] ?? ""}`}
                          >
                            {report.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold leading-snug group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors truncate">
                        {report.title ?? report.description.slice(0, 65)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-muted-foreground shrink-0"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {report.location}
                        </p>
                      </div>
                    </div>
                    {/* Right: badge + date */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${s.badge} flex items-center gap-1`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(report.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Monthly snapshot */}
      <div className="mt-8">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Monthly Overview — April 2026
        </p>
        <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-border/60 text-center">
            <div className="px-4 py-1">
              <p className="text-2xl font-black text-foreground">8</p>
              <p className="text-[11px] text-muted-foreground mt-1">Total</p>
            </div>
            <div className="px-4 py-1">
              <p className="text-2xl font-black text-emerald-400">6</p>
              <p className="text-[11px] text-muted-foreground mt-1">Resolved</p>
            </div>
            <div className="px-4 py-1">
              <p className="text-2xl font-black text-violet-400">1.8d</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Avg. Resolution
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">75% resolution rate</p>
            <div className="flex-1 mx-4 bg-muted/40 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-emerald-500"
                style={{ width: "75%" }}
              />
            </div>
            <Link
              href="/admin/monthly-report"
              className="text-xs text-violet-500 dark:text-violet-400 font-semibold hover:underline shrink-0"
            >
              Full report →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
