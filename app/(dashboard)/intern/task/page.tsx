import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import InternTaskHeader from "./InternTaskHeader";
import InternTaskTimeFilter from "./InternTaskTimeFilter";
import InternTaskStats from "./InternTaskStats";
import InternTaskTable from "./InternTaskTable";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("intern.tasks.metaTitle") };
}

export default function InternTaskPage() {
  return (
    <div className="space-y-6">
      <InternTaskHeader />
      <InternTaskTimeFilter />
      <InternTaskStats />
      <Suspense fallback={null}><InternTaskTable /></Suspense>
    </div>
  );
}
