"use client";

import { useTranslations } from "next-intl";
import { Activity, ShieldCheck } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";

export default function ActivityLogHeader() {
  const t = useTranslations();

  return (
    <MetalCard>
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Activity className="h-5 w-5 shrink-0" />
              </div>
              <h2 className="text-2xl font-bold metal-text">
                {t("admin.activityLogs.title")}
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted">
              {t("admin.activityLogs.description")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 backdrop-blur-xl shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{t("admin.activityLogs.liveBadge")}</span>
            </div>
          </div>
        </div>
      </div>
    </MetalCard>
  );
}
