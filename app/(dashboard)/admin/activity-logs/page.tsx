import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import ActivityLogHeader from "./ActivityLogHeader";
import ActivityLogStats from "./ActivityLogStats";
import ActivityLogFilter from "./ActivityLogFilter";
import ActivityLogTable from "./ActivityLogTable";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("admin.activityLogs.metaTitle") };
}

export default function ActivityLogsPage() {
  return (
    <ProtectedRoute requiredPermissions={["AUDIT_LOG_READ"]}>
      <div className="space-y-6">
        <ActivityLogHeader />
        <ActivityLogStats />
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
    </ProtectedRoute>
  );
}
