import { Skeleton } from "@/components/ui/skeleton";

export default function CitizenMapLoading() {
  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>

      {/* Legend chips */}
      <div className="flex gap-2 flex-wrap mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Map area */}
      <Skeleton className="w-full rounded-2xl h-[calc(100vh-280px)] min-h-[420px]" />
    </div>
  );
}
