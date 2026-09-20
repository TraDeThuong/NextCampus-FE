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
      iconBg: "from-sky-500/25 to-cyan-400/10",
      accent: "from-sky-400/70",
    },
    {
      title: t("stats.averageScore"),
      value: stats.averageScore > 0 ? stats.averageScore.toFixed(1) : "—",
      subtitle: t("stats.averageScoreSub"),
      icon: Award,
      iconBg: "from-emerald-500/25 to-teal-400/10",
      accent: "from-emerald-400/70",
    },
    {
      title: t("stats.goodRate"),
      value: `${stats.goodRate}%`,
      subtitle: t("stats.goodRateSub"),
      icon: TrendingUp,
      iconBg: "from-purple-500/25 to-indigo-400/10",
      accent: "from-purple-400/70",
    },
    {
      title: t("stats.aiAssisted"),
      value: stats.aiAssistedCount,
      subtitle: t("stats.aiAssistedSub"),
      icon: Sparkles,
      iconBg: "from-amber-500/25 to-orange-400/10",
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
