import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AdminSettingsForm from "./AdminSettingsForm";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("admin.settings.metaTitle") };
}

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute requiredPermissions={["SYSTEM_CONFIG_READ"]}>
      <div className="space-y-6 pb-12">
        <AdminSettingsForm />
      </div>
    </ProtectedRoute>
  );
}
