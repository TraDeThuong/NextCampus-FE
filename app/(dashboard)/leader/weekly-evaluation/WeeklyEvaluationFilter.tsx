"use client";

import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import FilterSelect from "@/components/ui/FilterSelect";
import type { Intern } from "@/types/intern";

interface WeeklyEvaluationFilterProps {
  interns: Intern[];
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onReset: () => void;
  hasFilters: boolean;
}

export default function WeeklyEvaluationFilter({
  interns,
  searchQuery,
  onSearchChange,
  onReset,
  hasFilters,
}: WeeklyEvaluationFilterProps) {
  const t = useTranslations("leader.weeklyEvaluation");
  const tRatings = useTranslations("leader.weeklyEvaluation.ratings");

  const internOptions = useMemo(
    () =>
      interns.map((intern) => ({
        value: intern.id,
        label: intern.fullName || intern.user?.fullName || intern.user?.email || intern.id,
      })),
    [interns],
  );

  const weekOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1),
        label: t("filter.weekOption", { n: i + 1 }),
      })),
    [t],
  );

  const ratingOptions = useMemo(
    () => [
      { value: "TOT", label: tRatings("TOT") },
      { value: "KHA", label: tRatings("KHA") },
      { value: "TB", label: tRatings("TB") },
      { value: "TBY", label: tRatings("TBY") },
      { value: "YEU", label: tRatings("YEU") },
    ],
    [tRatings],
  );

  return (
    <MetalCard>
      <div className="p-4 sm:p-5 space-y-4">
        {/* Minimalist Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
          {/* Intern Search */}
          <div className="lg:col-span-5">
            <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1 mb-1.5">
              {t("filter.intern")}
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("filter.searchPlaceholder")}
              className="h-[42px] sm:h-[46px] w-full rounded-xl border border-border bg-card dark:border-white/10 dark:bg-white/5 px-5 py-3 text-xs sm:text-sm text-foreground placeholder:text-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {/* Intern Select */}
          <div className="lg:col-span-3">
            <FilterSelect
              label={t("filter.intern")}
              filterField="internId"
              options={internOptions}
            />
          </div>

          {/* Week Select */}
          <div className="lg:col-span-2">
            <FilterSelect
              label={t("filter.week")}
              filterField="week"
              options={weekOptions}
            />
          </div>

          {/* Rating Select */}
          <div className="lg:col-span-2">
            <FilterSelect
              label={t("filter.rating")}
              filterField="rating"
              options={ratingOptions}
            />
          </div>
        </div>

        {/* Reset button: Only appears when hasFilters is active */}
        {hasFilters && (
          <div className="flex justify-end border-t border-border/40 pt-3">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span>{t("filter.reset")}</span>
            </button>
          </div>
        )}
      </div>
    </MetalCard>
  );
}
