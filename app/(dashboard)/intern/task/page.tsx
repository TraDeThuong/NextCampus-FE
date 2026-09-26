import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import InternTaskHeader from "./InternTaskHeader";
import InternTaskContent from "./InternTaskContent";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import InternTaskSkeleton from "@/components/task/InternTaskSkeleton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("intern.tasks.metaTitle") };
}

export default function InternTaskPage() {
  return (
    <ProtectedRoute
      requiredPermissions={["TASK_READ", "TASK_ASSIGNMENT_READ"]}
      permissionMode="ANY"
    >
      <div className="space-y-6">
        <InternTaskHeader />
        <Suspense fallback={<InternTaskSkeleton />}>
          <InternTaskContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
