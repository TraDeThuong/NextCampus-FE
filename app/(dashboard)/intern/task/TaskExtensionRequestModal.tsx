"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Clock,
  Calendar,
  AlertTriangle,
  Send,
  Loader2,
  Info,
  CheckCircle2,
  XCircle,
  History,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { DatePicker, formatDateSafe, parseDateSafe } from "@/components/ui/DatePicker";
import { useRequestTaskExtension } from "@/hooks/task-assignment/useRequestTaskExtension";
import { useTaskAssignmentExtensionRequests } from "@/hooks/task-assignment/useTaskAssignmentExtensionRequests";
import type { TaskAssignment, TaskExtensionRequest } from "@/types/task-assignment";

interface Props {
  isOpen: boolean;
  assignment: TaskAssignment | null;
  onClose: () => void;
}

export default function TaskExtensionRequestModal({
  isOpen,
  assignment,
  onClose,
}: Props) {
  const t = useTranslations("intern.tasks.extensionModal");
  const requestMutation = useRequestTaskExtension();

  const { data: extensionData, isLoading: historyLoading } =
    useTaskAssignmentExtensionRequests(assignment?.id, isOpen && !!assignment);

  const existingRequests: TaskExtensionRequest[] = useMemo(
    () => extensionData?.items ?? assignment?.extensionRequests ?? [],
    [extensionData, assignment],
  );

  const pendingRequest = useMemo(
    () => existingRequests.find((r) => r.status === "PENDING"),
    [existingRequests],
  );

  const totalOnTask = extensionData?.totalExtensionsOnTask ?? existingRequests.length;
  const totalInInternship = extensionData?.totalExtensionsInInternship ?? totalOnTask;

  // Calculate current task deadline and min date
  const currentDeadline = useMemo(() => {
    if (!assignment?.task?.deadline) return new Date();
    return new Date(assignment.task.deadline);
  }, [assignment]);

  const minDateStr = useMemo(() => {
    // Tomorrow or currentDeadline + 1 day, whichever is later
    const now = new Date();
    const base = currentDeadline > now ? currentDeadline : now;
    const nextDay = new Date(base.getTime() + 24 * 60 * 60 * 1000);
    return formatDateSafe(nextDay);
  }, [currentDeadline]);

  // Form states
  const [proposedDeadline, setProposedDeadline] = useState("");
  const [extensionDays, setExtensionDays] = useState<number>(1);
  const [reason, setReason] = useState("");
  const [commitmentPlan, setCommitmentPlan] = useState("");
  const [errors, setErrors] = useState<{
    deadline?: string;
    reason?: string;
    commitment?: string;
  }>({});

  // When modal opens, initialize default proposed deadline (currentDeadline + 2 days)
  useEffect(() => {
    if (isOpen && assignment) {
      const initialTarget = new Date(currentDeadline.getTime() + 2 * 24 * 60 * 60 * 1000);
      const formatted = formatDateSafe(initialTarget);
      setProposedDeadline(formatted);
      setExtensionDays(2);
      setReason("");
      setCommitmentPlan("");
      setErrors({});
    }
  }, [isOpen, assignment, currentDeadline]);

  // Handle proposed deadline change
  const handleDateChange = (newDateStr: string) => {
    setProposedDeadline(newDateStr);
    if (!newDateStr) {
      setErrors((prev) => ({ ...prev, deadline: t("proposedDeadlineRequired") }));
      return;
    }
    setErrors((prev) => ({ ...prev, deadline: undefined }));

    const parsed = parseDateSafe(newDateStr);
    if (parsed) {
      const diffMs = parsed.getTime() - currentDeadline.getTime();
      const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      setExtensionDays(days);
    }
  };

  // Handle days change
  const handleDaysChange = (days: number) => {
    const validDays = Math.max(1, Math.min(60, days));
    setExtensionDays(validDays);
    const newTarget = new Date(
      currentDeadline.getTime() + validDays * 24 * 60 * 60 * 1000,
    );
    setProposedDeadline(formatDateSafe(newTarget));
    setErrors((prev) => ({ ...prev, deadline: undefined }));
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment) return;

    const newErrors: {
      deadline?: string;
      reason?: string;
      commitment?: string;
    } = {};

    if (!proposedDeadline) {
      newErrors.deadline = t("proposedDeadlineRequired");
    }

    if (!reason.trim() || reason.trim().length < 10) {
      newErrors.reason = t("reasonMin");
    }

    if (!commitmentPlan.trim() || commitmentPlan.trim().length < 10) {
      newErrors.commitment = t("commitmentMin");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const isoDeadline = new Date(`${proposedDeadline}T23:59:59.000Z`).toISOString();

    requestMutation.mutate(
      {
        id: assignment.id,
        payload: {
          proposedDeadline: isoDeadline,
          extensionDays,
          reason: reason.trim(),
          commitmentPlan: commitmentPlan.trim(),
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !assignment) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-border bg-card shadow-glass p-6 sm:p-7 space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.2)]">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                <span className="metal-text">{t("title")}</span>
              </h2>
              <p className="mt-0.5 text-xs text-muted max-w-md">{t("desc")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card/60 text-muted transition-all hover:rotate-90 hover:text-foreground hover:bg-card active:scale-95 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Task Summary Banner */}
        <div className="rounded-2xl border border-border bg-card/50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md border border-border bg-card text-primary-light">
                {assignment.task.code || "TASK"}
              </span>
              <span className="text-sm font-semibold text-foreground truncate max-w-md">
                {assignment.task.title}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>{t("currentDeadline")}:</span>
              <span className="font-semibold text-amber-300">
                {new Date(assignment.task.deadline).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-border/40 px-3 py-2">
              <span className="text-muted">{t("timesOnTask", { count: "" }).trim()}</span>
              <span className="font-bold text-foreground">{totalOnTask}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-border/40 px-3 py-2">
              <span className="text-muted">{t("timesInInternship", { count: "" }).trim()}</span>
              <span className="font-bold text-foreground">{totalInInternship}</span>
            </div>
          </div>
        </div>

        {/* AI Evaluation Notice */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-300/90 leading-relaxed">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
          <p>{t("evaluationWarning")}</p>
        </div>

        {/* Pending Request Banner if currently pending */}
        {pendingRequest ? (
          <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5 space-y-3.5 animate-pulse">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-amber-300">
                {t("pendingBannerTitle")}
              </h3>
            </div>
            <p className="text-xs text-amber-200/80">
              {t("pendingBannerDesc", {
                date: new Date(pendingRequest.createdAt).toLocaleString("vi-VN"),
              })}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="space-y-1">
                <span className="text-muted font-medium">{t("proposedDeadline")}:</span>
                <p className="font-bold text-foreground">
                  {new Date(pendingRequest.proposedDeadline).toLocaleDateString("vi-VN")}{" "}
                  (+{pendingRequest.extensionDays} {t("daysUnit")})
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-muted font-medium">{t("reason")}:</span>
                <p className="text-foreground/90 italic">{pendingRequest.reason}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-muted font-medium">{t("commitmentPlan")}:</span>
                <p className="text-foreground/90">{pendingRequest.commitmentPlan}</p>
              </div>
            </div>
          </div>
        ) : (
          /* Form for Submitting New Extension Request */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Proposed Deadline & Extension Days */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                  {t("proposedDeadline")}
                  <span className="text-rose-400">*</span>
                </label>
                <DatePicker
                  value={proposedDeadline}
                  onChange={handleDateChange}
                  minDate={minDateStr}
                  placeholder={t("proposedDeadline")}
                  className="w-full [&>button]:h-[46px] [&>button]:rounded-xl"
                  error={errors.deadline}
                />
                {errors.deadline && (
                  <p className="text-xs text-rose-400">{errors.deadline}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  {t("extensionDays")}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={extensionDays}
                    onChange={(e) => handleDaysChange(Number(e.target.value))}
                    className="w-full h-[46px] rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none transition focus:border-primary-light"
                  />
                  <div className="flex gap-1">
                    {[1, 3, 5, 7].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleDaysChange(d)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          extensionDays === d
                            ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                            : "border-border bg-card/60 text-muted hover:text-foreground hover:bg-card"
                        }`}
                      >
                        +{d}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Reason */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  {t("reason")}
                  <span className="text-rose-400">*</span>
                </label>
                <span
                  className={`font-mono ${
                    reason.length >= 10 ? "text-muted" : "text-amber-400"
                  }`}
                >
                  {reason.length}/500
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (e.target.value.trim().length >= 10) {
                    setErrors((prev) => ({ ...prev, reason: undefined }));
                  }
                }}
                placeholder={t("reasonPlaceholder")}
                className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted outline-none transition focus:border-primary-light resize-none"
              />
              {errors.reason && (
                <p className="text-xs text-rose-400">{errors.reason}</p>
              )}
            </div>

            {/* Row 3: Commitment Plan */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  {t("commitmentPlan")}
                  <span className="text-rose-400">*</span>
                </label>
                <span
                  className={`font-mono ${
                    commitmentPlan.length >= 10 ? "text-muted" : "text-amber-400"
                  }`}
                >
                  {commitmentPlan.length}/500
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={commitmentPlan}
                onChange={(e) => {
                  setCommitmentPlan(e.target.value);
                  if (e.target.value.trim().length >= 10) {
                    setErrors((prev) => ({ ...prev, commitment: undefined }));
                  }
                }}
                placeholder={t("commitmentPlaceholder")}
                className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted outline-none transition focus:border-primary-light resize-none"
              />
              {errors.commitment && (
                <p className="text-xs text-rose-400">{errors.commitment}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
              <button
                type="button"
                onClick={onClose}
                disabled={requestMutation.isPending}
                className="rounded-xl border border-border bg-card/60 px-5 py-2.5 text-xs font-semibold text-muted hover:text-foreground hover:bg-card transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={requestMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {requestMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("submitting")}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{t("submit")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Previous Extension Requests History */}
        {existingRequests.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-border/40">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
              <History className="h-3.5 w-3.5 text-cyan-400" />
              <span>{t("historyTitle")}</span>
              <span className="font-mono text-[11px] text-foreground/70">
                ({existingRequests.length})
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {existingRequests.map((req) => {
                const isApproved = req.status === "APPROVED";
                const isRejected = req.status === "REJECTED";
                const isPending = req.status === "PENDING";

                return (
                  <div
                    key={req.id}
                    className="rounded-xl border border-border/60 bg-white/[0.02] p-3 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                            isApproved
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : isRejected
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-400 animate-pulse"
                          }`}
                        >
                          {isApproved && <CheckCircle2 className="h-3 w-3" />}
                          {isRejected && <XCircle className="h-3 w-3" />}
                          {isPending && <Clock className="h-3 w-3" />}
                          {isApproved
                            ? t("statusApproved")
                            : isRejected
                              ? t("statusRejected")
                              : t("statusPending")}
                        </span>
                        <span className="text-foreground font-semibold">
                          +{req.extensionDays} {t("daysUnit")} →{" "}
                          {new Date(req.proposedDeadline).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <span className="text-muted text-[11px]">
                        {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <p className="text-muted line-clamp-2">
                      <span className="text-foreground/80 font-medium">
                        {t("reason")}:
                      </span>{" "}
                      {req.reason}
                    </p>

                    {req.rejectionReason && (
                      <p className="text-rose-400 bg-rose-500/5 border border-rose-500/20 rounded-lg p-2 mt-1">
                        <span className="font-semibold">Phản hồi từ chối:</span>{" "}
                        {req.rejectionReason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
