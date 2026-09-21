import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import InternStatsOverview from "@/components/stats/InternStatsOverview";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("intern.dashboard.metaTitle") };
}

export default function InternDashboardPage() {
  return (
    <ProtectedRoute
      requiredPermissions={[
        "STATS_INTERN_READ",
        "STATS_LEADER_READ",
        "STATS_ADMIN_READ",
      ]}
      permissionMode="ANY"
    >
      <InternStatsOverview />
    </ProtectedRoute>
  );
}
