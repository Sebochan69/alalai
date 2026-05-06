import { Skeleton } from "@/components/ui/skeleton";

export default function FileConcernLoading() {
  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="space-y-2 mb-7">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Form card */}
      <div className="bg-card border border-border/60 rounded-2xl p-6 space-y-5">
        {/* Location field */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        {/* Map pin area */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>

        {/* Photo upload */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-20 w-full rounded-xl border-2 border-dashed border-border/40" />
        </div>

        {/* Submit button */}
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}
