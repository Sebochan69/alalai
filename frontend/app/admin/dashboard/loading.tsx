import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-8">
        <div>
          <Skeleton className="h-3 w-32 mb-3" />
          <Skeleton className="h-9 w-72 mb-3" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border/60 rounded-2xl p-4 shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <Skeleton className="h-3 w-28 mb-4" />
                <Skeleton className="h-10 w-14 mb-3" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-violet-500/20 bg-card p-5 mb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-52" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <Skeleton className="h-4 w-14" />
      </div>

      <div className="space-y-2 mb-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="w-2 h-2 rounded-full mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-10 rounded" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-5 w-72 max-w-full mb-2" />
                <Skeleton className="h-3 w-44" />
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
        <Skeleton className="h-4 w-40 mb-5" />
        <div className="grid grid-cols-3 divide-x divide-border/60 text-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-4 py-1 space-y-2">
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-3 w-24 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
