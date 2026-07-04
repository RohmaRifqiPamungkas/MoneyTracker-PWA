import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header skeleton */}
      <div className="border-b border-[var(--card-border)]/40 px-4 pt-5 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-xl">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-3 w-48 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <Skeleton className="h-8 w-8 rounded-lg mb-3" />
              <Skeleton className="h-3 w-16 rounded mb-2" />
              <Skeleton className="h-5 w-20 rounded" />
            </div>
          ))}
        </div>

        {/* Profile form skeleton */}
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4">
          <Skeleton className="h-5 w-32 rounded mb-4" />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>

        {/* Danger zone skeleton */}
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-5 space-y-3">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-64 rounded" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </main>
    </div>
  );
}
