import { cn } from "@/lib/cn";
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-moss/10", className)}
    />
  );
}
export function StatCardSkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-2xl border border-moss/15 bg-card px-5 py-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div
      className="rounded-3xl border border-moss/15 bg-card shadow-sm"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex flex-col gap-0 border-t border-moss/10 px-5 py-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 border-b border-moss/10 py-3 last:border-b-0"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-3.5 w-14 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
export function CardSkeleton({
  bodyHeight = "h-40",
}: {
  bodyHeight?: string;
}) {
  return (
    <div
      className="rounded-3xl border border-moss/15 bg-card px-6 py-6 shadow-sm"
      aria-hidden="true"
    >
      <Skeleton className="mb-4 h-5 w-32" />
      <Skeleton className={cn("w-full", bodyHeight)} />
    </div>
  );
}
