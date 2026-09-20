"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Layers, RotateCcw, Plus, SearchX } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import TaskGroupCreateModal from "@/components/task-group/TaskGroupCreateModal";
import { useTaskGroups } from "@/hooks/task-group/useTaskGroups";
import { extractTaskGroups, type TaskGroupStatus } from "@/types/task-group";
import TaskGroupCard from "./TaskGroupCard";

export default function TaskGroupList() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const search = searchParams.get("search") ?? undefined;
  const departmentId = searchParams.get("departmentId") ?? undefined;
  const status = (searchParams.get("status") as TaskGroupStatus) ?? undefined;

  const hasActiveFilters = Boolean(search || departmentId || status);

  const { data, isLoading, isError } = useTaskGroups({
    search,
    departmentId,
    status,
  });

  const taskGroups = extractTaskGroups(data?.data);

  const handleResetFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("departmentId");
    params.delete("status");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

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
        <AlertTriangle className="h-8 w-8 text-rose-400" />
        <p className="text-sm text-rose-300">
          {t("leader.taskGroups.loadError")}
        </p>
      </MetalCard>
    );
  }

  if (taskGroups.length === 0) {
    if (hasActiveFilters) {
      return (
        <MetalCard className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-muted mb-1">
            <SearchX className="h-7 w-7 text-slate-500" />
          </div>
          <p className="text-base font-semibold text-foreground">
            {t("leader.taskGroups.noFilterResults")}
          </p>
          <p className="text-xs text-muted max-w-sm">
            {t("leader.taskGroups.noTaskGroupsSub")}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-foreground hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-300 active:scale-95 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t("leader.taskGroups.resetFilter")}</span>
          </button>
        </MetalCard>
      );
    }

    return (
      <Modal>
        <MetalCard className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400 mb-1">
            <Layers className="h-7 w-7" />
          </div>
          <p className="text-base font-semibold text-foreground">
            {t("leader.taskGroups.noTaskGroups")}
          </p>
          <p className="text-xs text-muted max-w-sm">
            {t("leader.taskGroups.noTaskGroupsSub")}
          </p>
          <Modal.Open opens="create-task-group-empty">
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-(--primary-main) to-(--primary-light) px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:brightness-110 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("leader.taskGroups.createGroup")}</span>
            </button>
          </Modal.Open>
        </MetalCard>

        <Modal.Window name="create-task-group-empty" size="md">
          <TaskGroupCreateModal />
        </Modal.Window>
      </Modal>
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
