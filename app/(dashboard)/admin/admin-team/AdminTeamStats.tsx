"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Circle, XCircle, AlertTriangle } from "lucide-react";

import { getUsersService } from "@/services/user.service";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";

export default function AdminTeamStats() {
    const { data: allData, isPending: allLoading, isError } = useQuery({
        queryKey: ["users", { roleName: "ADMIN", limit: 1 }],
        queryFn: () => getUsersService({ roleName: "ADMIN", limit: 1 }),
    });

    const { data: activeData, isPending: activeLoading } = useQuery({
        queryKey: ["users", { roleName: "ADMIN", isActive: true, limit: 1 }],
        queryFn: () =>
            getUsersService({ roleName: "ADMIN", isActive: true, limit: 1 }),
    });

    const { data: inactiveData, isPending: inactiveLoading } = useQuery({
        queryKey: ["users", { roleName: "ADMIN", isActive: false, limit: 1 }],
        queryFn: () =>
            getUsersService({ roleName: "ADMIN", isActive: false, limit: 1 }),
    });

    const isPending = allLoading || activeLoading || inactiveLoading;

    const cards = [
        {
            title: "Total Admins",
            value: allData?.meta?.total ?? 0,
            icon: Users,
            iconBg: "from-sky-500/20 to-cyan-400/10",
        },
        {
            title: "Active",
            value: activeData?.meta?.total ?? 0,
            icon: Circle,
            iconBg: "from-emerald-500/20 to-green-400/10",
        },
        {
            title: "Inactive",
            value: inactiveData?.meta?.total ?? 0,
            icon: XCircle,
            iconBg: "from-red-500/20 to-rose-400/10",
        },
    ];

    if (isError) {
        return (
            <div className="flex items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                <p className="text-sm text-red-300">
                    Failed to load admin stats.
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

    return (
        <div className="grid gap-5 md:grid-cols-3">
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
