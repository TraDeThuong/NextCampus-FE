"use client";

import { useState, useMemo, useCallback } from "react";
import { FileText, Calendar, User, Layers, Link, ChevronRight, Clock, Send, Pencil, Video, Play, Loader2, AlertTriangle, Paperclip } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import { useUpdateTaskAssignment } from "@/hooks/task-assignment/useUpdateTaskAssignment";
import { useTask } from "@/hooks/task/useTask";
import { useTaskSubmissions } from "@/hooks/task-submission/useTaskSubmissions";
import type { TaskAssignment } from "@/types/task-assignment";
import type { TaskSubmission } from "@/types/task-submission";
import Spinner from "@/components/ui/Spinner";
import TaskSubmissionModal from "./TaskSubmissionModal";

const priorityBadge: Record<string, string> = { HIGH: "bg-red-500/10 text-red-400 border-red-500/30", MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/30", LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
const statusBadge: Record<string, string> = { DONE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300", IN_PROGRESS: "border-blue-500/30 bg-blue-500/10 text-blue-300", REVIEW: "border-purple-500/30 bg-purple-500/10 text-purple-300", TODO: "border-slate-700 bg-slate-800/50 text-slate-400", BLOCKED: "border-red-500/30 bg-red-500/10 text-red-300", PENDING_APPROVAL: "border-amber-500/30 bg-amber-500/10 text-amber-300" };

export default function InternTaskTable() {
  const t = useTranslations("intern.tasks");
  const searchParams = useSearchParams(); const router = useRouter();
  const deadlineFrom = searchParams.get("deadlineFrom"); const deadlineTo = searchParams.get("deadlineTo");
  const assignmentId = searchParams.get("assignmentId");
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<TaskSubmission | undefined>(undefined);
  const [isSubmissionReadOnly, setIsSubmissionReadOnly] = useState(false);

  const updateParams = useCallback((key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams.toString()); if (value) p.set(key, value); else p.delete(key); return p.toString();
  }, [searchParams]);

  const { data: assignmentsData, isLoading: listLoading } = useTaskAssignments({ limit: 100 });
  const assignments = useMemo(() => assignmentsData?.data ?? [], [assignmentsData?.data]);
  const sortedAssignments = useMemo(() => {
    let filtered = [...assignments];
    if (deadlineFrom || deadlineTo) {
      filtered = filtered.filter((a) => { const d = new Date(a.task.deadline); if (deadlineFrom && d < new Date(deadlineFrom)) return false; if (deadlineTo) { const to = new Date(deadlineTo); to.setHours(23, 59, 59, 999); if (d > to) return false; } return true; });
    }
    return filtered.sort((a, b) => {
      const timeA = new Date(a.assignedAt).getTime();
      const timeB = new Date(b.assignedAt).getTime();
      if (timeA !== timeB) return timeB - timeA;

      const taskTimeA = new Date(a.task.createdAt).getTime();
      const taskTimeB = new Date(b.task.createdAt).getTime();
      if (taskTimeA !== taskTimeB) return taskTimeB - taskTimeA;

      return (b.task.code || "").localeCompare(a.task.code || "");
    });
  }, [assignments, deadlineFrom, deadlineTo]);

  const selectedAssignment = assignmentId ? sortedAssignments.find((a) => a.id === assignmentId) : undefined;
  const { data: taskData, isLoading: taskLoading } = useTask(selectedAssignment?.taskId);
  const task = taskData?.data ?? null;

  const handleSelectAssignment = (aId: string) => { const query = updateParams("assignmentId", aId === assignmentId ? null : aId); router.replace(`?${query}`, { scroll: false }); };

  return (
    <>
    <div className="relative flex w-full h-[75vh] flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] text-slate-100">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03),_transparent)]" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-cyan-500/5 blur-[120px]" />

      <div className="relative flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-900/40 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" /><h2 className="text-lg font-bold tracking-wide uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">{t("taskRegistry")}</h2></div>
          <p className="mt-0.5 text-xs font-mono text-slate-500">[ {t("totalUnits", { n: sortedAssignments.length })} ]</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {listLoading ? <div className="flex w-full items-center justify-center"><Spinner size="lg" /></div> :
         sortedAssignments.length === 0 ? <div className="flex w-full flex-col items-center justify-center py-12 text-slate-500"><FileText className="h-10 w-10 stroke-[1.2] mb-2 opacity-40" /><p className="text-sm font-mono tracking-wide">{t("noTasksAllocated")}</p></div> :
         <>
           <div className="w-1/4 border-r border-slate-800/80 overflow-y-auto p-4 space-y-2 bg-slate-950/40 custom-scrollbar">
             <div className="px-2 pb-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono">{t("taskRegistry")}</div>
             {sortedAssignments.map((a) => <TaskRowButton key={a.id} assignment={a} isSelected={assignmentId === a.id} onClick={() => handleSelectAssignment(a.id)} />)}
           </div>
           <div className="w-3/4 overflow-y-auto p-6 bg-slate-900/20 relative custom-scrollbar">
             {assignmentId ? (
               taskLoading ? <div className="flex h-full items-center justify-center"><Spinner size="md" /></div> :
               task ? <TaskDetailPanel task={task} assignment={selectedAssignment} onOpenSubmission={() => { setEditingSubmission(undefined); setIsSubmissionReadOnly(false); setShowSubmissionModal(true); }} onViewSubmission={(sub) => { setEditingSubmission(sub); setIsSubmissionReadOnly(true); setShowSubmissionModal(true); }} onEditSubmission={(sub) => { setEditingSubmission(sub); setIsSubmissionReadOnly(false); setShowSubmissionModal(true); }} /> :
               selectedAssignment ? <TaskDetailPanel task={null} assignment={selectedAssignment} onOpenSubmission={() => { setEditingSubmission(undefined); setIsSubmissionReadOnly(false); setShowSubmissionModal(true); }} onViewSubmission={(sub) => { setEditingSubmission(sub); setIsSubmissionReadOnly(true); setShowSubmissionModal(true); }} onEditSubmission={(sub) => { setEditingSubmission(sub); setIsSubmissionReadOnly(false); setShowSubmissionModal(true); }} /> :
               <p className="text-center text-sm font-mono text-red-400/80 py-12">{t("failedToLoad")}</p>
             ) : (
               <div className="flex h-full flex-col items-center justify-center text-slate-600"><Layers className="h-12 w-12 stroke-[1] mb-2 opacity-20" /><p className="text-xs font-mono tracking-wider uppercase">{t("selectTask")}</p></div>
             )}
           </div>
         </>}
      </div>
    </div>

    {showSubmissionModal && selectedAssignment && <TaskSubmissionModal assignmentId={selectedAssignment.id} submission={editingSubmission} readOnly={isSubmissionReadOnly} onClose={() => { setShowSubmissionModal(false); setEditingSubmission(undefined); setIsSubmissionReadOnly(false); }} />}
    </>);
}

function TaskRowButton({ assignment, isSelected, onClick }: { assignment: TaskAssignment; isSelected: boolean; onClick: () => void }) {
  const statusColors: Record<string, string> = { DONE: "bg-emerald-400/20", IN_PROGRESS: "bg-blue-400/20", REVIEW: "bg-purple-400/20", TODO: "bg-slate-700/40", BLOCKED: "bg-red-400/20", PENDING_APPROVAL: "bg-amber-400/20" };
  return (
    <button onClick={onClick} className={`group relative flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition-all duration-200 ${isSelected ? "border-cyan-500/50 bg-gradient-to-r from-slate-900 to-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] text-white" : "border-slate-850 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:bg-slate-900/80"}`}>
      <div className={`absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r-full transition-all ${isSelected ? "bg-cyan-400" : statusColors[assignment.status] || "bg-slate-700"}`} />
      <div className="pl-2 space-y-1 overflow-hidden pr-2">
        <div className="font-mono text-xs font-bold tracking-wider text-slate-300 group-hover:text-cyan-400 transition-colors">{assignment.task.code || "UNTITLED"}</div>
        <div className="truncate text-xs text-slate-500 group-hover:text-slate-400 transition-colors">{assignment.task.title}</div>
        <div className="flex items-center gap-1 text-[10px] text-slate-600"><Clock className="h-3 w-3" />{new Date(assignment.task.deadline).toLocaleDateString("en-GB")}</div>
      </div>
      <ChevronRight className={`h-4 w-4 shrink-0 text-slate-600 transition-transform ${isSelected ? "translate-x-0.5 text-cyan-400" : "group-hover:translate-x-0.5"}`} />
    </button>
  );
}

function TaskDetailPanel({ task, assignment, onOpenSubmission, onViewSubmission, onEditSubmission }: { task: NonNullable<ReturnType<typeof useTask>["data"]>["data"] | null; assignment: TaskAssignment | undefined; onOpenSubmission: () => void; onViewSubmission: (sub: TaskSubmission) => void; onEditSubmission: (sub: TaskSubmission) => void }) {
  const t = useTranslations("intern.tasks");
  const basicTask = task ?? assignment?.task;
  const updateAssignment = useUpdateTaskAssignment();
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockedReason, setBlockedReason] = useState("");
  const { data: submissionsData } = useTaskSubmissions(assignment ? { assignmentId: assignment.id, limit: 20, sortBy: "attempt", order: "desc" } : undefined);
  const submissions = submissionsData?.data ?? []; const latestSubmission = submissions[0] ?? null;
  if (!basicTask) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-2 border-b border-slate-800/60 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-md">{basicTask.code ?? "N/A"}</span>
            {assignment && <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-mono uppercase font-bold tracking-wider ${statusBadge[assignment.status] ?? ""}`}><span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />{assignment.status.replace("_", " ")}</span>}
            <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-mono uppercase font-bold tracking-wider ${priorityBadge[basicTask.priority] ?? ""}`}>{basicTask.priority}</span>
          </div>
          {assignment?.status === "IN_PROGRESS" && latestSubmission?.reviewStatus !== "PENDING" && (
            <button onClick={onOpenSubmission} className="flex shrink-0 items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20"><Send className="h-3.5 w-3.5" />{t("submitWork")}</button>
          )}
        </div>
        <h3 className="text-xl font-bold tracking-tight text-white">{basicTask.title}</h3>
      </div>

      {assignment?.status === "TODO" && (
        <div className="flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
          <Play className="h-4 w-4 text-cyan-400" />
          <span className="text-xs text-cyan-300 flex-1">{t("readyToStart")}</span>
          <button onClick={() => updateAssignment.mutate({ id: assignment.id, payload: { status: "IN_PROGRESS" } })} disabled={updateAssignment.isPending} className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50">
            {updateAssignment.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}{t("startWorking")}
          </button>
        </div>
      )}

      {assignment?.status === "BLOCKED" && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-rose-300">{t("blockedMsg")}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">
                {assignment.blockedReason || t("blockedReasonMissing")}
              </p>
            </div>
          </div>
        </div>
      )}

      {assignment?.status === "IN_PROGRESS" && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          {!showBlockForm ? (
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="flex-1 text-xs text-amber-200">{t("blockTaskHint")}</span>
              <button
                type="button"
                onClick={() => setShowBlockForm(true)}
                className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20"
              >
                {t("blockTask")}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label htmlFor={`blocked-reason-${assignment.id}`} className="text-xs font-semibold text-amber-200">
                  {t("blockReason")}
                </label>
                <textarea
                  id={`blocked-reason-${assignment.id}`}
                  value={blockedReason}
                  onChange={(event) => setBlockedReason(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  autoFocus
                  placeholder={t("blockReasonPlaceholder")}
                  className="mt-2 w-full resize-y rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-amber-400/50"
                />
                <p className="mt-1 text-right text-[10px] text-slate-500">{blockedReason.length}/2000</p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowBlockForm(false); setBlockedReason(""); }}
                  disabled={updateAssignment.isPending}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {t("cancelBlock")}
                </button>
                <button
                  type="button"
                  onClick={() => updateAssignment.mutate(
                    { id: assignment.id, payload: { status: "BLOCKED", blockedReason: blockedReason.trim() } },
                    { onSuccess: () => { setShowBlockForm(false); setBlockedReason(""); } },
                  )}
                  disabled={updateAssignment.isPending || blockedReason.trim().length === 0}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updateAssignment.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {t("confirmBlock")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 bg-slate-950/40 border border-slate-850 p-4 rounded-xl">
        <DetailRow icon={Calendar} label={t("targetDeadline")} value={new Date(basicTask.deadline).toLocaleDateString("en-GB")} />
        <DetailRow icon={Calendar} label={t("assignedAt")} value={assignment ? new Date(assignment.assignedAt).toLocaleDateString("en-GB") : "—"} />
        <DetailRow icon={User} label={t("assignedBy")} value={assignment?.assigner?.fullName ?? "—"} />
        <DetailRow icon={User} label={t("support")} value={assignment?.support?.fullName ?? "—"} />
        {task && <DetailRow icon={Layers} label={t("group")} value={task.taskGroup?.name ?? "—"} />}
        {task?.startDate && <DetailRow icon={Calendar} label={t("startDate")} value={new Date(task.startDate).toLocaleDateString("en-GB")} />}
        {task?.estDays && <div className="col-span-2 mt-1 pt-2 border-t border-slate-850"><DetailRow label={t("estDuration")} value={t("days", { n: task.estDays })} /></div>}
      </div>

      {basicTask.description && <div className="space-y-1.5"><h4 className="text-[10px] font-bold uppercase font-mono tracking-widest text-slate-500">{t("description")}</h4><div className="rounded-xl border border-slate-850 bg-slate-900/30 p-3.5 text-sm text-slate-400 leading-relaxed">{basicTask.description}</div></div>}
      {task?.acceptanceCriteria && <div className="space-y-1.5"><h4 className="text-[10px] font-bold uppercase font-mono tracking-widest text-slate-500">{t("acceptanceCriteria")}</h4><div className="rounded-xl border border-slate-850 bg-slate-900/30 p-3.5 text-sm text-slate-400 leading-relaxed font-mono whitespace-pre-line">{task.acceptanceCriteria}</div></div>}
      {task?.taskNotes && <div className="space-y-1.5"><h4 className="text-[10px] font-bold uppercase font-mono tracking-widest text-slate-500">{t("notes")}</h4><div className="rounded-xl border border-slate-850 bg-slate-950/40 p-3.5 text-sm text-amber-400/80 leading-relaxed italic">{task.taskNotes}</div></div>}

      {task && task.attachments.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-[10px] font-bold uppercase font-mono tracking-widest text-slate-500">{t("attachments", { n: task.attachments.length })}</h4>
          <div className="grid grid-cols-1 gap-2">{task.attachments.map((att) => <a key={att.id} href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-xs text-slate-300 transition-all hover:border-cyan-500/40 hover:bg-slate-900 hover:text-cyan-400"><div className="flex items-center gap-2.5 overflow-hidden"><Link className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-cyan-400" /><span className="truncate font-mono">{att.fileName}</span></div><span className="text-[10px] font-mono text-slate-600 group-hover:text-cyan-500 uppercase border border-slate-800 px-1.5 py-0.5 rounded bg-slate-950/60 transition-colors ml-2 shrink-0">{t("open")}</span></a>)}</div>
        </div>
      )}

      {submissions.length > 0 && (
        <div className="space-y-3 pt-4 border-t-2 border-slate-700/50">
          <div className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-cyan-400" /><h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">{t("submissionHistory", { n: submissions.length })}</h4></div>
          <div className="space-y-3">
            {submissions.map((sub) => {
              const isLatest = sub.id === latestSubmission?.id;
              return (
                <div key={sub.id} className={`rounded-xl border p-4 ${isLatest ? "border-cyan-500/40 bg-gradient-to-r from-cyan-500/5 to-transparent" : "border-slate-800 bg-slate-900/40"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-300">#{sub.attempt}</span>
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase ${sub.reviewStatus === "APPROVED" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : sub.reviewStatus === "REJECTED" ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-amber-500/40 bg-amber-500/10 text-amber-300"}`}>{sub.reviewStatus}</span>
                      {isLatest && <span className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded">{t("latest")}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">{new Date(sub.submittedAt).toLocaleString("en-GB")}</span>
                      <button onClick={() => onViewSubmission(sub)} className="text-[11px] text-cyan-400 hover:text-cyan-300 transition">{t("view")}</button>
                      {sub.reviewStatus === "PENDING" && isLatest && <button onClick={() => onEditSubmission(sub)} className="flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300 transition hover:border-amber-400/50 hover:bg-amber-500/20"><Pencil className="h-3 w-3" />{t("edit")}</button>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {sub.prLink && <a href={sub.prLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition"><Link className="h-3 w-3 shrink-0" /><span className="truncate">{sub.prLink}</span></a>}
                    {sub.videoDemo && <a href={sub.videoDemo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition"><Video className="h-3 w-3 shrink-0" /><span className="truncate">Video Demo</span></a>}
                    {sub.attachments.length > 0 && <div className="space-y-1.5"><div className="flex items-center gap-1.5 text-xs text-slate-400"><Paperclip className="h-3 w-3 shrink-0" /><span>{t("attachments", { n: sub.attachments.length })}</span></div><div className="flex flex-wrap gap-1.5 pl-4.5">{sub.attachments.map((attachment) => <a key={attachment.id} href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" title={attachment.fileName} className="max-w-full truncate rounded-md border border-slate-700 bg-slate-950/60 px-2 py-1 text-[11px] text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-300">{attachment.fileName}</a>)}</div></div>}
                    {sub.note && <p className="text-xs text-slate-400 leading-relaxed">{sub.note}</p>}
                    {sub.reviewComment && <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2"><p className="text-[10px] text-amber-400/70 uppercase tracking-wider mb-0.5">{t("reviewComment")}</p><p className="text-xs text-amber-300 italic">{sub.reviewComment}</p></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon?: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5 p-1"><div className="flex items-center gap-1.5 text-[10px] font-bold font-mono tracking-wider uppercase text-slate-500">{Icon && <Icon className="h-3 w-3 shrink-0 text-slate-500" />}<span>{label}</span></div><div className="text-sm font-medium text-slate-200 mt-0.5">{value}</div></div>;
}
