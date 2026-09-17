"use client";

import { Layers, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Modal from "@/components/ui/Modal";
import TaskGroupCreateModal from "@/components/task-group/TaskGroupCreateModal";

export default function TaskGroupHeader() {
  const t = useTranslations();

  return (
    <Modal>
      <MetalCard>
        <div className="rounded-3xl p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-6 h-6 text-cyan-400 shrink-0" />
                <h2 className="text-2xl font-bold metal-text">
                  {t("leader.taskGroups.title")}
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {t("leader.taskGroups.description")}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Modal.Open opens="create-task-group">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  {t("leader.taskGroups.createGroup")}
                </button>
              </Modal.Open>
            </div>
          </div>
        </div>
      </MetalCard>

      <Modal.Window name="create-task-group" size="md">
        <TaskGroupCreateModal />
      </Modal.Window>
    </Modal>
  );
}
