"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { DailyReport } from "@/types/daily-report";
import { useSystemSettings } from "@/hooks/system-setting/useSystemSettings";

const VI_WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const EN_WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

type Props = {
  startDate: Date;
  endDate: Date;
  reportsMap: Map<string, DailyReport>;
  selectedReportId: string | null;
  onSelectDate: (dateStr: string, report?: DailyReport) => void;
};

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rows: (Date | null)[][] = [];
  let week: (Date | null)[] = [];

  for (let i = 0; i < startDow; i++) {
    week.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      rows.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    rows.push(week);
  }

  return rows;
}

export default function InternCalendar({
  startDate,
  endDate,
  reportsMap,
  selectedReportId,
  onSelectDate,
}: Props) {
  const locale = useLocale();
  const isVi = locale === "vi";
  const t = useTranslations("leader.dailyReports");
  const today = useMemo(() => new Date(), []);
  const { data: settingsResponse } = useSystemSettings();
  const workingDaysPerWeek = settingsResponse?.data?.WORKING_DAYS_PER_WEEK ?? 6;

  const totalMonths = useMemo(() => {
    return (
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) +
      1
    );
  }, [startDate, endDate]);

  const [currentOffset, setCurrentOffset] = useState(() => {
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const offset =
      (todayYear - startYear) * 12 + (todayMonth - startMonth);
    return Math.max(0, Math.min(offset, totalMonths - 1));
  });

  const currentYear =
    startDate.getFullYear() +
    Math.floor((startDate.getMonth() + currentOffset) / 12);
  const currentMonth = (startDate.getMonth() + currentOffset) % 12;

  const monthLabel = useMemo(() => {
    if (isVi) {
      return `Tháng ${currentMonth + 1} năm ${currentYear}`;
    }
    return new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [isVi, currentMonth, currentYear]);

  const weekdays = isVi ? VI_WEEKDAYS : EN_WEEKDAYS;

  const grid = useMemo(
    () => buildMonthGrid(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  const goPrev = useCallback(() => {
    setCurrentOffset((o) => Math.max(0, o - 1));
  }, []);

  const goNext = useCallback(() => {
    setCurrentOffset((o) => Math.min(totalMonths - 1, o + 1));
  }, [totalMonths]);

  function isInRange(d: Date): boolean {
    return d >= startDate && d <= endDate;
  }

  function isMissingReport(d: Date): boolean {
    if (d > today) return false; // future date
    if (d < startDate) return false;
    const dow = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const isoDow = dow === 0 ? 7 : dow; // 1 = Mon ... 7 = Sun
    if (isoDow > workingDaysPerWeek) return false; // weekend based on system setting
    return !reportsMap.has(isoDate(d));
  }

  return (
    <div className="flex flex-col">
      {/* Month header with arrows */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentOffset === 0}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold text-foreground tracking-wide">
          {monthLabel}
        </h3>
        <button
          type="button"
          onClick={goNext}
          disabled={currentOffset >= totalMonths - 1}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition active:scale-95"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {weekdays.map((name) => (
          <div
            key={name}
            className="text-center text-[10px] font-bold text-muted uppercase tracking-wider py-1 select-none"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {grid.map((week, wi) =>
          week.map((day, di) => {
            if (!day) {
              return (
                <div
                  key={`${wi}-${di}`}
                  className="aspect-square rounded-xl"
                />
              );
            }

            const dateStr = isoDate(day);
            const report = reportsMap.get(dateStr);
            const inRange = isInRange(day);
            const missing = isMissingReport(day);
            const isToday = sameDay(day, today);
            const isSelected =
              selectedReportId != null &&
              report?.id === selectedReportId;

            let cellClass =
              "aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all duration-150 cursor-pointer select-none active:scale-95 ";

            if (!inRange) {
              cellClass += "text-slate-700 opacity-30 cursor-not-allowed ";
            } else if (report) {
              cellClass +=
                "text-cyan-100 bg-cyan-500/25 font-bold shadow-[0_0_8px_rgba(6,182,212,0.15)] hover:bg-cyan-500/35 border border-cyan-400/30 ";
            } else if (missing) {
              cellClass +=
                "text-rose-200 bg-rose-500/15 font-medium hover:bg-rose-500/25 border border-rose-500/20 ";
            } else {
              cellClass += "text-slate-300 hover:bg-white/5 border border-transparent ";
            }

            if (isToday && !report) {
              cellClass += "ring-1 ring-white/40 ";
            }

            if (isToday && report) {
              cellClass += "ring-1 ring-cyan-400 ";
            }

            if (isSelected) {
              cellClass += "ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] ";
            }

            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                className={cellClass}
                onClick={() => onSelectDate(dateStr, report)}
                disabled={!inRange}
              >
                <span>{day.getDate()}</span>
                {report && (
                  <span className="block w-1.5 h-1.5 rounded-full bg-cyan-300 mt-0.5 shadow-[0_0_4px_rgba(6,182,212,0.8)]" />
                )}
              </button>
            );
          }),
        )}
      </div>

      {/* Calendar Legend */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_4px_rgba(6,182,212,0.6)]" />
          <span>{t("legendSubmitted")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400/80" />
          <span>{t("legendMissing")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-md border border-white/60" />
          <span>{t("legendToday")}</span>
        </div>
      </div>
    </div>
  );
}
