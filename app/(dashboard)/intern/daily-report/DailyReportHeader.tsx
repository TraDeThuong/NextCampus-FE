"use client";

import { useMemo } from "react";
import { FileText, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import { useDailyReports } from "@/hooks/daily-report/useDailyReports";
import type { DailyReport } from "@/types/daily-report";

type Props = { onOpenCreate: () => void; onOpenEdit: (report: DailyReport) => void };

export default function DailyReportHeader({ onOpenCreate, onOpenEdit }: Props) {
  const t = useTranslations("intern.dailyReport");

  // Format date and time in Asia/Ho_Chi_Minh
  const { todayStr, isPastCutoff } = useMemo(() => {
    const now = new Date();
    const vnDateStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(now);
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

  const { data, isPending } = useDailyReports({ from: todayStr, to: todayStr, limit: 1 });
  const existingReport = data?.data?.[0];
  const hasReportedToday = !!existingReport;

  return (
    <div className="space-y-4">
      <MetalCard>
        <div className="rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/20 to-cyan-400/10">
                <FileText className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold metal-text">{t("title")}</h2>
                <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
              </div>
            </div>
            <div>
              {isPending ? (
                <Button variant="metal-silver" size="md" isLoading disabled />
              ) : hasReportedToday ? (
                <Button variant="metal-blue" size="md" onClick={() => onOpenEdit(existingReport!)}>
                  {t("editReport")}
                </Button>
              ) : (
                <Button variant="metal-blue" size="md" onClick={onOpenCreate}>
                  {t("createReport")}
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
                <p className="text-sm font-semibold">Đã hoàn thành nộp báo cáo ngày hôm nay ({todayStr})</p>
                <p className="text-xs text-emerald-400/80 mt-0.5">
                  Báo cáo của bạn đã được ghi nhận đúng hạn trên hệ thống. Bạn có thể chỉnh sửa nếu cần cập nhật bổ sung.
                </p>
              </div>
              <Button variant="glass" size="sm" onClick={() => onOpenEdit(existingReport!)}>
                {t("editReport")}
              </Button>
            </div>
          ) : isPastCutoff ? (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-300 animate-fadeIn">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400 animate-bounce" />
              <div className="flex-1">
                <p className="text-sm font-bold text-rose-200">
                  Đã quá giờ chốt nộp báo cáo ngày (17:30)!
                </p>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  Hôm nay ({todayStr}) bạn chưa nộp báo cáo. Hãy nộp báo cáo bổ sung ngay để thông báo tiến độ cho Leader và không bị mất chuỗi ngày nộp (streak).
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={onOpenCreate}>
                Nộp bổ sung ngay
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300 animate-fadeIn">
              <Clock className="h-5 w-5 shrink-0 text-amber-400 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  Hạn chót nộp báo cáo ngày hôm nay: trước 17:30 ({todayStr})
                </p>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Vui lòng cập nhật công việc đã làm, khó khăn và kế hoạch ngày mai trước 17:30 để duy trì chuỗi nộp liên tiếp (streak).
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
