import type { Metadata } from "next";
import InternHeader from "./InternHeader";
import InternStats from "./InternStats";
import InternFilters from "./InternFilters";
import InternTable from "./InternTable";

export const metadata: Metadata = {
  title: "Quản lý thực tập sinh",
};

export default function InternManagementPage() {
  return (
    <div className="space-y-6">
      <InternHeader />
      <InternStats />
      <InternFilters />
      <InternTable />
    </div>
  );
}

