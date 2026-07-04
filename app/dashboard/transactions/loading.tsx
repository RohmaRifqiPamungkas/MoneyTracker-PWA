import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header skeleton */}
      <div className="border-b border-[var(--card-border)]/40 px-4 pt-5 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36 rounded" />
                <Skeleton className="h-3 w-48 rounded hidden sm:block" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>

          {/* Period selector skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Transactions list skeleton */}
      <main className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--card-border)] bg-[var(--card)]">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-20 rounded ml-auto" />
                <Skeleton className="h-3 w-16 rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
