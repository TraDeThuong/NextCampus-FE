import type { Metadata } from "next";
import { Suspense } from "react";
import ActivityLogFilter from "./ActivityLogFilter";
import ActivityLogTable from "./ActivityLogTable";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Activity Logs",
};

export default function ActivityLogsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <MetalCard>
        <div className="rounded-3xl p-6">
          <h2 className="text-2xl font-bold metal-text">
            Activity Logs
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View and filter activity history, audit system-wide operations.
          </p>
        </div>
      </MetalCard>

      <Suspense
        fallback={
          <MetalCard className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </MetalCard>
        }
      >
        {/* Filter */}
        <ActivityLogFilter />

        {/* Table */}
        <ActivityLogTable />
      </Suspense>
    </div>
  );
}
