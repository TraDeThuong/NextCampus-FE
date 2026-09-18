"use client";

import { useTranslations } from "next-intl";
import { useInterns } from "@/hooks/intern/useInterns";
import {
    Users,
    Circle,
    CheckCircle2,
    XCircle,
    CalendarPlus,
    AlertTriangle,
    type LucideIcon,
} from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";

interface StatCard {
    title: string;
    value: number;
    icon: LucideIcon;
    iconBg: string;
}

export default function InternStats() {
    const t = useTranslations();
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const firstDayStr = firstDayOfMonth.toISOString().split("T")[0];

    const { data: allData, isPending: allLoading, isError: allError } = useInterns({ limit: 1 });
    const { data: activeData, isPending: activeLoading } = useInterns({ status: "ACTIVE", limit: 1 });
    const { data: completedData, isPending: completedLoading } = useInterns({ status: "COMPLETED", limit: 1 });
    const { data: droppedData, isPending: droppedLoading } = useInterns({ status: "DROPPED", limit: 1 });
    const { data: newData, isPending: newLoading } = useInterns({ startDateFrom: firstDayStr, limit: 1 });

    const isPending = allLoading || activeLoading || completedLoading || droppedLoading || newLoading;

    const cards: StatCard[] = [
        {
            title: t("admin.interns.totalInterns"),
            value: allData?.meta?.total ?? 0,
            icon: Users,
            iconBg: "from-sky-500/20 to-cyan-400/10",
        },
        {
            title: t("admin.interns.active"),
            value: activeData?.meta?.total ?? 0,
            icon: Circle,
            iconBg: "from-emerald-500/20 to-green-400/10",
        },
        {
            title: t("admin.interns.completed"),
            value: completedData?.meta?.total ?? 0,
            icon: CheckCircle2,
            iconBg: "from-blue-500/20 to-indigo-400/10",
        },
        {
            title: t("admin.interns.dropped"),
            value: droppedData?.meta?.total ?? 0,
            icon: XCircle,
            iconBg: "from-red-500/20 to-rose-400/10",
        },
        {
            title: t("admin.interns.newThisMonth"),
            value: newData?.meta?.total ?? 0,
            icon: CalendarPlus,
            iconBg: "from-violet-500/20 to-purple-400/10",
        },
    ];

    if (allError) {
        return (
            <div className="flex items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                <p className="text-sm text-red-300">
                    {t("admin.interns.loadStatsError")}
                </p>
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
