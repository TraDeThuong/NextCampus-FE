
import type { Metadata } from "next";
import LeaderTaskHeader from "./LeaderTaskHeader";
import LeaderTaskStats from "./LeaderTaskStats";
import LeaderTaskFilters from "./LeaderTaskFilters";
import LeaderTableTasks from "./LeaderTableTasks";

export const metadata: Metadata = {
  title: "Task Management",
};

export default function page() {
  return (
    <div className="space-y-6">
      <LeaderTaskHeader />
      <LeaderTaskStats />
      <LeaderTaskFilters />
      <LeaderTableTasks/>
    </div>
  );
}

