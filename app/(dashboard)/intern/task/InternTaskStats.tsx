"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CheckSquare, Clock, CheckCircle2, Percent, AlertTriangle, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import type { TaskAssignment } from "@/types/task-assignment";
import MetalCard from "@/components/ui/MetalCard";

interface StatCard { title: string; value: string | number; icon: LucideIcon; iconBg?: string; containerClass?: string; }

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== "object") return [];
  if ("data" in data) {
    const inner = (data as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as T[];
    if (
      inner &&
      typeof inner === "object" &&
      "data" in inner &&
      Array.isArray((inner as { data: unknown }).data)
    ) {
      return (inner as { data: T[] }).data;
    }
    if (
      inner &&
      typeof inner === "object" &&
      "items" in inner &&
      Array.isArray((inner as { items: unknown }).items)
    ) {
      return (inner as { items: T[] }).items;
    }
  }
  if ("items" in data && Array.isArray((data as { items: unknown }).items)) {
    return (data as { items: T[] }).items;
  }
  return [];
}

export default function InternTaskStats() {
  const t = useTranslations("intern.tasks");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const deadlineFrom = searchParams.get("deadlineFrom");
  const deadlineTo = searchParams.get("deadlineTo");

  const { data: assignmentsData, isPending, isError } = useTaskAssignments({ limit: 500 });

  const stats = useMemo(() => {
    const now = new Date();
    const allList = extractArray<TaskAssignment>(assignmentsData);
    let all = allList;
    if (deadlineFrom || deadlineTo) {
      all = all.filter((a) => {
        if (!a.task?.deadline) return false;
        const d = new Date(a.task.deadline);
        if (deadlineFrom && d < new Date(deadlineFrom)) return false;
        if (deadlineTo) {
          const to = new Date(deadlineTo);
          to.setHours(23, 59, 59, 999);
          if (d > to) return false;
        }
        return true;
      });
    }
    const total = all.length;
    const inProgress = all.filter((a) => a.status === "IN_PROGRESS").length;
    const overdue = all.filter(
      (a) => a.task?.deadline && new Date(a.task.deadline) < now && a.status !== "DONE"
    ).length;
    const completed = all.filter((a) => a.status === "DONE").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, inProgress, overdue, completed, rate };
  }, [assignmentsData, deadlineFrom, deadlineTo]);

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
        <p className="text-sm text-red-300">{t("statsError")}</p>
      </div>
    );
  }

  const cards: StatCard[] = [
    {
      title: t("totalTasks"),
      value: stats.total,
      icon: CheckSquare,
      containerClass: "border-sky-300 bg-sky-100/80 text-sky-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-sky-500/20 dark:to-cyan-400/10 dark:text-sky-300",
    },
    {
      title: t("inProgress"),
      value: stats.inProgress,
      icon: Clock,
      containerClass: "border-blue-300 bg-blue-100/80 text-blue-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-blue-500/20 dark:to-indigo-400/10 dark:text-blue-300",
    },
    {
      title: t.has("overdue") ? t("overdue") : tCommon("overdue"),
      value: stats.overdue,
      icon: AlertTriangle,
      containerClass: "border-rose-300 bg-rose-100/80 text-rose-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-rose-500/20 dark:to-red-400/10 dark:text-rose-300",
    },
    {
      title: t("completed"),
      value: stats.completed,
      icon: CheckCircle2,
      containerClass: "border-emerald-300 bg-emerald-100/80 text-emerald-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-emerald-500/20 dark:to-green-400/10 dark:text-emerald-300",
    },
    {
      title: t("completionRate"),
      value: `${stats.rate}%`,
      icon: Percent,
      containerClass: "border-violet-300 bg-violet-100/80 text-violet-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-violet-500/20 dark:to-purple-400/10 dark:text-violet-300",
    },
  ];

  const isOdd = cards.length % 2 !== 0;

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5 md:gap-5">
        {cards.map((card, idx) => (
          <MetalCard
            key={card.title}
            className={`p-4 sm:p-5 lg:p-6 animate-pulse ${
              isOdd && idx === 0 ? "col-span-2 md:col-span-1" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-3 w-20 rounded bg-white/10" />
                <div className="h-8 w-14 rounded bg-white/10" />
                <div className="h-[2px] w-12 rounded-full bg-white/10" />
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-xl sm:rounded-2xl bg-white/10 shrink-0" />
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
            className={`p-4 sm:p-5 lg:p-6 ${
              isFirstAndOdd ? "col-span-2 md:col-span-1" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted truncate">
                  {card.title}
                </p>
                <h3 className="chrome-text mt-2 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl font-bold leading-none">
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
