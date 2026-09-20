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
  Loader2,
  CheckCircle2,
  XCircle,
  Info,
  Check,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useAiRecommendation } from "@/hooks/task/useAiRecommendation";
import { useAssignTask } from "@/hooks/task-assignment/useAssignTask";
import type { CandidateSummary } from "@/types/task-allocation";
import { useState } from "react";
import { toast } from "react-hot-toast";

// ─── Props ────────────────────────────────────────────────────────────────

type Props = {
  taskId: string;
  taskTitle: string;
  isAssigned?: boolean;
  onClose: () => void;
};

// ─── Risk badge helpers (from task-allocation-ui-config.json) ──────────────

const riskConfig = {
  LOW: {
    level: "LOW",
    label: "Rủi ro thấp (An toàn)",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    bannerClass: "bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-300 p-3 rounded-r-xl",
    icon: CheckCircle2,
    warningMessage: "Khối lượng công việc an toàn, ứng viên có đủ thời gian hoàn thành tốt.",
  },
  MEDIUM: {
    level: "MEDIUM",
    label: "Rủi ro vừa phải",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    bannerClass: "bg-amber-500/10 border-l-4 border-amber-500 text-amber-300 p-3 rounded-r-xl",
    icon: Info,
    warningMessage: "Khối lượng công việc tương đối, cần theo dõi sát sao hạn chót.",
  },
  HIGH: {
    level: "HIGH",
    label: "Rủi ro cao (Nguy cơ quá tải)",
    badgeClass: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
    bannerClass: "bg-rose-500/10 border-l-4 border-rose-500 text-rose-300 p-3 rounded-r-xl",
    icon: AlertTriangle,
    warningMessage: "Ứng viên đã đạt từ 80% hạn mức công việc tối đa (>= 8 ngày). Cân nhắc đổi Owner hoặc giảm bớt task khác.",
  },
};

// ─── Score bar component (4 Weights) ──────────────────────────────────────

function ScoreBar({
  label,
  value,
  weight,
  color,
}: {
  label: string;
  value: number;
  weight: string;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-slate-400">
          {label} <span className="text-[10px] text-slate-500">({weight})</span>
        </span>
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
  expectedWorkloadDays,
  riskLevel,
  onAssign,
  assigning,
}: {
  candidate: CandidateSummary & { suggestedRole?: "OWNER" | "SUPPORT" };
  role?: "OWNER" | "SUPPORT";
  expectedWorkloadDays?: number;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  onAssign?: () => void;
  assigning?: boolean;
}) {
  const isOwner = role === "OWNER";
  const isSupport = role === "SUPPORT";
  const risk = riskLevel ? riskConfig[riskLevel] : null;

  return (
    <div
      className={`rounded-2xl border p-4 space-y-3 transition-all duration-200 ${
        isOwner
          ? "border-sky-500/30 bg-sky-500/5 shadow-[0_0_20px_rgba(14,165,233,0.08)]"
          : isSupport
          ? "border-purple-500/30 bg-purple-500/5"
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
                ? "bg-purple-500/20 text-purple-400"
                : "bg-slate-700/60 text-slate-400"
            }`}
          >
            {isOwner ? <Star className="h-4 w-4" /> : isSupport ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">{candidate.name}</p>
            <p className="text-[11px] text-slate-400 truncate">
              {candidate.position || "Thực tập sinh"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {role && (
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                isOwner
                  ? "border-blue-400/30 bg-blue-500/15 text-blue-300"
                  : "border-purple-400/30 bg-purple-500/15 text-purple-300"
              }`}
            >
              {isOwner ? "Owner (100%)" : "Support (50%)"}
            </span>
          )}
          <span className="font-mono text-xs font-bold text-white">
            {candidate.compatibilityScore}% phù hợp
          </span>
        </div>
      </div>

      {/* Role description / Workload note */}
      {isOwner && (
        <div className="flex items-center justify-between text-xs bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-slate-400">Tải công việc dự kiến:</span>
          <span className="font-semibold text-slate-200 font-mono">
            {expectedWorkloadDays != null ? `${expectedWorkloadDays} ngày` : `${candidate.activeTaskDays} ngày`}
          </span>
        </div>
      )}

      {isSupport && (
        <div className="text-[11px] text-purple-300/90 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 leading-relaxed">
          Đề xuất hỗ trợ mentor và kèm cặp chuyên môn cho công việc.
        </div>
      )}

      {/* Risk Badge for Owner */}
      {isOwner && risk && (
        <div className={`flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-medium ${risk.badgeClass}`}>
          <risk.icon className="h-3.5 w-3.5 shrink-0" />
          <span>{risk.label}</span>
        </div>
      )}

      {/* 4 Score Bars: Workload 30%, Skill 25%, Performance 25%, Learning 20% */}
      <div className="space-y-1.5 pt-1">
        <ScoreBar label="Độ rảnh" weight="30%" value={candidate.workloadScore} color="bg-sky-400" />
        <ScoreBar label="Kỹ năng & Module" weight="25%" value={candidate.skillScore} color="bg-emerald-400" />
        <ScoreBar label="Hiệu suất gần nhất" weight="25%" value={candidate.performanceScore} color="bg-amber-400" />
        <ScoreBar label="Tiềm năng học tập" weight="20%" value={candidate.learningScore} color="bg-purple-400" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 pt-1 border-t border-slate-800/60 text-[11px] text-slate-400">
        <span>
          Số ngày task đang chạy:{" "}
          <span className={`font-bold ${candidate.activeTaskDays >= 8 ? "text-rose-400" : "text-slate-200"}`}>
            {candidate.activeTaskDays} ngày
          </span>
        </span>
        {candidate.codingScore !== null && (
          <span>
            Coding:{" "}
            <span className="font-bold text-slate-200">{candidate.codingScore}/10</span>
          </span>
        )}
      </div>

      {/* Assign button */}
      {isOwner && onAssign && (
        <Button
          variant="primary"
          size="sm"
          fullWidth
          onClick={onAssign}
          isLoading={assigning}
          className="mt-2"
        >
          {!assigning && <Check className="h-3.5 w-3.5" />}
          Chọn làm Người phụ trách
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
  const assignMutation = useAssignTask();
  const [activeTab, setActiveTab] = useState<"summary" | "candidates">("summary");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplySuggestion = () => {
    if (!data?.owner?.id || isSubmitting) return;
    setIsSubmitting(true);
    assignMutation.mutate(
      {
        taskId,
        payload: {
          internId: data.owner.id,
          supportId: data.support?.id || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Đã áp dụng đề xuất phân công bằng AI thành công.");
          onClose();
        },
        onError: () => setIsSubmitting(false),
      },
    );
  };

  const handleAssignSingle = (internId: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    assignMutation.mutate(
      {
        taskId,
        payload: {
          internId,
          supportId: data?.support?.id || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Phân công công việc thành công.");
          onClose();
        },
        onError: () => setIsSubmitting(false),
      },
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
          {/* ─── Header conforming to .agents/memory.md ──────────────── */}
          <div className="flex items-start justify-between gap-4 pr-10">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/20">
                <Sparkles className="h-6 w-6 text-sky-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-white">Đề xuất phân công bằng AI</h2>
                  {data?.meta?.aiFailed && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
                      Fallback
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 truncate">{taskTitle}</p>
              </div>
            </div>

            {/* Quick Apply Button on header */}
            {data && !isAssigned && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplySuggestion}
                isLoading={assignMutation.isPending || isSubmitting}
                className="shrink-0 shadow-lg shadow-sky-500/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Áp dụng gợi ý
              </Button>
            )}
          </div>

          {/* ─── Loading ─────────────────────────────────────────────── */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/20">
                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                <div className="absolute inset-0 rounded-full animate-ping bg-sky-400/10" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">AI đang phân tích và tính toán...</p>
                <p className="text-xs text-slate-500 mt-1">
                  Đánh giá 4 trọng số: Workload (30%), Kỹ năng (25%), Hiệu suất (25%), Học hỏi (20%)
                </p>
              </div>
            </div>
          )}

          {/* ─── Error state ─────────────────────────────────────────── */}
          {isError && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center space-y-3">
              <XCircle className="h-10 w-10 text-rose-400 mx-auto" />
              <p className="text-sm font-medium text-rose-300">Không thể lấy đề xuất AI</p>
              <p className="text-xs text-slate-400">
                {error?.message ?? "Vui lòng thử lại sau."}
              </p>
              <Button
                variant="glass"
                size="sm"
                onClick={() => refetch()}
              >
                Thử lại
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
                    Công việc đã được phân công. Kết quả AI dưới đây mang tính tham khảo để Leader điều chỉnh nếu cần.
                  </p>
                </div>
              )}

              {/* Risk Banner from config */}
              {risk && (
                <div className={risk.bannerClass}>
                  <div className="flex items-start gap-2.5">
                    <risk.icon className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-xs uppercase tracking-wider block">
                        {risk.label}
                      </span>
                      <p className="text-xs mt-0.5 opacity-90">{risk.warningMessage}</p>
                    </div>
                  </div>
                </div>
              )}

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
                  Đề xuất tối ưu (Owner & Support)
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
                  Bảng xếp hạng ứng viên ({data?.meta?.totalEvaluated ?? 0})
                </button>
              </div>

              {/* ── Tab: Summary ───────────────────────────────────────── */}
              {activeTab === "summary" && (
                <div className="space-y-5">
                  {/* Weight Legend */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl border border-slate-800/80 bg-slate-900/30 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-300">Công thức đánh giá 4 trọng số:</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sky-400">Workload: 30%</span>
                      <span className="text-emerald-400">Kỹ năng: 25%</span>
                      <span className="text-amber-400">Hiệu suất: 25%</span>
                      <span className="text-purple-400">Học hỏi: 20%</span>
                    </div>
                  </div>

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
                          expectedWorkloadDays={data.owner.workloadDays}
                          riskLevel={data.riskLevel}
                          onAssign={!isAssigned ? () => handleAssignSingle(ownerCandidate.id) : undefined}
                          assigning={assignMutation.isPending || isSubmitting}
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
                            expectedWorkloadDays={data.support.workloadDays}
                          />
                        );
                      })()}
                  </div>

                  {/* Reasons */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-sky-400" />
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Lý do đề xuất từ thuật toán AI
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {data.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                          <span>{reason}</span>
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
                          Phân tích Workload & Rủi ro
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{data.workloadAnalysis}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-3.5 w-3.5 text-purple-400" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Cơ hội học tập & Kèm cặp
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{data.learningOpportunity}</p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  {!isAssigned && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
                      <p className="text-xs text-slate-500 italic">
                        Leader là người xác nhận và quyết định phân công cuối cùng.
                      </p>
                      <Button
                        variant="primary"
                        onClick={handleApplySuggestion}
                        isLoading={assignMutation.isPending || isSubmitting}
                        className="w-full sm:w-auto"
                      >
                        <Sparkles className="h-4 w-4" />
                        Áp dụng gợi ý (Giao cho {data.owner.name})
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Tab: All Candidates ─────────────────────────────────── */}
              {activeTab === "candidates" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1 text-[11px] text-slate-500">
                    <span>Xếp hạng theo độ tương thích (Compatibility Score)</span>
                    <span>W: Workload (30%) · S: Skill (25%) · P: Performance (25%) · L: Learning (20%)</span>
                  </div>

                  {candidates
                    .slice()
                    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
                    .map((c, idx) => (
                      <div
                        key={c.id}
                        className={`flex items-center gap-4 rounded-2xl border px-4 py-3 transition-all ${
                          c.suggestedRole === "OWNER"
                            ? "border-sky-500/40 bg-sky-500/10"
                            : c.suggestedRole === "SUPPORT"
                            ? "border-purple-500/30 bg-purple-500/10"
                            : "border-slate-800 bg-slate-900/30"
                        }`}
                      >
                        {/* Rank */}
                        <span className="shrink-0 w-6 text-center font-mono text-xs font-bold text-slate-400">
                          #{idx + 1}
                        </span>

                        {/* Name + position */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white truncate">{c.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {c.position || "Thực tập sinh"} · {c.activeTaskDays}d active
                          </p>
                        </div>

                        {/* Role badge */}
                        {c.suggestedRole && (
                          <span
                            className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                              c.suggestedRole === "OWNER"
                                ? "border-blue-400/30 bg-blue-500/20 text-blue-300"
                                : "border-purple-400/30 bg-purple-500/20 text-purple-300"
                            }`}
                          >
                            {c.suggestedRole === "OWNER" ? "Owner" : "Support"}
                          </span>
                        )}

                        {/* 4 Scores */}
                        <div className="shrink-0 hidden sm:flex gap-2.5 items-center bg-slate-950/40 px-3 py-1 rounded-xl border border-slate-850">
                          {[
                            { label: "W (30%)", value: c.workloadScore, color: "text-sky-400" },
                            { label: "S (25%)", value: c.skillScore, color: "text-emerald-400" },
                            { label: "P (25%)", value: c.performanceScore, color: "text-amber-400" },
                            { label: "L (20%)", value: c.learningScore, color: "text-purple-400" },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="flex flex-col items-center gap-0.5">
                              <span className={`font-mono text-[10px] font-bold ${color}`}>{value}</span>
                              <span className="text-[8px] text-slate-500 uppercase">{label}</span>
                            </div>
                          ))}
                        </div>

                        {/* Compatibility score */}
                        <div className="shrink-0 text-right">
                          <span className="font-mono text-sm font-bold text-white">
                            {c.compatibilityScore}%
                          </span>
                          <p className="text-[10px] text-slate-500">Tương thích</p>
                        </div>

                        {/* Assign button */}
                        {!isAssigned && (
                          <Button
                            variant={c.suggestedRole === "OWNER" ? "primary" : "glass"}
                            size="sm"
                            onClick={() => handleAssignSingle(c.id)}
                            isLoading={assignMutation.isPending || isSubmitting}
                            className="shrink-0"
                          >
                            Giao
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
