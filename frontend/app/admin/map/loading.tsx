import { Skeleton } from "@/components/ui/skeleton";

export default function AdminMapLoading() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-5 md:px-8 py-5 border-b border-border bg-card shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-3 w-14 mb-3" />
            <Skeleton className="h-8 w-48 mb-3" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-36 rounded-full" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Skeleton className="h-8 w-40 rounded-full" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-28 rounded-full" />
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 border-r border-border bg-card flex-col hidden md:flex overflow-hidden shrink-0">
          <div className="flex-1 p-3 space-y-2">
            <div className="flex items-center justify-between px-2 pt-1 pb-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-3 border border-border bg-muted/40 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-3 w-5" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
                <div className="flex items-start gap-2">
                  <Skeleton className="w-2 h-2 rounded-full mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-4/5 mb-2" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden bg-slate-200 dark:bg-[#1a1f2e]">
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="admin-route-map-loading"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  width="60"
                  height="60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-slate-300 dark:text-white/8"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#admin-route-map-loading)" />
          </svg>
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0"
              y1="42%"
              x2="100%"
              y2="38%"
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-300 dark:text-white/10"
            />
            <line
              x1="0"
              y1="65%"
              x2="100%"
              y2="60%"
              stroke="currentColor"
              strokeWidth="5"
              className="text-slate-300 dark:text-white/8"
            />
            <line
              x1="30%"
              y1="0"
              x2="28%"
              y2="100%"
              stroke="currentColor"
              strokeWidth="12"
              className="text-slate-300 dark:text-white/10"
            />
            <line
              x1="62%"
              y1="0"
              x2="64%"
              y2="100%"
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-300 dark:text-white/8"
            />
          </svg>
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 dark:via-white/4 to-transparent animate-[shimmer_1.8s_ease-in-out_infinite] bg-size-[200%_100%]" />
          {[
            { top: "38%", left: "32%", color: "bg-amber-400" },
            { top: "55%", left: "58%", color: "bg-violet-400" },
            { top: "62%", left: "40%", color: "bg-blue-400" },
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 rounded-full animate-pulse opacity-60 ${pos.color}`}
              style={{ top: pos.top, left: pos.left }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
