"use client";

import React from "react";
import { Radio, Zap, CheckCircle2, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import type { DiscordWebhookConfig } from "@/types/discord";

interface DiscordStatsProps {
  webhooks: DiscordWebhookConfig[];
  isLoading: boolean;
  isError: boolean;
}

export default function DiscordStats({
  webhooks,
  isLoading,
  isError,
}: DiscordStatsProps) {
  const t = useTranslations("discord");

  const total = webhooks.length;
  const active = webhooks.filter((w) => w.isEnabled).length;
  const healthy = webhooks.filter((w) => w.lastStatus === "SUCCESS").length;
  const failed = webhooks.filter((w) => w.lastStatus === "FAILED").length;

  const cards = [
    {
      title: t("stats.totalWebhooks"),
      value: total,
      icon: Radio,
      containerClass:
        "border-indigo-300 bg-indigo-100/80 text-indigo-700 hover:bg-indigo-200/80 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-300",
    },
    {
      title: t("stats.activeWebhooks"),
      value: active,
      icon: Zap,
      containerClass:
        "border-sky-300 bg-sky-100/80 text-sky-700 hover:bg-sky-200/80 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300",
    },
    {
      title: t("stats.healthyConnections"),
      value: healthy,
      icon: CheckCircle2,
      containerClass:
        "border-emerald-300 bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200/80 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    },
    {
      title: t("stats.failedConnections"),
      value: failed,
      icon: AlertTriangle,
      containerClass:
        "border-rose-300 bg-rose-100/80 text-rose-700 hover:bg-rose-200/80 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300",
    },
  ];

  if (isError) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 backdrop-blur-xl shadow-inner">
        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
        <p className="text-sm text-rose-300">
          {t("departmentSection.empty")}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <MetalCard key={i}>
            <div className="flex items-center justify-between p-4 sm:p-6 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 w-16 sm:w-24 bg-muted/20 rounded-md" />
                <div className="h-7 sm:h-8 w-10 sm:w-12 bg-muted/30 rounded-md" />
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-muted/20" />
            </div>
          </MetalCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <MetalCard key={idx}>
            <div className="flex items-center justify-between p-4 sm:p-6">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted">
                  {card.title}
                </p>
                <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground">
                  {card.value}
                </p>
              </div>
              <div
                className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 ${card.containerClass}`}
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
