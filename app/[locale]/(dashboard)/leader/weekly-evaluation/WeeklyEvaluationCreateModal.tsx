"use client";

import { useState, useMemo, useContext } from "react";
import { Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { useCreateWeeklyEvaluation } from "@/hooks/weekly-evaluation/useCreateWeeklyEvaluation";
import { useAiSuggestion } from "@/hooks/weekly-evaluation/useAiSuggestion";
import { useInterns } from "@/hooks/intern/useInterns";
import { useWeeklyEvaluations } from "@/hooks/weekly-evaluation/useWeeklyEvaluations";
import { AuthContext } from "@/contexts/AuthContext";
import type { CreateWeeklyEvaluationPayload, EvaluationRatings, RatingLevel } from "@/types/weekly-evaluation";
import { CRITERIA_SECTIONS, DEFAULT_RATINGS, RATING_SCORES, RATING_COLORS } from "@/types/weekly-evaluation";

interface Props { onCloseModal?: () => void; }
const RATING_LEVELS: RatingLevel[] = ["TOT", "KHA", "TB", "TBY", "YEU"];

function computeScores(ratings: EvaluationRatings) {
  const s = (k: keyof EvaluationRatings) => RATING_SCORES[ratings[k]];
  const avg = (nums: number[]) => parseFloat((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2));
  const communication = avg([s("communication"), s("teamwork")]);
  const attitude = avg([s("ruleCompliance"), s("workAttitude"), s("resilience")]);
  const learning = avg([s("learningCapacity"), s("knowledge"), s("creativity")]);
  const coding = avg([s("practicalSkills"), s("contentQuality"), s("progressDelivery")]);
  const allScores = CRITERIA_SECTIONS.flatMap(sec => sec.criteria.map(c => s(c.key)));
  const totalScore = avg(allScores);
  return { communication, attitude, learning, coding, totalScore };
}

function RatingSelector({ value, onChange, aiValue }: { value: RatingLevel; onChange: (v: RatingLevel) => void; aiValue?: RatingLevel }) {
  const tRatings = useTranslations("leader.weeklyEvaluation.ratings");
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {RATING_LEVELS.map((level) => {
        const isSelected = value === level; const isAi = aiValue === level && !isSelected;
        const label = tRatings(level);
        return (
          <button key={level} type="button" onClick={() => onChange(level)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all duration-150 ${isSelected ? `${RATING_COLORS[level]} border-current ring-1 ring-current scale-105` : isAi ? "border-primary-light/40 text-primary-light bg-primary-light/5 opacity-80" : "border-white/10 text-slate-400 bg-white/[0.03] hover:border-white/20 hover:text-slate-300"}`}
            title={isAi ? `AI: ${label}` : label}>
            {label}{isAi && <span className="ml-1 opacity-60 text-[9px]">AI</span>}
          </button>
        );
      })}
    </div>
  );
}

export default function WeeklyEvaluationCreateModal({ onCloseModal }: Props) {
  const t = useTranslations("leader.weeklyEvaluation.createModal");
  const tSections = useTranslations("leader.weeklyEvaluation.sections");
  const tCriteria = useTranslations("leader.weeklyEvaluation.criteria");
  const tRatings = useTranslations("leader.weeklyEvaluation.ratings");
  const auth = useContext(AuthContext); const currentUserId = auth?.state.user?.id;
  const createEvaluation = useCreateWeeklyEvaluation(); const aiSuggestion = useAiSuggestion();
  const { data: internsData, isLoading: internsLoading } = useInterns({ status: "ACTIVE", leaderId: currentUserId || undefined });
  const interns = useMemo(() => internsData?.data ?? [], [internsData]);

  const [internId, setInternId] = useState(""); const [week, setWeek] = useState(1);
  const [ratings, setRatings] = useState<EvaluationRatings>({ ...DEFAULT_RATINGS });
  const { data: existingEvaluations } = useWeeklyEvaluations(internId ? { internId, limit: 100 } : undefined);
  const evaluatedWeeks = useMemo(() => existingEvaluations?.data?.map((e) => e.week) ?? [], [existingEvaluations]);
  const selectedIntern = useMemo(() => interns.find((i) => i.id === internId), [interns, internId]);

  const maxWeek = useMemo(() => {
    if (!selectedIntern) return 99;
    const tzOffset = 7 * 60 * 60 * 1000; // Asia/Ho_Chi_Minh is UTC+7
    const startLocal = new Date(new Date(selectedIntern.startDate).getTime() + tzOffset);
    const startMidnight = new Date(Date.UTC(
      startLocal.getUTCFullYear(),
      startLocal.getUTCMonth(),
      startLocal.getUTCDate(),
      0, 0, 0, 0
    ));
    const today = new Date();
    const todayLocal = new Date(today.getTime() + tzOffset);
    const todayMidnight = new Date(Date.UTC(
      todayLocal.getUTCFullYear(),
      todayLocal.getUTCMonth(),
      todayLocal.getUTCDate(),
      0, 0, 0, 0
    ));
    const diffMs = todayMidnight.getTime() - startMidnight.getTime();
    const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));
    const elapsedWeeks = Math.floor(diffDays / 7) + 1;
    return Math.max(1, elapsedWeeks);
  }, [selectedIntern]);

  const isWeekendAllowedForCurrentWeek = useMemo(() => {
    const tzOffset = 7 * 60 * 60 * 1000;
    const today = new Date();
    const todayLocal = new Date(today.getTime() + tzOffset);
    const dayOfWeek = todayLocal.getUTCDay();
    const hours = todayLocal.getUTCHours();
    return (dayOfWeek === 6 && hours >= 11) || dayOfWeek === 0;
  }, []);

  const handleInternChange = (id: string) => {
    setInternId(id); const intern = interns.find(i => i.id === id);
    if (intern) {
      const tzOffset = 7 * 60 * 60 * 1000;
      const startLocal = new Date(new Date(intern.startDate).getTime() + tzOffset);
      const startMidnight = new Date(Date.UTC(
        startLocal.getUTCFullYear(),
        startLocal.getUTCMonth(),
        startLocal.getUTCDate(),
        0, 0, 0, 0
      ));
      const today = new Date();
      const todayLocal = new Date(today.getTime() + tzOffset);
      const todayMidnight = new Date(Date.UTC(
        todayLocal.getUTCFullYear(),
        todayLocal.getUTCMonth(),
        todayLocal.getUTCDate(),
        0, 0, 0, 0
      ));
      const diffMs = todayMidnight.getTime() - startMidnight.getTime();
      const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));
      const elapsedWeeks = Math.floor(diffDays / 7) + 1;
      setWeek(Math.max(1, elapsedWeeks));
    }
  };

  const [aiRatings, setAiRatings] = useState<EvaluationRatings | null>(null);
  const [aiComment, setAiComment] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ I: true, II: true, III: true });
  const scores = useMemo(() => computeScores(ratings), [ratings]);

  const setRating = (key: keyof EvaluationRatings, value: RatingLevel) => { setRatings(prev => ({ ...prev, [key]: value })); };
  const toggleSection = (id: string) => { setExpandedSections(prev => ({ ...prev, [id]: !prev[id] })); };

  const handleGetAiSuggestion = async () => {
    if (!internId) { toast.error(t("selectInternFirst")); return; }
    if (!week || week <= 0) { toast.error(t("enterValidWeek")); return; }
    if (selectedIntern && (Number(week) < 1 || Number(week) > maxWeek)) { toast.error(t("weekRange", { max: maxWeek })); return; }
    if (selectedIntern && Number(week) === maxWeek && !isWeekendAllowedForCurrentWeek) { toast.error(t("weekendOnly")); return; }
    if (evaluatedWeeks.includes(Number(week))) { toast.error(t("weekAlreadyExists", { week })); return; }
    try {
      const response = await aiSuggestion.mutateAsync({ internId, week: Number(week) });
      if (response?.data) { setRatings(response.data.ratings); setAiRatings(response.data.ratings); setComment(response.data.comment || ""); setAiComment(response.data.comment || ""); toast.success(t("aiSuggestionReceived")); }
    } catch (err: any) { console.error(err); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internId) { toast.error(t("selectInternFirst")); return; }
    if (selectedIntern && (Number(week) < 1 || Number(week) > maxWeek)) { toast.error(t("weekRange", { max: maxWeek })); return; }
    if (selectedIntern && Number(week) === maxWeek && !isWeekendAllowedForCurrentWeek) { toast.error(t("weekendOnly")); return; }
    if (evaluatedWeeks.includes(Number(week))) { toast.error(t("weekAlreadyExists", { week })); return; }

    const payload: CreateWeeklyEvaluationPayload = {
      internId, week: Number(week), ratings, communication: scores.communication, attitude: scores.attitude,
      learning: scores.learning, coding: scores.coding, comment: comment || undefined,
      ...(aiRatings && { aiRatings, aiCommunication: computeScores(aiRatings).communication, aiAttitude: computeScores(aiRatings).attitude, aiLearning: computeScores(aiRatings).learning, aiCoding: computeScores(aiRatings).coding, aiComment: aiComment || undefined }),
    };
    try { await createEvaluation.mutateAsync(payload); onCloseModal?.(); } catch (err) { console.error(err); }
  };

  const inputClass = "w-full rounded-xl border border-border px-4 py-2.5 text-sm text-foreground bg-card placeholder:text-muted focus:outline-none focus:border-primary-light/40";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-main/10 text-primary-light"><Sparkles className="h-5 w-5" /></div>
        <div><h3 className="text-lg font-semibold metal-text">{t("title")}</h3><p className="text-sm text-muted">{t("description")}</p></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">{t("intern")} <span className="text-red-400">*</span></label>
            {internsLoading ? <div className="flex items-center gap-2 text-sm text-muted py-2.5"><Loader2 className="h-4 w-4 animate-spin" />{t("loadingInterns")}</div> :
             <select value={internId} onChange={e => handleInternChange(e.target.value)} className={inputClass} required><option value="">{t("selectIntern")}</option>{interns.map((i) => <option key={i.id} value={i.id}>{i.fullName} ({i.user.email})</option>)}</select>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">{t("week")} <span className="text-red-400">*</span></label>
            <input type="number" min={1} max={maxWeek} value={week} onChange={e => setWeek(Number(e.target.value))} className={inputClass} required />
            {selectedIntern && (
              <div className="mt-1 space-y-1">
                <p className="text-[11px] text-slate-400">{t("currentWeek", { week: maxWeek, max: maxWeek })}</p>
                {Number(week) === maxWeek && !isWeekendAllowedForCurrentWeek && <p className="text-[11px] text-amber-400 font-semibold">{t("weekendNotice")}</p>}
                {evaluatedWeeks.includes(Number(week)) && <p className="text-[11px] text-red-400 font-semibold">{t("weekAlreadyEvaluated")}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-muted">{t("selectRatings")}</p>
          <Button type="button" variant="glass" size="sm" onClick={handleGetAiSuggestion} isLoading={aiSuggestion.isPending} disabled={aiSuggestion.isPending || !internId}><Sparkles className="h-3.5 w-3.5 mr-1" />{t("getAiSuggestion")}</Button>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-primary-light/20 bg-primary-main/5 p-3">
          {[
            { label: t("communication"), value: scores.communication },
            { label: t("attitude"), value: scores.attitude },
            { label: t("learning"), value: scores.learning },
            { label: t("coding"), value: scores.coding },
          ].map(({ label, value }) => (
            <div key={label} className="text-center flex-1"><div className="text-xs text-muted mb-0.5">{label}</div><div className="text-base font-bold text-primary-light">{value.toFixed(1)}</div></div>
          ))}
          <div className="h-8 w-px bg-border/40" />
          <div className="text-center flex-[1.5]"><div className="text-xs text-muted mb-0.5">{t("totalScore")}</div><div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary-light">{scores.totalScore.toFixed(2)}</div></div>
        </div>

        <div className="space-y-3 border-t border-border/40 pt-4">
          {CRITERIA_SECTIONS.map((section) => (
            <div key={section.id} className="rounded-2xl border border-border/40 overflow-hidden">
              <button type="button" onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-main/20 text-xs font-bold text-primary-light">{section.id}</span><span className="text-sm font-semibold text-foreground">{tSections(section.id)}</span><span className="text-xs text-muted">{t("criteriaCount", { count: section.criteria.length })}</span></div>
                {expandedSections[section.id] ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
              </button>
              {expandedSections[section.id] && (
                <div className="divide-y divide-border/30">
                  {section.criteria.map((criterion, idx) => (
                    <div key={criterion.key} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-2 min-w-0 flex-1"><span className="text-xs text-muted font-mono shrink-0">{idx + 1}.</span><span className="text-sm text-slate-300 truncate">{tCriteria(criterion.key)}</span></div>
                      <div className="shrink-0"><RatingSelector value={ratings[criterion.key]} onChange={(v) => setRating(criterion.key, v)} aiValue={aiRatings?.[criterion.key]} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">{t("comment")}</label>
          <textarea rows={4} placeholder={t("commentPlaceholder")} value={comment} onChange={e => setComment(e.target.value)} maxLength={2000} className={`${inputClass} resize-none`} />
          {aiComment && aiComment !== comment && (
            <button type="button" className="mt-1.5 text-xs text-primary-light/70 hover:text-primary-light flex items-center gap-1" onClick={() => setComment(aiComment)}><Sparkles className="h-3 w-3" />{t("useAiComment")}</button>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
          <Button type="button" variant="glass" size="md" onClick={onCloseModal}>{t("cancel")}</Button>
          <Button type="submit" variant="primary" size="md" isLoading={createEvaluation.isPending}>{t("saveEvaluation")}</Button>
        </div>
      </form>
    </div>
  );
}
