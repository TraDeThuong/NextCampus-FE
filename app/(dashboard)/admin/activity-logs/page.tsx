import type { Metadata } from "next";
import ActivityLogFilter from "./ActivityLogFilter";
import ActivityLogTable from "./ActivityLogTable";
import MetalCard from "@/components/ui/MetalCard";

export const metadata: Metadata = {
  title: "Nhật ký hoạt động",
};

export default function ActivityLogsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <MetalCard>
        <div className="rounded-3xl p-6">
          <h2 className="text-2xl font-bold metal-text">
            Nhật Ký Hoạt Động (Activity Logs)
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Xem và lọc lịch sử hoạt động, kiểm toán thao tác trong toàn bộ hệ thống.
          </p>
        </div>
      </MetalCard>

      {/* Filter */}
      <ActivityLogFilter />

      {/* Table */}
      <ActivityLogTable />
    </div>
  );
}
