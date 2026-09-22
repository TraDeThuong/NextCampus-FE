"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CalendarDays, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import Spinner from "@/components/ui/Spinner";
import MetalCard from "@/components/ui/MetalCard";
import DailyReportHeader from "./DailyReportHeader";
import CreateDailyReportModal from "./CreateDailyReportModal";
import EditDailyReportModal from "./EditDailyReportModal";
import InternCalendar from "./InternCalendar";
import ReportDetail from "./ReportDetail";
import DailyReportStats from "./DailyReportStats";
import { useIntern } from "@/hooks/profile/useIntern";
import { useDailyReports } from "@/hooks/daily-report/useDailyReports";
import { useDailyReport } from "@/hooks/daily-report/useDailyReport";
import { useSystemSettings } from "@/hooks/system-setting/useSystemSettings";
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

export default function DailyReportContent() {
  const t = useTranslations("intern.dailyReport");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const queryClient = useQueryClient();

  const { intern, isLoading: internLoading, refetch: refetchIntern } = useIntern();

  const dateRange = useMemo(() => {
    if (!intern) return null;
    const start = new Date(intern.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(intern.startDate);
    end.setMonth(end.getMonth() + intern.duration);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [intern]);

  const {
    data: reportsData,
    isFetching: reportsFetching,
    refetch: refetchReports,
  } = useDailyReports(
    dateRange
      ? {
          from: isoDate(dateRange.start),
          to: isoDate(dateRange.end),
          createdAtFrom: isoDate(dateRange.start),
          createdAtTo: isoDate(dateRange.end),
          limit: 100,
        }
      : undefined,
  );

  const {
    data: singleReportData,
    isFetching: singleReportFetching,
    refetch: refetchSingleReport,
  } = useDailyReport(selectedId ?? undefined);

  const {
    data: settingsResponse,
    refetch: refetchSettings,
    isFetching: settingsFetching,
  } = useSystemSettings();
  const workingDaysPerWeek = settingsResponse?.data?.WORKING_DAYS_PER_WEEK ?? 6;

  const reportsMap = useMemo(() => {
    const map = new Map<string, DailyReport>();
    if (reportsData?.data) {
      for (const r of reportsData.data) {
        const dateStr = r.date
          ? isoDate(new Date(r.date))
          : dateStrFromISO(r.createdAt);
        map.set(dateStr, r);
      }
    }
    return map;
  }, [reportsData]);

  const stats = useMemo(() => {
    if (!dateRange) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let workingDays = 0;
    const cursor = new Date(dateRange.start);
    while (cursor <= today) {
      const dow = cursor.getDay();
      const isoDow = dow === 0 ? 7 : dow;
      if (isoDow <= workingDaysPerWeek) workingDays++;
      cursor.setDate(cursor.getDate() + 1);
    }
    const reportedDays = reportsMap.size;
    const missingDays = Math.max(0, workingDays - reportedDays);
    const submissionRate =
      workingDays > 0 ? Math.round((reportedDays / workingDays) * 100) : 0;

    // Week stats (Mon-Sat or configured working days, from monday to today)
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday
    let weekWorkingDays = 0;
    let weekReportedDays = 0;
    const w = new Date(monday);
    while (w <= today) {
      const dow = w.getDay();
      const isoDow = dow === 0 ? 7 : dow;
      if (isoDow <= workingDaysPerWeek) {
        weekWorkingDays++;
        if (reportsMap.has(isoDate(w))) weekReportedDays++;
      }
      w.setDate(w.getDate() + 1);
    }

    return {
      workingDays,
      reportedDays,
      missingDays,
      submissionRate,
      weekWorkingDays,
      weekReportedDays,
    };
  }, [dateRange, reportsMap, workingDaysPerWeek]);

  const selectedReport = useMemo(() => {
    if (!selectedId) return null;
    const fromMap = Array.from(reportsMap.values()).find(
      (r) => r.id === selectedId,
    );
    if (fromMap) return fromMap;
    return singleReportData?.data ?? null;
  }, [selectedId, reportsMap, singleReportData]);

  const detailLoading = !!selectedId && !selectedReport;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editReport, setEditReport] = useState<DailyReport | null>(null);
  const [missingDate, setMissingDate] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"calendar" | "detail">(
    selectedId ? "detail" : "calendar",
  );

  const handleSelectDate = useCallback(
    (dateStr: string, report?: DailyReport) => {
      if (report) {
        setMissingDate(null);
        router.replace(`${pathname}?id=${report.id}`);
        setMobileTab("detail");
      } else {
        router.replace(pathname);
        setMissingDate(dateStr);
        setMobileTab("detail");
      }
    },
    [router, pathname],
  );

  const isReloading =
    reportsFetching || singleReportFetching || settingsFetching;

  const handleReload = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    refetchSettings();
    refetchReports();
    refetchIntern();
    if (selectedId) refetchSingleReport();
  }, [queryClient, refetchSettings, refetchReports, refetchIntern, selectedId, refetchSingleReport]);

  if (internLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!dateRange) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted">{t("loadError")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with Rule 44 compliance, local reload, and deadline banner */}
      <DailyReportHeader
        onOpenCreate={() => setShowCreateModal(true)}
        onOpenEdit={(report) => setEditReport(report)}
        onReload={handleReload}
        isReloading={isReloading}
      />

      {/* 2. Standardized KPI and Analytics Stats */}
      {stats && (
        <DailyReportStats
          totalWorkingDays={stats.workingDays}
          reportedDays={stats.reportedDays}
          missingDays={stats.missingDays}
          submissionRate={stats.submissionRate}
          weekWorkingDays={stats.weekWorkingDays}
          weekReportedDays={stats.weekReportedDays}
        />
      )}

      {/* 3. Mobile Tab Switcher (< lg) */}
      <div className="lg:hidden flex items-center rounded-2xl border border-white/10 bg-white/5 p-1 text-xs">
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

      {/* 4. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calendar (Col 5 on lg) */}
        <div
          className={`lg:col-span-5 ${
            mobileTab !== "calendar" ? "hidden lg:block" : "block"
          }`}
        >
          <MetalCard className="p-4 sm:p-5">
            <InternCalendar
              startDate={dateRange.start}
              endDate={dateRange.end}
              reportsMap={reportsMap}
              selectedReportId={selectedId}
              onSelectDate={handleSelectDate}
            />
          </MetalCard>
        </div>

        {/* Right Column: Report Detail (Col 7 on lg - Rule 46: Borderless Right Panel) */}
        <div
          className={`lg:col-span-7 ${
            mobileTab !== "detail" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="overflow-y-auto custom-scrollbar">
            <ReportDetail
              report={selectedReport}
              isLoading={detailLoading}
              missingDate={missingDate}
              onEdit={(report) => setEditReport(report)}
              borderless={true}
            />
          </div>
        </div>
      </div>

      {/* 5. Modals */}
      {showCreateModal && (
        <CreateDailyReportModal
          onClose={() => {
            setShowCreateModal(false);
            refetchReports();
          }}
        />
      )}

      {editReport && (
        <EditDailyReportModal
          report={editReport}
          onClose={() => {
            setEditReport(null);
            refetchReports();
            if (selectedId) refetchSingleReport();
          }}
        />
      )}
    </div>
  );
}
