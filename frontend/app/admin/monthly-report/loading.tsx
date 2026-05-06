import { Skeleton } from "@/components/ui/skeleton";

export default function MonthlyReportLoading() {
  return (
    <div className="min-h-full bg-background">
      {/* Hero banner */}
      <div className="border-b border-border/50 px-6 md:px-10 pt-8 pb-7 max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36 rounded-full" />
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-11 w-40 rounded-2xl" />
        </div>
      </div>

      <div className="px-6 md:px-10 py-7 max-w-6xl mx-auto space-y-6">
        {/* Stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border/60 rounded-2xl p-5 space-y-3"
            >
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>

        {/* Completion rate bar */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-12 w-32" />
            </div>
            <Skeleton className="w-16 h-16 rounded-full shrink-0" />
          </div>
          <Skeleton className="h-4 w-full rounded-full" />
          <div className="flex gap-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        {/* Two-column */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Category breakdown */}
          <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
              <Skeleton className="w-7 h-7 rounded-xl shrink-0" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="p-5 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-2 h-2 rounded-full shrink-0" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-8 rounded-md" />
                      <Skeleton className="h-3 w-6" />
                    </div>
                  </div>
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Forecast + Actions */}
          <div className="flex flex-col gap-4">
            {/* Forecast */}
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-7 h-7 rounded-xl shrink-0" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-20 rounded-full ml-auto" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>

            {/* Actions */}
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden flex-1">
              <div className="px-5 py-4 border-b border-border/50 flex items-center gap-2">
                <Skeleton className="w-7 h-7 rounded-xl shrink-0" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-4 w-12 rounded-full ml-auto" />
              </div>
              <div className="p-4 space-y-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/20"
                  >
                    <Skeleton className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
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
