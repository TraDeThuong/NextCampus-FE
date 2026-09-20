"use client";

import { useState, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, Calendar, RefreshCw, Loader2, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import { AuthContext } from "@/contexts/AuthContext";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import { useInterns } from "@/hooks/intern/useInterns";
import { taskService } from "@/services/task.service";
import { taskAssignmentService } from "@/services/task-assignment.service";
import type { Intern } from "@/types/intern";
import type { TaskAssignment } from "@/types/task-assignment";
import type { CreateTaskPayload } from "@/types/task";
import Spinner from "@/components/ui/Spinner";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";

type Props = { intern: Intern; onClose: () => void };

const statusBadge: Record<string, string> = {
  DONE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  IN_PROGRESS: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  REVIEW: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  TODO: "border-border bg-card/60 text-muted",
  BLOCKED: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  PENDING_APPROVAL: "border-amber-500/30 bg-amber-500/10 text-amber-300",
};

function daysAgo(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "data" in data && Array.isArray((data as { data: unknown }).data)) {
    return (data as { data: T[] }).data;
  }
  return [];
}

const TODAY = new Date().toISOString().split("T")[0];

export default function InternOverdueModal({ intern, onClose }: Props) {
  const t = useTranslations("leader.interns");
  const auth = useContext(AuthContext);
  const currentUserId = auth?.state.user?.id;

  const { data: assignmentsData, isLoading: listLoading } = useTaskAssignments({
    internId: intern.id,
    limit: 100,
  });
  const { data: myInternsData } = useInterns(currentUserId ? { leaderId: currentUserId } : undefined);

  const now = new Date();
  const allAssignments = extractArray<TaskAssignment>(assignmentsData?.data);
  const overdueAssignments = allAssignments.filter(
    (a) => a.task.deadline && new Date(a.task.deadline) < now && a.status !== "DONE",
  );
  const myInterns = extractArray<Intern>(myInternsData?.data);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl text-foreground"
      >
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />

        <div className="relative p-6 overflow-y-auto max-h-[85vh]">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                <h2 className="text-xl font-bold tracking-tight metal-text">
                  {t("overdueModalTitle")}
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted">
                {t("overdueModalCount", {
                  name: intern.fullName,
                  count: overdueAssignments.length,
                  plural: overdueAssignments.length !== 1 ? "s" : "",
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card/60 transition-all hover:bg-card hover:text-foreground active:scale-95 shadow-sm text-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {listLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : overdueAssignments.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">
              {t("overdueModalEmpty")}
            </p>
          ) : (
            <div className="space-y-3">
              {overdueAssignments.map((a) => (
                <OverdueTaskCard
                  key={a.id}
                  assignment={a}
                  myInterns={myInterns}
                  currentIntern={intern}
                />
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

function OverdueTaskCard({
  assignment,
  myInterns,
  currentIntern,
}: {
  assignment: TaskAssignment;
  myInterns: Intern[];
  currentIntern: Intern;
}) {
  const t = useTranslations("leader.interns");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<RecreatePhase>("idle");
  const [recreateInternId, setRecreateInternId] = useState(currentIntern.id);
  const [recreateDeadline, setRecreateDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [recreateEstDays, setRecreateEstDays] = useState(assignment.task.estDays ?? 3);

  const recreateMutation = useMutation({
    mutationFn: async (internId: string) => {
      const task = assignment.task;
      const payload: CreateTaskPayload = {
        title: task.title,
        description: task.description ?? undefined,
        deadline: recreateDeadline,
        startDate: TODAY,
        estDays: recreateEstDays,
        priority: task.priority as CreateTaskPayload["priority"],
      };
      const taskResult = await taskService.createTask(payload);
      await taskAssignmentService.createAssignment({ taskId: taskResult.data.id, internId });
      await taskService.updateTask(assignment.taskId, { recreatedTaskId: taskResult.data.id });
      return taskResult.data.id;
    },
    onSuccess: (_newTaskId, internId) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      const targetName =
        internId === currentIntern.id
          ? currentIntern.fullName
          : myInterns.find((i) => i.id === internId)?.fullName ?? "another intern";
      setPhase("done");
      toast.success(
        t("overdueModalRecreatedToast", {
          title: assignment.task.title,
          name: targetName,
        }),
      );
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.message ?? axiosErr?.message ?? t("overdueModalRecreateError");
      toast.error(msg);
      setPhase("idle");
    },
  });

  const overdue = daysAgo(assignment.task.deadline);
  const isPermanentlyRecreated = Boolean(assignment.task.recreatedTaskId);
  const rt = assignment.task.recreatedTask;

  function handleConfirm() {
    if (recreateMutation.isPending) return;
    if (!recreateDeadline || recreateDeadline < TODAY) {
      toast.error(t("overdueModalDeadlinePast"));
      return;
    }
    if (!Number.isFinite(recreateEstDays) || recreateEstDays < 0.1 || recreateEstDays > 365) {
      toast.error(t("overdueModalEstDaysInvalid"));
      return;
    }
    setPhase("creating");
    recreateMutation.mutate(recreateInternId);
  }

  const internOptions = [
    { value: currentIntern.id, label: `${currentIntern.fullName} ${t("overdueModalCurrent")}` },
    ...myInterns
      .filter((i) => i.id !== currentIntern.id)
      .map((i) => ({ value: i.id, label: i.fullName })),
  ];

  const fmtDeadline = new Date(assignment.task.deadline).toLocaleDateString(
    locale === "vi" ? "vi-VN" : "en-GB",
  );

  return (
    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-4 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted">{assignment.task.code || "—"}</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                statusBadge[assignment.status] ?? ""
              }`}
            >
              {assignment.status.replace("_", " ")}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground">{assignment.task.title}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 font-medium">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{t("overdueModalDeadline", { date: fmtDeadline })}</span>
            <span className="text-rose-400/70">
              {t("overdueModalDaysAgo", { days: overdue, plural: overdue !== 1 ? "s" : "" })}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          {isPermanentlyRecreated ? (
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              <CheckCircle className="h-3.5 w-3.5" />
              {t("overdueModalRecreated")}
            </div>
          ) : (
            <>
              {phase === "idle" && (
                <button
                  onClick={() => {
                    setRecreateInternId(currentIntern.id);
                    setRecreateDeadline(() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      return d.toISOString().split("T")[0];
                    });
                    setRecreateEstDays(assignment.task.estDays ?? 3);
                    setPhase("choosing");
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:border-cyan-500/50 hover:bg-cyan-500/20 active:scale-95"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t("overdueModalRecreate")}
                </button>
              )}
              {phase === "creating" && (
                <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              )}
              {phase === "done" && (
                <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {t("overdueModalDone")}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Recreate Form: Standardized with Cyberpunk Select & DatePicker (Rules 48 & 60-71) */}
      {phase === "choosing" && (
        <div className="mt-4 rounded-xl border border-border bg-card/60 p-3.5 space-y-3 shadow-inner">
          <div className="space-y-1.5">
            <span className="text-xs text-muted font-medium block">
              {t("overdueModalAssignTo")}
            </span>
            <Select
              value={recreateInternId}
              onChange={(val) => setRecreateInternId(val)}
              options={internOptions}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <span className="text-xs text-muted font-medium block">
                {t("overdueModalDeadlineLabel")}
              </span>
              <DatePicker
                value={recreateDeadline}
                onChange={(val) => setRecreateDeadline(val || TODAY)}
                minDate={TODAY}
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-muted font-medium block">
                {t("overdueModalEstDaysLabel")}
              </span>
              <input
                type="number"
                min={0.1}
                max={365}
                step="any"
                value={recreateEstDays}
                onChange={(e) => setRecreateEstDays(e.target.valueAsNumber)}
                className="w-full h-[42px] sm:h-[46px] rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition hover:border-border-strong focus:border-primary-light"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={() => setPhase("idle")}
              className="rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted transition hover:text-foreground active:scale-95"
            >
              {t("overdueModalCancel")}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-cyan-500 shadow-md active:scale-95"
            >
              {t("overdueModalConfirm")}
            </button>
          </div>
        </div>
      )}

      {isPermanentlyRecreated && rt && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
          {t("overdueModalRecreatedFor", {
            code: rt.code || rt.title,
            name: rt.assignment?.intern?.fullName ?? "",
          })}
        </div>
      )}
    </div>
  );
}
