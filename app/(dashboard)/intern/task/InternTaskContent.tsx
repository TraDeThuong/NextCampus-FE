"use client";

import { useSearchParams } from "next/navigation";
import InternTaskFilters from "./InternTaskFilters";
import InternTaskStats from "./InternTaskStats";
import InternTaskTable from "./InternTaskTable";
import SquadViewContainer from "./squad/SquadViewContainer";

export default function InternTaskContent() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") === "team" ? "team" : "my";

  if (currentView === "team") {
    return <SquadViewContainer />;
  }

  return (
    <div className="space-y-6">
      <InternTaskFilters />
      <InternTaskStats />
      <InternTaskTable />
    </div>
  );
}
