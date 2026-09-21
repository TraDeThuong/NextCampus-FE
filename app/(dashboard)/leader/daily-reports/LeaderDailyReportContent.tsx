"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Users, CalendarDays, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import Spinner from "@/components/ui/Spinner";
import MetalCard from "@/components/ui/MetalCard";
import LeaderDailyReportsHeader from "./LeaderDailyReportsHeader";
import LeaderDailyReportsStats from "./LeaderDailyReportsStats";
import LeaderDailyReportsFilter, { type FilterMode } from "./LeaderDailyReportsFilter";
import LeaderInternList from "./LeaderInternList";
import InternCalendar from "@/app/(dashboard)/intern/daily-report/InternCalendar";
import ReportDetail from "@/app/(dashboard)/intern/daily-report/ReportDetail";
import { useAuth } from "@/hooks/auth/useAuth";
import { useInterns } from "@/hooks/intern/useInterns";
import { useInternDetail } from "@/hooks/intern/useInternDetail";
import { useDailyReports } from "@/hooks/daily-report/useDailyReports";
import { useDailyReport } from "@/hooks/daily-report/useDailyReport";
import { useRBAC } from "@/hooks/rbac/useRBAC";
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
  const { can } = useRBAC();
  const canReadInterns = can("INTERN_READ");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedReportId = searchParams.get("id");
  const urlInternId = searchParams.get("internId");

  const {
    state: { user },
  } = useAuth();
  const leaderId = user?.id;

  // 1. Fetch interns assigned to this leader
  const {
    data: internsData,
    isLoading: internsLoading,
    isFetching: internsFetching,
    refetch: refetchInterns,
  } = useInterns(
    leaderId ? { leaderId, limit: 100 } : undefined,
    { enabled: canReadInterns }
  );

  const interns = useMemo(() => internsData?.data ?? [], [internsData?.data]);

  // 2. Overview Stats (Today & This Week)
  const todayStr = useMemo(() => isoDate(new Date()), []);
  const mondayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return isoDate(d);
  }, []);

  const {
    data: todayReportsData,
    isFetching: todayFetching,
    refetch: refetchToday,
  } = useDailyReports({
    date: todayStr,
    from: todayStr,
    to: todayStr,
    createdAtFrom: todayStr,
    createdAtTo: todayStr,
    limit: 100,
  });

  const {
    data: weekReportsData,
    isFetching: weekFetching,
    refetch: refetchWeek,
  } = useDailyReports({
    from: mondayStr,
    to: todayStr,
    createdAtFrom: mondayStr,
    createdAtTo: todayStr,
    limit: 100,
  });

  // Calculate stats & today submitted set
  const { overviewStats, todaySubmittedSet } = useMemo(() => {
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

    return {
      overviewStats: {
        totalInterns,
        submittedToday,
        missingToday,
        weekRate,
        weekWorkingDays,
      },
      todaySubmittedSet: todayUniqueInterns,
    };
  }, [interns, todayReportsData, weekReportsData]);

  // 3. Selection & Filtering State
  const [selectedInternId, setSelectedInternId] = useState<string | null>(
    urlInternId ?? null,
  );
  const activeInternId = selectedInternId ?? urlInternId ?? (interns[0]?.id ?? null);
  const [missingDate, setMissingDate] = useState<string | null>(null);

  // Date filters
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [singleDate, setSingleDate] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Mobile / Tablet tab selector ("interns" | "calendar" | "detail")
  const [mobileTab, setMobileTab] = useState<"interns" | "calendar" | "detail">(
    selectedReportId ? "detail" : "calendar",
  );

  const handleSelectIntern = useCallback(
    (id: string) => {
      setSelectedInternId(id);
      setMissingDate(null);
      router.replace(`${pathname}?internId=${id}`);
      // On mobile, auto-switch to calendar view
      setMobileTab("calendar");
    },
    [router, pathname],
  );

  // 4. Selected Intern Detail & Active Range
  const { data: internData } = useInternDetail(activeInternId ?? undefined, {
    enabled: canReadInterns && Boolean(activeInternId),
  });
  const selectedIntern = internData?.data;

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

  // 5. Query Filter Calculation
  const activeQueryParams = useMemo(() => {
    if (!activeInternId) return undefined;
    if (filterMode === "single" && singleDate) {
      return {
        internId: activeInternId,
        date: singleDate,
        from: singleDate,
        to: singleDate,
        limit: 100,
      };
    }
    if (filterMode === "range" && (fromDate || toDate)) {
      return {
        internId: activeInternId,
        from: fromDate || undefined,
        to: toDate || undefined,
        limit: 100,
      };
    }
    if (dateRange) {
      return {
        internId: activeInternId,
        from: isoDate(dateRange.start),
        to: isoDate(dateRange.end),
        createdAtFrom: isoDate(dateRange.start),
        createdAtTo: isoDate(dateRange.end),
        limit: 100,
      };
    }
    return { internId: activeInternId, limit: 100 };
  }, [activeInternId, filterMode, singleDate, fromDate, toDate, dateRange]);

  // Fetch reports for selected intern
  const {
    data: reportsData,
    isFetching: reportsFetching,
    refetch: refetchReports,
  } = useDailyReports(activeQueryParams);

  const { data: singleReportData, isFetching: singleReportFetching, refetch: refetchSingleReport } = useDailyReport(
    selectedReportId ?? undefined,
  );

  const reportsMap = useMemo(() => {
    const map = new Map<string, DailyReport>();
    if (reportsData?.data) {
      for (const r of reportsData.data) {
        const dateKey = r.date
          ? isoDate(new Date(r.date))
          : dateStrFromISO(r.createdAt);
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
      if (!activeInternId) return;
      if (report) {
        setMissingDate(null);
        router.replace(
          `${pathname}?internId=${activeInternId}&id=${report.id}`,
        );
        setMobileTab("detail");
      } else {
        router.replace(`${pathname}?internId=${activeInternId}`);
        setMissingDate(dateStr);
        setMobileTab("detail");
      }
    },
    [router, pathname, activeInternId],
  );

  const handleResetFilters = useCallback(() => {
    setFilterMode("all");
    setSingleDate("");
    setFromDate("");
    setToDate("");
    setSearchQuery("");
  }, []);

  const hasFilters = useMemo(() => {
    return (
      filterMode !== "all" ||
      !!singleDate ||
      !!fromDate ||
      !!toDate ||
      !!searchQuery.trim()
    );
  }, [filterMode, singleDate, fromDate, toDate, searchQuery]);

  const isReloading =
    internsFetching || todayFetching || weekFetching || reportsFetching || singleReportFetching;

  const handleReload = useCallback(() => {
    refetchInterns();
    refetchToday();
    refetchWeek();
    refetchReports();
    if (selectedReportId) refetchSingleReport();
  }, [refetchInterns, refetchToday, refetchWeek, refetchReports, selectedReportId, refetchSingleReport]);

  if (internsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Rule 44 compliance and local Reload */}
      <LeaderDailyReportsHeader
        selectedIntern={selectedIntern}
        onReload={handleReload}
        isReloading={isReloading}
      />

      {/* 2. Overview KPI Stats with MetalCard and Micro-interaction */}
      <LeaderDailyReportsStats stats={overviewStats} />

      {/* 3. Minimalist Filter Card with Cyberpunk DatePicker */}
      <LeaderDailyReportsFilter
        filterMode={filterMode}
        onModeChange={setFilterMode}
        singleDate={singleDate}
        onSingleDateChange={setSingleDate}
        fromDate={fromDate}
        toDate={toDate}
        onDateRangeChange={(start, end) => {
          setFromDate(start);
          setToDate(end);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onReset={handleResetFilters}
        hasFilters={hasFilters}
      />

      {/* 4. Mobile Tab Switcher (Visible only on < lg) */}
      <div className="lg:hidden flex items-center rounded-2xl border border-white/10 bg-white/5 p-1 text-xs">
        <button
          type="button"
          onClick={() => setMobileTab("interns")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium transition cursor-pointer select-none ${
            mobileTab === "interns"
              ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4 shrink-0" />
          <span>{t("tabs.interns")}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("calendar")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium transition cursor-pointer select-none ${
            mobileTab === "calendar"
              ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span>{t("tabs.calendar")}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("detail")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium transition cursor-pointer select-none ${
            mobileTab === "detail"
              ? "bg-cyan-500/20 text-cyan-300 shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4 shrink-0" />
          <span>{t("tabs.detail")}</span>
        </button>
      </div>

      {/* 5. Main 3-Column / Seamless Area (Rule 46: Borderless Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Intern List (Col 3 on lg) */}
        <div
          className={`lg:col-span-3 ${
            mobileTab !== "interns" ? "hidden lg:block" : "block"
          }`}
        >
          <MetalCard className="p-4 sm:p-5 flex flex-col">
            <LeaderInternList
              interns={interns}
              selectedId={activeInternId}
              onSelect={handleSelectIntern}
              todaySubmittedSet={todaySubmittedSet}
              searchQuery={searchQuery}
            />
          </MetalCard>
        </div>

        {/* Middle Column: Calendar (Col 4 on lg) */}
        <div
          className={`lg:col-span-4 ${
            mobileTab !== "calendar" ? "hidden lg:block" : "block"
          }`}
        >
          <MetalCard className="p-4 sm:p-5">
            {dateRange ? (
              <InternCalendar
                startDate={dateRange.start}
                endDate={dateRange.end}
                reportsMap={reportsMap}
                selectedReportId={selectedReportId}
                onSelectDate={handleSelectDate}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="h-10 w-10 text-slate-600 mb-3 opacity-40" />
                <p className="text-sm text-muted">{t("selectCalendar")}</p>
              </div>
            )}
          </MetalCard>
        </div>

        {/* Right Column: Report Detail (Col 5 on lg - Rule 46: Borderless Right Panel) */}
        <div
          className={`lg:col-span-5 ${
            mobileTab !== "detail" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="overflow-y-auto custom-scrollbar">
            <ReportDetail
              report={selectedReport}
              isLoading={!!selectedReportId && !selectedReport}
              missingDate={missingDate}
              borderless={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
