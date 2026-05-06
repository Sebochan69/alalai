import { Skeleton } from "@/components/ui/skeleton";

export default function MyReportsLoading() {
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border/60 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="w-7 h-7 rounded-full" />
              <Skeleton className="h-2.5 w-14" />
            </div>
          ))}
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-xl" />
        ))}
      </div>

      {/* Report cards */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border/60 rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full shrink-0" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
