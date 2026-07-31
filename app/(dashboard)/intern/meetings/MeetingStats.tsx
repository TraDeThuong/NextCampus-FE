"use client";

import { Calendar, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useMeetings } from "@/hooks/meeting/useMeetings";

export default function MeetingStats() {
  const { data: totalData, isPending: t1, isError: e1 } = useMeetings({ limit: 1 });
  const { data: sData, isPending: t2 } = useMeetings({ status: "SCHEDULED", limit: 1 });
  const { data: oData, isPending: t3 } = useMeetings({ status: "ONGOING", limit: 1 });
  const { data: cData, isPending: t4 } = useMeetings({ status: "COMPLETED", limit: 1 });
  const isPending = t1 || t2 || t3 || t4;

  const cards = [
    { title: "Total", value: totalData?.meta?.total ?? 0, icon: Calendar, iconBg: "from-sky-500/20 to-cyan-400/10" },
    { title: "Scheduled", value: sData?.meta?.total ?? 0, icon: Clock, iconBg: "from-blue-500/20 to-indigo-400/10" },
    { title: "Ongoing", value: oData?.meta?.total ?? 0, icon: CheckCircle2, iconBg: "from-emerald-500/20 to-green-400/10" },
    { title: "Completed", value: cData?.meta?.total ?? 0, icon: XCircle, iconBg: "from-violet-500/20 to-purple-400/10" },
  ];

  if (e1) return <div className="flex items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6"><AlertTriangle className="h-5 w-5 text-red-400" /><p className="text-sm text-red-300">Failed to load stats.</p></div>;
  if (isPending) return <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <MetalCard key={card.title} className="p-6">
            <div className="flex items-start justify-between">
              <div><p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">{card.title}</p><h3 className="chrome-text mt-4 text-5xl font-bold leading-none">{card.value}</h3><div className="mt-4 h-[2px] w-16 rounded-full bg-gradient-to-r from-primary-light/70 to-transparent" /></div>
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br ${card.iconBg} shadow-lg`}><Icon className="h-6 w-6 text-white" /></div>
            </div>
          </MetalCard>
        );
      })}
    </div>
  );
}
