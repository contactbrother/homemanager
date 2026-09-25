import { Skeleton, SkeletonPanel } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-hidden>
      <Skeleton className="h-7 w-56" />
      <Skeleton className="mt-3 h-4 w-32" />
      <div className="mt-5 flex gap-4 border-b border-[var(--line)] pb-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <SkeletonPanel rows={3} className="mt-8" />
    </div>
  );
}
