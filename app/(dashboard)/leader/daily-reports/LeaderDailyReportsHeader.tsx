"use client";

import { FileText, RotateCw, UserCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import type { Intern } from "@/types/intern";

interface LeaderDailyReportsHeaderProps {
  selectedIntern?: Intern | null;
  onReload?: () => void;
  isReloading?: boolean;
}

export default function LeaderDailyReportsHeader({
  selectedIntern,
  onReload,
  isReloading = false,
}: LeaderDailyReportsHeaderProps) {
  const t = useTranslations("leader.dailyReports");

  return (
    <MetalCard>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <FileText className="h-6 w-6 shrink-0 text-cyan-400" />
              <h2 className="text-2xl font-bold metal-text">
                {t("title")}
              </h2>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
              {selectedIntern ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {selectedIntern.fullName}
                  </span>
                  {selectedIntern.department?.name && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-cyan-400/20 bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-300">
                      <UserCheck className="h-3 w-3 shrink-0" />
                      {selectedIntern.department.name}
                    </span>
                  )}
                </div>
              ) : (
                <p>{t("description")}</p>
              )}
            </div>
          </div>

          {onReload && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onReload}
                disabled={isReloading}
                title={t("reloadTooltip")}
                aria-label={t("reloadTooltip")}
                className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs sm:text-sm font-medium text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCw
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    isReloading ? "animate-spin text-cyan-400" : ""
                  }`}
                />
                <span className="hidden sm:inline">{t("reloadTooltip")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </MetalCard>
  );
}
