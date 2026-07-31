"use client";

import { createPortal } from "react-dom";
import {
  X,
  Sparkles,
  User,
  Users,
  AlertTriangle,
  TrendingUp,
  Brain,
  BarChart3,
  Star,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAiRecommendation } from "@/hooks/task/useAiRecommendation";
import { useCreateTaskAssignment } from "@/hooks/task-assignment/useCreateTaskAssignment";
import type { AiRecommendation, CandidateSummary } from "@/types/task-allocation";
import { useState, useEffect } from "react";

// ─── Props ────────────────────────────────────────────────────────────────

type Props = {
  taskId: string;
  taskTitle: string;
  isAssigned?: boolean;
  onClose: () => void;
};

// ─── Risk badge helpers ────────────────────────────────────────────────────

const riskConfig = {
  LOW: {
    label: "Low risk",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  MEDIUM: {
    label: "Medium risk",
    icon: <Clock className="h-3.5 w-3.5" />,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  },
  HIGH: {
    label: "High risk",
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
    className: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  },
};

// ─── Score bar component ──────────────────────────────────────────────────

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono font-bold text-slate-300">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

// ─── Candidate card ───────────────────────────────────────────────────────

function CandidateCard({
  candidate,
  role,
  onAssign,
  assigning,
}: {
  candidate: CandidateSummary & { suggestedRole?: "OWNER" | "SUPPORT" };
  role?: "OWNER" | "SUPPORT";
  onAssign?: () => void;
  assigning?: boolean;
}) {
  const isOwner = role === "OWNER";
  const isSupport = role === "SUPPORT";

  return (
    <div
      className={`rounded-2xl border p-4 space-y-3 transition-all duration-200 ${
        isOwner
          ? "border-sky-500/30 bg-sky-500/5 shadow-[0_0_20px_rgba(14,165,233,0.08)]"
          : isSupport
          ? "border-violet-500/30 bg-violet-500/5"
          : "border-slate-700/60 bg-slate-900/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              isOwner
                ? "bg-sky-500/20 text-sky-400"
                : isSupport
                ? "bg-violet-500/20 text-violet-400"
                : "bg-slate-700/60 text-slate-400"
            }`}
          >
            {isOwner ? <Star className="h-4 w-4" /> : isSupport ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">{candidate.name}</p>
            {candidate.position && (
              <p className="text-[11px] text-slate-400 truncate">{candidate.position}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {role && (
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                isOwner
                  ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                  : "border-violet-500/30 bg-violet-500/10 text-violet-400"
              }`}
            >
              {isOwner ? "Owner" : "Support"}
            </span>
          )}
          <span className="font-mono text-xs font-bold text-white">
            {candidate.compatibilityScore}%
          </span>
        </div>
      </div>

      {/* Score bars */}
      <div className="space-y-1.5">
        <ScoreBar label="Workload" value={candidate.workloadScore} color="bg-sky-400" />
        <ScoreBar label="Skill Match" value={candidate.skillScore} color="bg-emerald-400" />
        <ScoreBar label="Performance" value={candidate.performanceScore} color="bg-amber-400" />
        <ScoreBar label="Learning" value={candidate.learningScore} color="bg-violet-400" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 pt-1 border-t border-slate-800/60 text-[11px] text-slate-400">
        <span>
          Workload:{" "}
          <span className={`font-bold ${candidate.activeTaskDays >= 8 ? "text-rose-400" : "text-slate-200"}`}>
            {candidate.activeTaskDays}d
          </span>
        </span>
        {candidate.codingScore !== null && (
          <span>
            Coding:{" "}
            <span className="font-bold text-slate-200">{candidate.codingScore}/10</span>
          </span>
        )}
      </div>

      {/* Assign button (only for Owner) */}
      {isOwner && onAssign && (
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={onAssign}
          isLoading={assigning}
        >
          {!assigning && <User className="h-3.5 w-3.5" />}
          Assign
        </Button>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────

export default function TaskAiRecommendationModal({
  taskId,
  taskTitle,
  isAssigned = false,
  onClose,
}: Props) {
  const { data, isLoading, isError, error, refetch } = useAiRecommendation(taskId);
  const assignMutation = useCreateTaskAssignment();
  const [activeTab, setActiveTab] = useState<"summary" | "candidates">("summary");

  const handleAssign = (internId: string) => {
    assignMutation.mutate(
      { taskId, internId },
      { onSuccess: onClose },
    );
  };

  const risk = data ? riskConfig[data.riskLevel] : null;

  // Build candidate list with suggestedRole injected
  const candidates: (CandidateSummary & { suggestedRole?: "OWNER" | "SUPPORT" })[] =
    data
      ? data.allCandidates.map((c) => ({
          ...c,
          suggestedRole:
            c.id === data.owner.id
              ? "OWNER"
              : data.support && c.id === data.support.id
              ? "SUPPORT"
              : undefined,
        }))
      : [];

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center bg-black/75 p-4 pt-[4vh] backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-[28px] border border-white/10 bg-[#0d1117] shadow-glass"
      >
        {/* Top gradient accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* ─── Header ─────────────────────────────────────────────── */}
          <div className="flex items-start gap-4 pr-10">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20">
              <Sparkles className="h-6 w-6 text-sky-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-white">AI Assignment</h2>
                {data?.meta.aiFailed && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
                    Fallback
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 truncate">{taskTitle}</p>
            </div>
          </div>

          {/* ─── Loading ─────────────────────────────────────────────── */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/20">
                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                <div className="absolute inset-0 rounded-full animate-ping bg-sky-400/10" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">AI is analyzing...</p>
                <p className="text-xs text-slate-500 mt-1">Evaluating workload, skill match and learning opportunity</p>
              </div>
            </div>
          )}

          {/* ─── Error state ─────────────────────────────────────────── */}
          {isError && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center space-y-3">
              <XCircle className="h-10 w-10 text-rose-400 mx-auto" />
              <p className="text-sm font-medium text-rose-300">Cannot get AI suggestion</p>
              <p className="text-xs text-slate-400">
                {error?.message ?? "Please try again later."}
              </p>
              <Button
                variant="glass"
                size="sm"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          )}

          {/* ─── Results ─────────────────────────────────────────────── */}
          {data && (
            <>
              {/* Already assigned warning */}
              {isAssigned && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                  <p className="text-sm text-amber-300">
                    Task already assigned. AI results are for reference only.
                  </p>
                </div>
              )}

              {/* Risk + Meta strip */}
              <div className="flex flex-wrap items-center gap-3">
                {risk && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${risk.className}`}
                  >
                    {risk.icon}
                    {risk.label}
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  {data.meta.totalEvaluated} intern được đánh giá ·{" "}
                  {new Date(data.meta.generatedAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Tab bar */}
              <div className="flex gap-1 rounded-xl border border-slate-800 bg-slate-900/50 p-1">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                    activeTab === "summary"
                      ? "bg-sky-500/15 text-sky-400 border border-sky-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Brain className="h-3.5 w-3.5" />
                  AI Summary
                </button>
                <button
                  onClick={() => setActiveTab("candidates")}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                    activeTab === "candidates"
                      ? "bg-sky-500/15 text-sky-400 border border-sky-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Tất cả ứng viên ({data.meta.totalEvaluated})
                </button>
              </div>

              {/* ── Tab: Summary ───────────────────────────────────────── */}
              {activeTab === "summary" && (
                <div className="space-y-5">
                  {/* Owner + Support cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Owner card */}
                    {(() => {
                      const ownerCandidate = candidates.find((c) => c.id === data.owner.id);
                      if (!ownerCandidate) return null;
                      return (
                        <CandidateCard
                          key={ownerCandidate.id}
                          candidate={{ ...ownerCandidate, suggestedRole: "OWNER" }}
                          role="OWNER"
                          onAssign={!isAssigned ? () => handleAssign(ownerCandidate.id) : undefined}
                          assigning={assignMutation.isPending}
                        />
                      );
                    })()}

                    {/* Support card */}
                    {data.support &&
                      (() => {
                        const supportCandidate = candidates.find((c) => c.id === data.support!.id);
                        if (!supportCandidate) return null;
                        return (
                          <CandidateCard
                            key={supportCandidate.id}
                            candidate={{ ...supportCandidate, suggestedRole: "SUPPORT" }}
                            role="SUPPORT"
                          />
                        );
                      })()}
                  </div>

                  {/* Reasons */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-sky-400" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Recommendation Reasons
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {data.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Workload analysis + Learning opportunity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Workload Analysis
                        </h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{data.workloadAnalysis}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-3.5 w-3.5 text-violet-400" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Learning Opportunity
                        </h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{data.learningOpportunity}</p>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <p className="text-center text-[11px] text-slate-600 italic">
                    AI only suggests — Leader makes the final decision.
                  </p>
                </div>
              )}

              {/* ── Tab: All Candidates ─────────────────────────────────── */}
              {activeTab === "candidates" && (
                <div className="space-y-3">
                  {candidates
                    .slice()
                    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
                    .map((c, idx) => (
                      <div
                        key={c.id}
                        className={`flex items-center gap-4 rounded-2xl border px-4 py-3 transition-all ${
                          c.suggestedRole === "OWNER"
                            ? "border-sky-500/30 bg-sky-500/5"
                            : c.suggestedRole === "SUPPORT"
                            ? "border-violet-500/25 bg-violet-500/5"
                            : "border-slate-800 bg-slate-900/30"
                        }`}
                      >
                        {/* Rank */}
                        <span className="shrink-0 w-6 text-center font-mono text-xs font-bold text-slate-500">
                          #{idx + 1}
                        </span>

                        {/* Name + position */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white truncate">{c.name}</p>
                          {c.position && (
                            <p className="text-[11px] text-slate-400 truncate">{c.position}</p>
                          )}
                        </div>

                        {/* Role badge */}
                        {c.suggestedRole && (
                          <span
                            className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                              c.suggestedRole === "OWNER"
                                ? "border-sky-500/30 bg-sky-500/10 text-sky-400"
                                : "border-violet-500/30 bg-violet-500/10 text-violet-400"
                            }`}
                          >
                            {c.suggestedRole === "OWNER" ? "Owner" : "Support"}
                          </span>
                        )}

                        {/* Scores */}
                        <div className="shrink-0 hidden sm:flex gap-2 items-center">
                          {[
                            { label: "W", value: c.workloadScore, color: "text-sky-400" },
                            { label: "S", value: c.skillScore, color: "text-emerald-400" },
                            { label: "P", value: c.performanceScore, color: "text-amber-400" },
                            { label: "L", value: c.learningScore, color: "text-violet-400" },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="flex flex-col items-center gap-0.5">
                              <span className={`font-mono text-[10px] font-bold ${color}`}>{value}</span>
                              <span className="text-[9px] text-slate-600 uppercase">{label}</span>
                            </div>
                          ))}
                        </div>

                        {/* Compatibility score */}
                        <div className="shrink-0 text-right">
                          <span className="font-mono text-sm font-bold text-white">
                            {c.compatibilityScore}%
                          </span>
                          <p className="text-[10px] text-slate-500">Match</p>
                        </div>

                        {/* Assign button */}
                        {!isAssigned && c.suggestedRole === "OWNER" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAssign(c.id)}
                            isLoading={assignMutation.isPending}
                            className="shrink-0"
                          >
                            Assign
                          </Button>
                        )}
                      </div>
                    ))}
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
