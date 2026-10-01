import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DiscordContent from "./DiscordContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("discord");
  return {
    title: `${t("title")} | NexCampus`,
    description: t("subtitle"),
  };
}

export default function DiscordAdminPage() {
  return (
    <ProtectedRoute portal="admin" allowedRoles={["ADMIN"]}>
      <DiscordContent />
    </ProtectedRoute>
  );
}
