import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LeaderAbsencesContent from "./LeaderAbsencesContent";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Spinner from "@/components/ui/Spinner";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("absences");
  return { title: `${t("leaderTitle")} | NexCampus` };
}

export default function LeaderAbsencesPage() {
  return (
    <ProtectedRoute
      portal="leader"
      allowedRoles={["LEADER", "ADMIN", "HR"]}
      requiredPermissions={["ABSENCE_REVIEW", "ABSENCE_READ"]}
      permissionMode="ANY"
    >
      <Suspense fallback={<Spinner />}>
        <LeaderAbsencesContent />
      </Suspense>
    </ProtectedRoute>
  );
}
