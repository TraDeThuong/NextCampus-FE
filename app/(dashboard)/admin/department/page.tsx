
import type { Metadata } from "next";
import { Suspense } from "react";
import DepartmentHeader from "./DepartmentHeader";
import DepartmentFilter from "./DepartmentFilter";
import DepartmentTable from "./DepartmentTable";
import Spinner from "@/components/ui/Spinner";
import MetalCard from "@/components/ui/MetalCard";

export const metadata: Metadata = {
  title: "Quản lý Phòng ban",
};

export default function page() {
  return (
    <div className="space-y-6">
      <DepartmentHeader />
      <Suspense
        fallback={
          <MetalCard className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </MetalCard>
        }
      >
        <DepartmentFilter />
        <DepartmentTable />
      </Suspense>
    </div>
  );
}


