import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import SettingsTabs from "./SettingsTabs";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Spinner from "@/components/ui/Spinner";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("admin.settings.metaTitle") };
}

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute
      requiredPermissions={[
        "SYSTEM_CONFIG_READ",
        "MAINTENANCE_READ",
        "MAINTENANCE_MANAGE",
        "API_KEY_READ",
        "API_KEY_MANAGE",
        "WEBHOOK_READ",
        "WEBHOOK_MANAGE",
        "CRON_JOB_READ",
        "CRON_JOB_MANAGE",
      ]}
      permissionMode="ANY"
    >
      <div className="space-y-6 pb-12">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <Spinner size="lg" />
            </div>
          }
        >
          <SettingsTabs />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
