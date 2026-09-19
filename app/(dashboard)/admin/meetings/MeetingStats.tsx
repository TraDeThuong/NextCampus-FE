"use client";

import { useTranslations } from "next-intl";
import { Calendar, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useMeetings } from "@/hooks/meeting/useMeetings";

export default function MeetingStats() {
  const t = useTranslations();
  const { data: totalData, isPending: totalLoading, isError: totalError } = useMeetings({ limit: 1 });
  const { data: scheduledData, isPending: scheduledLoading } = useMeetings({ status: "SCHEDULED", limit: 1 });
  const { data: completedData, isPending: completedLoading } = useMeetings({ status: "COMPLETED", limit: 1 });
  const { data: cancelledData, isPending: cancelledLoading } = useMeetings({ status: "CANCELLED", limit: 1 });

  const isPending = totalLoading || scheduledLoading || completedLoading || cancelledLoading;

  const cards = [
    {
      title: t("admin.meetings.totalMeetings"),
      value: totalData?.meta?.total ?? 0,
      icon: Calendar,
      iconBg: "from-sky-500/25 to-cyan-400/10",
      accent: "from-sky-400/70",
    },
    {
      title: t("admin.meetings.scheduled"),
      value: scheduledData?.meta?.total ?? 0,
      icon: Clock,
      iconBg: "from-blue-500/25 to-indigo-400/10",
      accent: "from-blue-400/70",
    },
    {
      title: t("admin.meetings.completed"),
      value: completedData?.meta?.total ?? 0,
      icon: CheckCircle2,
      iconBg: "from-emerald-500/25 to-teal-400/10",
      accent: "from-emerald-400/70",
    },
    {
      title: t("admin.meetings.cancelled"),
      value: cancelledData?.meta?.total ?? 0,
      icon: XCircle,
      iconBg: "from-rose-500/25 to-red-400/10",
      accent: "from-rose-400/70",
    },
  ];

  if (totalError) {
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
