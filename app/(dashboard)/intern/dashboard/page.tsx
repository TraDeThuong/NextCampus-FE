import type { Metadata } from "next";
import InternStatsOverview from "@/components/stats/InternStatsOverview";

export const metadata: Metadata = {
  title: "Overview",
};

export default function InternDashboardPage() {
  return <InternStatsOverview />;
}

