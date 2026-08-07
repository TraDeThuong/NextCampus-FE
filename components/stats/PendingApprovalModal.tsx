"use client";

import { useContext } from "react";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import { CheckCircle, XCircle, Loader2, Calendar, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { AuthContext } from "@/contexts/AuthContext";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import { useApproveTaskAssignment } from "@/hooks/task-assignment/useApproveTaskAssignment";
import { useRejectTaskAssignment } from "@/hooks/task-assignment/useRejectTaskAssignment";
import type { TaskAssignment } from "@/types/task-assignment";
import Spinner from "@/components/ui/Spinner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const statusBadge: Record<string, string> = {
  PENDING_APPROVAL: "border-amber-400/20 bg-amber-500/10 text-amber-300",
};

const priorityBadge: Record<string, string> = {
  HIGH: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  LOW: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

function PendingRow({ assignment }: { assignment: TaskAssignment }) {
  const t = useTranslations("leader.dashboard");
  const approveMutation = useApproveTaskAssignment();
  const rejectMutation = useRejectTaskAssignment();

  const task = assignment.task;
  const isProcessing = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-500">{task.code || "—"}</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadge[assignment.status] ?? ""}`}
          >
            {assignment.status.replace("_", " ")}
          </span>
          {task.priority && (
            <span
              className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ${priorityBadge[task.priority] ?? ""}`}
            >
              {task.priority}
            </span>
          )}
        </div>

        <p className="text-sm font-medium text-white">{task.title}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(task.deadline).toLocaleDateString("en-GB")}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {assignment.intern.fullName}
          </span>
          <span>
            {t("requestedBy")}{" "}
            <span className="text-foreground">{assignment.assigner.fullName}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
        ) : (
          <>
            <button
              onClick={() => approveMutation.mutate(assignment.id)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {t("approve")}
            </button>
            <button
              onClick={() => rejectMutation.mutate(assignment.id)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              <XCircle className="h-3.5 w-3.5" />
              {t("reject")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PendingApprovalModal({ isOpen, onClose }: Props) {
  const t = useTranslations("leader.dashboard");
  const auth = useContext(AuthContext);
  const currentUserId = auth?.state.user?.id;

  const { data, isLoading } = useTaskAssignments({
    status: "PENDING_APPROVAL",
    leaderId: currentUserId,
    limit: 100,
  });

  if (!isOpen) return null;

  const allPending = data?.data ?? [];
  const crossTeam = allPending.filter((a) => a.assignedBy !== currentUserId);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-[28px] border border-white/10 bg-card shadow-glass">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted hover:text-foreground hover:bg-white/10 transition-all z-10"
        >
          <HiXMark className="h-6 w-6" />
        </button>

        <div className="p-6 sm:p-8 overflow-y-auto max-h-[85vh]">
          <div className="mb-6">
            <h2 className="text-xl font-bold metal-text">{t("pendingModalTitle")}</h2>
            <p className="text-xs text-muted mt-1">
              {t("pendingModalDesc", { count: crossTeam.length })}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : crossTeam.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-white/5 bg-white/[0.02]">
              <p className="text-sm text-muted">{t("pendingModalEmpty")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {crossTeam.map((a) => (
                <PendingRow key={a.id} assignment={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
