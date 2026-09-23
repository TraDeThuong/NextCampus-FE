"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Lock, Sparkles, AlertTriangle } from "lucide-react";
import { useRoles } from "@/hooks/rbac/useRoles";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";

export default function RolesStats() {
  const t = useTranslations();

  const { data: rolesRes, isLoading, isError } = useRoles({
    limit: 100,
  });

  const stats = useMemo(() => {
    const roles = rolesRes?.data ?? [];
    const totalRoles = rolesRes?.meta?.total ?? roles.length;
    const systemRoles = roles.filter((r) => r.isSystem).length;
    const customRoles = roles.filter((r) => !r.isSystem).length;

    return { totalRoles, systemRoles, customRoles };
  }, [rolesRes?.data, rolesRes?.meta?.total]);

  const cards = [
    {
      title: t("admin.roles.stats.totalRoles"),
      value: stats.totalRoles,
      icon: ShieldCheck,
      containerClass: "border-cyan-300 bg-cyan-100/80 text-cyan-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-sky-400/10 dark:text-cyan-300",
      lineGradient: "from-cyan-400/70 to-transparent",
    },
    {
      title: t("admin.roles.stats.systemRoles"),
      value: stats.systemRoles,
      icon: Lock,
      containerClass: "border-indigo-300 bg-indigo-100/80 text-indigo-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-indigo-500/20 dark:to-purple-400/10 dark:text-indigo-300",
      lineGradient: "from-indigo-400/70 to-transparent",
    },
    {
      title: t("admin.roles.stats.customRoles"),
      value: stats.customRoles,
      icon: Sparkles,
      containerClass: "border-emerald-300 bg-emerald-100/80 text-emerald-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-emerald-500/20 dark:to-green-400/10 dark:text-emerald-300",
      lineGradient: "from-emerald-400/70 to-transparent",
    },
  ];

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 backdrop-blur-xl">
        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
        <p className="text-sm text-rose-300">
          {t("admin.roles.loadError")}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const isOdd = cards.length % 2 !== 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5">
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
                <div
                  className={`mt-3 sm:mt-4 h-[2px] w-10 sm:w-16 rounded-full bg-gradient-to-r ${card.lineGradient}`}
                />
              </div>
              <div
                className={`
                  flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center
                  rounded-xl sm:rounded-2xl border ${card.containerClass}
                  shadow-sm dark:shadow-lg transition-all duration-500
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
