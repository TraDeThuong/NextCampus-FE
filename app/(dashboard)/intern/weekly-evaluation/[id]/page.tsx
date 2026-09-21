"use client";

import { useParams, useRouter, notFound } from "next/navigation";
import {
  ArrowLeft,
  User,
  Calendar,
  BookOpen,
  Star,
  MessageSquare,
  ClipboardList,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
} from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import WeeklyEvaluationExportButton from "@/components/pdf/WeeklyEvaluationExportButton";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useWeeklyEvaluationDetail } from "@/hooks/weekly-evaluation/useWeeklyEvaluationDetail";
import { useWeeklyEvaluations } from "@/hooks/weekly-evaluation/useWeeklyEvaluations";
import { useMarkReviewed } from "@/hooks/weekly-evaluation/useMarkReviewed";
import {
  CRITERIA_SECTIONS,
  RATING_COLORS,
  RATING_SCORES,
  type EvaluationRatings,
  type RatingLevel,
} from "@/types/weekly-evaluation";

function computeTotalFromRatings(ratings: EvaluationRatings): number {
  const allKeys = CRITERIA_SECTIONS.flatMap((s) => s.criteria.map((c) => c.key));
  return parseFloat(
    (
      allKeys.map((k) => RATING_SCORES[ratings[k]]).reduce((a, b) => a + b, 0) /
      allKeys.length
    ).toFixed(2),
  );
}

function RatingBadge({ level }: { level: RatingLevel }) {
  const tRatings = useTranslations("intern.weeklyEvaluation.ratings");
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-lg border leading-none ${RATING_COLORS[level]}`}
    >
      {tRatings(level)}
    </span>
  );
}

function CriteriaTable({
  ratings,
  aiRatings,
}: {
  ratings: EvaluationRatings;
  aiRatings?: EvaluationRatings | null;
}) {
  const td = useTranslations("intern.weeklyEvaluation.detail");
  const tSections = useTranslations("intern.weeklyEvaluation.sections");
  const tCriteria = useTranslations("intern.weeklyEvaluation.criteria");
  const tRatings = useTranslations("intern.weeklyEvaluation.ratings");

  return (
    <div className="space-y-4">
      {CRITERIA_SECTIONS.map((section) => (
        <div
          key={section.id}
          className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.01]"
        >
          <div className="flex items-center gap-2.5 px-4 py-3 bg-white/[0.04] border-b border-white/10">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/20 text-xs font-bold text-cyan-300 shrink-0">
              {section.id}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {tSections(section.id)}
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {section.criteria.map((criterion, idx) => {
              const level = ratings[criterion.key];
              const aiLevel = aiRatings?.[criterion.key];
              const isDiff = aiLevel && aiLevel !== level;
              return (
                <div
                  key={criterion.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs text-muted font-mono shrink-0 w-5">
                      {idx + 1}.
                    </span>
                    <span
                      className="text-xs sm:text-sm text-foreground/90 truncate"
                      title={criterion.tooltip}
                    >
                      {tCriteria(criterion.key)}
                    </span>
                    {criterion.tooltip && (
                      <span
                        className="text-muted hover:text-cyan-400 cursor-help transition shrink-0"
                        title={criterion.tooltip}
                      >
                        <Info className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pl-7 sm:pl-0 flex-wrap sm:flex-nowrap">
                    {aiLevel && isDiff && (
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-sky-400 shrink-0" />
                        <span
                          className={`text-xs px-2 py-0.5 rounded-lg border opacity-80 ${RATING_COLORS[aiLevel]}`}
                          title={`AI: ${tRatings(aiLevel)}`}
                        >
                          AI: {tRatings(aiLevel)}
                        </span>
                      </div>
                    )}
                    <RatingBadge level={level} />
                  </div>
                </div>
              );
            })}
          </div>
          {(() => {
            const keys = section.criteria.map((c) => c.key);
            const avg = parseFloat(
              (
                keys.map((k) => RATING_SCORES[ratings[k]]).reduce((a, b) => a + b, 0) /
                keys.length
              ).toFixed(1),
            );
            return (
              <div className="flex justify-end px-4 py-2.5 bg-white/[0.02] border-t border-white/5">
                <span className="text-xs text-muted mr-2">
                  {td("sectionScore", { id: section.id })}
                </span>
                <span className="text-xs font-bold text-cyan-300">
                  {avg.toFixed(1)} / 10
                </span>
              </div>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

function LegacyScoreBars({
  communication,
  attitude,
  learning,
  coding,
}: {
  communication: number;
  attitude: number;
  learning: number;
  coding: number;
}) {
  const td = useTranslations("intern.weeklyEvaluation.detail");
  const items = [
    { label: td("communication"), value: communication },
    { label: td("attitude"), value: attitude },
    { label: td("learning"), value: learning },
    { label: td("coding"), value: coding },
  ];
  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-foreground">{item.label}</span>
            <span className="text-sm font-bold text-primary-light">
              {item.value.toFixed(1)}{" "}
              <span className="text-muted font-normal">/ 10</span>
            </span>
          </div>
          <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-primary-main to-primary-light rounded-full"
              style={{ width: `${item.value * 10}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProgressChart({
  currentWeek,
  allEvaluations,
}: {
  currentWeek: number;
  allEvaluations: Array<{
    week: number;
    communication: number;
    attitude: number;
    learning: number;
    coding: number;
    totalScore: number;
  }>;
}) {
  const td = useTranslations("intern.weeklyEvaluation.detail");
  const recent = [...allEvaluations].sort((a, b) => a.week - b.week).slice(-6);
  if (recent.length < 2) return null;

  const groups = [
    {
      label: td("communication"),
      key: "communication" as const,
      color: "from-blue-500 to-blue-400",
    },
    {
      label: td("attitude"),
      key: "attitude" as const,
      color: "from-emerald-500 to-emerald-400",
    },
    {
      label: td("learning"),
      key: "learning" as const,
      color: "from-amber-500 to-amber-400",
    },
    {
      label: td("coding"),
      key: "coding" as const,
      color: "from-purple-500 to-purple-400",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="text-xs text-muted">{td("showingWeeks", { n: recent.length })}</div>
      {groups.map((g) => {
        const prev = recent.slice(-2)[0];
        const curr = recent.slice(-1)[0];
        const trend = curr[g.key] - prev[g.key];
        return (
          <div key={g.key} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{g.label}</span>
              <div className="flex items-center gap-2">
                {trend > 0 ? (
                  <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-semibold">
                    <TrendingUp className="h-3 w-3 shrink-0" />
                    +{trend.toFixed(1)}
                  </span>
                ) : trend < 0 ? (
                  <span className="flex items-center gap-0.5 text-rose-400 text-xs font-semibold">
                    <TrendingDown className="h-3 w-3 shrink-0" />
                    {trend.toFixed(1)}
                  </span>
                ) : null}
                <span className="text-sm font-bold text-primary-light">
                  {curr[g.key].toFixed(1)} / 10
                </span>
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-12 pt-2">
              {recent.map((ev) => {
                const val = ev[g.key];
                const isCurrent = ev.week === currentWeek;
                const heightPct = Math.max((val / 10) * 100, 8);
                return (
                  <div
                    key={ev.week}
                    className="flex-1 flex flex-col items-center gap-1 min-w-0"
                  >
                    <div className="w-full flex items-end h-10">
                      <div
                        className={`w-full rounded-md bg-gradient-to-t transition-all duration-500 ${
                          isCurrent
                            ? `${g.color} opacity-100 shadow-[0_0_8px_rgba(56,189,248,0.3)]`
                            : "from-white/10 to-white/20 opacity-60 hover:opacity-80"
                        }`}
                        style={{ height: `${heightPct}%` }}
                        title={`Tuần ${ev.week}: ${val.toFixed(1)} / 10`}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-mono ${
                        isCurrent
                          ? "text-primary-light font-bold"
                          : "text-muted"
                      }`}
                    >
                      W{ev.week}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeeklyEvaluationDetailContent() {
  const t = useTranslations("intern.weeklyEvaluation");
  const td = useTranslations("intern.weeklyEvaluation.detail");
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: response, isLoading, isError } = useWeeklyEvaluationDetail(params.id);
  const { data: allResponse } = useWeeklyEvaluations({
    sortBy: "week",
    order: "asc",
    limit: 100,
  });
  const markReviewed = useMarkReviewed();

  const evaluation = response?.data;
  const allEvaluations = allResponse?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !evaluation) notFound();

  const hasRatings = evaluation.ratings !== null && evaluation.ratings !== undefined;
  const ratings = evaluation.ratings as EvaluationRatings | null;
  const finalScore =
    hasRatings && ratings ? computeTotalFromRatings(ratings) : evaluation.totalScore;
  const isReviewed = !!(evaluation.viewedAt || evaluation.reviewedAt);

  const handleMarkReviewed = async () => {
    try {
      await markReviewed.mutateAsync(params.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── BACK BUTTON ─────────────────────────────────────────────────── */}
      <button
        onClick={() => router.push("/intern/weekly-evaluation")}
        className="group inline-flex items-center gap-2 text-xs sm:text-sm text-muted transition hover:text-foreground cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
        <span>{t("backToList")}</span>
      </button>

      {/* ─── HEADER INFO CARD ────────────────────────────────────────────── */}
      <MetalCard className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-main to-primary-light text-2xl font-bold text-white shadow-lg">
              {evaluation.intern?.fullName?.charAt(0).toUpperCase() || "I"}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {td("yourEvaluation")}
                </h1>
                <span className="text-xs sm:text-sm font-medium px-2.5 py-0.5 rounded-full border border-primary-light/30 bg-primary-light/10 text-primary-light">
                  {td("week", { n: evaluation.week })}
                </span>
                {hasRatings && (
                  <span className="text-xs font-normal px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                    <ClipboardList className="h-3.5 w-3.5 shrink-0" />
                    <span>{td("criteria12")}</span>
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-muted flex flex-wrap items-center gap-1.5">
                <User className="h-4 w-4 text-muted shrink-0" />
                <span>
                  {td("evaluatedBy", {
                    name:
                      evaluation.leader?.fullName ||
                      evaluation.leader?.email ||
                      td("leader"),
                  })}
                </span>
                <span className="text-border mx-1.5">|</span>
                <Calendar className="h-4 w-4 text-muted shrink-0" />
                <span>{new Date(evaluation.createdAt).toLocaleDateString("vi-VN")}</span>
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <WeeklyEvaluationExportButton id={evaluation.id} />
            {isReviewed ? (
              <div className="flex flex-col items-start sm:items-end gap-0.5">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{td("reviewedConfirmed")}</span>
                </div>
                <span className="text-[11px] text-muted font-mono">
                  {new Date(
                    (evaluation.viewedAt || evaluation.reviewedAt)!,
                  ).toLocaleString("vi-VN")}
                </span>
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleMarkReviewed}
                disabled={markReviewed.isPending}
                className="flex items-center gap-2 rounded-xl"
              >
                {markReviewed.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                )}
                <span>
                  {markReviewed.isPending ? td("confirming") : td("markReviewed")}
                </span>
              </Button>
            )}
          </div>
        </div>
      </MetalCard>

      {/* ─── MAIN GRID (Left 2 cols, Right 1 col) ────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: 12 Tiêu chí hoặc Legacy Breakdown */}
          <MetalCard className="p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-light/10 text-primary-light shrink-0">
                  <BookOpen className="h-4 w-4 shrink-0" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold">
                  <span className="metal-text">
                    {hasRatings ? td("criteriaTable") : td("scoreDetail")}
                  </span>
                </h2>
              </div>
              {evaluation.leaderEdited && (
                <span className="text-xs px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span>{td("adjustedAfterAi")}</span>
                </span>
              )}
            </div>

            {hasRatings && ratings ? (
              <CriteriaTable ratings={ratings} aiRatings={evaluation.aiRatings} />
            ) : (
              <LegacyScoreBars
                communication={evaluation.communication}
                attitude={evaluation.attitude}
                learning={evaluation.learning}
                coding={evaluation.coding}
              />
            )}
          </MetalCard>

          {/* Card 2: Nhận xét của Leader */}
          <MetalCard className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border/40 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-light/10 text-primary-light shrink-0">
                <MessageSquare className="h-4 w-4 shrink-0" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold">
                <span className="metal-text">{td("leadersReview")}</span>
              </h2>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5">
              <p className="text-foreground/90 text-sm whitespace-pre-wrap leading-relaxed">
                {evaluation.comment || td("noLeaderComment")}
              </p>
            </div>
            {evaluation.aiComment && evaluation.leaderEdited && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary-light shrink-0" />
                  <h3 className="text-xs font-semibold text-muted">
                    {td("originalAiComment")}
                  </h3>
                </div>
                <div className="bg-primary-main/5 border border-primary-light/10 rounded-2xl p-4">
                  <p className="text-muted text-xs whitespace-pre-wrap leading-relaxed italic">
                    {evaluation.aiComment}
                  </p>
                </div>
              </div>
            )}
          </MetalCard>

          {/* Card 3: Biểu đồ tiến độ (nếu có từ 2 tuần trở lên) */}
          {allEvaluations.length >= 2 && (
            <MetalCard className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-border/40 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-light/10 text-primary-light shrink-0">
                  <TrendingUp className="h-4 w-4 shrink-0" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold">
                  <span className="metal-text">{td("progressChart")}</span>
                </h2>
              </div>
              <ProgressChart
                currentWeek={evaluation.week}
                allEvaluations={allEvaluations.map((e) => ({
                  week: e.week,
                  communication: e.communication,
                  attitude: e.attitude,
                  learning: e.learning,
                  coding: e.coding,
                  totalScore: e.totalScore,
                }))}
              />
            </MetalCard>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR PANEL: BORDERLESS LAYOUT (Rule 46 Compliant) ─── */}
        <div className="space-y-6 lg:sticky lg:top-6 self-start">
          <div className="rounded-3xl bg-white/[0.02] p-5 sm:p-6 text-center space-y-6">
            {/* Header */}
            <div className="border-b border-border/40 pb-4 flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold">
                <span className="metal-text">{td("overallScore")}</span>
              </h2>
            </div>

            {/* Score Big Display */}
            <div className="space-y-2">
              <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary-light leading-none">
                {finalScore.toFixed(2)}
              </div>
              <div className="text-xs sm:text-sm text-muted">{td("outOf")}</div>
            </div>

            {/* Sub-scores bars */}
            <div className="pt-4 border-t border-border/40 space-y-2.5 text-xs">
              {[
                { label: td("communication"), value: evaluation.communication },
                { label: td("attitude"), value: evaluation.attitude },
                { label: td("learning"), value: evaluation.learning },
                { label: td("coding"), value: evaluation.coding },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-muted">{label}:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-main to-primary-light rounded-full"
                        style={{ width: `${value * 10}%` }}
                      />
                    </div>
                    <span className="font-semibold text-foreground w-8 text-right">
                      {value.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Meta Information */}
            <div className="pt-4 border-t border-border/40 text-left space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <span>{td("evaluator")}</span>
                <span className="font-semibold text-foreground truncate max-w-[140px] text-right">
                  {evaluation.leader?.fullName ||
                    evaluation.leader?.email ||
                    td("leader")}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>{td("createdAt")}</span>
                <span className="font-semibold text-foreground">
                  {new Date(evaluation.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between text-muted">
                <span>{td("status")}</span>
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    isReviewed ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {isReviewed ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      {td("reviewed")}
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 shrink-0" />
                      {td("notReviewed")}
                    </>
                  )}
                </span>
              </div>
              {isReviewed && (
                <div className="flex justify-between text-muted">
                  <span>{td("reviewedAt")}</span>
                  <span className="font-semibold text-foreground text-right">
                    {new Date(
                      (evaluation.viewedAt || evaluation.reviewedAt)!,
                    ).toLocaleString("vi-VN")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InternWeeklyEvaluationDetailPage() {
  return (
    <ProtectedRoute requiredPermissions={["WEEKLY_EVALUATION_READ"]}>
      <WeeklyEvaluationDetailContent />
    </ProtectedRoute>
  );
}
