import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import RolesHeader from "./RolesHeader";
import RolesFilter from "./RolesFilter";
import RolesTable from "./RolesTable";
import Spinner from "@/components/ui/Spinner";
import MetalCard from "@/components/ui/MetalCard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("admin.roles.metaTitle") };
}

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <RolesHeader />
      <Suspense
        fallback={
          <MetalCard className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </MetalCard>
        }
      >
        <RolesFilter />
        <RolesTable />
      </Suspense>
    </div>
  );
}
