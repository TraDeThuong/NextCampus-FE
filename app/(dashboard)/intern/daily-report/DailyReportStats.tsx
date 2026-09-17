"use client";

import { Calendar, FileCheck, AlertCircle, CalendarDays, Flame } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import StatsCard from "@/components/stats/StatsCard";
import MetalCard from "@/components/ui/MetalCard";
import { useInternStats } from "@/hooks/stats/useInternStats";

type Props = {
  totalWorkingDays: number;
  reportedDays: number;
  missingDays: number;
  submissionRate: number;
  weekWorkingDays: number;
  weekReportedDays: number;
  streak?: number;
};

const COLORS = { reported: "#0ea5e9", missing: "#f43f5e" };

export default function DailyReportStats({
  totalWorkingDays,
  reportedDays,
  missingDays,
  submissionRate,
  weekWorkingDays,
  weekReportedDays,
  streak,
}: Props) {
  const t = useTranslations("intern.dailyReport");
  const { data: internStatsData } = useInternStats();
  const currentStreak = streak ?? internStatsData?.data?.reportStreak ?? 0;

  const chartData = [
    { name: "Reported", value: reportedDays, fill: COLORS.reported },
    { name: "Missing", value: missingDays, fill: COLORS.missing },
  ];

  const weekPercent = weekWorkingDays > 0 ? Math.round((weekReportedDays / weekWorkingDays) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 w-full items-stretch">
      <div className="lg:col-span-1 flex flex-col gap-3 justify-between">
        <StatsCard
          title="Chuỗi nộp liên tiếp"
          value={`${currentStreak} ngày`}
          subtitle={currentStreak > 0 ? "Duy trì nộp đều đặn mỗi ngày" : "Hãy nộp báo cáo để kích hoạt chuỗi"}
          icon={<Flame className="h-5 w-5 text-amber-400 fill-amber-400/20 animate-pulse" />}
        />
        <StatsCard
          title={t("reported")}
          value={reportedDays}
          subtitle={t("submissionRate", { rate: submissionRate })}
          icon={<FileCheck className="h-5 w-5 text-sky-500" />}
        />
        <StatsCard
          title={t("workingDays")}
          value={totalWorkingDays}
          subtitle={t("workingDaysDesc")}
          icon={<Calendar className="h-5 w-5 text-slate-400" />}
        />
        <StatsCard
          title={t("missing")}
          value={missingDays}
          subtitle={t("missingDesc")}
          icon={<AlertCircle className="h-5 w-5 text-rose-500" />}
        />
      </div>

      <MetalCard className="p-6 flex flex-col justify-between min-h-[300px] relative overflow-hidden backdrop-blur-md border border-white/10 shadow-lg rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <h4 className="text-sm font-bold tracking-wide text-slate-300 dark:text-slate-200">
            {t("submissionAnalytics")}
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">{t("analyticsDesc")}</p>
        </div>
        <div className="relative w-full h-[180px] flex items-center justify-center my-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={6}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.fill}
                    className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black tracking-tight metal-text dark:text-white">
              {submissionRate}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
              {t("rate")}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex flex-col items-center p-2 rounded-xl bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/10">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              {t("reported")}
            </div>
            <span className="text-sm font-bold text-slate-200 dark:text-slate-300 mt-0.5">
              {reportedDays} <span className="text-[10px] font-normal text-slate-400">{t("days")}</span>
            </span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {t("missing")}
            </div>
            <span className="text-sm font-bold text-slate-200 dark:text-slate-300 mt-0.5">
              {missingDays} <span className="text-[10px] font-normal text-slate-400">{t("days")}</span>
            </span>
          </div>
        </div>
      </MetalCard>

      <MetalCard className="p-6 flex flex-col justify-between min-h-[300px] border border-white/10 rounded-2xl">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <CalendarDays className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">{t("thisWeek")}</h4>
              <p className="text-xs text-slate-500">{t("monToday")}</p>
            </div>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-black metal-text">{weekReportedDays}</span>
            <span className="text-lg text-slate-500">/ {weekWorkingDays}</span>
          </div>
          <p className="text-xs text-slate-400">{t("daysReported")}</p>
          <div className="mt-4 h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${weekPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Tỷ lệ tuần:</span>
            <span className="font-bold text-indigo-300">{weekPercent}%</span>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">Quy định báo cáo:</p>
          <p>Nộp hàng ngày từ thứ Hai đến thứ Bảy trước 17:30 để được ghi nhận tính điểm chuyên cần.</p>
        </div>
      </MetalCard>
    </div>
  );
}
