import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import InternTaskHeader from "./InternTaskHeader";
import InternTaskFilters from "./InternTaskFilters";
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
      <Suspense fallback={null}>
        <InternTaskFilters />
      </Suspense>
      <Suspense fallback={null}>
        <InternTaskStats />
      </Suspense>
      <Suspense fallback={null}>
        <InternTaskTable />
      </Suspense>
    </div>
  );
}
