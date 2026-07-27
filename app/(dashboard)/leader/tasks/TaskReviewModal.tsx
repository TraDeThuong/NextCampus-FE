"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, ExternalLink, Loader2, CheckCircle, RotateCcw, Calendar, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useTaskAssignment } from "@/hooks/task-assignment/useTaskAssignment";
import { useTaskSubmissions } from "@/hooks/task-submission/useTaskSubmissions";
import { useUpdateTaskSubmission } from "@/hooks/task-submission/useUpdateTaskSubmission";
import Spinner from "@/components/ui/Spinner";
import type { ReviewStatus } from "@/types/task-submission";

type Props = {
  assignmentId: string;
  taskId: string;
  onClose: () => void;
};

const priorityBadge: Record<string, string> = {
  HIGH: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  LOW: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

const reviewStatusBadge: Record<string, string> = {
  PENDING: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  APPROVED: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  REJECTED: "border-red-400/20 bg-red-500/10 text-red-300",
};

export default function TaskReviewModal({ assignmentId, taskId, onClose }: Props) {
  const queryClient = useQueryClient();
  const [reviewComment, setReviewComment] = useState("");

  const { data: assignmentData, isLoading: assignmentLoading } =
    useTaskAssignment(assignmentId);
  const { data: submissionsData, isLoading: submissionsLoading } =
    useTaskSubmissions({ assignmentId, sortBy: "submittedAt", order: "desc" });

  const updateSubmission = useUpdateTaskSubmission();

  const assignment = assignmentData?.data;
  const submissions = submissionsData?.data ?? [];
  const latestSubmission = submissions[0];

  const isProcessing = updateSubmission.isPending;

  const handleReview = (reviewStatus: ReviewStatus) => {
    if (!latestSubmission) return;
    updateSubmission.mutate(
      {
        id: latestSubmission.id,
        payload: {
          reviewStatus,
          reviewComment: reviewComment.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          queryClient.invalidateQueries({ queryKey: ["task-assignments"] });
          queryClient.invalidateQueries({ queryKey: ["stats"] });
          setReviewComment("");
          onClose();
        },
      },
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[28px] border border-white/10 bg-card shadow-glass">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted hover:text-foreground hover:bg-white/10 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="overflow-y-auto max-h-[90vh] p-6 sm:p-8">
          {assignmentLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : !assignment ? (
            <p className="py-8 text-center text-sm text-muted">
              Assignment not found.
            </p>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-500">
                    {assignment.task.code || "—"}
                  </span>
                  {assignment.task.priority && (
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ${priorityBadge[assignment.task.priority] ?? ""}`}
                    >
                      {assignment.task.priority}
                    </span>
                  )}
                  <span className="inline-flex rounded-lg px-2 py-0.5 text-xs bg-purple-500/10 text-purple-400">
                    {assignment.status.replace("_", " ")}
                  </span>
                </div>
                <h2 className="text-xl font-bold metal-text">
                  {assignment.task.title}
                </h2>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                <div className="flex items-center gap-2 text-muted">
                  <Calendar className="h-3.5 w-3.5" />
                  Deadline:{" "}
                  <span className="text-foreground">
                    {new Date(assignment.task.deadline).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <User className="h-3.5 w-3.5" />
                  Intern:{" "}
                  <span className="text-foreground">{assignment.intern.fullName}</span>
                </div>
                <div className="text-muted">
                  Assigned by:{" "}
                  <span className="text-foreground">
                    {assignment.assigner.fullName}
                  </span>
                </div>
                <div className="text-muted">
                  Attempts:{" "}
                  <span className="text-foreground">{submissions.length}</span>
                </div>
              </div>

              {/* Latest Submission */}
              {latestSubmission && (
                <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Latest Submission (Attempt #{latestSubmission.attempt})
                  </h3>

                  {latestSubmission.prLink && (
                    <div className="mb-2">
                      <a
                        href={latestSubmission.prLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Pull Request
                      </a>
                    </div>
                  )}

                  {latestSubmission.videoDemo && (
                    <div className="mb-2">
                      <a
                        href={latestSubmission.videoDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Video Demo
                      </a>
                    </div>
                  )}

                  {latestSubmission.note && (
                    <div className="mt-2 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                      <p className="text-xs text-muted mb-1">Intern&apos;s Note:</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {latestSubmission.note}
                      </p>
                    </div>
                  )}

                  {latestSubmission.reviewStatus !== "PENDING" && (
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${reviewStatusBadge[latestSubmission.reviewStatus] ?? ""}`}
                      >
                        {latestSubmission.reviewStatus}
                      </span>
                      {latestSubmission.reviewComment && (
                        <p className="mt-2 text-xs text-muted">
                          Previous comment:{" "}
                          <span className="text-foreground">
                            {latestSubmission.reviewComment}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Submission History */}
              {submissions.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Submission History
                  </h3>
                  <div className="space-y-2">
                    {submissions.slice(1).map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs"
                      >
                        <span className="text-muted">
                          Attempt #{s.attempt} —{" "}
                          {new Date(s.submittedAt).toLocaleDateString("en-GB")}
                        </span>
                        <span
                          className={`rounded-full border px-1.5 py-0.5 text-[10px] ${reviewStatusBadge[s.reviewStatus] ?? ""}`}
                        >
                          {s.reviewStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Form */}
              {submissionsLoading ? (
                <div className="flex justify-center py-6">
                  <Spinner size="sm" />
                </div>
              ) : submissions.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">
                  No submissions yet.
                </p>
              ) : latestSubmission.reviewStatus === "APPROVED" ? (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-center text-sm text-emerald-300">
                  <CheckCircle className="h-5 w-5 mx-auto mb-1" />
                  This submission has been approved.
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Nhận xét / Góp ý
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Viết nhận xét, góp ý cho intern..."
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none resize-none"
                    disabled={isProcessing}
                  />

                  <div className="mt-4 flex items-center gap-3">
                    {isProcessing ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary-light" />
                    ) : (
                      <>
                        <button
                          onClick={() => handleReview("APPROVED")}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReview("REJECTED")}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Request Rework
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
