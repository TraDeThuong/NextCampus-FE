"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  Users,
  PieChart,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  Sliders,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { TaskGroup, TaskGroupTask } from "@/types/task-group";
import { useTaskGroupTasks } from "@/hooks/task-group/useTaskGroupTasks";
import { taskAssignmentService } from "@/services/task-assignment.service";

interface TaskGroupQuotaAllocationModalProps {
  taskGroup: TaskGroup;
  onCloseModal?: () => void;
}

type AllocationMode = "equal" | "custom";

export default function TaskGroupQuotaAllocationModal({
  taskGroup,
  onCloseModal,
}: TaskGroupQuotaAllocationModalProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();

  const { data: tasksData, isLoading: loadingTasks } = useTaskGroupTasks(
    taskGroup.id,
  );
  const tasks = useMemo(() => tasksData?.data ?? [], [tasksData]);

  const members = useMemo(
    () => taskGroup.members ?? [],
    [taskGroup.members],
  );

  const unassignedTasks = useMemo(
    () => tasks.filter((task) => !task.assignment?.internId),
    [tasks],
  );

  const assignedTasksCount = tasks.length - unassignedTasks.length;

  const [mode, setMode] = useState<AllocationMode>("equal");
  const [customQuotas, setCustomQuotas] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Equal split calculation
  const calculatedAssignments = useMemo(() => {
    if (members.length === 0 || unassignedTasks.length === 0) {
      return [] as { internId: string; internName: string; task: TaskGroupTask }[];
    }

    const assignments: {
      internId: string;
      internName: string;
      task: TaskGroupTask;
    }[] = [];

    if (mode === "equal") {
      unassignedTasks.forEach((task, index) => {
        const member = members[index % members.length];
        assignments.push({
          internId: member.internId,
          internName: member.intern.fullName,
          task,
        });
      });
    } else {
      // Custom Quotas mode
      let taskPointer = 0;
      for (const member of members) {
        const quota = customQuotas[member.internId] ?? 0;
        for (let i = 0; i < quota && taskPointer < unassignedTasks.length; i++) {
          assignments.push({
            internId: member.internId,
            internName: member.intern.fullName,
            task: unassignedTasks[taskPointer],
          });
          taskPointer++;
        }
      }
    }

    return assignments;
  }, [members, unassignedTasks, mode, customQuotas]);

  const handleCustomQuotaChange = (internId: string, count: number) => {
    setCustomQuotas((prev) => ({
      ...prev,
      [internId]: Math.max(0, count),
    }));
  };

  const handleApplyAllocation = async () => {
    if (calculatedAssignments.length === 0) {
      toast.error(t("leader.taskGroups.noUnassignedTasks"));
      return;
    }

    setIsSubmitting(true);
    try {
      // Assign each task to the targeted intern
      const promises = calculatedAssignments.map((assignment) =>
        taskAssignmentService.assignTask(assignment.task.id, {
          internId: assignment.internId,
        }),
      );

      await Promise.all(promises);

      toast.success(
        t("leader.taskGroups.allocationSuccess", {
          count: calculatedAssignments.length,
        }),
      );

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["task-groups"] });
      queryClient.invalidateQueries({
        queryKey: ["task-group-tasks", taskGroup.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["task-group-progress", taskGroup.id],
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });

      onCloseModal?.();
    } catch {
      toast.error(t("leader.taskGroups.allocationFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-2 py-4 text-left">
      {/* Header with standard icon wrapper */}
      <div className="flex items-center gap-2 mb-1">
        <PieChart className="w-5 h-5 text-cyan-400 shrink-0" />
        <h2 className="text-lg font-bold text-white">
          {t("leader.taskGroups.allocationModalTitle")}
        </h2>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        {t("leader.taskGroups.allocationModalDesc")} (
        <span className="text-cyan-300 font-medium">{taskGroup.name}</span>)
      </p>

      {/* Task Summary Badges */}
      <div className="grid grid-cols-3 gap-3 mb-6 p-3 rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-0.5">
            {t("leader.taskGroups.totalTasks")}
          </p>
          <p className="text-lg font-bold text-white">{tasks.length}</p>
        </div>
        <div className="text-center border-x border-white/5">
          <p className="text-xs text-emerald-400 mb-0.5">
            {t("leader.taskGroups.assignedTasks")}
          </p>
          <p className="text-lg font-bold text-emerald-300">
            {assignedTasksCount}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-amber-400 mb-0.5">
            {t("leader.taskGroups.unassignedTasks")}
          </p>
          <p className="text-lg font-bold text-amber-300">
            {unassignedTasks.length}
          </p>
        </div>
      </div>

      {/* Mode selection tabs */}
      <div className="flex items-center gap-2 mb-5 p-1 bg-[#090d16] border border-white/10 rounded-xl">
        <button
          type="button"
          onClick={() => setMode("equal")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
            mode === "equal"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          {t("leader.taskGroups.modeEqual")}
        </button>

        <button
          type="button"
          onClick={() => setMode("custom")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
            mode === "custom"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4 shrink-0" />
          {t("leader.taskGroups.modeCustom")}
        </button>
      </div>

      {loadingTasks ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 text-cyan-400 animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/10 rounded-2xl">
          <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
          <p className="text-sm text-slate-300">
            {t("leader.taskGroups.noMembersToAllocate")}
          </p>
        </div>
      ) : unassignedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-white/10 rounded-2xl">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
          <p className="text-sm text-slate-300">
            {t("leader.taskGroups.noUnassignedTasks")}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Members Quota Configuration */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t("leader.taskGroups.membersSectionTitle")} ({members.length})
              </h3>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {members.map((member) => {
                const assignedCount = calculatedAssignments.filter(
                  (a) => a.internId === member.internId,
                ).length;

                return (
                  <div
                    key={member.internId}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-white/5 bg-white/[0.02]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {member.intern.fullName}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {member.intern.position?.name ||
                          member.intern.department?.name ||
                          member.intern.user.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {mode === "custom" ? (
                        <div className="flex items-center gap-1.5">
                          <label className="text-xs text-slate-400">
                            {t("leader.taskGroups.taskQuotaLabel")}:
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={unassignedTasks.length}
                            value={customQuotas[member.internId] ?? 0}
                            onChange={(e) =>
                              handleCustomQuotaChange(
                                member.internId,
                                parseInt(e.target.value, 10) || 0,
                              )
                            }
                            className="w-16 rounded-lg border border-white/10 bg-white/5 py-1 px-2 text-center text-xs text-white outline-none focus:border-cyan-400/50"
                          />
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-cyan-400/10 px-2 py-0.5 text-xs font-medium text-cyan-300 ring-1 ring-inset ring-cyan-400/20">
                          {t("leader.taskGroups.tasksCount", {
                            count: assignedCount,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Allocation Preview List */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {t("leader.taskGroups.previewAllocation")} (
              {calculatedAssignments.length} / {unassignedTasks.length})
            </h3>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {calculatedAssignments.slice(0, 10).map((assignment) => (
                <div
                  key={assignment.task.id}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-white/[0.01] border border-white/5"
                >
                  <span className="text-slate-300 truncate max-w-[200px]">
                    {assignment.task.title}
                  </span>
                  <div className="flex items-center gap-1 text-cyan-400 font-medium shrink-0">
                    <ArrowRight className="w-3 h-3" />
                    <span>{assignment.internName}</span>
                  </div>
                </div>
              ))}

              {calculatedAssignments.length > 10 && (
                <p className="text-[11px] text-slate-500 text-center italic py-1">
                  + {calculatedAssignments.length - 10} task khác...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Actions */}
      <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCloseModal}
          disabled={isSubmitting}
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 hover:text-white transition"
        >
          {t("leader.taskGroups.cancel")}
        </button>

        <button
          type="button"
          onClick={handleApplyAllocation}
          disabled={
            isSubmitting ||
            calculatedAssignments.length === 0 ||
            members.length === 0
          }
          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("leader.taskGroups.applying")}
            </>
          ) : (
            t("leader.taskGroups.applyAllocation")
          )}
        </button>
      </div>
    </div>
  );
}
