import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LeaderDailyReportContent from "./LeaderDailyReportContent";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("leader.dailyReports.metaTitle") };
}

export default function LeaderDailyReportsPage() {
  return (
    <ProtectedRoute requiredPermissions={["DAILY_REPORT_READ"]}>
      <Suspense fallback={null}>
        <LeaderDailyReportContent />
      </Suspense>
    </ProtectedRoute>
  );
}
