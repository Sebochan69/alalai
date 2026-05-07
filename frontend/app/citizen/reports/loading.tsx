import { Skeleton } from "@/components/ui/skeleton";

export default function MyReportsLoading() {
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto w-full space-y-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 min-w-0 flex-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-8 w-44 sm:w-48" />
          <Skeleton className="h-4 w-full max-w-64" />
        </div>
        <Skeleton className="h-9 w-16 sm:h-10 sm:w-32 rounded-xl shrink-0" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-2xl p-3 text-center"
          >
            <Skeleton className="h-8 w-8 mx-auto rounded mb-1.5" />
            <Skeleton className="h-3 w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Tab chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {["w-20", "w-24", "w-[88px]", "w-24", "w-20"].map((widthClass, i) => (
          <Skeleton
            key={i}
            className={`h-8 rounded-full ${widthClass}`}
          />
        ))}
      </div>

      {/* Report cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border/60 rounded-2xl overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Category icon circle */}
                <Skeleton className="w-11 h-11 rounded-full shrink-0 mt-0.5" />

                <div className="flex-1 min-w-0 space-y-2">
                  {/* Top row: tag + badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <Skeleton className="h-2.5 w-40" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full shrink-0" />
                  </div>

                  {/* Location */}
                  <Skeleton className="h-3 w-1/2" />

                  {/* Progress tracker dots */}
                  <div className="flex items-center gap-1 pt-1">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-1">
                        <Skeleton className="w-3 h-3 rounded-full" />
                        {j < 3 && <Skeleton className="h-0.5 w-12" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border/40 bg-muted/20 px-4 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-10" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
