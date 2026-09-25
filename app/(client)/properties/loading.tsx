import { SkeletonHeader, SkeletonPanel } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonPanel rows={2} />
    </div>
  );
}
