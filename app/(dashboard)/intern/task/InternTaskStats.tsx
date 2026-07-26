"use client";

import { useInternStats } from "@/hooks/stats/useInternStats";
import { CheckSquare, Clock, CheckCircle2, Percent, AlertTriangle, type LucideIcon } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";

interface StatCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBg: string;
}

export default function InternTaskStats() {
  const { data, isPending, isError } = useInternStats();

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

  const s = data?.data;
  const cards: StatCard[] = [
    { title: "Total Tasks", value: s?.totalTasks ?? 0, icon: CheckSquare, iconBg: "from-sky-500/20 to-cyan-400/10" },
    { title: "In Progress", value: s?.tasksInProgress ?? 0, icon: Clock, iconBg: "from-blue-500/20 to-indigo-400/10" },
    { title: "Completed", value: s?.tasksCompleted ?? 0, icon: CheckCircle2, iconBg: "from-emerald-500/20 to-green-400/10" },
    { title: "Completion Rate", value: `${s?.completionRate ?? 0}%`, icon: Percent, iconBg: "from-violet-500/20 to-purple-400/10" },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <MetalCard key={card.title} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                  {card.title}
                </p>
                <h3 className="chrome-text mt-4 text-5xl font-bold leading-none">
                  {card.value}
                </h3>
                <div className="mt-4 h-[2px] w-16 rounded-full bg-gradient-to-r from-primary-light/70 to-transparent" />
              </div>
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${card.iconBg} shadow-lg`}
              >
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </MetalCard>
        );
      })}
    </div>
  );
}
