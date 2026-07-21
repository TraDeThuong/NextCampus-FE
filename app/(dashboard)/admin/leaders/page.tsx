import type { Metadata } from "next";
import LeaderHeader from "./LeaderHeader";
import LeaderStats from "./LeaderStats";
import LeaderFilter from "./LeaderFilter";
import LeaderTable from "./LeaderTable";

export const metadata: Metadata = {
  title: "Quản lý Trưởng nhóm",
};

export default function ManageLeaders() {
    return (
        <div className="space-y-6">
            <LeaderHeader />
            <LeaderStats />
            <LeaderFilter />
            <LeaderTable />
        </div>
    );
}

