import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import ActivityLogFilter from "./ActivityLogFilter";
import ActivityLogTable from "./ActivityLogTable";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("admin.activityLogs.metaTitle") };
}

export default async function ActivityLogsPage() {
  const t = await getTranslations();
  return (
    <div className="space-y-6">
      <MetalCard>
        <div className="rounded-3xl p-6">
          <h2 className="text-2xl font-bold metal-text">
            {t("admin.activityLogs.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("admin.activityLogs.description")}
          </p>
        </div>
      </MetalCard>

      <Suspense
        fallback={
          <MetalCard className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </MetalCard>
        }
      >
        <ActivityLogFilter />
        <ActivityLogTable />
      </Suspense>
    </div>
  );
}
