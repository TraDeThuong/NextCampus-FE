import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import DailyReportContent from "./DailyReportContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("intern.dailyReport.metaTitle") };
}

export default function DailyReportPage() {
  return (
    <Suspense fallback={null}>
      <DailyReportContent />
    </Suspense>
  );
}
