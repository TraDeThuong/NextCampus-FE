"use client";

import { useState, useMemo, useContext } from "react";
import { Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useCreateWeeklyEvaluation } from "@/hooks/weekly-evaluation/useCreateWeeklyEvaluation";
import { useAiSuggestion } from "@/hooks/weekly-evaluation/useAiSuggestion";
import { useInterns } from "@/hooks/intern/useInterns";
import { useWeeklyEvaluations } from "@/hooks/weekly-evaluation/useWeeklyEvaluations";
import { AuthContext } from "@/contexts/AuthContext";
import type {
  CreateWeeklyEvaluationPayload,
  EvaluationRatings,
  RatingLevel,
} from "@/types/weekly-evaluation";
import {
  CRITERIA_SECTIONS,
  DEFAULT_RATINGS,
  RATING_LABELS,
  RATING_SCORES,
  RATING_COLORS,
} from "@/types/weekly-evaluation";

interface Props {
  onCloseModal?: () => void;
}

const RATING_LEVELS: RatingLevel[] = ["TOT", "KHA", "TB", "TBY", "YEU"];

// Tính 4 nhóm điểm và tổng điểm từ ratings
function computeScores(ratings: EvaluationRatings) {
  const s = (k: keyof EvaluationRatings) => RATING_SCORES[ratings[k]];
  const avg = (nums: number[]) => parseFloat((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2));

  const communication = avg([s("communication"), s("teamwork")]);
  const attitude      = avg([s("ruleCompliance"), s("workAttitude"), s("resilience")]);
  const learning      = avg([s("learningCapacity"), s("knowledge"), s("creativity")]);
  const coding        = avg([s("practicalSkills"), s("contentQuality"), s("progressDelivery")]);

  const allScores = CRITERIA_SECTIONS.flatMap(sec => sec.criteria.map(c => s(c.key)));
  const totalScore = avg(allScores);

  return { communication, attitude, learning, coding, totalScore };
}

// Component chọn xếp loại cho 1 tiêu chí
function RatingSelector({
  value,
  onChange,
  aiValue,
}: {
  value: RatingLevel;
  onChange: (v: RatingLevel) => void;
  aiValue?: RatingLevel;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {RATING_LEVELS.map((level) => {
        const isSelected = value === level;
        const isAi = aiValue === level && !isSelected;
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`
              px-3 py-1 text-xs font-semibold rounded-lg border transition-all duration-150
              ${isSelected
                ? `${RATING_COLORS[level]} border-current ring-1 ring-current scale-105`
                : isAi
                  ? "border-primary-light/40 text-primary-light bg-primary-light/5 opacity-80"
                  : "border-white/10 text-slate-400 bg-white/[0.03] hover:border-white/20 hover:text-slate-300"
              }
            `}
            title={isAi ? `AI suggestion: ${RATING_LABELS[level]}` : RATING_LABELS[level]}
          >
            {RATING_LABELS[level]}
            {isAi && <span className="ml-1 opacity-60 text-[9px]">AI</span>}
          </button>
        );
      })}
    </div>
  );
}

export default function WeeklyEvaluationCreateModal({ onCloseModal }: Props) {
  const auth = useContext(AuthContext);
  const currentUserId = auth?.state.user?.id;

  const createEvaluation = useCreateWeeklyEvaluation();
  const aiSuggestion = useAiSuggestion();
  const { data: internsData, isLoading: internsLoading } = useInterns({
    status: "ACTIVE",
    leaderId: currentUserId || undefined,
  });
  const interns = useMemo(() => internsData?.data ?? [], [internsData]);

  const [internId, setInternId] = useState("");
  const [week, setWeek] = useState(1);
  const [ratings, setRatings] = useState<EvaluationRatings>({ ...DEFAULT_RATINGS });

  const { data: existingEvaluations } = useWeeklyEvaluations(
    internId ? { internId, limit: 100 } : undefined
  );

  const evaluatedWeeks = useMemo(() => {
    return existingEvaluations?.data?.map((e) => e.week) ?? [];
  }, [existingEvaluations]);

  const selectedIntern = useMemo(() => {
    return interns.find((i) => i.id === internId);
  }, [interns, internId]);

  const maxWeek = useMemo(() => {
    if (!selectedIntern) return 99;
    const start = new Date(selectedIntern.startDate);
    start.setHours(0, 0, 0, 0);

    const today = new Date();
    const todayMidnight = new Date(today);
    todayMidnight.setHours(0, 0, 0, 0);

    const elapsedWeeks = Math.ceil((todayMidnight.getTime() - start.getTime()) / (7 * 24 * 3600 * 1000));
    return Math.max(1, elapsedWeeks);
  }, [selectedIntern]);

  const isWeekendAllowedForCurrentWeek = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
    const hours = today.getHours();
    const isSaturdayAllowed = dayOfWeek === 6 && hours >= 11;
    const isSundayAllowed = dayOfWeek === 0;
    return isSaturdayAllowed || isSundayAllowed;
  }, []);

  const handleInternChange = (id: string) => {
    setInternId(id);
    const intern = interns.find(i => i.id === id);
    if (intern) {
      const start = new Date(intern.startDate);
      start.setHours(0, 0, 0, 0);

      const today = new Date();
      const todayMidnight = new Date(today);
      todayMidnight.setHours(0, 0, 0, 0);

      const elapsedWeeks = Math.ceil((todayMidnight.getTime() - start.getTime()) / (7 * 24 * 3600 * 1000));
      const calculatedWeek = Math.max(1, elapsedWeeks);
      setWeek(calculatedWeek);
    }
  };
  const [aiRatings, setAiRatings] = useState<EvaluationRatings | null>(null);
  const [aiComment, setAiComment] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    I: true, II: true, III: true,
  });

  const scores = useMemo(() => computeScores(ratings), [ratings]);

  const setRating = (key: keyof EvaluationRatings, value: RatingLevel) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGetAiSuggestion = async () => {
    if (!internId) {
      toast.error("Please select an intern first.");
      return;
    }
    if (!week || week <= 0) {
      toast.error("Please enter a valid evaluation week.");
      return;
    }
    if (selectedIntern && (Number(week) < 1 || Number(week) > maxWeek)) {
      toast.error(`Tuần đánh giá phải nằm trong khoảng từ 1 đến ${maxWeek}.`);
      return;
    }
    if (selectedIntern && Number(week) === maxWeek && !isWeekendAllowedForCurrentWeek) {
      toast.error("Chỉ có thể đánh giá tuần hiện tại từ Thứ Bảy (sau 11:00 sáng) đến hết Chủ Nhật.");
      return;
    }
    if (evaluatedWeeks.includes(Number(week))) {
      toast.error(`Tuần ${week} đã được đánh giá cho thực tập sinh này.`);
      return;
    }

    try {
      const response = await aiSuggestion.mutateAsync({ internId, week: Number(week) });
      if (response?.data) {
        const { ratings: suggestedRatings, comment: suggestedComment } = response.data;
        setRatings(suggestedRatings);
        setAiRatings(suggestedRatings);
        setComment(suggestedComment || "");
        setAiComment(suggestedComment || "");
        toast.success("AI suggestion received!");
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internId) {
      toast.error("Please select an intern.");
      return;
    }
    if (selectedIntern && (Number(week) < 1 || Number(week) > maxWeek)) {
      toast.error(`Tuần đánh giá phải nằm trong khoảng từ 1 đến ${maxWeek} (tuần thực tập hiện tại).`);
      return;
    }
    if (selectedIntern && Number(week) === maxWeek && !isWeekendAllowedForCurrentWeek) {
      toast.error("Chỉ có thể đánh giá tuần hiện tại từ Thứ Bảy (sau 11:00 sáng) đến hết Chủ Nhật.");
      return;
    }
    if (evaluatedWeeks.includes(Number(week))) {
      toast.error(`Tuần ${week} đã được đánh giá cho thực tập sinh này.`);
      return;
    }

    const payload: CreateWeeklyEvaluationPayload = {
      internId,
      week: Number(week),
      ratings,
      communication: scores.communication,
      attitude:      scores.attitude,
      learning:      scores.learning,
      coding:        scores.coding,
      comment: comment || undefined,
      ...(aiRatings && {
        aiRatings,
        aiCommunication: computeScores(aiRatings).communication,
        aiAttitude:      computeScores(aiRatings).attitude,
        aiLearning:      computeScores(aiRatings).learning,
        aiCoding:        computeScores(aiRatings).coding,
        aiComment:       aiComment || undefined,
      }),
    };

    try {
      await createEvaluation.mutateAsync(payload);
      onCloseModal?.();
    } catch (err) {
      console.error(err);
    }
  };

  const inputClass = "w-full rounded-xl border border-border px-4 py-2.5 text-sm text-foreground bg-card placeholder:text-muted focus:outline-none focus:border-primary-light/40";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-main/10 text-primary-light">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold metal-text">Create Weekly Evaluation</h3>
          <p className="text-sm text-muted">
            Evaluate intern competency based on 12 criteria and 5 rating levels.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Intern + Week */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Intern <span className="text-red-400">*</span>
            </label>
            {internsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted py-2.5">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading list...
              </div>
            ) : (
              <select
                value={internId}
                onChange={e => handleInternChange(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">-- Select intern --</option>
                {interns.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.fullName} ({i.user.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Evaluation Week <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={maxWeek}
              value={week}
              onChange={e => setWeek(Number(e.target.value))}
              className={inputClass}
              required
            />
            {selectedIntern && (
              <div className="mt-1 space-y-1">
                <p className="text-[11px] text-slate-400">
                  Tuần hiện tại: <span className="font-semibold text-primary-light">{maxWeek}</span> (Khoảng từ 1 đến {maxWeek})
                </p>
                {Number(week) === maxWeek && !isWeekendAllowedForCurrentWeek && (
                  <p className="text-[11px] text-amber-400 font-semibold">
                    Đánh giá tuần hiện tại sẽ bắt đầu mở từ Thứ Bảy (sau 11:00 sáng).
                  </p>
                )}
                {evaluatedWeeks.includes(Number(week)) && (
                  <p className="text-[11px] text-red-400 font-semibold">
                    Tuần này đã được đánh giá cho học viên này trước đó.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestion Button */}
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted">Select rating level for 12 criteria below:</p>
          <Button
            type="button"
            variant="glass"
            size="sm"
            onClick={handleGetAiSuggestion}
            isLoading={aiSuggestion.isPending}
            disabled={aiSuggestion.isPending || !internId}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Get AI Suggestion
          </Button>
        </div>

        {/* Live Score Preview */}
        <div className="flex items-center gap-3 rounded-2xl border border-primary-light/20 bg-primary-main/5 p-3">
          <div className="text-center flex-1">
            <div className="text-xs text-muted mb-0.5">Communication</div>
            <div className="text-base font-bold text-primary-light">{scores.communication.toFixed(1)}</div>
          </div>
          <div className="h-8 w-px bg-border/40" />
          <div className="text-center flex-1">
            <div className="text-xs text-muted mb-0.5">Attitude</div>
            <div className="text-base font-bold text-primary-light">{scores.attitude.toFixed(1)}</div>
          </div>
          <div className="h-8 w-px bg-border/40" />
          <div className="text-center flex-1">
            <div className="text-xs text-muted mb-0.5">Self-learning</div>
            <div className="text-base font-bold text-primary-light">{scores.learning.toFixed(1)}</div>
          </div>
          <div className="h-8 w-px bg-border/40" />
          <div className="text-center flex-1">
            <div className="text-xs text-muted mb-0.5">Coding</div>
            <div className="text-base font-bold text-primary-light">{scores.coding.toFixed(1)}</div>
          </div>
          <div className="h-8 w-px bg-border/40" />
          <div className="text-center flex-[1.5]">
            <div className="text-xs text-muted mb-0.5">Total Avg Score</div>
            <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary-light">
              {scores.totalScore.toFixed(2)}
            </div>
          </div>
        </div>

        {/* 12 Criteria Sections */}
        <div className="space-y-3 border-t border-border/40 pt-4">
          {CRITERIA_SECTIONS.map((section) => (
            <div
              key={section.id}
              className="rounded-2xl border border-border/40 overflow-hidden"
            >
              {/* Section Header */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-main/20 text-xs font-bold text-primary-light">
                    {section.id}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{section.label}</span>
                  <span className="text-xs text-muted">({section.criteria.length} criteria)</span>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronUp className="h-4 w-4 text-muted" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted" />
                )}
              </button>

              {/* Section Criteria */}
              {expandedSections[section.id] && (
                <div className="divide-y divide-border/30">
                  {section.criteria.map((criterion, idx) => (
                    <div
                      key={criterion.key}
                      className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xs text-muted font-mono shrink-0">{idx + 1}.</span>
                        <span className="text-sm text-slate-300 truncate">{criterion.label}</span>
                      </div>
                      <div className="shrink-0">
                        <RatingSelector
                          value={ratings[criterion.key]}
                          onChange={(v) => setRating(criterion.key, v)}
                          aiValue={aiRatings?.[criterion.key]}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comment */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Comment</label>
          <textarea
            rows={4}
            placeholder="Enter detailed comments about the intern this week..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={2000}
            className={`${inputClass} resize-none`}
          />
          {aiComment && aiComment !== comment && (
            <button
              type="button"
              className="mt-1.5 text-xs text-primary-light/70 hover:text-primary-light flex items-center gap-1"
              onClick={() => setComment(aiComment)}
            >
              <Sparkles className="h-3 w-3" />
              Use AI comment
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
          <Button type="button" variant="glass" size="md" onClick={onCloseModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={createEvaluation.isPending}
          >
            Save Evaluation
          </Button>
        </div>
      </form>
    </div>
  );
}
