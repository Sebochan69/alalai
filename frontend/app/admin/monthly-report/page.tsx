export default function MonthlyReportPage() {
  const months = [
    { month: "April 2026", total: 8,  resolved: 6,  avgDays: 1.8 },
    { month: "March 2026", total: 12, resolved: 10, avgDays: 2.1 },
    { month: "Feb 2026",   total: 7,  resolved: 7,  avgDays: 1.5 },
  ];
  const categories = [
    { label: "Infrastructure", count: 9,  color: "bg-blue-400",           text: "text-blue-400" },
    { label: "Sanitation",     count: 6,  color: "bg-emerald-400",        text: "text-emerald-400" },
    { label: "Public Safety",  count: 4,  color: "bg-red-400",            text: "text-red-400" },
    { label: "Flooding",       count: 4,  color: "bg-cyan-400",           text: "text-cyan-400" },
    { label: "Other",          count: 4,  color: "bg-muted-foreground",   text: "text-muted-foreground" },
  ];
  const total = categories.reduce((s, c) => s + c.count, 0);

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-7">
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-1">Admin</p>
        <h1 className="text-2xl font-black tracking-tight">Monthly Report</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Zones A, B, C — May 2026</p>
      </div>

      {/* This month highlight */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        {[
          {
            label: "Total Reports", value: "4", color: "text-foreground",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            ),
            bg: "bg-violet-600",
            glow: "hover:shadow-[0_8px_24px_rgba(139,92,246,0.2)]",
            border: "border-violet-500/20",
          },
          {
            label: "Resolved", value: "1", color: "text-emerald-400",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ),
            bg: "bg-emerald-500",
            glow: "hover:shadow-[0_8px_24px_rgba(16,185,129,0.2)]",
            border: "border-emerald-500/20",
          },
          {
            label: "Avg. Resolution", value: "—", color: "text-violet-400",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            ),
            bg: "bg-blue-500",
            glow: "hover:shadow-[0_8px_24px_rgba(59,130,246,0.2)]",
            border: "border-blue-500/20",
          },
        ].map((s) => (
          <div key={s.label} className={`bg-card border rounded-2xl p-5 shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-default ${s.border} ${s.glow}`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                {s.icon}
              </div>
            </div>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm mb-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500 dark:text-violet-400">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Category Breakdown</p>
        </div>
        <div className="space-y-3.5">
          {categories.map((c) => {
            const pct = Math.round((c.count / total) * 100);
            return (
              <div key={c.label} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">{c.label}</span>
                <div className="flex-1 bg-muted/40 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full ${c.color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center gap-1.5 w-10 justify-end shrink-0">
                  <span className={`text-xs font-black ${c.text}`}>{c.count}</span>
                  <span className="text-[9px] text-muted-foreground">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Previous Months</p>
        <div className="space-y-2.5">
          {months.map((m) => {
            const rate = Math.round((m.resolved / m.total) * 100);
            return (
              <div key={m.month} className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <p className="text-sm font-bold">{m.month}</p>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{rate}% resolved</span>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                    <p className="text-base font-black">{m.total}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Resolved</p>
                    <p className="text-base font-black text-emerald-400">{m.resolved}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Avg Days</p>
                    <p className="text-base font-black text-violet-400">{m.avgDays}</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                      <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${rate}%` }} />
                    </div>
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