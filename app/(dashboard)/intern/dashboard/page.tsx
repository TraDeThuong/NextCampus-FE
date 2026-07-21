import type { Metadata } from "next";
import InternStatsOverview from "@/components/stats/InternStatsOverview";

export const metadata: Metadata = {
  title: "Tổng quan",
};

export default function InternDashboardPage() {
  return <InternStatsOverview />;
}

