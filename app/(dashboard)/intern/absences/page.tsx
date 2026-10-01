import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import InternAbsencesContent from "./InternAbsencesContent";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("absences");
  return { title: `${t("internTitle")} | NexCampus` };
}

export default function InternAbsencesPage() {
  return (
    <ProtectedRoute
      portal="intern"
      allowedRoles={["INTERN"]}
      requiredPermissions={["ABSENCE_READ", "ABSENCE_CREATE"]}
      permissionMode="ANY"
    >
      <Suspense fallback={null}>
        <InternAbsencesContent />
      </Suspense>
    </ProtectedRoute>
  );
}
