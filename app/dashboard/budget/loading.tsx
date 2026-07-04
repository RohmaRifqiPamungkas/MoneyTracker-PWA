import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-32">
      {/* Header skeleton */}
      <div className="w-full border-b border-[var(--card-border)]/40 px-4 pt-5 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-3 w-48 rounded hidden xs:block" />
              </div>
            </div>
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>

          {/* Period selector skeleton */}
          <div className="flex gap-2 mb-3">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>

          {/* Summary box skeleton */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 bg-[var(--card)] border border-[var(--card-border)]/50 p-1.5 sm:p-3.5 rounded-2xl">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-center gap-1 sm:gap-3 py-2 px-1">
                <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-2 w-10 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <main className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 lg:px-8 space-y-4">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-[var(--card-border)]/35 last:border-0">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-32 rounded" />
                  <Skeleton className="h-3 w-12 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
