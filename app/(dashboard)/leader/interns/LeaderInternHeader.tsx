"use client";

import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";

export default function LeaderInternHeader() {
  const t = useTranslations("leader.interns");

  return (
    <MetalCard className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/20 to-cyan-400/10 shadow-lg">
            <Users className="h-6 w-6 text-cyan-300 shrink-0" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight metal-text">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              {t("description")}
            </p>
          </div>
        </div>
      </div>
    </MetalCard>
  );
}
