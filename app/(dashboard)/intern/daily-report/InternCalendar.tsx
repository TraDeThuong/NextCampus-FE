"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DailyReport } from "@/types/daily-report";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
  const today = useMemo(() => new Date(), []);

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

  const currentYear = startDate.getFullYear() + Math.floor(
    (startDate.getMonth() + currentOffset) / 12,
  );
  const currentMonth = (startDate.getMonth() + currentOffset) % 12;

  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

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
    if (d.getDay() === 0) return false; // Sunday
    return !reportsMap.has(isoDate(d));
  }

  return (
    <div>
      {/* Month header with arrows */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goPrev}
          disabled={currentOffset === 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold text-slate-300">{monthLabel}</h3>
        <button
          onClick={goNext}
          disabled={currentOffset >= totalMonths - 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-center text-[10px] font-medium text-slate-600 uppercase tracking-wider py-1"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((week, wi) =>
          week.map((day, di) => {
            if (!day) {
              return (
                <div
                  key={`${wi}-${di}`}
                  className="aspect-square rounded-lg"
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
              "aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition cursor-pointer ";

            if (!inRange) {
              cellClass += "text-slate-700 ";
            } else if (report) {
              cellClass +=
                "text-cyan-100 bg-cyan-500/25 font-bold shadow-[0_0_8px_rgba(6,182,212,0.15)] hover:bg-cyan-500/35 ";
            } else if (missing) {
              cellClass +=
                "text-red-300 bg-red-500/15 font-medium hover:bg-red-500/25 ";
            } else {
              cellClass += "text-slate-300 hover:bg-white/5 ";
            }

            if (isToday && !report) {
              cellClass += "ring-1 ring-white/20 ";
            }

            if (isToday && report) {
              cellClass += "ring-1 ring-cyan-400/50 ";
            }

            if (isSelected) {
              cellClass += "ring-2 ring-cyan-400 ";
            }

            return (
              <button
                key={`${wi}-${di}`}
                className={cellClass}
                onClick={() => onSelectDate(dateStr, report)}
                disabled={!inRange}
              >
                <span>{day.getDate()}</span>
                {report && (
                  <span className="block w-1.5 h-1.5 rounded-full bg-cyan-300 mt-0.5 shadow-[0_0_4px_rgba(6,182,212,0.6)]" />
                )}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
