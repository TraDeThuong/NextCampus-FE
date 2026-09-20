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
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
                  <Layers className="h-6 w-6 shrink-0" />
                </div>
                <h1 className="text-2xl font-bold metal-text">
                  {t("leader.taskGroups.title")}
                </h1>
              </div>
              <p className="mt-2 text-sm text-muted">
                {t("leader.taskGroups.description")}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Modal.Open opens="create-task-group">
                <button
                  type="button"
                  className="
                    group relative inline-flex items-center justify-center gap-2 overflow-hidden
                    rounded-xl sm:rounded-2xl
                    h-[42px] sm:h-[46px] px-5 sm:px-6
                    bg-gradient-to-r from-(--primary-main) to-(--primary-light)
                    text-sm font-semibold text-white
                    shadow-[0_0_25px_rgba(21,174,245,0.25)]
                    transition-all duration-300
                    hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(21,174,245,0.4)] hover:brightness-110
                    active:scale-[0.98]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background
                    disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
                    cursor-pointer select-none
                  "
                >
                  <span
                    className="
                      pointer-events-none absolute inset-y-0 -left-24 w-16 rotate-12
                      bg-white/30 blur-lg
                      transition-all duration-700
                      group-hover:left-[130%]
                    "
                  />
                  <span className="relative flex items-center gap-2">
                    <Plus className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
                    <span>{t("leader.taskGroups.createGroup")}</span>
                  </span>
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
