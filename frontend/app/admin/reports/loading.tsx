import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReportsLoading() {
  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-7">
        <div>
          <Skeleton className="h-3 w-14 mb-3" />
          <Skeleton className="h-8 w-56 mb-3" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border/60 rounded-2xl p-3.5 shadow-sm flex items-center gap-3"
          >
            <Skeleton className="w-8 h-8 rounded-xl shrink-0" />
            <div>
              <Skeleton className="h-6 w-8 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <Skeleton className="h-5 w-10 rounded" />
                  <Skeleton className="h-5 w-28 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                  {i === 1 && <Skeleton className="h-5 w-14 rounded-full" />}
                </div>
                <Skeleton className="h-5 w-80 max-w-full mb-3" />
                <div className="flex items-center gap-3 flex-wrap">
                  <Skeleton className="h-3 w-44" />
                  {i === 0 && <Skeleton className="h-3 w-28" />}
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
