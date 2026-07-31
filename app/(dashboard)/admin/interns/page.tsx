import type { Metadata } from "next";
import { Suspense } from "react";
import InternHeader from "./InternHeader";
import InternStats from "./InternStats";
import InternFilters from "./InternFilters";
import InternTable from "./InternTable";
import Spinner from "@/components/ui/Spinner";
import MetalCard from "@/components/ui/MetalCard";

export const metadata: Metadata = {
  title: "Manage Interns",
};

export default function InternManagementPage() {
  return (
    <div className="space-y-6">
      <InternHeader />
      <InternStats />
      <Suspense
        fallback={
          <MetalCard className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </MetalCard>
        }
      >
        <InternFilters />
        <InternTable />
      </Suspense>
    </div>
  );
}

