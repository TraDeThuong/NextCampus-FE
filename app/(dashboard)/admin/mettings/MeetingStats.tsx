"use client";

import { Calendar, Clock, Play, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useMeetings } from "@/hooks/meeting/useMeetings";

export default function MeetingStats() {
  const { data: totalData, isPending: totalLoading, isError: totalError } = useMeetings({ limit: 1 });
  const { data: scheduledData, isPending: scheduledLoading } = useMeetings({ status: "SCHEDULED", limit: 1 });
  const { data: ongoingData, isPending: ongoingLoading } = useMeetings({ status: "ONGOING", limit: 1 });
  const { data: completedData, isPending: completedLoading } = useMeetings({ status: "COMPLETED", limit: 1 });
  const { data: cancelledData, isPending: cancelledLoading } = useMeetings({ status: "CANCELLED", limit: 1 });

  const isPending = totalLoading || scheduledLoading || ongoingLoading || completedLoading || cancelledLoading;

  const cards = [
    { title: "Total Meetings", value: totalData?.meta?.total ?? 0, icon: Calendar, iconBg: "from-sky-500/20 to-cyan-400/10" },
    { title: "Scheduled", value: scheduledData?.meta?.total ?? 0, icon: Clock, iconBg: "from-blue-500/20 to-indigo-400/10" },
    { title: "Ongoing", value: ongoingData?.meta?.total ?? 0, icon: Play, iconBg: "from-emerald-500/20 to-green-400/10" },
    { title: "Completed", value: completedData?.meta?.total ?? 0, icon: CheckCircle2, iconBg: "from-violet-500/20 to-purple-400/10" },
    { title: "Cancelled", value: cancelledData?.meta?.total ?? 0, icon: XCircle, iconBg: "from-red-500/20 to-rose-400/10" },
  ];

  if (totalError) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
        <p className="text-sm text-red-300">Failed to load meeting stats.</p>
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

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
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
