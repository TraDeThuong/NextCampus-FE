import type { Metadata } from "next";
import LeaderInternHeader from "./LeaderInternHeader";
import LeaderInternStats from "./LeaderInternStats";
import LeaderInternFilters from "./LeaderInternFilters";
import LeaderInternTable from "./LeaderInternTable";

export const metadata: Metadata = {
  title: "My Interns",
};

export default function LeaderInternsPage() {
  return (
    <div className="space-y-6">
      <LeaderInternHeader />
      <LeaderInternStats />
      <LeaderInternFilters />
      <LeaderInternTable />
    </div>
  );
}
