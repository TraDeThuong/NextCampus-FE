"use client";

import { useMemo } from "react";
import { Calendar, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useMeetings } from "@/hooks/meeting/useMeetings";
import { useMyApprovedAbsences } from "@/hooks/meeting/useMyApprovedAbsences";

export default function MeetingStats() {
  const t = useTranslations("leader.meetings");
  const { data, isPending, isError } = useMeetings({ limit: 100, sortBy: "startTime", order: "asc" });
  const { data: excusedIds } = useMyApprovedAbsences();

  const counts = useMemo(() => {
    const meetings = data?.data ?? [];
    const excused = excusedIds ?? new Set<string>();
    const active = meetings.filter((m) => !excused.has(m.id));
    return {
      total: active.length,
      scheduled: active.filter((m) => m.status === "SCHEDULED").length,
      completed: active.filter((m) => m.status === "COMPLETED").length,
      cancelled: active.filter((m) => m.status === "CANCELLED").length,
    };
  }, [data, excusedIds]);

  const cards = [
    { title: t("totalMeetings"), value: counts.total, icon: Calendar, iconBg: "from-sky-500/20 to-cyan-400/10" },
    { title: t("scheduled"), value: counts.scheduled, icon: Clock, iconBg: "from-blue-500/20 to-indigo-400/10" },
    { title: t("completed"), value: counts.completed, icon: CheckCircle2, iconBg: "from-violet-500/20 to-purple-400/10" },
    { title: t("cancelled"), value: counts.cancelled, icon: XCircle, iconBg: "from-red-500/20 to-rose-400/10" },
  ];

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
        <p className="text-sm text-red-300">{t("statsError")}</p>
      </div>
    );
  }

  if (isPending) return <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="grid gap-5 md:grid-cols-2">
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
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${card.iconBg} shadow-lg`}><Icon className="h-6 w-6 text-white" /></div>
            </div>
          </MetalCard>
        );
      })}
    </div>
  );
}
