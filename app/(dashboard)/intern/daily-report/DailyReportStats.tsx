"use client";

import { Calendar, FileCheck, AlertCircle, CalendarDays, Flame } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import { useInternStats } from "@/hooks/stats/useInternStats";

type Props = {
  totalWorkingDays: number;
  reportedDays: number;
  missingDays: number;
  submissionRate: number;
  weekWorkingDays: number;
  weekReportedDays: number;
  streak?: number;
};

const COLORS = { reported: "#06b6d4", missing: "#f43f5e" };

export default function DailyReportStats({
  totalWorkingDays,
  reportedDays,
  missingDays,
  submissionRate,
  weekWorkingDays,
  weekReportedDays,
  streak,
}: Props) {
  const t = useTranslations("intern.dailyReport");
  const { data: internStatsData } = useInternStats();
  const currentStreak = streak ?? internStatsData?.data?.reportStreak ?? 0;

  const chartData = [
    { name: "Reported", value: reportedDays, fill: COLORS.reported },
    { name: "Missing", value: missingDays, fill: COLORS.missing },
  ];

  const weekPercent =
    weekWorkingDays > 0
      ? Math.round((weekReportedDays / weekWorkingDays) * 100)
      : 0;

  const kpiCards = [
    {
      title: t("streakTitle"),
      value: t("streakDays", { count: currentStreak }),
      subtitle:
        currentStreak > 0 ? t("streakDescActive") : t("streakDescInactive"),
      icon: Flame,
      iconBg: "from-amber-500/25 to-orange-400/10",
      accent: "from-amber-400/70",
      iconColor: "text-amber-300",
    },
    {
      title: t("reported"),
      value: reportedDays,
      subtitle: t("submissionRate", { rate: submissionRate }),
      icon: FileCheck,
      iconBg: "from-emerald-500/25 to-teal-400/10",
      accent: "from-emerald-400/70",
      iconColor: "text-emerald-300",
    },
    {
      title: t("workingDays"),
      value: totalWorkingDays,
      subtitle: t("workingDaysDesc"),
      icon: Calendar,
      iconBg: "from-sky-500/25 to-cyan-400/10",
      accent: "from-sky-400/70",
      iconColor: "text-sky-300",
    },
    {
      title: t("missing"),
      value: missingDays,
      subtitle: t("missingDesc"),
      icon: AlertCircle,
      iconBg: "from-rose-500/25 to-red-400/10",
      accent: "from-rose-400/70",
      iconColor: "text-rose-300",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Primary 4-KPI Grid: 2 cols on mobile, 4 on desktop (Rule 49-51 & memory.md 54-66) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <MetalCard key={card.title} className="group p-4 sm:p-5 lg:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted truncate">
                    {card.title}
                  </p>
                  <h3 className="chrome-text mt-2 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl font-bold leading-none">
                    {card.value}
                  </h3>
                  <div
                    className={`mt-3 sm:mt-4 h-[2px] w-10 sm:w-16 rounded-full bg-gradient-to-r ${card.accent} to-transparent`}
                  />
                  <p className="mt-2 text-xs text-muted truncate hidden sm:block">
                    {card.subtitle}
                  </p>
                </div>
                <div
                  className={`
                    flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center
                    rounded-xl sm:rounded-2xl border border-white/10
                    bg-gradient-to-br ${card.iconBg}
                    shadow-lg transition-all duration-500
                    group-hover:rotate-6 group-hover:scale-110
                  `}
                >
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${card.iconColor} shrink-0`} />
                </div>
              </div>
            </MetalCard>
          );
        })}
      </div>

      {/* 2. Secondary Analytics & Weekly Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Donut Chart (Submission Analytics) */}
        <div className="lg:col-span-6">
          <MetalCard className="p-5 sm:p-6 flex flex-col justify-between h-full">
            <div>
              <h4 className="text-sm font-bold tracking-wide text-foreground">
                {t("submissionAnalytics")}
              </h4>
              <p className="text-xs text-muted mt-0.5">{t("analyticsDesc")}</p>
            </div>

            <div className="relative w-full h-[180px] flex items-center justify-center my-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={6}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.fill}
                        className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black tracking-tight chrome-text">
                  {submissionRate}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted mt-0.5">
                  {t("rate")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
              <div className="flex flex-col items-center p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
                  {t("reported")}
                </div>
                <span className="text-sm font-bold text-foreground mt-0.5">
                  {reportedDays}{" "}
                  <span className="text-[10px] font-normal text-muted">
                    {t("days")}
                  </span>
                </span>
              </div>
              <div className="flex flex-col items-center p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                  {t("missing")}
                </div>
                <span className="text-sm font-bold text-foreground mt-0.5">
                  {missingDays}{" "}
                  <span className="text-[10px] font-normal text-muted">
                    {t("days")}
                  </span>
                </span>
              </div>
            </div>
          </MetalCard>
        </div>

        {/* Right: Weekly Attendance & Policy Reminder */}
        <div className="lg:col-span-6">
          <MetalCard className="p-5 sm:p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30">
                  <CalendarDays className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{t("thisWeek")}</h4>
                  <p className="text-xs text-muted">{t("monToday")}</p>
                </div>
              </div>

              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-black chrome-text">
                  {weekReportedDays}
                </span>
                <span className="text-lg text-muted">/ {weekWorkingDays}</span>
              </div>
              <p className="text-xs text-muted">{t("daysReported")}</p>

              <div className="mt-4 h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${weekPercent}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>{t("weekRateTitle")}:</span>
                <span className="font-bold text-indigo-300">{weekPercent}%</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-muted">
              <p className="font-semibold text-foreground mb-1">{t("policyTitle")}</p>
              <p>{t("policyDesc")}</p>
            </div>
          </MetalCard>
        </div>
      </div>
    </div>
  );
}
