"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import { Sparkles, ChevronLeft, ChevronRight, CheckCircle2, Clock, TrendingUp, Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import WeeklyEvaluationExportButton from "@/components/pdf/WeeklyEvaluationExportButton";
import { useWeeklyEvaluations } from "@/hooks/weekly-evaluation/useWeeklyEvaluations";
import { RATING_COLORS, type RatingLevel, type WeeklyEvaluation, type WeeklyEvaluationQueryParams } from "@/types/weekly-evaluation";

function getRatingLevel(score: number): RatingLevel {
  if (score >= 8.0) return "TOT"; if (score >= 6.5) return "KHA"; if (score >= 5.0) return "TB"; if (score >= 3.5) return "TBY"; return "YEU";
}

export default function InternWeeklyEvaluationList() {
  const t = useTranslations("intern.weeklyEvaluation");
  const tRatings = useTranslations("intern.weeklyEvaluation.ratings");
  const searchParams = useSearchParams(); const router = useRouter(); const pathname = usePathname();

  const params: WeeklyEvaluationQueryParams = useMemo(() => {
    const page = searchParams.get("page"); return { page: page ? Number(page) : 1, limit: 10, sortBy: "week", order: "desc" };
  }, [searchParams]);

  const { data: response, isLoading } = useWeeklyEvaluations(params);
  const evaluations = response?.data ?? []; const meta = response?.meta;
  const totalPages = meta?.totalPages ?? 1; const currentPage = meta?.page ?? 1;

  const handlePageChange = (page: number) => { const nextParams = new URLSearchParams(searchParams.toString()); nextParams.set("page", String(page)); router.push(`${pathname}?${nextParams.toString()}`); };

  const avgScore = evaluations.length
    ? evaluations.reduce((sum, e) => sum + (e.score ?? e.totalScore ?? 0), 0) / evaluations.length
    : null;
  const latestEval = evaluations[0] ?? null;
  const latestScore = latestEval ? (latestEval.score ?? latestEval.totalScore ?? 0) : null;
  const reviewedCount = evaluations.filter((e) => e.viewedAt || e.reviewedAt).length;

  if (isLoading) return <div className="flex justify-center items-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-primary-light" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted">{t("description")}</p>
        </div>
      </div>

      {latestEval && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetalCard className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary-light" />
            </div>
            <div>
              <p className="text-xs text-muted">{t("latestScore")}</p>
              <p className="text-lg font-bold text-foreground">
                {latestScore !== null ? `${latestScore.toFixed(1)} / 10` : "—"}
              </p>
            </div>
          </MetalCard>
          <MetalCard className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted">{t("avgScore")}</p>
              <p className="text-lg font-bold text-foreground">
                {avgScore !== null ? `${avgScore.toFixed(1)} / 10` : "—"}
              </p>
            </div>
          </MetalCard>
          <MetalCard className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
              <CheckCircle2 className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-muted">{t("reviewedCount")}</p>
              <p className="text-lg font-bold text-foreground">{reviewedCount}</p>
            </div>
          </MetalCard>
        </div>
      )}

      <MetalCard className="p-6">
        <div className="border-b border-white/10 pb-4 mb-5"><h2 className="text-lg font-semibold metal-text">{t("evaluationHistory")}</h2><p className="text-xs text-muted mt-1">{t("historyDesc")}</p></div>

        {evaluations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10"><Sparkles className="h-8 w-8 text-muted" /></div><p className="text-sm text-muted">{t("noEvaluations")}</p></div>
        ) : (
          <Table columns="1.5fr 1.5fr 1fr 1.5fr">
            <Table.Header><span>{t("colWeek")}</span><span>{t("colScore")}</span><span className="text-center">{t("colStatus")}</span><span className="text-center">{t("colDetail")}</span></Table.Header>
            <Table.Body data={evaluations} render={(item: WeeklyEvaluation) => {
              const scoreVal = item.score ?? item.totalScore ?? 0;
              const level = getRatingLevel(scoreVal);
              const isReviewed = !!(item.viewedAt || item.reviewedAt);
              return (
                <Table.Row key={item.id}>
                  <div className="flex flex-col gap-0.5"><span className="font-bold text-foreground text-sm">{t("week", { n: item.week })}</span><span className="text-[11px] text-muted">{new Date(item.createdAt).toLocaleDateString("vi-VN")}</span></div>
                  <div className="flex flex-col gap-1 items-start"><span className="text-sm font-extrabold text-foreground">{scoreVal.toFixed(1)} / 10</span><span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-lg border leading-none w-fit ${RATING_COLORS[level]}`}>{tRatings(level)}</span></div>
                  <div className="flex justify-center">{isReviewed ? <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border text-emerald-400 border-emerald-500/30 bg-emerald-500/10"><CheckCircle2 className="h-3 w-3" />{t("reviewed")}</span> : <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border text-amber-400 border-amber-500/30 bg-amber-500/10"><Clock className="h-3 w-3" />{t("notReviewed")}</span>}</div>
                  <div className="flex items-center justify-center gap-2">
                    <WeeklyEvaluationExportButton id={item.id} label="PDF" className="flex items-center gap-1 px-2.5 py-1 text-xs" />
                    <Link href={`/intern/weekly-evaluation/${item.id}`}>
                      <Button variant="glass" size="sm" className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        <span>{t("view")}</span>
                      </Button>
                    </Link>
                  </div>
                </Table.Row>
              );
            }} />
            {totalPages > 1 && <Table.Footer><div className="flex items-center gap-4"><Button variant="glass" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}><ChevronLeft className="h-4 w-4" /></Button><span className="text-sm text-muted">{t("pagination", { page: currentPage, totalPages })}</span><Button variant="glass" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}><ChevronRight className="h-4 w-4" /></Button></div></Table.Footer>}
          </Table>
        )}
      </MetalCard>
    </div>
  );
}
