import Link from "next/link";
import { getAdminComplaints } from "@/lib/api";

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

export default async function AdminReportsPage() {
  const reports = await getAdminComplaints();
  const total = reports.length;
  const pending = reports.filter((r) => r.status === "pending").length;
  const inProgress = reports.filter(
    (r) => r.status === "in-progress" || r.status === "for-review",
  ).length;
  const resolved = reports.filter((r) => r.status === "resolved").length;

  const miniStats = [
    {
      label: "Total",
      value: total,
      color: "text-foreground",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      label: "Pending",
      value: pending,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "In Progress",
      value: inProgress,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      ),
    },
    {
      label: "Resolved",
      value: resolved,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-7">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-1">
            Admin
          </p>
          <h1 className="text-2xl font-black tracking-tight">
            Assigned Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All assigned reports
          </p>
        </div>
        <Link href="/admin/map">
          <button className="h-9 px-3.5 rounded-xl border border-border text-muted-foreground text-sm font-semibold hover:bg-muted/60 hover:text-foreground transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer">
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
            View Map
          </button>
        </Link>
      </div>

      {/* Mini stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {miniStats.map((s) => (
          <div
            key={s.label}
            className={`bg-card border rounded-2xl p-3.5 shadow-sm flex items-center gap-3 ${s.border}`}
          >
            <div
              className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center shrink-0 ${s.color}`}
            >
              {s.icon}
            </div>
            <div>
              <p className={`text-xl font-black leading-none ${s.color}`}>
                {s.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Reports list */}
      <div className="space-y-2">
        {reports.map((report) => {
          const s = STATUS[report.status] ?? STATUS["pending"];
          return (
            <Link
              key={report.id}
              href={`/admin/reports/${report.id}`}
              className="block group"
            >
              <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-violet-500/30 hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="pt-1 shrink-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full block ${s.dot}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        #{report.id}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 border border-border px-2 py-0.5 rounded-full">
                        {report.tagging}
                      </span>
                      {report.priority && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${PRIORITY_CHIP[report.priority] ?? ""}`}
                        >
                          {report.priority}
                        </span>
                      )}
                      {report.lat && report.lng && (
                        <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          GPS
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold leading-snug group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">
                      {report.title ?? report.description.slice(0, 70)}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <div className="flex items-center gap-1">
                        <svg
                          width="10"
                          height="10"
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
                        <span className="text-[11px] text-muted-foreground">
                          {report.location}
                        </span>
                      </div>
                      {report.citizenName && (
                        <div className="flex items-center gap-1">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-muted-foreground"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          <span className="text-[11px] text-muted-foreground">
                            {report.citizenName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
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
  );
}
