import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReportDetailLoading() {
  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto w-full space-y-5">
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

      {/* Media */}
      <Skeleton className="h-52 w-full rounded-2xl" />

      {/* GPS map */}
      <Skeleton className="h-56 w-full rounded-2xl" />

      {/* Update form */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
