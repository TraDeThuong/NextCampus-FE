"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2, FileText, Users, FileCheck, AlertCircle, CalendarDays, Filter, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import StatsCard from "@/components/stats/StatsCard";
import InternCalendar from "@/app/(dashboard)/intern/daily-report/InternCalendar";
import ReportDetail from "@/app/(dashboard)/intern/daily-report/ReportDetail";
import LeaderInternList from "./LeaderInternList";
import { useAuth } from "@/hooks/auth/useAuth";
import { useInterns } from "@/hooks/intern/useInterns";
import { useInternDetail } from "@/hooks/intern/useInternDetail";
import { useDailyReports } from "@/hooks/daily-report/useDailyReports";
import { useDailyReport } from "@/hooks/daily-report/useDailyReport";
import type { DailyReport } from "@/types/daily-report";

function isoDate(d: Date): string {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(d);
  const year = parts.find((p) => p.type === "year")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const day = parts.find((p) => p.type === "day")?.value || "";
  return `${year}-${month}-${day}`;
}

function dateStrFromISO(iso: string): string {
  const d = new Date(iso);
  return isoDate(d);
}

export default function LeaderDailyReportContent() {
  const t = useTranslations("leader.dailyReports");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedReportId = searchParams.get("id");
  const urlInternId = searchParams.get("internId");

  const { state: { user } } = useAuth();
  const leaderId = user?.id;

  // Fetch interns assigned to this leader
  const { data: internsData, isLoading: internsLoading } = useInterns(
    leaderId ? { leaderId, limit: 100 } : undefined,
  );
  const interns = useMemo(
    () => internsData?.data ?? [],
    [internsData?.data],
  );

  // Leader-wide stats: fetch today's and this week's reports
  const todayStr = useMemo(() => isoDate(new Date()), []);
  const mondayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return isoDate(d);
  }, []);

  const { data: todayReportsData } = useDailyReports({
    date: todayStr,
    from: todayStr,
    to: todayStr,
    createdAtFrom: todayStr,
    createdAtTo: todayStr,
    limit: 100,
  });

  const { data: weekReportsData } = useDailyReports({
    from: mondayStr,
    to: todayStr,
    createdAtFrom: mondayStr,
    createdAtTo: todayStr,
    limit: 100,
  });

  // Leader-wide stats
  const overviewStats = useMemo(() => {
    const totalInterns = interns.length;
    const internIdSet = new Set(interns.map((i) => i.id));

    // Today
    const todaySubmitted = todayReportsData?.data ?? [];
    const todayUniqueInterns = new Set(todaySubmitted.map((r) => r.internId));
    const submittedToday = [...todayUniqueInterns].filter((id) =>
      internIdSet.has(id),
    ).length;
    const missingToday = Math.max(0, totalInterns - submittedToday);

    // This week (Mon–today, excl Sundays)
    const weekReports = weekReportsData?.data ?? [];
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    let weekWorkingDays = 0;
    const w = new Date(monday);
    while (w <= now) {
      if (w.getDay() !== 0) weekWorkingDays++;
      w.setDate(w.getDate() + 1);
    }
    const expectedWeek = totalInterns * weekWorkingDays;
    const weekSubmitted = weekReports.filter((r) =>
      internIdSet.has(r.internId),
    ).length;
    const weekRate =
      expectedWeek > 0 ? Math.round((weekSubmitted / expectedWeek) * 100) : 0;

    return { totalInterns, submittedToday, missingToday, weekRate, weekWorkingDays };
  }, [interns, todayReportsData, weekReportsData]);

  // Selected intern
  const [selectedInternId, setSelectedInternId] = useState<string | null>(
    urlInternId ?? null,
  );
  const [missingDate, setMissingDate] = useState<string | null>(null);

  // Date filters
  const [filterMode, setFilterMode] = useState<"all" | "single" | "range">("all");
  const [singleDate, setSingleDate] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const handleSelectIntern = useCallback(
    (id: string) => {
      setSelectedInternId(id);
      router.replace(`${pathname}?internId=${id}`);
    },
    [router, pathname],
  );

  // Selected intern detail
  const { data: internData } = useInternDetail(
    selectedInternId ?? undefined,
  );
  const selectedIntern = internData?.data;

  // Date range from selected intern
  const dateRange = useMemo(() => {
    if (!selectedIntern) return null;
    const start = new Date(selectedIntern.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedIntern.startDate);
    end.setMonth(end.getMonth() + selectedIntern.duration);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [selectedIntern]);

  // Query filter calculation based on filter mode
  const activeQueryParams = useMemo(() => {
    if (!selectedInternId) return undefined;
    if (filterMode === "single" && singleDate) {
      return {
        internId: selectedInternId,
        date: singleDate,
        from: singleDate,
        to: singleDate,
        limit: 100,
      };
    }
    if (filterMode === "range" && (fromDate || toDate)) {
      return {
        internId: selectedInternId,
        from: fromDate || undefined,
        to: toDate || undefined,
        limit: 100,
      };
    }
    if (dateRange) {
      return {
        internId: selectedInternId,
        from: isoDate(dateRange.start),
        to: isoDate(dateRange.end),
        createdAtFrom: isoDate(dateRange.start),
        createdAtTo: isoDate(dateRange.end),
        limit: 100,
      };
    }
    return { internId: selectedInternId, limit: 100 };
  }, [selectedInternId, filterMode, singleDate, fromDate, toDate, dateRange]);

  // Fetch reports for selected intern
  const { data: reportsData } = useDailyReports(activeQueryParams);

  const { data: singleReportData } = useDailyReport(
    selectedReportId ?? undefined,
  );

  const reportsMap = useMemo(() => {
    const map = new Map<string, DailyReport>();
    if (reportsData?.data) {
      for (const r of reportsData.data) {
        const dateKey = r.date ? isoDate(new Date(r.date)) : dateStrFromISO(r.createdAt);
        map.set(dateKey, r);
      }
    }
    return map;
  }, [reportsData]);

  const selectedReport = useMemo(() => {
    if (!selectedReportId) return null;
    const fromMap = Array.from(reportsMap.values()).find(
      (r) => r.id === selectedReportId,
    );
    if (fromMap) return fromMap;
    return singleReportData?.data ?? null;
  }, [selectedReportId, reportsMap, singleReportData]);

  const handleSelectDate = useCallback(
    (dateStr: string, report?: DailyReport) => {
      if (report) {
        setMissingDate(null);
        router.replace(
          `${pathname}?internId=${selectedInternId}&id=${report.id}`,
        );
      } else {
        router.replace(`${pathname}?internId=${selectedInternId}`);
        setMissingDate(dateStr);
      }
    },
    [router, pathname, selectedInternId],
  );

  if (internsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <MetalCard>
        <div className="rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/20 to-cyan-400/10">
                <FileText className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold metal-text">{t("title")}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedIntern
                    ? `${selectedIntern.fullName} — ${selectedIntern.department?.name ?? ""}`
                    : t("description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </MetalCard>

      {/* Overview stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("totalInterns")}
          value={overviewStats.totalInterns}
          subtitle={t("assignedToYou")}
          icon={<Users className="h-5 w-5 text-slate-400" />}
        />
        <StatsCard
          title={t("submittedToday")}
          value={overviewStats.submittedToday}
          subtitle={t("percentOfInterns", { percent: overviewStats.totalInterns > 0 ? Math.round((overviewStats.submittedToday / overviewStats.totalInterns) * 100) : 0 })}
          icon={<FileCheck className="h-5 w-5 text-emerald-400" />}
        />
        <StatsCard
          title={t("missingToday")}
          value={overviewStats.missingToday}
          subtitle={t("notSubmittedYet")}
          icon={<AlertCircle className="h-5 w-5 text-red-400" />}
        />
        <StatsCard
          title={t("weekRate")}
          value={`${overviewStats.weekRate}%`}
          subtitle={t("workingDays", { days: overviewStats.weekWorkingDays })}
          icon={<CalendarDays className="h-5 w-5 text-indigo-400" />}
        />
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 px-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Filter className="h-4 w-4 text-cyan-400" />
          <span>Bộ lọc ngày báo cáo (Asia/Ho_Chi_Minh):</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1 rounded-lg transition ${
                filterMode === "all"
                  ? "bg-cyan-500/20 text-cyan-300 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Kỳ thực tập
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("single")}
              className={`px-3 py-1 rounded-lg transition ${
                filterMode === "single"
                  ? "bg-cyan-500/20 text-cyan-300 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Theo ngày
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("range")}
              className={`px-3 py-1 rounded-lg transition ${
                filterMode === "range"
                  ? "bg-cyan-500/20 text-cyan-300 font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Khoảng ngày
            </button>
          </div>

          {filterMode === "single" && (
            <input
              type="date"
              value={singleDate}
              onChange={(e) => setSingleDate(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            />
          )}

          {filterMode === "range" && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Từ</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
              <span>đến</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          )}

          {filterMode !== "all" && (
            <button
              type="button"
              onClick={() => {
                setFilterMode("all");
                setSingleDate("");
                setFromDate("");
                setToDate("");
              }}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition"
            >
              <RotateCcw className="h-3 w-3" />
              Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* 3-column layout in a shared card */}
      <MetalCard>
        <div className="rounded-3xl p-4">
          <div className="flex gap-4" style={{ minHeight: "calc(100vh - 500px)" }}>
            {/* Left: Intern list */}
            <div className="w-56 shrink-0 border-r border-white/5 pr-4 overflow-y-auto">
              <LeaderInternList
                interns={interns}
                selectedId={selectedInternId}
                onSelect={handleSelectIntern}
              />
            </div>

            {/* Middle: Calendar */}
            <div className="w-80 shrink-0 border-r border-white/5 pr-4 overflow-y-auto">
              {dateRange ? (
                <InternCalendar
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  reportsMap={reportsMap}
                  selectedReportId={selectedReportId}
                  onSelectDate={handleSelectDate}
                />
              ) : (
                <div className="flex items-center justify-center min-h-[300px] text-center">
                  <p className="text-sm text-slate-500">
                    {t("selectCalendar")}
                  </p>
                </div>
              )}
            </div>

            {/* Right: Report detail */}
            <div className="flex-1 min-w-0 overflow-y-auto">
              <ReportDetail
                report={selectedReport}
                isLoading={!!selectedReportId && !selectedReport}
                missingDate={missingDate}
              />
            </div>
          </div>
        </div>
      </MetalCard>
    </div>
  );
}
