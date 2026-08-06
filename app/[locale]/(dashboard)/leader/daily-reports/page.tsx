import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LeaderDailyReportContent from "./LeaderDailyReportContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("leader.dailyReports.metaTitle") };
}

export default function LeaderDailyReportsPage() {
  return (
    <Suspense fallback={null}>
      <LeaderDailyReportContent />
    </Suspense>
  );
}
