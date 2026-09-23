"use client";

import { RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import DatePicker, { DateRangePicker } from "@/components/ui/DatePicker";

export type FilterMode = "all" | "single" | "range";

interface LeaderDailyReportsFilterProps {
  filterMode: FilterMode;
  onModeChange: (mode: FilterMode) => void;
  singleDate: string;
  onSingleDateChange: (date: string) => void;
  fromDate: string;
  toDate: string;
  onDateRangeChange: (start: string, end: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  hasFilters: boolean;
}

export default function LeaderDailyReportsFilter({
  filterMode,
  onModeChange,
  singleDate,
  onSingleDateChange,
  fromDate,
  toDate,
  onDateRangeChange,
  searchQuery,
  onSearchChange,
  onReset,
  hasFilters,
}: LeaderDailyReportsFilterProps) {
  const t = useTranslations("leader.dailyReports");

  return (
    <MetalCard>
      <div className="p-4 sm:p-5 space-y-4">
        {/* Minimalist Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
          {/* Intern Search */}
          <div className="md:col-span-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchIntern")}
              className="h-[42px] sm:h-[46px] w-full rounded-xl border border-border bg-card dark:border-white/10 dark:bg-white/5 px-5 py-3 text-xs sm:text-sm text-foreground placeholder:text-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {/* Mode Selector */}
          <div className="md:col-span-4">
            <div className="flex h-[42px] sm:h-[46px] items-center rounded-xl border border-border bg-slate-100/80 dark:border-white/10 dark:bg-white/5 p-1 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => onModeChange("all")}
                className={`flex-1 h-full rounded-lg px-2 sm:px-3 font-medium transition cursor-pointer select-none text-center truncate ${
                  filterMode === "all"
                    ? "bg-white text-cyan-700 shadow-sm dark:bg-cyan-500/20 dark:text-cyan-300"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t("filterPeriod")}
              </button>
              <button
                type="button"
                onClick={() => onModeChange("single")}
                className={`flex-1 h-full rounded-lg px-2 sm:px-3 font-medium transition cursor-pointer select-none text-center truncate ${
                  filterMode === "single"
                    ? "bg-white text-cyan-700 shadow-sm dark:bg-cyan-500/20 dark:text-cyan-300"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t("filterSingleDate")}
              </button>
              <button
                type="button"
                onClick={() => onModeChange("range")}
                className={`flex-1 h-full rounded-lg px-2 sm:px-3 font-medium transition cursor-pointer select-none text-center truncate ${
                  filterMode === "range"
                    ? "bg-white text-cyan-700 shadow-sm dark:bg-cyan-500/20 dark:text-cyan-300"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t("filterDateRange")}
              </button>
            </div>
          </div>

          {/* Date Picker (Conditional) */}
          <div className="md:col-span-4">
            {filterMode === "single" ? (
              <DatePicker
                value={singleDate}
                onChange={onSingleDateChange}
                onClear={() => onSingleDateChange("")}
                placeholder={t("selectSingleDate")}
                className="w-full [&>div>button]:h-[42px] sm:[&>div>button]:h-[46px] [&>div>button]:rounded-xl [&>div>button]:px-4 [&>div>button]:text-xs sm:[&>div>button]:text-sm"
              />
            ) : filterMode === "range" ? (
              <DateRangePicker
                startDate={fromDate}
                endDate={toDate}
                onChange={onDateRangeChange}
                onClear={() => onDateRangeChange("", "")}
                placeholder={t("selectDateRange")}
                className="w-full [&>button]:h-[42px] sm:[&>button]:h-[46px] [&>button]:rounded-xl [&>button]:px-4 [&>button]:text-xs sm:[&>button]:text-sm [&>button]:w-full"
              />
            ) : (
              <div className="flex h-[42px] sm:h-[46px] items-center rounded-xl border border-border bg-muted/20 dark:border-white/5 dark:bg-white/[0.02] px-4 text-xs text-muted italic">
                {t("selectCalendar")}
              </div>
            )}
          </div>
        </div>

        {/* Reset Row (Rule 63: only when hasFilters is active) */}
        {hasFilters && (
          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
              {t("legendSelected")}
            </span>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card dark:border-white/10 dark:bg-white/5 px-3 py-1.5 text-xs text-muted hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-300 transition cursor-pointer active:scale-95"
            >
              <RotateCcw className="h-3 w-3 shrink-0" />
              <span>{t("resetFilters")}</span>
            </button>
          </div>
        )}
      </div>
    </MetalCard>
  );
}
