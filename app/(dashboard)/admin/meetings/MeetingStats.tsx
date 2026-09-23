"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useMeetings } from "@/hooks/meeting/useMeetings";
import { isUserParticipating } from "@/lib/meeting";

interface MeetingStatsProps {
  scope?: "my" | "all";
  currentUserId?: string;
}

export default function MeetingStats({
  scope = "my",
  currentUserId,
}: MeetingStatsProps) {
  const t = useTranslations();

  const { data: myMeetingsData, isPending: myPending, isError: myError } = useMeetings({
    limit: 100,
    sortBy: "startTime",
    order: "asc",
  });

  const { data: totalData, isPending: totalLoading, isError: totalError } = useMeetings({ limit: 1 });
  const { data: scheduledData, isPending: scheduledLoading } = useMeetings({ status: "SCHEDULED", limit: 1 });
  const { data: completedData, isPending: completedLoading } = useMeetings({ status: "COMPLETED", limit: 1 });
  const { data: cancelledData, isPending: cancelledLoading } = useMeetings({ status: "CANCELLED", limit: 1 });

  const isPending =
    scope === "my"
      ? myPending
      : totalLoading || scheduledLoading || completedLoading || cancelledLoading;

  const isError = scope === "my" ? myError : totalError;

  const counts = useMemo(() => {
    if (scope === "all") {
      return {
        total: totalData?.meta?.total ?? 0,
        scheduled: scheduledData?.meta?.total ?? 0,
        completed: completedData?.meta?.total ?? 0,
        cancelled: cancelledData?.meta?.total ?? 0,
      };
    }
    const rawMeetings = myMeetingsData?.data ?? [];
    const active = currentUserId
      ? rawMeetings.filter((m) => isUserParticipating(m, currentUserId))
      : rawMeetings;
    return {
      total: active.length,
      scheduled: active.filter((m) => m.status === "SCHEDULED").length,
      completed: active.filter((m) => m.status === "COMPLETED").length,
      cancelled: active.filter((m) => m.status === "CANCELLED").length,
    };
  }, [scope, totalData, scheduledData, completedData, cancelledData, myMeetingsData, currentUserId]);

  const cards = [
    {
      title: t("admin.meetings.totalMeetings"),
      value: counts.total,
      icon: Calendar,
      containerClass: "border-sky-300 bg-sky-100/80 text-sky-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-sky-500/25 dark:to-cyan-400/10 dark:text-sky-300",
      accent: "from-sky-500",
    },
    {
      title: t("admin.meetings.scheduled"),
      value: counts.scheduled,
      icon: Clock,
      containerClass: "border-blue-300 bg-blue-100/80 text-blue-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-blue-500/25 dark:to-indigo-400/10 dark:text-blue-300",
      accent: "from-blue-500",
    },
    {
      title: t("admin.meetings.completed"),
      value: counts.completed,
      icon: CheckCircle2,
      containerClass: "border-emerald-300 bg-emerald-100/80 text-emerald-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-emerald-500/25 dark:to-teal-400/10 dark:text-emerald-300",
      accent: "from-emerald-500",
    },
    {
      title: t("admin.meetings.cancelled"),
      value: counts.cancelled,
      icon: XCircle,
      containerClass: "border-rose-300 bg-rose-100/80 text-rose-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-rose-500/25 dark:to-red-400/10 dark:text-rose-300",
      accent: "from-rose-500",
    },
  ];

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 backdrop-blur-xl">
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
        <p className="text-sm text-red-300">{t("admin.meetings.loadStatsError")}</p>
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
