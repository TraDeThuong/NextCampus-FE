import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import Spinner from "@/components/ui/Spinner";
import LeaderTasksContent from "./LeaderTasksContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("leader.tasks.metaTitle") };
}

export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <LeaderTasksContent />
    </Suspense>
  );
}
