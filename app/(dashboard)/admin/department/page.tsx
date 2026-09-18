
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import DepartmentHeader from "./DepartmentHeader";
import DepartmentStats from "./DepartmentStats";
import DepartmentFilter from "./DepartmentFilter";
import DepartmentTable from "./DepartmentTable";
import Spinner from "@/components/ui/Spinner";
import MetalCard from "@/components/ui/MetalCard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("admin.department.metaTitle") };
}

export default function DepartmentPage() {
  return (
    <div className="space-y-6">
      <DepartmentHeader />
      <DepartmentStats />
      <Suspense
        fallback={
          <MetalCard className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </MetalCard>
        }
      >
        <DepartmentFilter />
        <DepartmentTable />
      </Suspense>
    </div>
  );
}


