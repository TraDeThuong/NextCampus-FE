import type { Metadata } from "next";
import { Suspense } from "react";
import LeaderHeader from "./LeaderHeader";
import LeaderStats from "./LeaderStats";
import LeaderFilter from "./LeaderFilter";
import LeaderTable from "./LeaderTable";
import Spinner from "@/components/ui/Spinner";
import MetalCard from "@/components/ui/MetalCard";

export const metadata: Metadata = {
  title: "Quản lý Trưởng nhóm",
};

export default function ManageLeaders() {
    return (
        <div className="space-y-6">
            <LeaderHeader />
            <LeaderStats />
            <Suspense
                fallback={
                    <MetalCard className="flex items-center justify-center py-20">
                        <Spinner size="lg" />
                    </MetalCard>
                }
            >
                <LeaderFilter />
                <LeaderTable />
            </Suspense>
        </div>
    );
}

