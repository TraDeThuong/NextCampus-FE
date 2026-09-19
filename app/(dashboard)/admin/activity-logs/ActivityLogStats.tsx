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
  iconBg: string;
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
      iconBg: "from-sky-500/20 to-cyan-400/10",
    },
    {
      title: t("admin.activityLogs.statToday"),
      value: todayCount,
      icon: Clock,
      iconBg: "from-emerald-500/20 to-green-400/10",
    },
    {
      title: t("admin.activityLogs.statAdmin"),
      value: userCount,
      icon: UserCog,
      iconBg: "from-violet-500/20 to-purple-400/10",
    },
    {
      title: t("admin.activityLogs.statIntern"),
      value: internCount,
      icon: Users,
      iconBg: "from-amber-500/20 to-orange-400/10",
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
          <MetalCard key={card.title} className="p-4 sm:p-5 lg:p-6 group">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.1em] sm:tracking-[0.18em] text-muted truncate">
                  {card.title}
                </p>
                <h3 className="chrome-text mt-2 sm:mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-none">
                  {card.value}
                </h3>
                <div className="mt-3 sm:mt-4 h-[2px] w-10 sm:w-16 rounded-full bg-gradient-to-r from-primary-light/70 to-transparent" />
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
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </MetalCard>
        );
      })}
    </div>
  );
}
