import type { Metadata } from "next";
import { Suspense } from "react";
import PolicyHeader from "./PolicyHeader";
import PolicyFilter from "./PolicyFilter";
import PolicyTable from "./PolicyTable";
import Spinner from "@/components/ui/Spinner";
import MetalCard from "@/components/ui/MetalCard";

export const metadata: Metadata = {
  title: "Chính sách & Quy định",
};

export default function ManagePolicies() {
  return (
    <div className="space-y-6">
      <PolicyHeader />
      <Suspense
        fallback={
          <MetalCard className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </MetalCard>
        }
      >
        <PolicyFilter />
        <PolicyTable />
      </Suspense>
    </div>
  );
}


