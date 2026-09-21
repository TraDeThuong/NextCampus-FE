import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import DepartmentHeader from "./DepartmentHeader";
import DepartmentFilter from "./DepartmentFilter";
import DepartmentTable from "./DepartmentTable";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("leader.department.metaTitle") };
}

export default function page() {
  return (
    <ProtectedRoute requiredPermissions={["DEPARTMENT_READ"]}>
      <div className="space-y-6">
        <DepartmentHeader />
        <DepartmentFilter />
        <DepartmentTable />
      </div>
    </ProtectedRoute>
  );
}
