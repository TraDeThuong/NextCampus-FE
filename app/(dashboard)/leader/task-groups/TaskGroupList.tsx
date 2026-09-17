"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Layers } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useTaskGroups } from "@/hooks/task-group/useTaskGroups";
import type { TaskGroupStatus } from "@/types/task-group";
import TaskGroupCard from "./TaskGroupCard";

export default function TaskGroupList() {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? undefined;
  const departmentId = searchParams.get("departmentId") ?? undefined;
  const status = (searchParams.get("status") as TaskGroupStatus) ?? undefined;

  const { data, isLoading, isError } = useTaskGroups({
    search,
    departmentId,
    status,
  });

  const taskGroups = data?.data ?? [];

  if (isLoading) {
    return (
      <MetalCard className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </MetalCard>
    );
  }

  if (isError) {
    return (
      <MetalCard className="flex flex-col items-center justify-center gap-3 py-20">
        <AlertTriangle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-slate-400">
          {t("admin.department.loadError")}
        </p>
      </MetalCard>
    );
  }

  if (taskGroups.length === 0) {
    return (
      <MetalCard className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <Layers className="h-10 w-10 text-slate-600 mb-1" />
        <p className="text-sm font-medium text-slate-300">
          {t("leader.taskGroups.noTaskGroups")}
        </p>
        <p className="text-xs text-slate-500">
          {t("leader.taskGroups.noTaskGroupsSub")}
        </p>
      </MetalCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {taskGroups.map((group) => (
        <TaskGroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}
