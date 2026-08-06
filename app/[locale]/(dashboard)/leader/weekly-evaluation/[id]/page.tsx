"use client";

import { useParams, useRouter, notFound } from "next/navigation";
import { ArrowLeft, Sparkles, User, Calendar, BookOpen, Star, MessageSquare, ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useWeeklyEvaluationDetail } from "@/hooks/weekly-evaluation/useWeeklyEvaluationDetail";
import WeeklyEvaluationExportButton from "../WeeklyEvaluationExportButton";
import { CRITERIA_SECTIONS, RATING_COLORS, RATING_SCORES, type EvaluationRatings, type RatingLevel } from "@/types/weekly-evaluation";

function computeTotalFromRatings(ratings: EvaluationRatings): number {
  const allKeys = CRITERIA_SECTIONS.flatMap(s => s.criteria.map(c => c.key));
  return parseFloat((allKeys.map(k => RATING_SCORES[ratings[k]]).reduce((a, b) => a + b, 0) / allKeys.length).toFixed(2));
}

function RatingBadge({ level }: { level: RatingLevel }) {
  const tRatings = useTranslations("leader.weeklyEvaluation.ratings");
  return <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-lg border ${RATING_COLORS[level]}`}>{tRatings(level)}</span>;
}

function CriteriaTable({ ratings, aiRatings }: { ratings: EvaluationRatings; aiRatings?: EvaluationRatings | null }) {
  const t = useTranslations("leader.weeklyEvaluation.detail");
  const tSections = useTranslations("leader.weeklyEvaluation.sections");
  const tCriteria = useTranslations("leader.weeklyEvaluation.criteria");
  const tRatings = useTranslations("leader.weeklyEvaluation.ratings");
  return (
    <div className="space-y-4">
      {CRITERIA_SECTIONS.map((section) => (
        <div key={section.id} className="rounded-2xl overflow-hidden border border-border/40">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border-b border-border/40">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-main/20 text-xs font-bold text-primary-light shrink-0">{section.id}</span>
            <span className="text-sm font-semibold text-foreground">{tSections(section.id)}</span>
          </div>
          <div className="divide-y divide-border/20">
            {section.criteria.map((criterion, idx) => {
              const level = ratings[criterion.key]; const aiLevel = aiRatings?.[criterion.key]; const isDiff = aiLevel && aiLevel !== level;
              return (
                <div key={criterion.key} className="flex items-center gap-4 px-4 py-2.5 hover:bg-white/[0.01]">
                  <span className="text-xs text-muted font-mono shrink-0 w-5">{idx + 1}.</span>
                  <span className="flex-1 text-sm text-slate-300">{tCriteria(criterion.key)}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {aiLevel && isDiff && <div className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary-light/50" /><span className={`text-xs px-2 py-0.5 rounded border opacity-60 ${RATING_COLORS[aiLevel]}`}>{tRatings(aiLevel)}</span></div>}
                    <RatingBadge level={level} />
                  </div>
                </div>
              );
            })}
          </div>
          {(() => {
            const keys = section.criteria.map(c => c.key);
            const avg = parseFloat((keys.map(k => RATING_SCORES[ratings[k]]).reduce((a, b) => a + b, 0) / keys.length).toFixed(1));
            return (
              <div className="flex justify-end px-4 py-2 bg-white/[0.02] border-t border-border/20">
                <span className="text-xs text-muted mr-2">{t("sectionScore", { id: section.id })}</span>
                <span className="text-xs font-bold text-primary-light">{avg.toFixed(1)} / 10</span>
              </div>
            );
          })()}
        </div>
      ))}
    </div>
  );
}

function LegacyScoreBars({ communication, attitude, learning, coding, aiCommunication, aiAttitude, aiLearning, aiCoding, hasAi }: {
  communication: number; attitude: number; learning: number; coding: number;
  aiCommunication: number | null; aiAttitude: number | null; aiLearning: number | null; aiCoding: number | null; hasAi: boolean;
}) {
  const t = useTranslations("leader.weeklyEvaluation.detail");
  const scoreItems = [
    { label: t("communication"), final: communication, ai: aiCommunication },
    { label: t("attitude"), final: attitude, ai: aiAttitude },
    { label: t("learning"), final: learning, ai: aiLearning },
    { label: t("coding"), final: coding, ai: aiCoding },
  ];
  return (
    <div className="space-y-6">
      {scoreItems.map((item, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-slate-300">{item.label}</span>
            <div className="flex items-center gap-3">
              {hasAi && item.ai !== null && <span className="text-xs text-muted">{t("aiHint")} <strong className="text-slate-400">{item.ai.toFixed(1)}</strong></span>}
              <span className="text-sm font-bold text-primary-light">{item.final.toFixed(1)} <span className="text-slate-500 font-normal">/ 10</span></span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-gradient-to-r from-primary-main to-primary-light rounded-full" style={{ width: `${item.final * 10}%` }} /></div>
            {hasAi && item.ai !== null && <div className="h-1 w-full bg-transparent rounded-full overflow-hidden"><div className="h-full bg-slate-500/40 rounded-full" style={{ width: `${item.ai * 10}%` }} /></div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WeeklyEvaluationDetailPage() {
  const t = useTranslations("leader.weeklyEvaluation");
  const td = useTranslations("leader.weeklyEvaluation.detail");
  const params = useParams<{ id: string }>(); const router = useRouter();
  const { data: response, isLoading, isError } = useWeeklyEvaluationDetail(params.id);
  const evaluation = response?.data;

  if (isLoading) return <div className="flex items-center justify-center py-32"><Spinner size="lg" /></div>;
  if (isError || !evaluation) notFound();

  const hasRatings = evaluation.ratings !== null && evaluation.ratings !== undefined;
  const ratings = evaluation.ratings as EvaluationRatings | null;
  const aiRatings = evaluation.aiRatings as EvaluationRatings | null;

  const finalScore = hasRatings && ratings ? computeTotalFromRatings(ratings) : evaluation.totalScore;
  const hasAi = hasRatings ? aiRatings !== null : (evaluation.aiCommunication !== null && evaluation.aiAttitude !== null && evaluation.aiLearning !== null && evaluation.aiCoding !== null);
  const aiScore = hasRatings && aiRatings ? computeTotalFromRatings(aiRatings) : hasAi ? ((evaluation.aiCommunication ?? 0) + (evaluation.aiAttitude ?? 0) + (evaluation.aiLearning ?? 0) + (evaluation.aiCoding ?? 0)) / 4 : 0;

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/leader/weekly-evaluation")} className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" />{t("backToList")}</button>

      <MetalCard>
        <div className="rounded-3xl p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-main to-primary-light text-2xl font-bold text-white shadow-lg">{evaluation.intern?.fullName.charAt(0).toUpperCase() || "I"}</div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  {evaluation.intern?.fullName || td("unknownIntern")}
                  <span className="text-sm font-normal px-2.5 py-0.5 rounded-full border border-primary-light/30 bg-primary-light/10 text-primary-light">{td("week", { n: evaluation.week })}</span>
                  {hasRatings && <span className="text-xs font-normal px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1"><ClipboardList className="h-3 w-3" />{td("criteria12")}</span>}
                </h1>
                <p className="mt-1 text-sm text-slate-400 flex items-center gap-1">
                  <User className="h-4 w-4 text-slate-500" /><span>{evaluation.intern?.user?.email}</span>
                  <span className="text-slate-600 mx-2">|</span>
                  <Calendar className="h-4 w-4 text-slate-500" /><span>{td("evaluatedOn", { date: new Date(evaluation.createdAt).toLocaleDateString("vi-VN") })}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3"><WeeklyEvaluationExportButton id={evaluation.id} /></div>
          </div>
        </div>
      </MetalCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <MetalCard>
            <div className="rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary-light shrink-0" /><span className="metal-text">{hasRatings ? td("criteriaTable") : td("scoreDetail")}</span></h2>
                {evaluation.leaderEdited && <span className="text-xs px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 flex items-center gap-1"><Sparkles className="h-3 w-3" />{td("adjustedAfterAi")}</span>}
              </div>
              {hasRatings && ratings ? <CriteriaTable ratings={ratings} aiRatings={aiRatings} /> :
               <LegacyScoreBars communication={evaluation.communication} attitude={evaluation.attitude} learning={evaluation.learning} coding={evaluation.coding} aiCommunication={evaluation.aiCommunication} aiAttitude={evaluation.aiAttitude} aiLearning={evaluation.aiLearning} aiCoding={evaluation.aiCoding} hasAi={hasAi} />}
            </div>
          </MetalCard>

          <MetalCard>
            <div className="rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border/40 pb-4"><MessageSquare className="h-5 w-5 text-primary-light shrink-0" /><span className="metal-text">{td("review")}</span></h2>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5"><p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{evaluation.comment || td("noComment")}</p></div>
              {evaluation.aiComment && evaluation.leaderEdited && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-xs font-semibold text-muted flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-primary-light" />{td("originalAiComment")}</h3>
                  <div className="bg-primary-main/5 border border-primary-light/10 rounded-2xl p-4"><p className="text-slate-400 text-xs whitespace-pre-wrap leading-relaxed italic">{evaluation.aiComment}</p></div>
                </div>
              )}
            </div>
          </MetalCard>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 self-start">
          <MetalCard>
            <div className="rounded-3xl p-6 text-center space-y-6">
              <h2 className="text-lg font-semibold border-b border-border/40 pb-4 flex items-center justify-center gap-2"><Star className="h-5 w-5 text-yellow-400 shrink-0" /><span className="metal-text">{td("overallScore")}</span></h2>
              <div className="space-y-2"><div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary-light">{finalScore.toFixed(2)}</div><div className="text-sm text-muted">{td("outOf")}</div></div>
              {hasAi && (
                <div className="pt-4 border-t border-border/40 flex items-center justify-around text-xs">
                  <div className="text-center"><div className="text-slate-400 font-bold">{finalScore.toFixed(2)}</div><div className="text-muted mt-0.5">{td("finalScore")}</div></div>
                  <div className="h-8 w-px bg-border/40" />
                  <div className="text-center"><div className="text-slate-400 font-bold">{aiScore.toFixed(2)}</div><div className="text-muted mt-0.5">{td("aiSuggested")}</div></div>
                </div>
              )}
              <div className="pt-4 border-t border-border/40 space-y-2 text-xs">
                {[
                  { label: td("communication"), value: evaluation.communication },
                  { label: td("attitude"), value: evaluation.attitude },
                  { label: td("learning"), value: evaluation.learning },
                  { label: td("coding"), value: evaluation.coding },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-muted">{label}:</span>
                    <div className="flex items-center gap-2"><div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary-main to-primary-light rounded-full" style={{ width: `${value * 10}%` }} /></div><span className="font-semibold text-foreground w-8 text-right">{value.toFixed(1)}</span></div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-border/40 text-left space-y-2 text-xs">
                <div className="flex justify-between text-muted"><span>{td("evaluator")}</span><span className="font-semibold text-foreground">{evaluation.leader?.fullName || evaluation.leader?.email || td("leader")}</span></div>
                <div className="flex justify-between text-muted"><span>{td("createdAt")}</span><span className="font-semibold text-foreground">{new Date(evaluation.createdAt).toLocaleDateString("vi-VN")}</span></div>
                <div className="flex justify-between text-muted"><span>{td("updatedAt")}</span><span className="font-semibold text-foreground">{new Date(evaluation.updatedAt).toLocaleDateString("vi-VN")}</span></div>
              </div>
            </div>
          </MetalCard>
        </div>
      </div>
    </div>
  );
}
