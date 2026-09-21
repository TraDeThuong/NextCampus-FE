import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MeetingsClient from "./MeetingsClient";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("admin.meetings.metaTitle") };
}

export default function MeetingsPage() {
  return (
    <ProtectedRoute requiredPermissions={["MEETING_READ"]}>
      <MeetingsClient />
    </ProtectedRoute>
  );
}
