import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import InternWeeklyEvaluationList from "./InternWeeklyEvaluationList";
import Spinner from "@/components/ui/Spinner";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("intern.weeklyEvaluation.metaTitle") };
}

export default function page() {
  return (
    <Suspense fallback={<Spinner />}>
      <InternWeeklyEvaluationList />
    </Suspense>
  );
}
