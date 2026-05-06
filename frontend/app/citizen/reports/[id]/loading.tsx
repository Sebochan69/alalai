import { Skeleton } from "@/components/ui/skeleton";

export default function CitizenReportDetailLoading() {
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-3xl mx-auto space-y-5">
      {/* Back link */}
      <Skeleton className="h-4 w-28" />

      {/* Status badge + title */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>

      {/* Timeline */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center gap-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              {i < 3 && <Skeleton className="h-0.5 flex-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Detail card */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
        <div className="grid grid-cols-2 gap-4 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Media placeholder */}
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
