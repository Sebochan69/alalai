import Link from "next/link";
import { getMonthlyReport } from "@/lib/api";

const CATEGORY_COLORS = [
  {
    bar: "bg-violet-500",
    dot: "bg-violet-500",
    text: "text-violet-400",
    light: "bg-violet-500/10 border-violet-500/20",
  },
  {
    bar: "bg-blue-500",
    dot: "bg-blue-500",
    text: "text-blue-400",
    light: "bg-blue-500/10 border-blue-500/20",
  },
  {
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    text: "text-emerald-400",
    light: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    text: "text-amber-400",
    light: "bg-amber-500/10 border-amber-500/20",
  },
  {
    bar: "bg-rose-500",
    dot: "bg-rose-500",
    text: "text-rose-400",
    light: "bg-rose-500/10 border-rose-500/20",
  },
  {
    bar: "bg-cyan-500",
    dot: "bg-cyan-500",
    text: "text-cyan-400",
    light: "bg-cyan-500/10 border-cyan-500/20",
  },
  {
    bar: "bg-pink-500",
    dot: "bg-pink-500",
    text: "text-pink-400",
    light: "bg-pink-500/10 border-pink-500/20",
  },
  {
    bar: "bg-orange-500",
    dot: "bg-orange-500",
    text: "text-orange-400",
    light: "bg-orange-500/10 border-orange-500/20",
  },
  {
    bar: "bg-teal-500",
    dot: "bg-teal-500",
    text: "text-teal-400",
    light: "bg-teal-500/10 border-teal-500/20",
  },
  {
    bar: "bg-slate-500",
    dot: "bg-slate-500",
    text: "text-muted-foreground",
    light: "bg-slate-500/10 border-slate-500/20",
  },
];

function formatMonth(raw: string) {
  // handles "2026-05" and "2026-05-01T00:00:00Z"
  const d = new Date(raw.length === 7 ? raw + "-01" : raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function MonthlyReportPage() {
  let report: Awaited<ReturnType<typeof getMonthlyReport>> = null;
  let loadError: string | null = null;

  try {
    report = await getMonthlyReport();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load the monthly report.";
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const isAuthError =
    loadError?.toLowerCase().includes("invalid token") ||
    loadError?.toLowerCase().includes("unauthorized") ||
    loadError?.toLowerCase().includes("forbidden");

  if (!report) {
    return (
      <div className="min-h-full bg-background">
        <div className="relative overflow-hidden border-b border-border/50">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
          <div className="absolute -top-10 right-10 w-56 h-56 rounded-full bg-accent/8 blur-3xl pointer-events-none" />
          <div className="px-6 md:px-10 pt-8 pb-7 max-w-6xl mx-auto">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">
                    AI-Powered Analytics
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  Monthly Report
                </h1>
                <p className="text-base text-muted-foreground mt-1 font-medium">
                  {formatMonth(currentMonth)}
                </p>
              </div>
              <div className="flex items-center gap-2.5 bg-card border border-amber-500/30 rounded-2xl px-4 py-3 shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-sm font-black text-amber-500">
                  {isAuthError ? "Sign In Needed" : "Not Generated Yet"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-10 py-10 max-w-6xl mx-auto">
          <div className="bg-card border border-border/60 rounded-2xl p-8 md:p-10 shadow-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-5">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-violet-500"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <p className="text-xl font-black tracking-tight mb-2">
              {isAuthError ? "Your session expired" : "No monthly report yet"}
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {isAuthError
                ? "Please sign in again as an admin to load the monthly analytics."
                : `The backend does not have analytics for ${formatMonth(
                    currentMonth,
                  )} yet. Once the monthly report is generated, the forecast, completion rate, and suggested actions will appear here.`}
            </p>
            {isAuthError && (
              <Link href="/login?role=admin">
                <button className="mt-6 h-11 px-5 rounded-xl bg-violet-600 text-white text-sm font-black hover:bg-violet-600/90 transition-colors shadow-sm">
                  Sign in again
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Clamp to valid range in case BE sends bad data
  const rate = Math.min(100, Math.max(0, report.overall_completion_rate));

  const resolved = Math.round((rate / 100) * report.overall_complaint_count);
  const unresolved = report.overall_complaint_count - resolved;

  const rateColor =
    rate >= 80
      ? "text-emerald-400"
      : rate >= 50
        ? "text-amber-400"
        : "text-rose-400";

  const rateBarColor =
    rate >= 80 ? "bg-emerald-500" : rate >= 50 ? "bg-amber-500" : "bg-rose-500";

  const rateBorderColor =
    rate >= 80
      ? "rgba(16,185,129,0.3)"
      : rate >= 50
        ? "rgba(245,158,11,0.3)"
        : "rgba(244,63,94,0.3)";

  const rateStrokeClass =
    rate >= 80
      ? "stroke-emerald-500"
      : rate >= 50
        ? "stroke-amber-500"
        : "stroke-rose-500";

  const categoryEntries = Object.entries(report.category_breakdown).sort(
    (a, b) => b[1] - a[1],
  );
  const categoryTotal = categoryEntries.reduce((s, [, v]) => s + v, 0);
  const topCategory = categoryEntries[0];

  return (
    <div className="min-h-full bg-background">
      {/* ── Hero banner ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-10 right-10 w-56 h-56 rounded-full bg-accent/8 blur-3xl pointer-events-none" />
        <div className="px-6 md:px-10 pt-8 pb-7 max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">
                  AI-Powered Analytics
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Monthly Report
              </h1>
              <p className="text-base text-muted-foreground mt-1 font-medium">
                {formatMonth(report.month)}
              </p>
            </div>
            {/* Status verdict chip */}
            <div
              className="flex items-center gap-2.5 bg-card border rounded-2xl px-4 py-3 shadow-lg"
              style={{ borderColor: rateBorderColor }}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${rateBarColor} animate-pulse`}
              />
              <span className={`text-sm font-black ${rateColor}`}>
                {rate >= 80
                  ? "On Track"
                  : rate >= 50
                    ? "Needs Attention"
                    : "Critical — Low Completion"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="px-6 md:px-10 py-7 max-w-6xl mx-auto space-y-6">
        {/* ── Stat row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative bg-card border border-violet-500/20 rounded-2xl p-5 shadow-sm overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(139,92,246,0.2)] transition-all duration-200">
            <div className="absolute inset-0 bg-linear-to-br from-violet-500/6 to-transparent pointer-events-none" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Total Filed
            </p>
            <p className="text-4xl font-black tracking-tight text-violet-400">
              {report.overall_complaint_count}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              complaints this month
            </p>
          </div>
          <div className="relative bg-card border border-emerald-500/20 rounded-2xl p-5 shadow-sm overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(16,185,129,0.2)] transition-all duration-200">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/6 to-transparent pointer-events-none" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Resolved
            </p>
            <p className="text-4xl font-black tracking-tight text-emerald-400">
              {resolved}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              fully closed
            </p>
          </div>
          <div className="relative bg-card border border-rose-500/20 rounded-2xl p-5 shadow-sm overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(244,63,94,0.2)] transition-all duration-200">
            <div className="absolute inset-0 bg-linear-to-br from-rose-500/6 to-transparent pointer-events-none" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Unresolved
            </p>
            <p className="text-4xl font-black tracking-tight text-rose-400">
              {unresolved}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">still open</p>
          </div>
          <div className="relative bg-card border border-blue-500/20 rounded-2xl p-5 shadow-sm overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(59,130,246,0.2)] transition-all duration-200">
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/6 to-transparent pointer-events-none" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Avg. Resolution
            </p>
            <p className="text-4xl font-black tracking-tight text-blue-400">
              {report.avg_solution_days}
              <span className="text-lg font-bold ml-0.5">d</span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              per complaint
            </p>
          </div>
        </div>

        {/* ── Completion rate hero bar ──────────────────────────────────── */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Overall Completion Rate
              </p>
              <div className="flex items-baseline gap-3">
                <span
                  className={`text-5xl font-black tracking-tight ${rateColor}`}
                >
                  {rate}%
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  {resolved} of {report.overall_complaint_count} resolved
                </span>
              </div>
            </div>
            {/* SVG donut ring */}
            <div className="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-muted/40"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={`${rate} ${100 - rate}`}
                  className={rateStrokeClass}
                />
              </svg>
              <span
                className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${rateColor}`}
              >
                {rate}%
              </span>
            </div>
          </div>
          {/* Segmented bar */}
          <div className="h-4 bg-muted/30 rounded-full overflow-hidden flex">
            <div
              className={`h-4 ${rateBarColor} transition-all duration-700 ${report.overall_completion_rate < 100 ? "rounded-l-full" : "rounded-full"}`}
              style={{ width: `${rate}%` }}
            />
            {unresolved > 0 && (
              <div
                className="h-4 bg-rose-500/30 transition-all duration-700 rounded-r-full"
                style={{ width: `${100 - rate}%` }}
              />
            )}
          </div>
          <div className="flex items-center gap-5 mt-3">
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${rateBarColor}`} />
              <span className="text-[11px] text-muted-foreground">
                Resolved ({resolved})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
              <span className="text-[11px] text-muted-foreground">
                Unresolved ({unresolved})
              </span>
            </div>
          </div>
        </div>

        {/* ── Two-column section ────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Category breakdown */}
          <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-violet-500"
                  >
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  By Category
                </p>
              </div>
              {topCategory && (
                <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                  Top: {topCategory[0]}
                </span>
              )}
            </div>
            <div className="p-5 space-y-3.5">
              {categoryEntries.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No category data available.
                </p>
              )}
              {categoryEntries.map(([label, count], i) => {
                const pct =
                  categoryTotal > 0
                    ? Math.round((count / categoryTotal) * 100)
                    : 0;
                const clr = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${clr.dot}`}
                        />
                        <span className="text-xs font-semibold">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${clr.light} ${clr.text}`}
                        >
                          {count}
                        </span>
                        <span className="text-[10px] text-muted-foreground w-6 text-right tabular-nums">
                          {pct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${clr.bar} transition-all duration-700`}
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Forecast + Suggested Actions */}
          <div className="flex flex-col gap-4">
            {/* Forecast */}
            <div className="relative bg-card border border-violet-500/20 rounded-2xl p-5 shadow-sm overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-violet-500/5 to-transparent pointer-events-none" />
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-violet-500/8 blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-violet-400"
                    >
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400">
                    AI Forecast
                  </p>
                  <span className="ml-auto text-[9px] font-bold bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">
                    AI-Generated
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {report.forecast ||
                    "No AI forecast available for this period."}
                </p>
              </div>
            </div>

            {/* Suggested Actions */}
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm flex-1">
              <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-emerald-500"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Suggested Actions
                </p>
                <span className="ml-auto text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {report.suggest_actions.length} items
                </span>
              </div>
              <div className="p-4 space-y-2.5">
                {report.suggest_actions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No suggested actions for this month.
                  </p>
                )}
                {report.suggest_actions.map((action, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-emerald-500/30">
                      <span className="text-[9px] font-black text-white">
                        {i + 1}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
