import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReportDetailLoading() {
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto space-y-5">
      {/* Back link */}
      <Skeleton className="h-4 w-28" />

      {/* Title + badges */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main detail panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
            <div className="grid grid-cols-2 gap-4 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
          {/* Media */}
          <Skeleton className="h-52 w-full rounded-2xl" />
        </div>

        {/* Sidebar: update form */}
        <div className="space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
