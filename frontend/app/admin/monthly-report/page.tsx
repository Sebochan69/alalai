export default function MonthlyReportPage() {
  const months = [
    { month: "April 2026", total: 8, resolved: 6, avgDays: 1.8 },
    { month: "March 2026", total: 12, resolved: 10, avgDays: 2.1 },
    { month: "Feb 2026", total: 7, resolved: 7, avgDays: 1.5 },
  ];
  const categories = [
    {
      label: "Infrastructure",
      count: 9,
      bar: "bg-blue-500",
      text: "text-blue-400",
      dot: "bg-blue-500",
    },
    {
      label: "Sanitation",
      count: 6,
      bar: "bg-emerald-500",
      text: "text-emerald-400",
      dot: "bg-emerald-500",
    },
    {
      label: "Public Safety",
      count: 4,
      bar: "bg-rose-500",
      text: "text-rose-400",
      dot: "bg-rose-500",
    },
    {
      label: "Flooding",
      count: 4,
      bar: "bg-cyan-500",
      text: "text-cyan-400",
      dot: "bg-cyan-500",
    },
    {
      label: "Other",
      count: 4,
      bar: "bg-slate-500",
      text: "text-muted-foreground",
      dot: "bg-slate-500",
    },
  ];
  const total = categories.reduce((s, c) => s + c.count, 0);
  const currentMonth = "May 2026";

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-1">
          Admin
        </p>
        <h1 className="text-2xl font-black tracking-tight">Monthly Report</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{currentMonth}</p>
      </div>

      {/* ── This month stat cards ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Total */}
        <div className="relative bg-card border border-violet-500/25 rounded-2xl p-5 shadow-sm overflow-hidden hover:shadow-[0_8px_32px_rgba(139,92,246,0.18)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/6 to-transparent pointer-events-none" />
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/30">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-3xl font-black tracking-tight">4</p>
          <p className="text-[11px] text-muted-foreground mt-1 font-medium">
            Total Reports
          </p>
        </div>

        {/* Resolved */}
        <div className="relative bg-card border border-emerald-500/25 rounded-2xl p-5 shadow-sm overflow-hidden hover:shadow-[0_8px_32px_rgba(16,185,129,0.18)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/6 to-transparent pointer-events-none" />
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p className="text-3xl font-black tracking-tight text-emerald-400">
            1
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 font-medium">
            Resolved
          </p>
        </div>

        {/* Avg Resolution */}
        <div className="relative bg-card border border-blue-500/25 rounded-2xl p-5 shadow-sm overflow-hidden hover:shadow-[0_8px_32px_rgba(59,130,246,0.18)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/6 to-transparent pointer-events-none" />
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <p className="text-3xl font-black tracking-tight text-blue-400">—</p>
          <p className="text-[11px] text-muted-foreground mt-1 font-medium">
            Avg. Resolution
          </p>
        </div>
      </div>

      {/* ── Category breakdown ── */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm mb-5">
        <div className="px-5 py-3.5 border-b border-border/50 bg-muted/30 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
            <svg
              width="12"
              height="12"
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
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Category Breakdown
          </p>
        </div>
        <div className="p-5 space-y-4">
          {categories.map((c) => {
            const pct = Math.round((c.count / total) * 100);
            return (
              <div key={c.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`}
                    />
                    <span className="text-xs font-semibold">{c.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black ${c.text}`}>
                      {c.count}
                    </span>
                    <span className="text-[10px] text-muted-foreground w-7 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${c.bar} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── History ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Previous Months
        </p>
        <div className="space-y-3">
          {months.map((m) => {
            const rate = Math.round((m.resolved / m.total) * 100);
            const rateColor =
              rate >= 80
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : rate >= 50
                  ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                  : "text-rose-400 bg-rose-500/10 border-rose-500/20";
            const barColor =
              rate >= 80
                ? "bg-emerald-500"
                : rate >= 50
                  ? "bg-amber-500"
                  : "bg-rose-500";
            return (
              <div
                key={m.month}
                className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-border hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="px-5 pt-4 pb-3">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <p className="text-sm font-black tracking-tight">
                      {m.month}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${rateColor}`}
                    >
                      {rate}% resolved
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-muted/30 rounded-xl px-3 py-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Total
                      </p>
                      <p className="text-lg font-black">{m.total}</p>
                    </div>
                    <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-xl px-3 py-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Resolved
                      </p>
                      <p className="text-lg font-black text-emerald-400">
                        {m.resolved}
                      </p>
                    </div>
                    <div className="bg-violet-500/8 border border-violet-500/15 rounded-xl px-3 py-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Avg Days
                      </p>
                      <p className="text-lg font-black text-violet-400">
                        {m.avgDays}
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${barColor} transition-all duration-500`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
