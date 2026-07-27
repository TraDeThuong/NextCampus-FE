"use client";

import { Calendar, FileCheck, AlertCircle, CalendarDays } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import StatsCard from "@/components/stats/StatsCard";
import MetalCard from "@/components/ui/MetalCard";

type Props = {
  totalWorkingDays: number;
  reportedDays: number;
  missingDays: number;
  submissionRate: number;
  weekWorkingDays: number;
  weekReportedDays: number;
};

const COLORS = { 
  reported: "#0ea5e9", // Sky 500
  missing: "#f43f5e"   // Rose 500
};

export default function DailyReportStats({
  totalWorkingDays,
  reportedDays,
  missingDays,
  submissionRate,
  weekWorkingDays,
  weekReportedDays,
}: Props) {
  const chartData = [
    { name: "Reported", value: reportedDays, fill: COLORS.reported },
    { name: "Missing", value: missingDays, fill: COLORS.missing },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 w-full items-stretch">
      
      {/* CỘT TRÁI: CÁC THẺ THỐNG KÊ (Chiếm 2/3 không gian trên màn hình lớn) */}
      <div className="lg:col-span-1 flex flex-col gap-4 justify-between">
        <StatsCard
          title="Working Days"
          value={totalWorkingDays}
          subtitle="From start to today (excl. Sundays)"
          icon={<Calendar className="h-5 w-5 text-slate-400" />}
        />

        <StatsCard
          title="Reported"
          value={reportedDays}
          subtitle={`${submissionRate}% submission rate`}
          icon={<FileCheck className="h-5 w-5 text-sky-500" />}
        />

        <StatsCard
          title="Missing"
          value={missingDays}
          subtitle="Days without report"
          icon={<AlertCircle className="h-5 w-5 text-rose-500" />}
        />
      </div>

      {/* CỘT PHẢI: BIỂU ĐỒ LỚN, ĐẲNG CẤP (Chiếm 1/3 không gian) */}
      <MetalCard className="p-6 flex flex-col justify-between min-h-[300px] relative overflow-hidden backdrop-blur-md border border-white/10 shadow-lg rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
        
        {/* Tiêu đề góc trên */}
        <div>
          <h4 className="text-sm font-bold tracking-wide text-slate-300 dark:text-slate-200">
            Submission Analytics
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Visualized report attendance</p>
        </div>
        
        {/* Vùng chứa Biểu đồ phóng to */}
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

          {/* Khối text trung tâm cực đại */}
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black tracking-tight metal-text dark:text-white">
              {submissionRate}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
              Rate
            </span>
          </div>
        </div>

        {/* Chú thích (Legend) Premium dưới đáy */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex flex-col items-center p-2 rounded-xl bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/10">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Reported
            </div>
            <span className="text-sm font-bold text-slate-200 dark:text-slate-300 mt-0.5">
              {reportedDays} <span className="text-[10px] font-normal text-slate-400">days</span>
            </span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Missing
            </div>
            <span className="text-sm font-bold text-slate-200 dark:text-slate-300 mt-0.5">
              {missingDays} <span className="text-[10px] font-normal text-slate-400">days</span>
            </span>
          </div>
        </div>

      </MetalCard>

      {/* This Week */}
      <MetalCard className="p-6 flex flex-col justify-center min-h-[300px] border border-white/10 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
            <CalendarDays className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">This Week</h4>
            <p className="text-xs text-slate-500">Mon – Today</p>
          </div>
        </div>

        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-black metal-text">
            {weekReportedDays}
          </span>
          <span className="text-lg text-slate-500">/ {weekWorkingDays}</span>
        </div>

        <p className="text-xs text-slate-500">days reported this week</p>

        <div className="mt-4 h-2 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{
              width: `${weekWorkingDays > 0 ? Math.round((weekReportedDays / weekWorkingDays) * 100) : 0}%`,
            }}
          />
        </div>

        <p className="text-xs text-slate-500 mt-2">
          {weekWorkingDays > 0
            ? `${Math.round((weekReportedDays / weekWorkingDays) * 100)}% complete`
            : "No working days yet"}
        </p>
      </MetalCard>
    </div>
  );
}