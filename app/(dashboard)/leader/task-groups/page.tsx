import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import Spinner from "@/components/ui/Spinner";
import TaskGroupHeader from "./TaskGroupHeader";
import TaskGroupStats from "./TaskGroupStats";
import TaskGroupFilter from "./TaskGroupFilter";
import TaskGroupList from "./TaskGroupList";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("leader.taskGroups.metaTitle") };
}

export default function LeaderTaskGroupsPage() {
  return (
    <ProtectedRoute requiredPermissions={["TASK_GROUP_READ"]}>
      <div className="space-y-6">
        <TaskGroupHeader />
        <Suspense
          fallback={
            <div className="flex justify-center py-10">
              <Spinner size="md" />
            </div>
          }
        >
          <TaskGroupStats />
          <TaskGroupFilter />
          <TaskGroupList />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
