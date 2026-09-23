"use client";

import { FileSpreadsheet, Plus, Layers, CheckSquare } from "lucide-react";
import { useTranslations } from "next-intl";

import MetalCard from "@/components/ui/MetalCard";
import Modal from "@/components/ui/Modal";
import TaskImportModal from "./TaskImportModal";
import TaskCreateModal from "./TaskCreateModal";
import TaskGroupCreateModal from "./TaskGroupCreateModal";
import { useRBAC } from "@/hooks/rbac/useRBAC";

export default function LeaderTaskHeader() {
  const t = useTranslations("leader.tasks");
  const { can } = useRBAC();
  const canCreateTask = can("TASK_CREATE");
  const canCreateGroup = can("TASK_GROUP_CREATE");

  return (
    <Modal>
      <MetalCard>
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-6 w-6 shrink-0 text-cyan-400" />
                <h2 className="text-2xl font-bold metal-text">{t("title")}</h2>
              </div>
              <p className="mt-1 text-sm text-muted">{t("description")}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {canCreateTask && (
                <>
                  <Modal.Open opens="import">
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-muted transition hover:border-slate-300 dark:hover:border-white/20 hover:bg-card hover:text-foreground active:scale-95 shadow-sm cursor-pointer"
                    >
                      <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{t("importTasks")}</span>
                    </button>
                  </Modal.Open>

                  <Modal.Open opens="create-task">
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-xl border border-cyan-300 bg-cyan-100/80 text-cyan-700 hover:bg-cyan-200/80 hover:border-cyan-400 dark:border-cyan-400/30 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:border-cyan-400/50 dark:hover:bg-cyan-500/20 px-4 py-2.5 text-sm font-medium transition active:scale-95 shadow-sm cursor-pointer"
                    >
                      <Plus className="h-4 w-4 shrink-0" />
                      <span>{t("createTask")}</span>
                    </button>
                  </Modal.Open>
                </>
              )}

              {canCreateGroup && (
                <Modal.Open opens="create-group">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl border border-purple-300 bg-purple-100/80 text-purple-700 hover:bg-purple-200/80 hover:border-purple-400 dark:border-purple-400/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:border-purple-400/50 dark:hover:bg-purple-500/20 px-4 py-2.5 text-sm font-medium transition active:scale-95 shadow-sm cursor-pointer"
                  >
                    <Layers className="h-4 w-4 shrink-0" />
                    <span>{t("createGroup")}</span>
                  </button>
                </Modal.Open>
              )}
            </div>
          </div>
        </div>
      </MetalCard>

      <Modal.Window name="import" size="lg">
        <TaskImportModal />
      </Modal.Window>
      <Modal.Window name="create-task" size="lg">
        <TaskCreateModal />
      </Modal.Window>
      <Modal.Window name="create-group" size="sm">
        <TaskGroupCreateModal />
      </Modal.Window>
    </Modal>
  );
}
