import { SkeletonHeader, SkeletonPanel } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <SkeletonHeader />
      <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
        <SkeletonPanel rows={2} />
        <SkeletonPanel rows={3} />
        <SkeletonPanel rows={2} className="hidden md:block" />
      </div>
    </div>
  );
}
