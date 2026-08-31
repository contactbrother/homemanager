import { Skeleton, SkeletonRows } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-8 w-48" />
      <div className="mt-6">
        <SkeletonRows rows={4} />
      </div>
    </div>
  );
}
