import { Skeleton } from "@/components/ui/skeleton";

export default function CitizenChatLoading() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border/60 bg-card/90 px-5 md:px-8 py-4 shrink-0">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-44" />
            </div>
          </div>
          <Skeleton className="h-8 w-14 rounded-xl" />
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 px-4 md:px-8 py-5 max-w-3xl mx-auto w-full space-y-5">
        {/* Bot message */}
        <div className="flex items-end gap-2.5">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="space-y-1.5 max-w-[65%]">
            <Skeleton className="h-24 w-72 rounded-2xl rounded-bl-sm" />
            <Skeleton className="h-2.5 w-10" />
          </div>
        </div>
      </div>

      {/* Quick replies */}
      <div className="px-4 md:px-8 pb-3 max-w-3xl mx-auto w-full space-y-2">
        <Skeleton className="h-3 w-28" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-40 rounded-full" />
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 z-10 border-t border-border/60 bg-background/90 px-4 md:px-8 pt-3 pb-5 md:pb-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-3 w-48 mx-auto mt-2" />
        </div>
      </div>
    </div>
  );
}
