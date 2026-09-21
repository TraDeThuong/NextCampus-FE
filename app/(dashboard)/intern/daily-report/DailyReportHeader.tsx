"use client";

import { useMemo } from "react";
import { FileText, Clock, CheckCircle2, AlertTriangle, Plus, RotateCw } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import { useDailyReports } from "@/hooks/daily-report/useDailyReports";
import type { DailyReport } from "@/types/daily-report";

type Props = {
  onOpenCreate: () => void;
  onOpenEdit: (report: DailyReport) => void;
  onReload?: () => void;
  isReloading?: boolean;
};

export default function DailyReportHeader({
  onOpenCreate,
  onOpenEdit,
  onReload,
  isReloading = false,
}: Props) {
  const t = useTranslations("intern.dailyReport");

  // Format date and time in Asia/Ho_Chi_Minh
  const { todayStr, isPastCutoff } = useMemo(() => {
    const now = new Date();
    const vnDateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(now);
    const vnTimeStr = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
    const [vnHour, vnMinute] = vnTimeStr.split(":").map(Number);
    const past = vnHour > 17 || (vnHour === 17 && vnMinute >= 30);
    return { todayStr: vnDateStr, isPastCutoff: past };
  }, []);

  const { data, isPending } = useDailyReports({
    from: todayStr,
    to: todayStr,
    limit: 1,
  });
  const existingReport = data?.data?.[0];
  const hasReportedToday = !!existingReport;

  return (
    <div className="space-y-4">
      <MetalCard>
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <FileText className="h-6 w-6 shrink-0 text-cyan-400" />
                <h2 className="text-2xl font-bold metal-text">{t("title")}</h2>
              </div>
              <p className="mt-1 text-sm text-muted">{t("description")}</p>
            </div>

            <div className="flex items-center gap-3">
              {onReload && (
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
              )}

              {isPending ? (
                <Button variant="metal-silver" size="md" isLoading disabled />
              ) : hasReportedToday ? (
                <Button
                  variant="metal-blue"
                  size="md"
                  onClick={() => onOpenEdit(existingReport!)}
                  className="active:scale-95 shadow-sm"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span>{t("editReport")}</span>
                </Button>
              ) : (
                <Button
                  variant="metal-blue"
                  size="md"
                  onClick={onOpenCreate}
                  className="active:scale-95 shadow-sm"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  <span>{t("createReport")}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </MetalCard>

      {/* Cut-off Deadline Banner (17:30 Hạn chốt nộp báo cáo) */}
      {!isPending && (
        <div>
          {hasReportedToday ? (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 animate-fadeIn">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {t("reportedTodayTitle", { date: todayStr })}
                </p>
                <p className="text-xs text-emerald-400/80 mt-0.5">
                  {t("reportedTodayDesc")}
                </p>
              </div>
              <Button
                variant="glass"
                size="sm"
                onClick={() => onOpenEdit(existingReport!)}
              >
                {t("editReport")}
              </Button>
            </div>
          ) : isPastCutoff ? (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-300 animate-fadeIn">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400 animate-bounce" />
              <div className="flex-1">
                <p className="text-sm font-bold text-rose-200">
                  {t("pastCutoffTitle")}
                </p>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  {t("pastCutoffDesc", { date: todayStr })}
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={onOpenCreate}>
                {t("submitLateNow")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300 animate-fadeIn">
              <Clock className="h-5 w-5 shrink-0 text-amber-400 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {t("beforeCutoffTitle", { date: todayStr })}
                </p>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  {t("beforeCutoffDesc")}
                </p>
              </div>
              <Button variant="metal-blue" size="sm" onClick={onOpenCreate}>
                {t("createReport")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
