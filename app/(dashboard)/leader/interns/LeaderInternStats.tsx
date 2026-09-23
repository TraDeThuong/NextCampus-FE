"use client";

import { useContext } from "react";
import { useTranslations } from "next-intl";
import { AuthContext } from "@/contexts/AuthContext";
import { useInterns } from "@/hooks/intern/useInterns";
import { Users, Circle, CheckCircle2, XCircle, CalendarPlus, AlertTriangle, type LucideIcon } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";

interface StatCard {
  title: string;
  value: number;
  icon: LucideIcon;
  containerClass: string;
}

export default function LeaderInternStats() {
  const t = useTranslations("leader.interns");
  const auth = useContext(AuthContext);
  const currentUserId = auth?.state.user?.id;

  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  const firstDayStr = firstDayOfMonth.toISOString().split("T")[0];

  const { data: allData, isPending: allLoading, isError: allError } = useInterns(
    currentUserId ? { leaderId: currentUserId, limit: 1 } : { limit: 1 },
  );
  const { data: activeData, isPending: activeLoading } = useInterns(
    currentUserId ? { leaderId: currentUserId, status: "ACTIVE", limit: 1 } : { status: "ACTIVE", limit: 1 },
  );
  const { data: completedData, isPending: completedLoading } = useInterns(
    currentUserId ? { leaderId: currentUserId, status: "COMPLETED", limit: 1 } : { status: "COMPLETED", limit: 1 },
  );
  const { data: droppedData, isPending: droppedLoading } = useInterns(
    currentUserId ? { leaderId: currentUserId, status: "DROPPED", limit: 1 } : { status: "DROPPED", limit: 1 },
  );
  const { data: newData, isPending: newLoading } = useInterns(
    currentUserId ? { leaderId: currentUserId, startDateFrom: firstDayStr, limit: 1 } : { startDateFrom: firstDayStr, limit: 1 },
  );

  const isPending = allLoading || activeLoading || completedLoading || droppedLoading || newLoading;

  const cards: StatCard[] = [
    { title: t("totalInterns"), value: allData?.meta?.total ?? 0, icon: Users, containerClass: "border-sky-300 bg-sky-100/80 text-sky-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-sky-500/20 dark:to-cyan-400/10 dark:text-sky-300" },
    { title: t("active"), value: activeData?.meta?.total ?? 0, icon: Circle, containerClass: "border-emerald-300 bg-emerald-100/80 text-emerald-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-emerald-500/20 dark:to-green-400/10 dark:text-emerald-300" },
    { title: t("completed"), value: completedData?.meta?.total ?? 0, icon: CheckCircle2, containerClass: "border-blue-300 bg-blue-100/80 text-blue-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-blue-500/20 dark:to-indigo-400/10 dark:text-blue-300" },
    { title: t("dropped"), value: droppedData?.meta?.total ?? 0, icon: XCircle, containerClass: "border-rose-300 bg-rose-100/80 text-rose-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-rose-500/20 dark:to-pink-400/10 dark:text-rose-300" },
    { title: t("newThisMonth"), value: newData?.meta?.total ?? 0, icon: CalendarPlus, containerClass: "border-violet-300 bg-violet-100/80 text-violet-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-violet-500/20 dark:to-purple-400/10 dark:text-violet-300" },
  ];

  if (allError) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-rose-300 shadow-glass">
        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
        <p className="text-sm font-medium">{t("statsError")}</p>
      </div>
    );
  }

  const isOdd = cards.length % 2 !== 0;

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5 md:gap-5">
        {cards.map((card, idx) => (
          <MetalCard
            key={card.title}
            className={`p-4 sm:p-5 lg:p-6 ${isOdd && idx === 0 ? "col-span-2 md:col-span-1" : ""}`}
          >
            <div className="flex items-start justify-between gap-2 animate-pulse">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-3 w-20 rounded bg-muted/20" />
                <div className="h-8 w-12 rounded bg-muted/20" />
                <div className="h-[2px] w-12 rounded-full bg-muted/20" />
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-xl sm:rounded-2xl bg-muted/20" />
            </div>
          </MetalCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5 md:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isFirstAndOdd = isOdd && idx === 0;

        return (
          <MetalCard
            key={card.title}
            className={`p-4 sm:p-5 lg:p-6 ${isFirstAndOdd ? "col-span-2 md:col-span-1" : ""}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted truncate">
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
