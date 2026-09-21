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
                      className="flex items-center gap-2 rounded-xl border border-border dark:border-white/10 bg-card/60 px-4 py-2.5 text-sm font-medium text-muted transition hover:border-white/20 hover:bg-card hover:text-foreground active:scale-95 shadow-sm cursor-pointer"
                    >
                      <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{t("importTasks")}</span>
                    </button>
                  </Modal.Open>

                  <Modal.Open opens="create-task">
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20 active:scale-95 shadow-sm cursor-pointer"
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
                    className="flex items-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-300 transition hover:border-purple-400/50 hover:bg-purple-500/20 active:scale-95 shadow-sm cursor-pointer"
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
