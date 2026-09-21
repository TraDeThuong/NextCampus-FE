"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Flame, Calendar, Award, Info } from "lucide-react";
import MetalCard from "../ui/MetalCard";
import type { InternActivityStatsData } from "@/types/stats";

interface Props {
  activity?: InternActivityStatsData;
}

interface DayCell {
  dateStr: string;
  date: Date;
  count: number;
  reports: number;
  submissions: number;
  isFuture: boolean;
  isToday: boolean;
  level: 0 | 1 | 2 | 3 | 4;
}

interface MonthLabel {
  name: string;
  colIndex: number;
}

export default function InternActivityHeatmap({ activity }: Props) {
  const t = useTranslations("intern.dashboard");
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [hoveredCell, setHoveredCell] = useState<{
    cell: DayCell;
    x: number;
    y: number;
  } | null>(null);

  // Auto-scroll to the far right on mount so users on mobile see current weeks
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayStr = now.toLocaleDateString("en-CA"); // YYYY-MM-DD

    // End on Sunday of current week (ISO: Monday = 0 ... Sunday = 6)
    const currentIsoDay = (now.getDay() + 6) % 7;
    const endOfCurrentWeek = new Date(now.getTime() + (6 - currentIsoDay) * 86400000);

    // 53 columns (weeks) = 371 days total
    const totalWeeks = 53;
    const startCalendar = new Date(endOfCurrentWeek.getTime() - (totalWeeks * 7 - 1) * 86400000);

    const generatedWeeks: DayCell[][] = [];
    const rawMonthLabels: MonthLabel[] = [];
    let lastMonth = -1;

    const getMonthShortName = (date: Date) => {
      if (locale === "vi") {
        return `T${date.getMonth() + 1}`;
      }
      return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
    };

    for (let w = 0; w < totalWeeks; w++) {
      const daysInWeek: DayCell[] = [];

      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startCalendar.getTime() + (w * 7 + d) * 86400000);
        const dateStr = cellDate.toLocaleDateString("en-CA");
        const isFuture = cellDate > now;
        const isToday = dateStr === todayStr;

        const detail = activity?.history?.[dateStr];
        const reports = detail?.reports ?? 0;
        const submissions = detail?.submissions ?? 0;
        const count = detail?.count ?? reports + submissions;

        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (count >= 4) level = 4;
        else if (count === 3) level = 3;
        else if (count === 2) level = 2;
        else if (count === 1) level = 1;

        daysInWeek.push({
          dateStr,
          date: cellDate,
          count,
          reports,
          submissions,
          isFuture,
          isToday,
          level,
        });

        // Detect month transitions (check the Monday of the week)
        if (d === 0) {
          const m = cellDate.getMonth();
          if (m !== lastMonth) {
            rawMonthLabels.push({
              name: getMonthShortName(cellDate),
              colIndex: w,
            });
            lastMonth = m;
          }
        }
      }

      generatedWeeks.push(daysInWeek);
    }

    // Filter out month labels that are too close to avoid text overlapping
    const cleanMonthLabels: MonthLabel[] = [];
    for (let i = 0; i < rawMonthLabels.length; i++) {
      const current = rawMonthLabels[i];
      const next = rawMonthLabels[i + 1];

      // If week index is at the very start (< 2) and next month is close (<= 3), skip first label
      if (current.colIndex < 2 && next && next.colIndex <= 3) {
        continue;
      }

      // Ensure at least 3 columns spacing between consecutive labels
      if (cleanMonthLabels.length > 0) {
        const prev = cleanMonthLabels[cleanMonthLabels.length - 1];
        if (current.colIndex - prev.colIndex < 3) {
          continue;
        }
      }

      cleanMonthLabels.push(current);
    }

    return { weeks: generatedWeeks, monthLabels: cleanMonthLabels };
  }, [activity, locale]);

  const currentStreak = activity?.currentStreak ?? 0;
  const longestStreak = activity?.longestStreak ?? currentStreak;
  const totalActiveDays = activity?.totalActiveDays ?? Object.keys(activity?.history ?? {}).length;

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [locale]
  );

  return (
    <MetalCard className="p-4 sm:p-5 lg:p-6 transition-all duration-300">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Flame className="h-4 w-4 shrink-0 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground metal-text">
              {t("activityHeatmapTitle")}
            </h3>
            <p className="text-xs text-muted mt-0.5">
              {t("activityHeatmapSubtitle")}
            </p>
          </div>
        </div>

        {/* Top-Right Streak Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Current Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold shadow-[0_0_10px_rgba(6,182,212,0.1)]">
            <Flame className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>{t("currentStreakBadge", { n: currentStreak })}</span>
          </div>

          {/* Longest Streak */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold">
            <Award className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span>{t("longestStreakBadge", { n: longestStreak })}</span>
          </div>

          {/* Total Active Days */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl border border-white/10 bg-white/5 text-muted text-xs font-semibold">
            <Calendar className="h-3.5 w-3.5 text-muted shrink-0" />
            <span>{t("activeDaysBadge", { n: totalActiveDays })}</span>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Container (Centered Horizontally via w-fit mx-auto) */}
      <div
        ref={scrollRef}
        className="relative overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent select-none"
      >
        <div className="w-fit mx-auto min-w-max px-2">
          {/* Month Labels Across Top */}
          <div className="relative h-5 mb-1.5 text-[11px] font-semibold text-muted pl-6">
            {monthLabels.map((lbl, idx) => (
              <span
                key={`${lbl.name}-${idx}`}
                className="absolute uppercase tracking-wider text-[10px] text-muted/80"
                style={{ left: `${lbl.colIndex * 17 + 24}px` }}
              >
                {lbl.name}
              </span>
            ))}
          </div>

          {/* Days Grid + Left Weekday Labels (Pixel-perfect alignment) */}
          <div className="flex items-start gap-2">
            {/* Left Weekday Labels (M, W, F, S) aligned with row heights */}
            <div className="flex flex-col gap-[3px] w-4 text-[10px] font-semibold text-muted text-right pr-1 select-none">
              <div className="h-[12.5px] sm:h-[13.5px] md:h-[14px] flex items-center justify-end leading-none">M</div>
              <div className="h-[12.5px] sm:h-[13.5px] md:h-[14px]" />
              <div className="h-[12.5px] sm:h-[13.5px] md:h-[14px] flex items-center justify-end leading-none">W</div>
              <div className="h-[12.5px] sm:h-[13.5px] md:h-[14px]" />
              <div className="h-[12.5px] sm:h-[13.5px] md:h-[14px] flex items-center justify-end leading-none">F</div>
              <div className="h-[12.5px] sm:h-[13.5px] md:h-[14px]" />
              <div className="h-[12.5px] sm:h-[13.5px] md:h-[14px] flex items-center justify-end leading-none">S</div>
            </div>

            {/* 53 Columns of 7 Days */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={`w-${wIdx}`} className="flex flex-col gap-[3px]">
                  {week.map((cell, dIdx) => {
                    if (cell.isFuture) {
                      return (
                        <div
                          key={`c-${wIdx}-${dIdx}`}
                          className="w-[12.5px] h-[12.5px] sm:w-[13.5px] sm:h-[13.5px] md:w-[14px] md:h-[14px] rounded-[2px] opacity-0 pointer-events-none"
                        />
                      );
                    }

                    // Level color classes faithfully aligned with the GitLab blue palette in the user's image
                    let cellColor =
                      "bg-slate-200/60 dark:bg-white/[0.04] border border-slate-300/40 dark:border-white/[0.06]";
                    if (cell.level === 1) {
                      cellColor = "bg-[#a0c7ed] dark:bg-[#2b5c8f] border border-[#a0c7ed]/50";
                    } else if (cell.level === 2) {
                      cellColor = "bg-[#6ba3d6] dark:bg-[#387ec0] border border-[#6ba3d6]/50";
                    } else if (cell.level === 3) {
                      cellColor = "bg-[#397bb8] dark:bg-[#2563eb] border border-[#397bb8]/50";
                    } else if (cell.level === 4) {
                      cellColor = "bg-[#1f4e79] dark:bg-[#1d4ed8] border border-[#1f4e79]/50 shadow-[0_0_6px_rgba(31,78,121,0.4)]";
                    }

                    return (
                      <div
                        key={`c-${wIdx}-${dIdx}`}
                        aria-label={`${cell.dateStr}: ${cell.count} activities`}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            cell,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-[12.5px] h-[12.5px] sm:w-[13.5px] sm:h-[13.5px] md:w-[14px] md:h-[14px] rounded-[2px] transition-all duration-150 cursor-pointer hover:scale-125 hover:z-10 hover:ring-2 hover:ring-cyan-400/80 ${cellColor} ${
                          cell.isToday ? "ring-1.5 ring-amber-400 ring-offset-1 ring-offset-black/40" : ""
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredCell && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full px-3 py-2 mb-2 rounded-xl border border-white/20 bg-[#0c1322]/95 backdrop-blur-xl shadow-2xl text-xs text-foreground whitespace-nowrap animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y}px`,
          }}
        >
          <div className="font-semibold text-cyan-300">
            {dateFormatter.format(hoveredCell.cell.date)}
          </div>
          <div className="text-[11px] text-muted mt-1 space-y-0.5">
            {hoveredCell.cell.count > 0 ? (
              <>
                <div className="font-medium text-foreground">
                  {t("activitiesCount", { n: hoveredCell.cell.count })}
                </div>
                <div className="text-[10px] text-muted flex items-center gap-2">
                  <span>• Báo cáo ngày: {hoveredCell.cell.reports}</span>
                  <span>• Bài nộp task: {hoveredCell.cell.submissions}</span>
                </div>
              </>
            ) : (
              <span>{t("noActivity")}</span>
            )}
          </div>
        </div>
      )}

      {/* Bottom Footer: Legend & Description (Centering & Detailed Tooltips) */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted">
        {/* Left: 5-Level Scale Legend with Detailed Tooltips */}
        <div className="flex items-center gap-2 font-medium">
          <span className="text-[11px]">{t("legendLess")}</span>
          <div className="flex items-center gap-1.5">
            <div
              title={t("level0Tooltip")}
              className="w-3 h-3 rounded-[2px] bg-slate-200/60 dark:bg-white/[0.04] border border-slate-300/40 dark:border-white/[0.06] cursor-help hover:ring-1 hover:ring-white/40 transition-all"
            />
            <div
              title={t("level1Tooltip")}
              className="w-3 h-3 rounded-[2px] bg-[#a0c7ed] dark:bg-[#2b5c8f] border border-[#a0c7ed]/50 cursor-help hover:ring-1 hover:ring-cyan-300 transition-all"
            />
            <div
              title={t("level2Tooltip")}
              className="w-3 h-3 rounded-[2px] bg-[#6ba3d6] dark:bg-[#387ec0] border border-[#6ba3d6]/50 cursor-help hover:ring-1 hover:ring-cyan-300 transition-all"
            />
            <div
              title={t("level3Tooltip")}
              className="w-3 h-3 rounded-[2px] bg-[#397bb8] dark:bg-[#2563eb] border border-[#397bb8]/50 cursor-help hover:ring-1 hover:ring-cyan-300 transition-all"
            />
            <div
              title={t("level4Tooltip")}
              className="w-3 h-3 rounded-[2px] bg-[#1f4e79] dark:bg-[#1d4ed8] border border-[#1f4e79]/50 shadow-[0_0_6px_rgba(31,78,121,0.4)] cursor-help hover:ring-1 hover:ring-cyan-300 transition-all"
            />
          </div>
          <span className="text-[11px]">{t("legendMore")}</span>

          <div
            className="flex items-center gap-1 ml-2 text-[11px] text-muted/80 hover:text-cyan-400 transition-colors cursor-help"
            title={t("activityLevelExplain")}
          >
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden md:inline">{t("activityCriteria")}</span>
          </div>
        </div>

        {/* Right: Subtitle Text */}
        <div className="text-[11px] sm:text-xs text-muted font-normal">
          {t("activityFooterDesc")}
        </div>
      </div>
    </MetalCard>
  );
}
