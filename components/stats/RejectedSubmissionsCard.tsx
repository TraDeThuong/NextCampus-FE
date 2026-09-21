"use client";

import { RotateCcw, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTaskSubmissions } from "@/hooks/task-submission/useTaskSubmissions";
import type { NeedsReworkItem } from "@/types/stats";

interface Props {
  needsReworkItems?: NeedsReworkItem[];
}

export default function RejectedSubmissionsCard({ needsReworkItems }: Props) {
  const t = useTranslations("intern.dashboard");
  const { data, isLoading } = useTaskSubmissions(
    { reviewStatus: "REJECTED", sortBy: "submittedAt", order: "desc", limit: 100 },
    !needsReworkItems || needsReworkItems.length === 0,
  );

  const queryRejected = (data?.data ?? []).filter(
    (submission, index, submissions) =>
      submission.assignment.status !== "REVIEW" &&
      submission.assignment.status !== "DONE" &&
      submissions.findIndex(
        (candidate) => candidate.assignmentId === submission.assignmentId,
      ) === index,
  );

  const hasPropItems = Boolean(needsReworkItems && needsReworkItems.length > 0);

  const items: Array<{
    id: string;
    title: string;
    attempt: number;
    reviewComment: string | null;
    link: string;
  }> = hasPropItems
    ? (needsReworkItems ?? []).map((item) => ({
        id: item.submissionId || item.taskId,
        title: item.taskTitle,
        attempt: item.attempt ?? 1,
        reviewComment: item.reviewComment || item.rejectedReason || null,
        link: item.taskId ? `/intern/task?taskId=${item.taskId}` : `/intern/task`,
      }))
    : queryRejected.map((s) => ({
        id: s.id,
        title: s.assignment.task.title,
        attempt: s.attempt,
        reviewComment: s.reviewComment,
        link: `/intern/task?assignmentId=${s.assignmentId}`,
      }));

  if (!hasPropItems && (isLoading || items.length === 0)) return null;
  if (hasPropItems && items.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-red-500/30 bg-red-500/10 p-5 shadow-glass">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-500/20 px-2.5 py-0.5 rounded-full border border-red-500/30">
            🔴 {t("needsRework")}
          </span>
          <h3 className="text-2xl font-black text-red-300 mt-2">
            {t("submissionsReworked", {
              n: items.length,
              plural: items.length !== 1 ? "s" : "",
            })}
          </h3>
          <p className="text-xs text-muted mt-1">{t("resubmitHint")}</p>
        </div>
        <div className="p-3 rounded-2xl bg-red-500/20 text-red-300">
          <RotateCcw className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        {items.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-foreground font-semibold">{item.title}</p>
                <span className="text-[11px] text-muted">
                  {t("submissionAttempt", { attempt: item.attempt })}
                </span>
              </div>
              <Link
                href={item.link}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-red-500/20 px-2.5 py-1 text-[11px] font-bold text-red-300 hover:bg-red-500/30 transition-colors"
              >
                {t("editAndResubmit")} <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            {item.reviewComment && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 text-[11px] text-red-200">
                <span className="font-semibold text-red-300">{t("rejectedReasonLabel")}: </span>
                <span className="italic">{item.reviewComment}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
