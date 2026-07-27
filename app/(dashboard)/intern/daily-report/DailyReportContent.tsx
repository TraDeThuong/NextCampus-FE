"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import DailyReportHeader from "./DailyReportHeader";
import CreateDailyReportModal from "./CreateDailyReportModal";
import EditDailyReportModal from "./EditDailyReportModal";
import InternCalendar from "./InternCalendar";
import ReportDetail from "./ReportDetail";
import DailyReportStats from "./DailyReportStats";
import { useIntern } from "@/hooks/profile/useIntern";
import { useDailyReports } from "@/hooks/daily-report/useDailyReports";
import { useDailyReport } from "@/hooks/daily-report/useDailyReport";
import type { DailyReport } from "@/types/daily-report";

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateStrFromISO(iso: string): string {
  const d = new Date(iso);
  return isoDate(d);
}

export default function DailyReportContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const { intern, isLoading: internLoading } = useIntern();

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

  const { data: reportsData } = useDailyReports(
    dateRange
      ? {
          createdAtFrom: isoDate(dateRange.start),
          createdAtTo: isoDate(dateRange.end),
          limit: 100,
        }
      : undefined,
  );

  const { data: singleReportData } = useDailyReport(
    selectedId ?? undefined,
  );

  const reportsMap = useMemo(() => {
    const map = new Map<string, DailyReport>();
    if (reportsData?.data) {
      for (const r of reportsData.data) {
        const dateStr = dateStrFromISO(r.createdAt);
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
      if (cursor.getDay() !== 0) workingDays++;
      cursor.setDate(cursor.getDate() + 1);
    }
    const reportedDays = reportsMap.size;
    const missingDays = Math.max(0, workingDays - reportedDays);
    const submissionRate = workingDays > 0
      ? Math.round((reportedDays / workingDays) * 100)
      : 0;

    // Week stats (Mon-Sat, from monday to today)
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday
    let weekWorkingDays = 0;
    let weekReportedDays = 0;
    const w = new Date(monday);
    while (w <= today) {
      if (w.getDay() !== 0) {
        weekWorkingDays++;
        if (reportsMap.has(isoDate(w))) weekReportedDays++;
      }
      w.setDate(w.getDate() + 1);
    }

    return { workingDays, reportedDays, missingDays, submissionRate, weekWorkingDays, weekReportedDays };
  }, [dateRange, reportsMap]);

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

  const handleSelectDate = useCallback(
    (dateStr: string, report?: DailyReport) => {
      if (report) {
        setMissingDate(null);
        router.replace(`${pathname}?id=${report.id}`);
      } else {
        router.replace(pathname);
        setMissingDate(dateStr);
      }
    },
    [router, pathname],
  );

  if (internLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!dateRange) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500">Unable to load internship data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DailyReportHeader
        onOpenCreate={() => setShowCreateModal(true)}
        onOpenEdit={(report) => setEditReport(report)}
      />

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

      <div className="flex gap-6">
        <div className="w-80 shrink-0">
          <InternCalendar
            startDate={dateRange.start}
            endDate={dateRange.end}
            reportsMap={reportsMap}
            selectedReportId={selectedId}
            onSelectDate={handleSelectDate}
          />
        </div>

        <div className="flex-1 min-w-0">
          <ReportDetail
            report={selectedReport}
            isLoading={detailLoading}
            missingDate={missingDate}
            onEdit={(report) => setEditReport(report)}
          />
        </div>
      </div>

      {showCreateModal && (
        <CreateDailyReportModal
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editReport && (
        <EditDailyReportModal
          report={editReport}
          onClose={() => setEditReport(null)}
        />
      )}
    </div>
  );
}
