import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LeaderStatsOverview from "@/components/stats/LeaderStatsOverview";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("leader.dashboard.metaTitle") };
}

export default function LeaderDashboardPage() {
  return <LeaderStatsOverview />;
}
