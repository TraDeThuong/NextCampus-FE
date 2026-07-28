import { Suspense } from "react";
import type { Metadata } from "next";
import LeaderDailyReportContent from "./LeaderDailyReportContent";

export const metadata: Metadata = {
  title: "Daily Reports",
};

export default function LeaderDailyReportsPage() {
  return (
    <Suspense fallback={null}>
      <LeaderDailyReportContent />
    </Suspense>
  );
}
