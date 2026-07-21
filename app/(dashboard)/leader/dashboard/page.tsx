import type { Metadata } from "next";
import LeaderStatsOverview from "@/components/stats/LeaderStatsOverview";

export const metadata: Metadata = {
  title: "Tổng quan (Leader)",
};

export default function LeaderDashboardPage() {
  return <LeaderStatsOverview />;
}

