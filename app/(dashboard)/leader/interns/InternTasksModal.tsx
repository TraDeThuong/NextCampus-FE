"use client";

import { useState } from "react";
import { X, FileText, Link, Calendar, Flag, User, Layers, Circle, ChevronRight } from "lucide-react";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import { useTask } from "@/hooks/task/useTask";
import type { Intern } from "@/types/intern";
import type { TaskAssignment } from "@/types/task-assignment";
import Spinner from "@/components/ui/Spinner";

type Props = {
  intern: Intern;
  onClose: () => void;
};

const priorityBadge: Record<string, string> = {
  HIGH: "bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
  LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
};

const statusBadge: Record<string, string> = {
  DONE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  IN_PROGRESS: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  REVIEW: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  TODO: "border-slate-700 bg-slate-800/50 text-slate-400",
  BLOCKED: "border-red-500/30 bg-red-500/10 text-red-300",
  PENDING_APPROVAL: "border-amber-500/30 bg-amber-500/10 text-amber-300",
};

export default function InternTasksModal({ intern, onClose }: Props) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { data: assignmentsData, isLoading: listLoading } = useTaskAssignments({
    internId: intern.id,
    limit: 100,
  });
  const { data: taskData, isLoading: taskLoading } = useTask(
    selectedTaskId ?? undefined,
  );

  const assignments = assignmentsData?.data ?? [];
  const task = taskData?.data ?? null;
  const selectedAssignment = assignments.find((a) => a.taskId === selectedTaskId);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
    >
      {/* Khung Metal Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-5xl h-[80vh] flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] text-slate-100"
      >
        {/* Lớp phản quang kim loại & Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03),_transparent)]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />
        
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-900/40 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-lg font-bold tracking-wide uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Tasks // {intern.fullName}
              </h2>
            </div>
            <p className="mt-0.5 text-xs font-mono text-slate-500">
              [ Total: {assignments.length} UNIT{assignments.length !== 1 ? "S" : ""} ]
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="group flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 transition-all duration-300 hover:border-slate-600 hover:bg-slate-800 active:scale-95 shadow-inner"
          >
            <X className="h-4 w-4 text-slate-400 transition-colors group-hover:text-white" />
          </button>
        </div>

        {/* Body chính chia 2 cột */}
        <div className="flex flex-1 overflow-hidden relative">
          {listLoading ? (
            <div className="flex w-full items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex w-full flex-col items-center justify-center py-12 text-slate-500">
              <FileText className="h-10 w-10 stroke-[1.2] mb-2 opacity-40" />
              <p className="text-sm font-mono tracking-wide">NO TASKS ALLOCATED</p>
            </div>
          ) : (
            <>
              {/* CỘT TRÁI: Danh sách Task (Scrollable) */}
              <div className="w-2/5 border-r border-slate-800/80 overflow-y-auto p-4 space-y-2 bg-slate-950/40 custom-scrollbar">
                <div className="px-2 pb-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono">
                  Task Registry
                </div>
                {assignments.map((a) => (
                  <TaskRowButton
                    key={a.id}
                    assignment={a}
                    isSelected={selectedTaskId === a.taskId}
                    onClick={() => setSelectedTaskId(selectedTaskId === a.taskId ? null : a.taskId)}
                  />
                ))}
              </div>

              {/* CỘT PHẢI: Chi tiết Task */}
              <div className="w-3/5 overflow-y-auto p-6 bg-slate-900/20 custom-scrollbar relative">
                {selectedTaskId ? (
                  taskLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <Spinner size="md" />
                    </div>
                  ) : task ? (
                    <TaskDetailPanel task={task} assignment={selectedAssignment} />
                  ) : (
                    <p className="text-center text-sm font-mono text-red-400/80 py-12">
                      CRITICAL: Failed to fetch task metadata.
                    </p>
                  )
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-slate-600">
                    <Layers className="h-12 w-12 stroke-[1] mb-2 opacity-20 animate-pulse" />
                    <p className="text-xs font-mono tracking-wider uppercase">Select a task row to inspect blueprint</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   COMPONENT: TASK ROW BUTTON (CỘT TRÁI)
   ========================================== */
function TaskRowButton({
  assignment,
  isSelected,
  onClick,
}: {
  assignment: TaskAssignment;
  isSelected: boolean;
  onClick: () => void;
}) {
  const statusColors: Record<string, string> = {
    DONE: "bg-emerald-400/20",
    IN_PROGRESS: "bg-blue-400/20",
    REVIEW: "bg-purple-400/20",
    TODO: "bg-slate-700/40",
    BLOCKED: "bg-red-400/20",
    PENDING_APPROVAL: "bg-amber-400/20",
  };

  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all duration-200 ${
        isSelected
          ? "border-cyan-500/50 bg-gradient-to-r from-slate-900 to-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] text-white"
          : "border-slate-850 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:bg-slate-900/80"
      }`}
    >
      {/* Thanh hiển thị trạng thái viền trái dạng Metal Tag */}
      <div className={`absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r-full transition-all ${
        isSelected ? "bg-cyan-400" : (statusColors[assignment.status] || "bg-slate-700")
      }`} />

      <div className="pl-2 space-y-1 overflow-hidden pr-2">
        <div className="font-mono text-xs font-bold tracking-wider text-slate-300 group-hover:text-cyan-400 transition-colors">
          {assignment.task.code || "UNTITLED-UNIT"}
        </div>
        <div className="truncate text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
          {assignment.task.title}
        </div>
      </div>

      <ChevronRight className={`h-4 w-4 shrink-0 text-slate-600 transition-transform ${
        isSelected ? "translate-x-0.5 text-cyan-400" : "group-hover:translate-x-0.5"
      }`} />
    </button>
  );
}

/* ==========================================
   COMPONENT: PANEL DETAIL (CỘT PHẢI)
   ========================================== */
function TaskDetailPanel({
  task,
  assignment,
}: {
  task: NonNullable<ReturnType<typeof useTask>["data"]>["data"];
  assignment: TaskAssignment | undefined;
}) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="space-y-2 border-b border-slate-800/60 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-md shadow-inner">
            {task.code ?? "N/A"}
          </span>
          {assignment && (
            <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-mono uppercase font-bold tracking-wider ${statusBadge[assignment.status] ?? ""}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              {assignment.status.replace("_", " ")}
            </span>
          )}
          <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-mono uppercase font-bold tracking-wider ${priorityBadge[task.priority] ?? ""}`}>
            {task.priority}
          </span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-white">{task.title}</h3>
      </div>

      {/* Grid Specs Kim Loại Mịn */}
      <div className="grid grid-cols-2 gap-3 bg-slate-950/40 border border-slate-850 p-4 rounded-xl shadow-inner">
        <DetailGridRow icon={Calendar} label="Target Deadline" value={new Date(task.deadline).toLocaleDateString("en-GB")} />
        <DetailGridRow icon={User} label="Assigned By" value={task.creator.fullName ?? task.creator.email} />
        <DetailGridRow icon={Layers} label="Architecture Group" value={task.taskGroup?.name ?? "—"} />
        <DetailGridRow 
          icon={Calendar} 
          label="Activation Date" 
          value={task.startDate ? new Date(task.startDate).toLocaleDateString("en-GB") : "—"} 
        />
        {task.estDays && (
          <div className="col-span-2 mt-1 pt-2 border-t border-slate-850">
            <DetailGridRow label="Estimated Duration" value={`${task.estDays} System Days`} />
          </div>
        )}
      </div>

      {/* Description & Criteria blocks */}
      <div className="space-y-4 font-sans">
        {task.description && (
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold uppercase font-mono tracking-widest text-slate-500">Project Objective</h4>
            <div className="rounded-xl border border-slate-850 bg-slate-900/30 p-3.5 text-sm text-slate-400 leading-relaxed">
              {task.description}
            </div>
          </div>
        )}

        {task.acceptanceCriteria && (
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold uppercase font-mono tracking-widest text-slate-500">Acceptance Criteria</h4>
            <div className="rounded-xl border border-slate-850 bg-slate-900/30 p-3.5 text-sm text-slate-400 leading-relaxed font-mono whitespace-pre-line">
              {task.acceptanceCriteria}
            </div>
          </div>
        )}

        {task.taskNotes && (
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold uppercase font-mono tracking-widest text-slate-500">Execution Notes</h4>
            <div className="rounded-xl border border-slate-850 bg-slate-950/40 p-3.5 text-sm text-amber-400/80 leading-relaxed italic">
              {task.taskNotes}
            </div>
          </div>
        )}
      </div>

      {/* Attachments Section */}
      {task.attachments.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-[10px] font-bold uppercase font-mono tracking-widest text-slate-500">
            Connected Vaults ({task.attachments.length})
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {task.attachments.map((att) => (
              <a
                key={att.id}
                href={att.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-xs text-slate-300 transition-all hover:border-cyan-500/40 hover:bg-slate-900 hover:text-cyan-400"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Link className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-cyan-400" />
                  <span className="truncate font-mono">{att.fileName}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-600 group-hover:text-cyan-500 uppercase border border-slate-800 px-1.5 py-0.5 rounded bg-slate-950/60 transition-colors ml-2 shrink-0">
                  Open External
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Helper Row Component */
function DetailGridRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 p-1">
      <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono tracking-wider uppercase text-slate-500">
        {Icon && <Icon className="h-3 w-3 shrink-0 text-slate-500" />}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-slate-200 mt-0.5">{value}</div>
    </div>
  );
}