"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useApplicationInvites } from "@/hooks/application/useApplicationInvites";
import type { GetApplicationInvitesParams } from "@/types/application";
import {
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";

interface StatCard {
  title: string;
  value: number;
  icon: LucideIcon;
  iconBg: string;
}

export default function OnboardingStats() {
  const searchParams = useSearchParams();

  const params: GetApplicationInvitesParams = useMemo(() => {
    const p: GetApplicationInvitesParams = {};
    const createdFrom = searchParams.get("createdFrom");
    const createdTo = searchParams.get("createdTo");
    if (createdFrom) p.createdFrom = createdFrom;
    if (createdTo) p.createdTo = createdTo;
    return p;
  }, [searchParams]);

  const { data, isPending, isError } = useApplicationInvites(params);

  const invites = data?.data ?? [];

  const stats = {
    activeInvites: invites.filter((i) => i.status === "ACTIVE").length,
    pendingApplications: invites.filter(
      (i) => i.application?.status === "PENDING"
    ).length,
    approvedApplications: invites.filter(
      (i) => i.application?.status === "APPROVED"
    ).length,
    rejectedApplications: invites.filter(
      (i) => i.application?.status === "REJECTED"
    ).length,
  };

  const cards: StatCard[] = [
    {
      title: "Active Invites",
      value: stats.activeInvites,
      icon: Mail,
      iconBg: "from-sky-500/20 to-cyan-400/10",
    },
    {
      title: "Pending Applications",
      value: stats.pendingApplications,
      icon: Clock,
      iconBg: "from-amber-500/20 to-yellow-400/10",
    },
    {
      title: "Approved Applications",
      value: stats.approvedApplications,
      icon: CheckCircle2,
      iconBg: "from-emerald-500/20 to-green-400/10",
    },
    {
      title: "Rejected Applications",
      value: stats.rejectedApplications,
      icon: XCircle,
      iconBg: "from-red-500/20 to-rose-400/10",
    },
  ];

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
        <p className="text-sm text-red-300">
          Failed to load onboarding stats. Please try refreshing the page.
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
                className={`
                  flex h-14 w-14 items-center justify-center
                  rounded-2xl
                  border border-white/10
                  bg-gradient-to-br ${card.iconBg}
                  shadow-lg
                  transition-all duration-500
                  group-hover:rotate-6 group-hover:scale-110
                `}
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
