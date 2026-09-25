"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  History,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useTaskAssignment } from "@/hooks/task-assignment/useTaskAssignment";
import { useTaskAssignmentExtensionRequests } from "@/hooks/task-assignment/useTaskAssignmentExtensionRequests";
import { useApproveTaskExtension } from "@/hooks/task-assignment/useApproveTaskExtension";
import { useRejectTaskExtension } from "@/hooks/task-assignment/useRejectTaskExtension";
import Spinner from "@/components/ui/Spinner";
import type { TaskExtensionRequest } from "@/types/task-assignment";

interface Props {
  assignmentId: string;
  onClose: () => void;
}

export default function TaskExtensionReviewModal({
  assignmentId,
  onClose,
}: Props) {
  const t = useTranslations("leader.tasks.extensionReviewModal");

  const { data: assignmentData, isLoading: assignmentLoading } =
    useTaskAssignment(assignmentId);
  const { data: extensionData, isLoading: extensionLoading } =
    useTaskAssignmentExtensionRequests(assignmentId);

  const approveMutation = useApproveTaskExtension();
  const rejectMutation = useRejectTaskExtension();

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");

  const assignment = assignmentData?.data;
  const requests: TaskExtensionRequest[] = useMemo(
    () => extensionData?.items ?? assignment?.extensionRequests ?? [],
    [extensionData, assignment],
  );

  const pendingRequest = useMemo(
    () => requests.find((r) => r.status === "PENDING"),
    [requests],
  );

  const totalOnTask = extensionData?.totalExtensionsOnTask ?? requests.length;
  const totalInInternship =
    extensionData?.totalExtensionsInInternship ?? totalOnTask;

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  const handleApprove = () => {
    if (!pendingRequest) return;
    approveMutation.mutate(pendingRequest.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleReject = () => {
    if (!pendingRequest) return;
    if (!rejectionReason.trim()) {
      setRejectionError(t("rejectionReasonRequired"));
      return;
    }
    setRejectionError("");
    rejectMutation.mutate(
      {
        requestId: pendingRequest.id,
        payload: {
          rejectionReason: rejectionReason.trim(),
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
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isLoading = assignmentLoading || extensionLoading;

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

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : !assignment ? (
          <p className="py-8 text-center text-sm text-muted">
            Không tìm thấy thông tin công việc.
          </p>
        ) : (
          <>
            {/* Task & Intern Information Card */}
            <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md border border-border bg-card text-primary-light">
                    {assignment.task.code || "TASK"}
                  </span>
                  <span className="text-sm font-semibold text-foreground truncate max-w-md">
                    {assignment.task.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <User className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{t("intern")}:</span>
                  <span className="font-semibold text-foreground">
                    {assignment.intern?.user?.fullName ||
                      assignment.intern?.userId ||
                      "—"}
                  </span>
                </div>
              </div>

              {/* Deadline comparison highlight */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40 text-xs">
                <div className="flex items-center gap-2">
                  <div className="space-y-0.5">
                    <span className="text-muted block text-[11px]">
                      {t("currentDeadline")}
                    </span>
                    <span className="font-semibold text-foreground/80 line-through">
                      {new Date(assignment.task.deadline).toLocaleDateString(
                        "vi-VN",
                      )}
                    </span>
                  </div>

                  <ArrowRight className="h-4 w-4 text-amber-400 mx-1 shrink-0" />

                  <div className="space-y-0.5">
                    <span className="text-amber-400 block text-[11px] font-bold">
                      {t("proposedDeadline")}
                    </span>
                    <span className="font-bold text-amber-300 text-sm">
                      {pendingRequest
                        ? new Date(
                            pendingRequest.proposedDeadline,
                          ).toLocaleDateString("vi-VN")
                        : "—"}
                    </span>
                  </div>
                </div>

                {pendingRequest && (
                  <span className="inline-flex items-center gap-1 rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-1 font-mono text-xs font-bold text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                    <Clock className="h-3.5 w-3.5" />
                    {t("daysCount", { days: pendingRequest.extensionDays })}
                  </span>
                )}
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-border/40 px-3 py-2">
                  <span className="text-muted">{t("taskExtensionsCount")}</span>
                  <span className="font-bold text-foreground">{totalOnTask}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-border/40 px-3 py-2">
                  <span className="text-muted">
                    {t("internshipExtensionsCount")}
                  </span>
                  <span className="font-bold text-foreground">
                    {totalInInternship}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Request Details */}
            {pendingRequest ? (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/5 p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      {t("statusPending")}
                    </span>
                  </div>
                  <span className="text-xs text-muted">
                    {t("requestedAt")}:{" "}
                    {new Date(pendingRequest.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>

                {/* Reason */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    {t("reason")}
                  </span>
                  <div className="rounded-xl border border-border bg-card/60 p-3 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {pendingRequest.reason}
                  </div>
                </div>

                {/* Commitment Plan */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    {t("commitmentPlan")}
                  </span>
                  <div className="rounded-xl border border-border bg-card/60 p-3 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {pendingRequest.commitmentPlan}
                  </div>
                </div>

                {/* Rejection Input Box if leader clicked reject */}
                {isRejecting && (
                  <div className="space-y-2 pt-2 border-t border-rose-500/20 animate-in fade-in duration-150">
                    <label className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5" />
                      {t("rejectionReason")}
                      <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={rejectionReason}
                      onChange={(e) => {
                        setRejectionReason(e.target.value);
                        if (e.target.value.trim()) setRejectionError("");
                      }}
                      placeholder={t("rejectionReasonPlaceholder")}
                      className="w-full rounded-xl border border-rose-500/40 bg-card p-3 text-sm text-foreground placeholder:text-muted outline-none transition focus:border-rose-400 resize-none"
                    />
                    {rejectionError && (
                      <p className="text-xs text-rose-400">{rejectionError}</p>
                    )}
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-amber-500/20">
                  {isRejecting ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRejecting(false);
                          setRejectionReason("");
                          setRejectionError("");
                        }}
                        disabled={isPending}
                        className="rounded-xl border border-border bg-card/60 px-4 py-2 text-xs font-semibold text-muted hover:text-foreground hover:bg-card transition active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {t("cancel")}
                      </button>
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={isPending}
                        className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {rejectMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        <span>{t("confirmReject")}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsRejecting(true)}
                        disabled={isPending}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-400 transition active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>{t("reject")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={isPending}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {approveMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>{t("approve")}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card/40 p-6 text-center text-sm text-muted">
                Không có yêu cầu gia hạn nào đang chờ xử lý cho công việc này.
              </div>
            )}

            {/* Extension History on this task */}
            {requests.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-border/40">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                  <History className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{t("historyTitle")}</span>
                  <span className="font-mono text-[11px] text-foreground/70">
                    ({requests.length})
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {requests.map((req) => {
                    const isApproved = req.status === "APPROVED";
                    const isRejected = req.status === "REJECTED";
                    const isPend = req.status === "PENDING";

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
                              {isPend && <Clock className="h-3 w-3" />}
                              {isApproved
                                ? t("statusApproved")
                                : isRejected
                                  ? t("statusRejected")
                                  : t("statusPending")}
                            </span>
                            <span className="text-foreground font-semibold">
                              +{req.extensionDays} ngày →{" "}
                              {new Date(
                                req.proposedDeadline,
                              ).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <span className="text-muted text-[11px]">
                            {new Date(req.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
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
                            <span className="font-semibold">
                              Lý do từ chối:
                            </span>{" "}
                            {req.rejectionReason}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
