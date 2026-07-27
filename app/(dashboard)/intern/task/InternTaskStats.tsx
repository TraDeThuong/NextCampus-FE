"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CheckSquare, Clock, CheckCircle2, Percent, AlertTriangle, ListTodo, type LucideIcon } from "lucide-react";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";

interface StatCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBg: string;
}

export default function InternTaskStats() {
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
        if (deadlineTo) {
          const to = new Date(deadlineTo);
          to.setHours(23, 59, 59, 999);
          if (d > to) return false;
        }
        return true;
      });
    }

    const total = all.length;
    const todo = all.filter((a) => a.status === "TODO").length;
    const inProgress = all.filter((a) => a.status === "IN_PROGRESS").length;
    const completed = all.filter((a) => a.status === "DONE").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const overdue = all.filter(
      (a) => a.task.deadline && new Date(a.task.deadline) < now && a.status !== "DONE",
    ).length;

    return { total, inProgress, completed, rate, overdue };
  }, [assignmentsData, deadlineFrom, deadlineTo]);

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
        <p className="text-sm text-red-300">Failed to load task stats.</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const cards: StatCard[] = [
    { title: "Total Tasks", value: stats.total, icon: CheckSquare, iconBg: "from-sky-500/20 to-cyan-400/10" },
    { title: "In Progress", value: stats.inProgress, icon: Clock, iconBg: "from-blue-500/20 to-indigo-400/10" },
    { title: "Completed", value: stats.completed, icon: CheckCircle2, iconBg: "from-emerald-500/20 to-green-400/10" },
    { title: "Completion Rate", value: `${stats.rate}%`, icon: Percent, iconBg: "from-violet-500/20 to-purple-400/10" },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <MetalCard key={card.title} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">{card.title}</p>
                <h3 className="chrome-text mt-4 text-5xl font-bold leading-none">{card.value}</h3>
                <div className="mt-4 h-[2px] w-16 rounded-full bg-gradient-to-r from-primary-light/70 to-transparent" />
              </div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${card.iconBg} shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </MetalCard>
        );
      })}
    </div>
  );
}
