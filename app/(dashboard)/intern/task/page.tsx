import { Suspense } from "react";
import type { Metadata } from "next";
import InternTaskHeader from "./InternTaskHeader";
import InternTaskTimeFilter from "./InternTaskTimeFilter";
import InternTaskStats from "./InternTaskStats";
import InternTaskTable from "./InternTaskTable";

export const metadata: Metadata = {
  title: "My Tasks",
};

export default function InternTaskPage() {
  return (
    <div className="space-y-6">
      <InternTaskHeader />
      <InternTaskTimeFilter />
      <InternTaskStats />
      <Suspense fallback={null}>
        <InternTaskTable />
      </Suspense>
    </div>
  );
}
