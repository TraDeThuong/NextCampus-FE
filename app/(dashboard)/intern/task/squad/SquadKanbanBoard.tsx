"use client";

import { useState, useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  PlayCircle,
  AlertOctagon,
  FileCheck,
  Calendar,
  Lock,
  Unlock,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/auth/useAuth";
import { useStartTaskAssignment } from "@/hooks/task-assignment/useStartTaskAssignment";
import toast from "react-hot-toast";
import type { TaskGroupTask } from "@/types/task-group";

interface SquadKanbanBoardProps {
  tasks: TaskGroupTask[];
  onSelectTask: (task: TaskGroupTask) => void;
  onRefresh?: () => void;
}

const COLUMNS = [
  { id: "TODO", icon: Clock, color: "text-slate-600 dark:text-slate-400", border: "border-slate-300 dark:border-slate-500/30", bg: "bg-slate-100/90 dark:bg-slate-500/10" },
  { id: "IN_PROGRESS", icon: PlayCircle, color: "text-blue-700 dark:text-blue-400", border: "border-blue-300 dark:border-blue-500/30", bg: "bg-blue-50 dark:bg-blue-500/10" },
  { id: "REVIEW", icon: FileCheck, color: "text-purple-700 dark:text-purple-400", border: "border-purple-300 dark:border-purple-500/30", bg: "bg-purple-50 dark:bg-purple-500/10" },
  { id: "DONE", icon: CheckCircle2, color: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-300 dark:border-emerald-500/30", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  { id: "BLOCKED", icon: AlertOctagon, color: "text-rose-700 dark:text-rose-400", border: "border-rose-300 dark:border-rose-500/30", bg: "bg-rose-50 dark:bg-rose-500/10" },
] as const;

const priorityBadge: Record<string, string> = {
  HIGH: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  LOW: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
};

export default function SquadKanbanBoard({ tasks, onSelectTask, onRefresh }: SquadKanbanBoardProps) {
  const t = useTranslations("intern.tasks");
  const { state: authState } = useAuth();
  const currentUserId = authState.user?.id;
  const currentUserEmail = authState.user?.email;

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const startTaskMutation = useStartTaskAssignment();

  // Group tasks by status
  const columnsData = useMemo(() => {
    const map: Record<string, TaskGroupTask[]> = {
      TODO: [],
      IN_PROGRESS: [],
      REVIEW: [],
      DONE: [],
      BLOCKED: [],
    };

    tasks.forEach((task) => {
      const status = task.assignment?.status || "TODO";
      if (map[status]) {
        map[status].push(task);
      } else {
        map.TODO.push(task);
      }
    });

    return map;
  }, [tasks]);

  const isOwnTask = (task: TaskGroupTask) => {
    if (!task.assignment) return false;
    const internUserEmail = task.assignment.intern?.user?.email;
    const internId = task.assignment.internId;
    const internUserId = (task.assignment.intern as unknown as { userId?: string })?.userId;
    const supportEmail = task.assignment.support?.user?.email;
    const supportId = task.assignment.supportId;
    const supportUserId = (task.assignment.support as unknown as { userId?: string })?.userId;

    const matchesEmail = Boolean(
      currentUserEmail &&
      (internUserEmail === currentUserEmail || supportEmail === currentUserEmail)
    );
    const matchesId = Boolean(
      currentUserId &&
      (internId === currentUserId ||
       internUserId === currentUserId ||
       supportId === currentUserId ||
       supportUserId === currentUserId)
    );

    return matchesEmail || matchesId;
  };

  const handleDragStart = (e: React.DragEvent, task: TaskGroupTask) => {
    if (!isOwnTask(task)) {
      e.preventDefault();
      toast.error(t("dragNotice"));
      return;
    }
    setDraggedTaskId(task.id);
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = async (e: React.DragEvent, targetCol: string) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    setDraggedTaskId(null);

    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.assignment) return;

    if (!isOwnTask(task)) {
      toast.error(t("dragNotice"));
      return;
    }

    const currentStatus = task.assignment.status;
    if (currentStatus === targetCol) return;

    // Moving TODO -> IN_PROGRESS
    if (currentStatus === "TODO" && targetCol === "IN_PROGRESS") {
      try {
        await startTaskMutation.mutateAsync(task.assignment.id);
        toast.success(t("taskInProgressNotice"));
        onRefresh?.();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to start task";
        toast.error(message);
      }
    } else {
      toast(
        targetCol === "REVIEW"
          ? "Hãy nộp bài thông qua nút 'Nộp bài' để chuyển sang Đang duyệt."
          : `Không thể kéo thả trực tiếp sang ${targetCol}`,
        { icon: "ℹ️" },
      );
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 items-start">
      {COLUMNS.map((col) => {
        const Icon = col.icon;
        const colTasks = columnsData[col.id] || [];
        const isTarget = dragOverCol === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-2xl border transition-all duration-200 min-h-[500px] ${
              isTarget
                ? "border-cyan-400 bg-cyan-100/50 shadow-md dark:border-cyan-400 dark:bg-cyan-950/20 dark:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                : "border-border/80 bg-surface-elevated/40 dark:border-border/60 dark:bg-slate-900/40"
            }`}
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between p-3.5 border-b border-border/40 rounded-t-2xl ${col.bg}`}>
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${col.color}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {t.has(`status${col.id}`) ? t(`status${col.id}`) : col.id}
                </span>
              </div>
              <span className={`rounded-lg px-2 py-0.5 text-xs font-mono font-bold ${col.bg} ${col.color}`}>
                {colTasks.length}
              </span>
            </div>

            {/* Column Body / Task List */}
            <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[700px]">
              {colTasks.length === 0 ? (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/80 text-xs text-muted">
                  {t("noTasksFound")}
                </div>
              ) : (
                colTasks.map((task) => {
                  const mine = isOwnTask(task);
                  const isDraggable = mine && (task.assignment?.status === "TODO" || task.assignment?.status === "IN_PROGRESS");
                  const hasPrereqs = task.dependsOn && task.dependsOn.length > 0;
                  const unfinishedPrereq = hasPrereqs
                    ? task.dependsOn?.find((p) => p.assignment?.status !== "DONE")
                    : null;

                  return (
                    <div
                      key={task.id}
                      draggable={isDraggable}
                      onDragStart={(e) => handleDragStart(e, task)}
                      onClick={() => onSelectTask(task)}
                      className={`group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer ${
                        mine
                          ? "border-cyan-300 bg-cyan-50/60 shadow-sm hover:border-cyan-400 hover:bg-cyan-50/90 dark:border-cyan-500/40 dark:bg-slate-900/90 dark:shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:hover:border-cyan-400"
                          : "border-border/80 bg-card shadow-sm hover:border-border-strong hover:bg-card-hover dark:border-border/60 dark:bg-slate-900/60 dark:hover:border-border dark:hover:bg-slate-900/90"
                      } ${isDraggable ? "active:cursor-grabbing hover:scale-[1.01]" : ""}`}
                    >
                      {/* Top row: Code + Priority + Mine Badge */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-border bg-card/80 text-cyan-600 dark:text-cyan-400">
                            {task.code || "TASK"}
                          </span>
                          {mine && (
                            <span className="inline-flex items-center gap-0.5 rounded border border-cyan-300 bg-cyan-100 px-1.5 py-0.5 text-[9px] font-bold text-cyan-800 dark:border-cyan-500/40 dark:bg-cyan-500/20 dark:text-cyan-300">
                              ★ BẠN
                            </span>
                          )}
                        </div>
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                            priorityBadge[task.priority] ?? priorityBadge.MEDIUM
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                        {task.title}
                      </h4>

                      {/* Dependency Badge (if any) */}
                      {hasPrereqs && (
                        <div className="mb-2">
                          {unfinishedPrereq ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                              <Lock className="h-3 w-3 shrink-0" />
                              {t("dependencyWaiting", { code: unfinishedPrereq.code || unfinishedPrereq.title })}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                              <Unlock className="h-3 w-3 shrink-0" />
                              {t("dependencyUnlocked")}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer: Assignee & Deadline */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted">
                        <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                          {task.assignment?.intern?.user?.avatarUrl ? (
                            <img
                              src={task.assignment.intern.user.avatarUrl}
                              alt=""
                              className="h-5 w-5 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-cyan-700 dark:bg-slate-800 dark:text-cyan-400 shrink-0">
                              {task.assignment?.intern?.fullName?.[0] || "?"}
                            </div>
                          )}
                          <span className="truncate text-foreground/80 font-medium">
                            {task.assignment?.intern?.fullName || "Chưa giao"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] shrink-0 font-mono">
                          <Calendar className="h-3 w-3 text-muted" />
                          <span>{new Date(task.deadline).toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
