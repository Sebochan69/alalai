import { Skeleton } from "@/components/ui/skeleton";

export default function CitizenDashboardLoading() {
  return (
    <div className="flex flex-col px-6 md:px-8 py-6">
      <div className="shrink-0 mb-6">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 max-w-[62vw]" />
            <Skeleton className="h-4 w-80 max-w-[72vw]" />
          </div>
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border/60 rounded-2xl p-4 shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-10 w-12" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 mb-3">
        <Skeleton className="h-4 w-28 mb-2" />
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border/60 rounded-2xl shadow-md overflow-hidden"
          >
            <div className="p-4 flex items-start gap-3">
              <Skeleton className="w-11 h-11 rounded-full shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <div className="border-t border-border/50 bg-muted/20 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
