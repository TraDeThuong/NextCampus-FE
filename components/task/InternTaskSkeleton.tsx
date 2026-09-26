import Skeleton from "@/components/ui/Skeleton";
import MetalCard from "@/components/ui/MetalCard";

export default function InternTaskSkeleton() {
  return (
    <div className="space-y-6 w-full animate-fadeIn">
      {/* Top Header Card Skeleton */}
      <MetalCard>
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-4 w-72 rounded-md" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-36 rounded-xl" />
              <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
          </div>
        </div>
      </MetalCard>

      {/* Filters Skeleton */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton.Card />
        <Skeleton.Card />
        <Skeleton.Card />
        <Skeleton.Card />
      </div>

      {/* Table Skeleton */}
      <Skeleton.Table rows={6} />
    </div>
  );
}
