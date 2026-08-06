"use client";

import { RotateCcw, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTaskSubmissions } from "@/hooks/task-submission/useTaskSubmissions";

export default function RejectedSubmissionsCard() {
  const t = useTranslations("intern.dashboard");
  const { data, isLoading } = useTaskSubmissions({ reviewStatus: "REJECTED", sortBy: "submittedAt", order: "desc", limit: 10 });
  const rejected = data?.data ?? [];
  if (isLoading || rejected.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-red-500/30 bg-red-500/10 p-5 shadow-glass">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-500/20 px-2.5 py-0.5 rounded-full border border-red-500/30">🔴 {t("needsRework")}</span>
          <h3 className="text-2xl font-black text-red-300 mt-2">{t("submissionsReworked", { n: rejected.length, plural: rejected.length !== 1 ? "s" : "" })}</h3>
          <p className="text-xs text-muted mt-1">{t("resubmitHint")}</p>
        </div>
        <div className="p-3 rounded-2xl bg-red-500/20 text-red-300"><RotateCcw className="h-6 w-6" /></div>
      </div>
      <div className="mt-4 space-y-2">
        {rejected.slice(0, 3).map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs">
            <div className="min-w-0 flex-1">
              <p className="truncate text-foreground font-medium">{s.assignment.task.title}</p>
              <p className="text-muted">Attempt #{s.attempt}{s.reviewComment && <span className="ml-2 italic">— &quot;{s.reviewComment.slice(0, 60)}{s.reviewComment.length > 60 ? "..." : ""}&quot;</span>}</p>
            </div>
            <Link href={`/intern/task?assignmentId=${s.assignmentId}`} className="ml-3 shrink-0 flex items-center gap-1 text-xs font-medium text-red-400 hover:underline">{t("resubmit")} <ExternalLink className="h-3 w-3" /></Link>
          </div>
        ))}
      </div>
    </div>
  );
}
