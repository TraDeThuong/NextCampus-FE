"use client";

import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, Calendar, RefreshCw, Loader2, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { AuthContext } from "@/contexts/AuthContext";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import { useInterns } from "@/hooks/intern/useInterns";
import { taskService } from "@/services/task.service";
import { taskAssignmentService } from "@/services/task-assignment.service";
import type { Intern } from "@/types/intern";
import type { TaskAssignment } from "@/types/task-assignment";
import type { CreateTaskPayload } from "@/types/task";
import Spinner from "@/components/ui/Spinner";

type Props = { intern: Intern; onClose: () => void };

const statusBadge: Record<string, string> = {
  DONE: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  IN_PROGRESS: "border-blue-400/20 bg-blue-500/10 text-blue-300",
  REVIEW: "border-purple-400/20 bg-purple-500/10 text-purple-300",
  TODO: "border-white/10 bg-white/5 text-slate-400",
  BLOCKED: "border-red-400/20 bg-red-500/10 text-red-300",
  PENDING_APPROVAL: "border-amber-400/20 bg-amber-500/10 text-amber-300",
};

function daysAgo(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const TODAY = new Date().toISOString().split("T")[0];

export default function InternOverdueModal({ intern, onClose }: Props) {
  const t = useTranslations("leader.interns");
  const auth = useContext(AuthContext);
  const currentUserId = auth?.state.user?.id;

  const { data: assignmentsData, isLoading: listLoading } = useTaskAssignments({ internId: intern.id, limit: 100 });
  const { data: myInternsData } = useInterns({ leaderId: currentUserId });

  const now = new Date();
  const allAssignments = assignmentsData?.data ?? [];
  const overdueAssignments = allAssignments.filter(
    (a) => a.task.deadline && new Date(a.task.deadline) < now && a.status !== "DONE",
  );
  const myInterns = myInternsData?.data ?? [];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0e1a] p-4">
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-red-400/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/60 to-transparent" />

        <div className="relative p-6 overflow-y-auto max-h-[85vh]">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                <span className="metal-text">{t("overdueModalTitle")}</span>
              </h2>
              <p className="mt-1 text-sm text-muted">
                {t("overdueModalCount", { name: intern.fullName, count: overdueAssignments.length, plural: overdueAssignments.length !== 1 ? "s" : "" })}
              </p>
            </div>
            <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all hover:rotate-90 hover:border-white/20 hover:bg-white/10">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {listLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : overdueAssignments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">{t("overdueModalEmpty")}</p>
          ) : (
            <div className="space-y-3">
              {overdueAssignments.map((a) => (
                <OverdueTaskCard key={a.id} assignment={a} myInterns={myInterns} currentIntern={intern} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

type RecreatePhase = "idle" | "choosing" | "creating" | "done";

function OverdueTaskCard({ assignment, myInterns, currentIntern }: { assignment: TaskAssignment; myInterns: Intern[]; currentIntern: Intern }) {
  const t = useTranslations("leader.interns");
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<RecreatePhase>("idle");
  const [recreateInternId, setRecreateInternId] = useState(currentIntern.id);
  const [recreateDeadline, setRecreateDeadline] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split("T")[0];
  });

  const recreateMutation = useMutation({
    mutationFn: async (internId: string) => {
      const task = assignment.task;
      const payload: CreateTaskPayload = { title: task.title, description: task.description ?? undefined, deadline: recreateDeadline, priority: task.priority as CreateTaskPayload["priority"] };
      const taskResult = await taskService.createTask(payload);
      await taskAssignmentService.createAssignment({ taskId: taskResult.data.id, internId });
      await taskService.updateTask(assignment.taskId, { recreatedTaskId: taskResult.data.id });
      return taskResult.data.id;
    },
    onSuccess: (_newTaskId, internId) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      const targetName = internId === currentIntern.id ? currentIntern.fullName : myInterns.find((i) => i.id === internId)?.fullName ?? "another intern";
      setPhase("done");
      toast.success(t("overdueModalRecreatedToast", { title: assignment.task.title, name: targetName }));
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.message ?? axiosErr?.message ?? t("overdueModalRecreateError");
      toast.error(msg);
      setPhase("idle");
    },
  });

  const overdue = daysAgo(assignment.task.deadline);
  const isPermanentlyRecreated = !!assignment.task.recreatedTaskId;
  const rt = assignment.task.recreatedTask;

  function handleConfirm() {
    if (recreateMutation.isPending) return;
    if (!recreateDeadline || recreateDeadline < TODAY) {
      toast.error(t("overdueModalDeadlinePast"));
      return;
    }
    setPhase("creating");
    recreateMutation.mutate(recreateInternId);
  }

  return (
    <div className="rounded-2xl border border-red-400/20 bg-red-500/[0.04] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-500">{assignment.task.code || "—"}</span>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadge[assignment.status] ?? ""}`}>
              {assignment.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-sm font-medium text-white">{assignment.task.title}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400 font-medium">
            <Calendar className="h-3.5 w-3.5" />
            <span>{t("overdueModalDeadline", { date: new Date(assignment.task.deadline).toLocaleDateString("en-GB") })}</span>
            <span className="text-red-400/70">{t("overdueModalDaysAgo", { days: overdue, plural: overdue !== 1 ? "s" : "" })}</span>
          </div>
        </div>

        <div className="shrink-0">
          {isPermanentlyRecreated ? (
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              <CheckCircle className="h-3.5 w-3.5" />{t("overdueModalRecreated")}
            </div>
          ) : (
            <>
              {phase === "idle" && (
                <button onClick={() => { setRecreateInternId(currentIntern.id); setRecreateDeadline(() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split("T")[0]; }); setPhase("choosing"); }}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20">
                  <RefreshCw className="h-3.5 w-3.5" />{t("overdueModalRecreate")}
                </button>
              )}
              {phase === "creating" && <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />}
              {phase === "done" && (
                <div className="flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  <CheckCircle className="h-3.5 w-3.5" />{t("overdueModalDone")}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {phase === "choosing" && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted shrink-0">{t("overdueModalAssignTo")}</span>
            <select value={recreateInternId} onChange={(e) => setRecreateInternId(e.target.value)} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none">
              <option value={currentIntern.id}>{currentIntern.fullName} {t("overdueModalCurrent")}</option>
              {myInterns.filter((i) => i.id !== currentIntern.id).map((i) => (
                <option key={i.id} value={i.id}>{i.fullName}</option>
              ))}
            </select>
            <button onClick={handleConfirm} className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-cyan-500">{t("overdueModalConfirm")}</button>
            <button onClick={() => setPhase("idle")} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:text-white">{t("overdueModalCancel")}</button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted shrink-0">{t("overdueModalDeadlineLabel")}</span>
            <input type="date" value={recreateDeadline} min={TODAY} onChange={(e) => setRecreateDeadline(e.target.value)} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none" />
          </div>
        </div>
      )}

      {isPermanentlyRecreated && rt && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle className="h-3.5 w-3.5" />
          {t("overdueModalRecreatedFor", { code: rt.code || rt.title, name: rt.assignment?.intern?.fullName ?? "" })}
        </div>
      )}
    </div>
  );
}
