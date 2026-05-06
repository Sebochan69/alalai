export default function ManageAdminsPage() {
  const admins = [
    { id: "A1", name: "Admin 1", email: "admin1@alalai.gov.ph", active: 3 },
    { id: "A2", name: "Admin 2", email: "admin2@alalai.gov.ph", active: 1 },
    { id: "A3", name: "Admin 3", email: "admin3@alalai.gov.ph", active: 0 },
  ];
  const total = admins.length;
  const totalActive = admins.reduce((s, a) => s + a.active, 0);

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-7">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-1">
            Admin
          </p>
          <h1 className="text-2xl font-black tracking-tight">Manage Admins</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Barangay admin accounts
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 mb-7">
        {[
          {
            label: "Total Admins",
            value: total,
            color: "text-foreground",
            bg: "bg-violet-500/10 border-violet-500/20",
          },
          {
            label: "Active Reports",
            value: totalActive,
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-card border rounded-2xl p-4 text-center shadow-sm ${s.bg}`}
          >
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Admin cards */}
      <div className="space-y-3">
        {admins.map((a) => (
          <div
            key={a.id}
            className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-black">
                  {a.id}
                </div>
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm">{a.name}</p>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
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
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {a.email}
                  </p>
                </div>
              </div>
              {/* Right: active reports */}
              <div className="hidden sm:flex items-center gap-5 shrink-0">
                <div className="text-right min-w-10">
                  <p className="text-[10px] text-muted-foreground">Active</p>
                  <p
                    className={`text-lg font-black mt-0.5 ${a.active > 0 ? "text-amber-400" : "text-muted-foreground"}`}
                  >
                    {a.active}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add admin CTA */}
      <button className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-4 text-sm text-muted-foreground hover:border-violet-500/30 hover:text-violet-500 dark:hover:text-violet-400 transition-colors group">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:scale-110 transition-transform"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        Add new admin — powered by FastAPI backend
      </button>
    </div>
  );
}
