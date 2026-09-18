"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CheckSquare, Clock, CheckCircle2, Percent, AlertTriangle, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";

interface StatCard { title: string; value: string | number; icon: LucideIcon; iconBg: string; }

export default function InternTaskStats() {
  const t = useTranslations("intern.tasks");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const deadlineFrom = searchParams.get("deadlineFrom");
  const deadlineTo = searchParams.get("deadlineTo");

  const { data: assignmentsData, isPending, isError } = useTaskAssignments({ limit: 500 });

  const stats = useMemo(() => {
    const now = new Date();
    let all = assignmentsData?.data ?? [];
    if (deadlineFrom || deadlineTo) {
      all = all.filter((a) => {
        const d = new Date(a.task.deadline);
        if (deadlineFrom && d < new Date(deadlineFrom)) return false;
        if (deadlineTo) { const to = new Date(deadlineTo); to.setHours(23, 59, 59, 999); if (d > to) return false; }
        return true;
      });
    }
    const total = all.length;
    const inProgress = all.filter((a) => a.status === "IN_PROGRESS").length;
    const overdue = all.filter(
      (a) => new Date(a.task.deadline) < now && a.status !== "DONE"
    ).length;
    const completed = all.filter((a) => a.status === "DONE").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, inProgress, overdue, completed, rate };
  }, [assignmentsData, deadlineFrom, deadlineTo]);

  if (isError) return <div className="flex items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl"><AlertTriangle className="h-5 w-5 shrink-0 text-red-400" /><p className="text-sm text-red-300">{t("statsError")}</p></div>;
  if (isPending) return <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>;

  const cards: StatCard[] = [
    { title: t("totalTasks"), value: stats.total, icon: CheckSquare, iconBg: "from-sky-500/20 to-cyan-400/10" },
    { title: t("inProgress"), value: stats.inProgress, icon: Clock, iconBg: "from-blue-500/20 to-indigo-400/10" },
    { title: t.has("overdue") ? t("overdue") : tCommon("overdue"), value: stats.overdue, icon: AlertTriangle, iconBg: "from-rose-500/20 to-red-400/10" },
    { title: t("completed"), value: stats.completed, icon: CheckCircle2, iconBg: "from-emerald-500/20 to-green-400/10" },
    { title: t("completionRate"), value: `${stats.rate}%`, icon: Percent, iconBg: "from-violet-500/20 to-purple-400/10" },
  ];

  const isOdd = cards.length % 2 !== 0;

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
                <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted truncate">{card.title}</p>
                <h3 className="chrome-text mt-2 sm:mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold leading-none">{card.value}</h3>
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
