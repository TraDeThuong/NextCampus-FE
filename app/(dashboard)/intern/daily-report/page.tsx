import { Suspense } from "react";
import DailyReportContent from "./DailyReportContent";

export default function DailyReportPage() {
  return (
    <Suspense fallback={null}>
      <DailyReportContent />
    </Suspense>
  );
}
