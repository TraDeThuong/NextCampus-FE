import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AdminStatsOverview from "@/components/stats/AdminStatsOverview";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("admin.dashboard.metaTitle") };
}

export default function AdminDashboardPage() {
  return <AdminStatsOverview />;
}

