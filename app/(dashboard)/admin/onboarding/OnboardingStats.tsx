"use client";

import { useTranslations } from "next-intl";
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
  containerClass: string;
}

export default function OnboardingStats() {
  const t = useTranslations();
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
      title: t("admin.onboarding.activeInvites"),
      value: stats.activeInvites,
      icon: Mail,
      containerClass: "border-sky-300 bg-sky-100/80 text-sky-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-sky-500/20 dark:to-cyan-400/10 dark:text-sky-300",
    },
    {
      title: t("admin.onboarding.pendingApplications"),
      value: stats.pendingApplications,
      icon: Clock,
      containerClass: "border-amber-300 bg-amber-100/80 text-amber-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-amber-500/20 dark:to-yellow-400/10 dark:text-amber-300",
    },
    {
      title: t("admin.onboarding.approvedApplications"),
      value: stats.approvedApplications,
      icon: CheckCircle2,
      containerClass: "border-emerald-300 bg-emerald-100/80 text-emerald-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-emerald-500/20 dark:to-green-400/10 dark:text-emerald-300",
    },
    {
      title: t("admin.onboarding.rejectedApplications"),
      value: stats.rejectedApplications,
      icon: XCircle,
      containerClass: "border-rose-300 bg-rose-100/80 text-rose-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-red-500/20 dark:to-rose-400/10 dark:text-rose-300",
    },
  ];

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
        <p className="text-sm text-red-300">
          {t("admin.onboarding.loadStatsError")}
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
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4 md:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <MetalCard key={card.title} className="p-4 sm:p-5 lg:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted truncate">
                  {card.title}
                </p>

                <h3 className="chrome-text mt-2 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl font-bold leading-none">
                  {card.value}
                </h3>

                <div className="mt-3 sm:mt-4 h-[2px] w-10 sm:w-16 rounded-full bg-gradient-to-r from-primary-light/70 to-transparent" />
              </div>

              <div
                className={`
                  flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center
                  rounded-xl sm:rounded-2xl
                  border ${card.containerClass}
                  shadow-sm dark:shadow-lg
                  transition-all duration-500
                  group-hover:rotate-6 group-hover:scale-110
                `}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
              </div>
            </div>
          </MetalCard>
        );
      })}
    </div>
  );
}
