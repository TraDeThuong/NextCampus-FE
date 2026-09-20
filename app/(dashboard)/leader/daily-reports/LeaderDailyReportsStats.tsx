"use client";

import { Users, FileCheck, AlertCircle, CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";

export interface DailyReportOverviewStats {
  totalInterns: number;
  submittedToday: number;
  missingToday: number;
  weekRate: number;
  weekWorkingDays: number;
}

interface LeaderDailyReportsStatsProps {
  stats: DailyReportOverviewStats;
}

export default function LeaderDailyReportsStats({
  stats,
}: LeaderDailyReportsStatsProps) {
  const t = useTranslations("leader.dailyReports");

  const cards = [
    {
      title: t("totalInterns"),
      value: stats.totalInterns,
      subtitle: t("assignedToYou"),
      icon: Users,
      iconBg: "from-sky-500/25 to-cyan-400/10",
      accent: "from-sky-400/70",
    },
    {
      title: t("submittedToday"),
      value: stats.submittedToday,
      subtitle: t("percentOfInterns", {
        percent:
          stats.totalInterns > 0
            ? Math.round((stats.submittedToday / stats.totalInterns) * 100)
            : 0,
      }),
      icon: FileCheck,
      iconBg: "from-emerald-500/25 to-teal-400/10",
      accent: "from-emerald-400/70",
    },
    {
      title: t("missingToday"),
      value: stats.missingToday,
      subtitle: t("notSubmittedYet"),
      icon: AlertCircle,
      iconBg: "from-rose-500/25 to-red-400/10",
      accent: "from-rose-400/70",
    },
    {
      title: t("weekRate"),
      value: `${stats.weekRate}%`,
      subtitle: t("workingDays", { days: stats.weekWorkingDays }),
      icon: CalendarDays,
      iconBg: "from-indigo-500/25 to-purple-400/10",
      accent: "from-indigo-400/70",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-4">
      {cards.map((card) => {
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
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white shrink-0" />
              </div>
            </div>
          </MetalCard>
        );
      })}
    </div>
  );
}
