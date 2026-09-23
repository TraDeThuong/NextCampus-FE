"use client";

import { ClipboardCheck, Award, TrendingUp, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";

export interface WeeklyEvaluationOverviewStats {
  totalEvaluations: number;
  averageScore: number;
  goodRate: number;
  aiAssistedCount: number;
}

interface WeeklyEvaluationStatsProps {
  stats: WeeklyEvaluationOverviewStats;
}

export default function WeeklyEvaluationStats({
  stats,
}: WeeklyEvaluationStatsProps) {
  const t = useTranslations("leader.weeklyEvaluation");

  const cards = [
    {
      title: t("stats.totalEvaluations"),
      value: stats.totalEvaluations,
      subtitle: t("stats.totalEvaluationsSub"),
      icon: ClipboardCheck,
      containerClass: "border-sky-300 bg-sky-100/80 text-sky-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-sky-500/25 dark:to-cyan-400/10 dark:text-cyan-300",
      accent: "from-sky-400/70",
    },
    {
      title: t("stats.averageScore"),
      value: stats.averageScore > 0 ? stats.averageScore.toFixed(1) : "—",
      subtitle: t("stats.averageScoreSub"),
      icon: Award,
      containerClass: "border-emerald-300 bg-emerald-100/80 text-emerald-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-emerald-500/25 dark:to-teal-400/10 dark:text-emerald-300",
      accent: "from-emerald-400/70",
    },
    {
      title: t("stats.goodRate"),
      value: `${stats.goodRate}%`,
      subtitle: t("stats.goodRateSub"),
      icon: TrendingUp,
      containerClass: "border-purple-300 bg-purple-100/80 text-purple-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-purple-500/25 dark:to-indigo-400/10 dark:text-purple-300",
      accent: "from-purple-400/70",
    },
    {
      title: t("stats.aiAssisted"),
      value: stats.aiAssistedCount,
      subtitle: t("stats.aiAssistedSub"),
      icon: Sparkles,
      containerClass: "border-amber-300 bg-amber-100/80 text-amber-800 dark:border-white/10 dark:bg-gradient-to-br dark:from-amber-500/25 dark:to-orange-400/10 dark:text-amber-300",
      accent: "from-amber-400/70",
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
                  rounded-xl sm:rounded-2xl border ${card.containerClass}
                  shadow-sm dark:shadow-lg transition-all duration-500
                  group-hover:rotate-6 group-hover:scale-110
                `}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
              </div>
            </div>
          </MetalCard>
        );
      })}
    </div>
  );
}
