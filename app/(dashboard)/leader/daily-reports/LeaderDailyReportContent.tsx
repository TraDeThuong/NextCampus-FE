"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2, FileText, Users, FileCheck, AlertCircle, CalendarDays } from "lucide-react";
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
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateStrFromISO(iso: string): string {
  const d = new Date(iso);
  return isoDate(d);
}

export default function LeaderDailyReportContent() {
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
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const mondayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.toISOString().split("T")[0];
  }, []);

  const { data: todayReportsData } = useDailyReports({
    createdAtFrom: todayStr,
    createdAtTo: todayStr,
    limit: 100,
  });

  const { data: weekReportsData } = useDailyReports({
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

  // Fetch reports for selected intern
  const { data: reportsData } = useDailyReports(
    dateRange && selectedInternId
      ? {
          internId: selectedInternId,
          createdAtFrom: isoDate(dateRange.start),
          createdAtTo: isoDate(dateRange.end),
          limit: 100,
        }
      : undefined,
  );

  const { data: singleReportData } = useDailyReport(
    selectedReportId ?? undefined,
  );

  const reportsMap = useMemo(() => {
    const map = new Map<string, DailyReport>();
    if (reportsData?.data) {
      for (const r of reportsData.data) {
        map.set(dateStrFromISO(r.createdAt), r);
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
                <h2 className="text-2xl font-bold metal-text">
                  Daily Reports
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedIntern
                    ? `${selectedIntern.fullName} — ${selectedIntern.department?.name ?? ""}`
                    : "Select an intern to view their reports"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </MetalCard>

      {/* Overview stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Interns"
          value={overviewStats.totalInterns}
          subtitle="Assigned to you"
          icon={<Users className="h-5 w-5 text-slate-400" />}
        />
        <StatsCard
          title="Submitted Today"
          value={overviewStats.submittedToday}
          subtitle={`${overviewStats.totalInterns > 0 ? Math.round((overviewStats.submittedToday / overviewStats.totalInterns) * 100) : 0}% of interns`}
          icon={<FileCheck className="h-5 w-5 text-emerald-400" />}
        />
        <StatsCard
          title="Missing Today"
          value={overviewStats.missingToday}
          subtitle="Haven't submitted yet"
          icon={<AlertCircle className="h-5 w-5 text-red-400" />}
        />
        <StatsCard
          title="Week Rate"
          value={`${overviewStats.weekRate}%`}
          subtitle={`${overviewStats.weekWorkingDays} working days this week`}
          icon={<CalendarDays className="h-5 w-5 text-indigo-400" />}
        />
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
                    Select an intern to view their calendar.
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
