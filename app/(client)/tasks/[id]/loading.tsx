import { Skeleton, SkeletonPanel } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-hidden>
      <Skeleton className="h-7 w-64 max-w-full" />
      <Skeleton className="mt-3 h-5 w-40" />
      <SkeletonPanel rows={1} className="mt-6" />
      <SkeletonPanel rows={3} className="mt-5" />
    </div>
  );
}
