
import type { Metadata } from "next";
import { Suspense } from "react";
import LeaderTaskHeader from "./LeaderTaskHeader";
import LeaderTaskStats from "./LeaderTaskStats";
import LeaderTaskFilters from "./LeaderTaskFilters";
import LeaderTableTasks from "./LeaderTableTasks";
import Spinner from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Task Management",
};

export default function page() {
  return (
    <div className="space-y-6">
      <LeaderTaskHeader />
      <Suspense fallback={<Spinner />}>
        <LeaderTaskStats />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <LeaderTaskFilters />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <LeaderTableTasks />
      </Suspense>
    </div>
  );
}

