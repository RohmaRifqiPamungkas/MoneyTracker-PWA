import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-5">
      {/* Header skeleton */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* Period filter skeleton */}
      <Skeleton className="h-20 rounded-2xl mb-5" />

      {/* Overview cards skeleton */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>

      {/* Tabs skeleton (mobile) */}
      <div className="flex rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-1.5 mb-5 lg:hidden">
        <Skeleton className="flex-1 h-10 rounded-xl" />
        <Skeleton className="flex-1 h-10 rounded-xl" />
        <Skeleton className="flex-1 h-10 rounded-xl" />
      </div>

      {/* Desktop layout skeleton */}
      <div className="hidden lg:grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-72 rounded-2xl" />
          <div className="grid gap-5 md:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
        <div className="flex flex-col gap-5">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>

      {/* Mobile tab content skeleton */}
      <div className="lg:hidden flex flex-col gap-5">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    </div>
  );
}
