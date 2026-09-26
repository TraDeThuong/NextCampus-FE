"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Lock, Unlock, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/auth/useAuth";
import type { TaskGroupTask } from "@/types/task-group";

interface SquadDependencyGraphProps {
  tasks: TaskGroupTask[];
  onSelectTask: (task: TaskGroupTask) => void;
}

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function SquadDependencyGraph({ tasks, onSelectTask }: SquadDependencyGraphProps) {
  const t = useTranslations("intern.tasks");
  const { state: authState } = useAuth();
  const currentUserId = authState.user?.id;
  const currentUserEmail = authState.user?.email;

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [positions, setPositions] = useState<Record<string, NodePosition>>({});

  // 1. Group tasks into topological levels/phases
  const levels = useMemo(() => {
    const taskMap = new Map<string, TaskGroupTask>(tasks.map((t) => [t.id, t]));
    const levelMap = new Map<string, number>();

    const getLevel = (taskId: string, visited = new Set<string>()): number => {
      if (levelMap.has(taskId)) return levelMap.get(taskId)!;
      if (visited.has(taskId)) return 0; // cycle fallback
      visited.add(taskId);

      const task = taskMap.get(taskId);
      if (!task || !task.dependsOn || task.dependsOn.length === 0) {
        levelMap.set(taskId, 0);
        return 0;
      }

      let maxPrereqLevel = 0;
      for (const prereq of task.dependsOn) {
        const lvl = getLevel(prereq.id, new Set(visited));
        if (lvl + 1 > maxPrereqLevel) {
          maxPrereqLevel = lvl + 1;
        }
      }

      levelMap.set(taskId, maxPrereqLevel);
      return maxPrereqLevel;
    };

    tasks.forEach((task) => getLevel(task.id));

    // Group into columns array
    const maxLevel = Math.max(0, ...Array.from(levelMap.values()));
    const grouped: TaskGroupTask[][] = Array.from({ length: maxLevel + 1 }, () => []);

    tasks.forEach((task) => {
      const lvl = levelMap.get(task.id) ?? 0;
      grouped[lvl].push(task);
    });

    return grouped;
  }, [tasks]);

  // 2. Measure DOM positions for drawing SVG connector curves
  const updatePositions = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newPositions: Record<string, NodePosition> = {};

    Object.entries(cardRefs.current).forEach(([id, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        newPositions[id] = {
          x: rect.left - containerRect.left + container.scrollLeft,
          y: rect.top - containerRect.top + container.scrollTop,
          width: rect.width,
          height: rect.height,
        };
      }
    });

    setPositions(newPositions);
  };

  useEffect(() => {
    updatePositions();
    const handleResize = () => updatePositions();
    window.addEventListener("resize", handleResize);
    const timer = setTimeout(updatePositions, 100);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [levels, tasks]);

  // 3. Compute SVG Edges (from prerequisite to dependent)
  const edges = useMemo(() => {
    const list: Array<{
      id: string;
      fromId: string;
      toId: string;
      isDone: boolean;
      d: string;
    }> = [];

    tasks.forEach((task) => {
      if (!task.dependsOn) return;
      const targetPos = positions[task.id];
      if (!targetPos) return;

      task.dependsOn.forEach((prereq) => {
        const sourcePos = positions[prereq.id];
        if (!sourcePos) return;

        const x1 = sourcePos.x + sourcePos.width;
        const y1 = sourcePos.y + sourcePos.height / 2;
        const x2 = targetPos.x;
        const y2 = targetPos.y + targetPos.height / 2;

        const dx = Math.max(40, (x2 - x1) / 2);
        const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

        // Prerequisite task status
        const prereqTask = tasks.find((t) => t.id === prereq.id);
        const isDone = prereqTask?.assignment?.status === "DONE";

        list.push({
          id: `${prereq.id}->${task.id}`,
          fromId: prereq.id,
          toId: task.id,
          isDone,
          d,
        });
      });
    });

    return list;
  }, [tasks, positions]);

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

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/80 bg-surface-elevated/80 px-4 py-2.5 text-xs shadow-sm dark:border-white/10 dark:bg-slate-900/60 dark:shadow-none">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-6 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-sm dark:shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          <span className="text-muted">{t("legendPrereqDone")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-6 rounded-full border border-dashed border-amber-500 dark:border-amber-400 bg-amber-100 dark:bg-amber-400/20"></span>
          <span className="text-muted">{t("legendPrereqPending")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-cyan-500 dark:border-cyan-400 bg-cyan-100 dark:bg-cyan-400/30"></span>
          <span className="text-cyan-700 dark:text-cyan-300 font-medium">{t("legendMyTask")}</span>
        </div>
      </div>

      {/* Graph Area */}
      <div
        ref={containerRef}
        className="relative overflow-x-auto overflow-y-hidden rounded-2xl border border-border/80 bg-slate-50/70 p-6 min-h-[550px] dark:border-border/60 dark:bg-slate-950/80"
      >
        {/* SVG Bezier Connection Layer */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <defs>
            <marker
              id="arrow-done"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
            <marker
              id="arrow-pending"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
            </marker>
          </defs>

          {edges.map((edge) => (
            <path
              key={edge.id}
              d={edge.d}
              fill="none"
              stroke={edge.isDone ? "#10b981" : "#f59e0b"}
              strokeWidth={edge.isDone ? "2.5" : "2"}
              strokeDasharray={edge.isDone ? "none" : "6,5"}
              markerEnd={edge.isDone ? "url(#arrow-done)" : "url(#arrow-pending)"}
              className={edge.isDone ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "opacity-75"}
            />
          ))}
        </svg>

        {/* Levels / Columns */}
        <div className="flex items-start gap-16 min-w-max relative z-10">
          {levels.map((columnTasks, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-6 w-72">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-mono font-bold text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30">
                  {colIdx + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  Giai đoạn {colIdx + 1}
                </span>
                <span className="text-[11px] text-muted-foreground ml-auto">({columnTasks.length})</span>
              </div>

              <div className="flex flex-col gap-5">
                {columnTasks.map((task) => {
                  const mine = isOwnTask(task);
                  const status = task.assignment?.status || "TODO";
                  const isDone = status === "DONE";
                  const isBlocked = status === "BLOCKED";
                  const hasPrereqs = task.dependsOn && task.dependsOn.length > 0;
                  const allPrereqsDone = hasPrereqs
                    ? task.dependsOn?.every((p) => p.assignment?.status === "DONE")
                    : true;

                  return (
                    <div
                      key={task.id}
                      ref={(el) => {
                        cardRefs.current[task.id] = el;
                      }}
                      onClick={() => onSelectTask(task)}
                      className={`relative rounded-xl border p-4 backdrop-blur-md transition-all duration-200 cursor-pointer ${
                        mine
                          ? "border-cyan-400 bg-card shadow-md ring-1 ring-cyan-400/50 hover:scale-[1.02] dark:border-cyan-400 dark:bg-slate-900/95 dark:shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                          : isDone
                            ? "border-emerald-300 bg-card shadow-sm hover:border-emerald-400 dark:border-emerald-500/40 dark:bg-slate-900/80"
                            : isBlocked
                              ? "border-rose-300 bg-card shadow-sm hover:border-rose-400 dark:border-rose-500/40 dark:bg-slate-900/80"
                              : "border-border/80 bg-card shadow-sm hover:border-border-strong hover:bg-card-hover dark:border-border/60 dark:bg-slate-900/70 dark:hover:bg-slate-900/90"
                      }`}
                    >
                      {/* Left & Right Connector Pins */}
                      {hasPrereqs && (
                        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-card dark:border-slate-900 bg-amber-400" />
                      )}
                      {task.dependencies && task.dependencies.length > 0 && (
                        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-card dark:border-slate-900 bg-indigo-400" />
                      )}

                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                            {task.code || "TASK"}
                          </span>
                          {mine && (
                            <span className="rounded bg-cyan-100 border border-cyan-300 px-1 py-0.2 text-[9px] font-bold text-cyan-800 dark:bg-cyan-500/20 dark:border-cyan-500/40 dark:text-cyan-300">
                              BẠN
                            </span>
                          )}
                        </div>

                        <span
                          className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isDone
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : isBlocked
                                ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
                                : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-muted-foreground"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : isBlocked ? (
                            <AlertTriangle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          {status}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-foreground line-clamp-2 mb-2">
                        {task.title}
                      </h4>

                      {/* Dependency Badge */}
                      {hasPrereqs && (
                        <div className="mb-2">
                          {!allPrereqsDone ? (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] text-amber-800 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-300">
                              <Lock className="h-3 w-3 shrink-0" />
                              {t("dependencyPrereq")} ({task.dependsOn?.length})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] text-emerald-800 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-300">
                              <Unlock className="h-3 w-3 shrink-0" />
                              {t("dependencyUnlocked")}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Assignee Footer */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-[11px] text-muted">
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
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
