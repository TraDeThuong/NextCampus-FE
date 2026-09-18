"use client";

import { Calendar, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useMeetings } from "@/hooks/meeting/useMeetings";

export default function MeetingStats() {
  const t = useTranslations("intern.meetings");
  const { data: totalData, isPending: t1, isError: e1 } = useMeetings({ limit: 1 });
  const { data: sData, isPending: t2 } = useMeetings({ status: "SCHEDULED", limit: 1 });
  const { data: oData, isPending: t3 } = useMeetings({ status: "ONGOING", limit: 1 });
  const { data: cData, isPending: t4 } = useMeetings({ status: "COMPLETED", limit: 1 });
  const isPending = t1 || t2 || t3 || t4;

  const cards = [
    { title: t("total"), value: totalData?.meta?.total ?? 0, icon: Calendar, iconBg: "from-sky-500/20 to-cyan-400/10" },
    { title: t("scheduled"), value: sData?.meta?.total ?? 0, icon: Clock, iconBg: "from-blue-500/20 to-indigo-400/10" },
    { title: t("ongoing"), value: oData?.meta?.total ?? 0, icon: CheckCircle2, iconBg: "from-emerald-500/20 to-green-400/10" },
    { title: t("completed"), value: cData?.meta?.total ?? 0, icon: XCircle, iconBg: "from-violet-500/20 to-purple-400/10" },
  ];

  if (e1) return <div className="flex items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6"><AlertTriangle className="h-5 w-5 text-red-400" /><p className="text-sm text-red-300">{t("statsError")}</p></div>;
  if (isPending) return <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <MetalCard key={card.title} className="p-4 sm:p-5 lg:p-6">
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
