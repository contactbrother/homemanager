/** Skeletons, never spinners. Shaped like the content that is arriving. FR-042. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-[var(--r-sm)] bg-[var(--line)] ${className}`}
    />
  );
}

/** Legacy stacked rows, still used by team screens. */
export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--surface)] rounded-[var(--r-md)] border border-[var(--line)] p-4"
        >
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

/** A panel with a header and divided rows, matching Panel. */
export function SkeletonPanel({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={`overflow-hidden rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] ${className}`}
    >
      <div className="flex min-h-[56px] items-center border-b border-[var(--line)] px-4 md:px-5">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="divide-y divide-[var(--line)]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-4 md:px-5">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="mt-2 h-3 w-2/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonHeader() {
  return (
    <div aria-hidden className="mb-6 md:mb-8">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-3 h-4 w-72 max-w-full" />
    </div>
  );
}
