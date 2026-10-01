"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Shield,
  Clock,
  UserCog,
  Users,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { useActivityLogs } from "@/hooks/activity-log/useActivityLogs";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";

interface StatItem {
  title: string;
  value: number;
  icon: LucideIcon;
  containerClass: string;
}

export default function ActivityLogStats() {
  const t = useTranslations();

  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const { data: totalData, isPending: isTotalPending, isError } = useActivityLogs({ limit: 1 });
  const { data: todayData, isPending: isTodayPending } = useActivityLogs({ from: todayStr, limit: 1 });
  const { data: userData, isPending: isUserPending } = useActivityLogs({ targetType: "USER", limit: 1 });
  const { data: internData, isPending: isInternPending } = useActivityLogs({ targetType: "INTERN", limit: 1 });

  const isPending = isTotalPending || isTodayPending || isUserPending || isInternPending;

  const totalCount = totalData?.total ?? totalData?.meta?.total ?? 0;
  const todayCount = todayData?.total ?? todayData?.meta?.total ?? 0;
  const userCount = userData?.total ?? userData?.meta?.total ?? 0;
  const internCount = internData?.total ?? internData?.meta?.total ?? 0;

  const cards: StatItem[] = [
    {
      title: t("admin.activityLogs.statTotal"),
      value: totalCount,
      icon: Shield,
      containerClass:
        "border-cyan-300 bg-cyan-100/80 text-cyan-700 hover:bg-cyan-200/80 dark:border-cyan-400/30 dark:bg-cyan-500/10 dark:text-cyan-300",
    },
    {
      title: t("admin.activityLogs.statToday"),
      value: todayCount,
      icon: Clock,
      containerClass:
        "border-emerald-300 bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200/80 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    },
    {
      title: t("admin.activityLogs.statAdmin"),
      value: userCount,
      icon: UserCog,
      containerClass:
        "border-indigo-300 bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200/80 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-300",
    },
    {
      title: t("admin.activityLogs.statIntern"),
      value: internCount,
      icon: Users,
      containerClass:
        "border-amber-300 bg-amber-100/80 text-amber-700 hover:bg-amber-200/80 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
    },
  ];

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 backdrop-blur-xl shadow-inner">
        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
        <p className="text-sm text-rose-300">
          {t("admin.activityLogs.loadStatsError")}
        </p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <MetalCard
            key={card.title}
            className="group relative overflow-hidden p-4 sm:p-5 lg:p-6 transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_12px_30px_rgba(21,174,245,.12)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.1em] sm:tracking-[0.14em] text-muted group-hover:text-foreground transition-colors truncate">
                  {card.title}
                </p>
                <h3 className="chrome-text mt-1.5 sm:mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold leading-none tracking-tight truncate">
                  {card.value}
                </h3>
                <div className="mt-2.5 sm:mt-3 h-[2px] w-10 sm:w-14 rounded-full bg-gradient-to-r from-primary-main/70 dark:from-primary-light/70 to-transparent" />
              </div>
              <div
                className={`flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-xs ${card.containerClass}`}
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
