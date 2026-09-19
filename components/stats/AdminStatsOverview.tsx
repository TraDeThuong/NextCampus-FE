"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/hooks/auth/useAuth";
import { useAdminStats } from "@/hooks/stats/useAdminStats";
import StatsCard from "./StatsCard";
import Spinner from "../ui/Spinner";
import MetalCard from "../ui/MetalCard";
import TaskAssignmentModal from "./TaskAssignmentModal";
import Table from "../ui/Table";
import type {
  AssignmentDetail,
  LeaderTeamProgress,
  DepartmentDistribution,
  ActionAlert,
  ActivityLog,
} from "@/types/stats";
import {
  Users,
  FileText,
  CheckCircle2,
  AlertOctagon,
  ExternalLink,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building2,
  Award,
  RotateCw,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminStatsOverview() {
  const t = useTranslations();
  const locale = useLocale();
  const { state: authState } = useAuth();
  const { data: response, isLoading, isError, isFetching, refetch } = useAdminStats();

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    assignments: AssignmentDetail[];
  }>({
    isOpen: false,
    title: "",
    assignments: [],
  });

  const [showAllLeaders, setShowAllLeaders] = useState(false);
  const [timeScope, setTimeScope] = useState<"month" | "week" | "all">("month");

  if (isLoading) {
    return (
      <MetalCard className="flex h-72 w-full items-center justify-center">
        <Spinner size="lg" />
      </MetalCard>
    );
  }

  if (isError || !response?.success) {
    return (
      <MetalCard className="p-8 sm:p-10">
        <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.2)]">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-foreground">
              {t("admin.dashboard.errorLoad")}
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {response?.message ||
                (locale === "vi"
                  ? "Không thể lấy dữ liệu thống kê từ máy chủ. Vui lòng kiểm tra lại quyền hạn hoặc kết nối mạng và thử lại."
                  : "Unable to retrieve statistics from the server. Please check your permissions or network connection and try again.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-lg disabled:opacity-50 active:scale-95"
          >
            <RotateCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {t("common.retry")}
          </button>
        </div>
      </MetalCard>
    );
  }

  const stats = response?.data;

  const rawOverdue = stats?.overdueAssignments ?? [];
  const overdueAssignments = rawOverdue.filter((a) => a.isOverdue);
  const leaderTeams = stats?.leaderTeams ?? [];
  const recentActivities = stats?.recentActivities ?? [];
  const departmentDistribution = stats?.departmentDistribution ?? [];
  const missingLeaderDepts = departmentDistribution.filter(
    (d) => d.leaderCount === 0,
  );

  const displayedLeaderTeams = showAllLeaders
    ? leaderTeams
    : leaderTeams.slice(0, 5);

  const totalInterns = stats?.system?.totalInterns ?? stats?.interns?.total ?? 0;
  const activeInterns = stats?.system?.activeInterns ?? stats?.interns?.active ?? 0;
  const completedInterns = stats?.system?.completedInterns ?? stats?.interns?.completed ?? 0;
  const totalLeaders = stats?.system?.activeLeaders ?? stats?.system?.leaders ?? 0;
  const activeTasks = stats?.tasks?.activeTasks ?? stats?.assignments?.byStatus?.inProgress ?? 0;
  const totalTasks = stats?.tasks?.totalTasks ?? stats?.tasks?.total ?? 0;
  const completedTasks = stats?.tasks?.completedTasks ?? 0;
  const totalAppsCount =
    stats?.applications?.totalApplications ?? stats?.applications?.total ?? 0;

  const actionAlertsObj =
    typeof stats?.actionAlerts === "object" && !Array.isArray(stats?.actionAlerts)
      ? stats?.actionAlerts
      : undefined;

  const pendingAppsCount =
    actionAlertsObj?.pendingApplicationsCount ??
    stats?.applications?.pendingApplications ??
    stats?.applications?.pending ??
    0;

  const overdueTasksCount =
    actionAlertsObj?.overdueTasksCount ??
    stats?.tasks?.overdueTasks ??
    stats?.tasks?.overdue ??
    overdueAssignments.length;

  const droppedInternsCount =
    actionAlertsObj?.droppedInternsCount ??
    stats?.system?.droppedInterns ??
    stats?.interns?.dropped ??
    0;

  // Retention display logic (Phương án 1: Phân tách theo trạng thái khóa thực tập)
  const finishedInterns = completedInterns + droppedInternsCount;
  const retentionDisplay = (() => {
    if (finishedInterns > 0) {
      const calculatedRate = Math.round((completedInterns / finishedInterns) * 100);
      return {
        value: `${calculatedRate}%`,
        subtitle: t("admin.dashboard.retentionCardSubtitle", {
          completed: completedInterns,
          dropped: droppedInternsCount,
        }),
        trend: {
          text:
            calculatedRate >= 80
              ? t("admin.dashboard.retentionHigh")
              : t("admin.dashboard.retentionAttention"),
          positive: calculatedRate >= 80,
        },
      };
    }

    if (activeInterns > 0) {
      return {
        value: "100%",
        subtitle: t("admin.dashboard.retentionOngoingSubtitle", {
          active: activeInterns,
        }),
        trend: {
          text: t("admin.dashboard.retentionOngoingTrend"),
          positive: true,
        },
      };
    }

    return {
      value: "—",
      subtitle: t("admin.dashboard.retentionNoDataSubtitle"),
      trend: {
        text: t("admin.dashboard.retentionNoDataTrend"),
        positive: true,
      },
    };
  })();

  const dynamicAlerts = Array.isArray(stats?.actionAlerts) ? stats?.actionAlerts : [];

  const handleOpenOverdueModal = () => {
    setModalConfig({
      isOpen: true,
      title: t("admin.dashboard.overdueModalTitle", {
        n: overdueAssignments.length,
      }),
      assignments: overdueAssignments,
    });
  };

  // Task status distribution for Donut Chart
  const statusCounts = stats?.assignments?.byStatus ?? {
    done: completedTasks,
    inProgress: activeTasks,
    review: 0,
    blocked: 0,
    todo: 0,
    pendingApproval: 0,
  };

  const donutData = [
    {
      name: t("admin.dashboard.taskStatusDone"),
      value: statusCounts.done || completedTasks || 0,
      color: "#10b981", // Emerald
    },
    {
      name: t("admin.dashboard.taskStatusInProgress"),
      value: (statusCounts.inProgress || 0) + (statusCounts.todo || 0),
      color: "#06b6d4", // Cyan
    },
    {
      name: t("admin.dashboard.taskStatusReview"),
      value: (statusCounts.review || 0) + (statusCounts.pendingApproval || 0),
      color: "#f59e0b", // Amber
    },
    {
      name: t("admin.dashboard.taskStatusOverdue"),
      value: overdueTasksCount + (statusCounts.blocked || 0),
      color: "#f43f5e", // Rose
    },
  ];

  const totalDonutValue = donutData.reduce((acc, curr) => acc + curr.value, 0);

  const displayDonutData =
    totalDonutValue > 0
      ? donutData.filter((d) => d.value > 0)
      : [{ name: t("admin.dashboard.totalTasksLabel"), value: 1, color: "#334155" }];

  const userName = authState.user?.fullName || "Admin";

  const timeScopes = [
    { id: "month" as const, label: t("admin.dashboard.filterThisMonth") },
    { id: "week" as const, label: t("admin.dashboard.filterLast7Days") },
    { id: "all" as const, label: t("admin.dashboard.filterAllTime") },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Modal View Details */}
      <TaskAssignmentModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
        assignments={modalConfig.assignments}
      />

      {/* Tier 1: Header Banner (Top Executive Control Center) */}
      <MetalCard>
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <LayoutDashboard className="h-5 w-5 shrink-0" />
                </div>
                <h1 className="text-2xl font-bold metal-text">
                  {t("admin.dashboard.welcomeBack", { name: userName })}
                </h1>
                <span className="hidden sm:inline-flex rounded-full border border-primary-light/30 bg-primary-light/10 px-3 py-0.5 text-xs font-semibold text-primary-light">
                  {t("admin.dashboard.badge")}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {t("admin.dashboard.subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Time Scope Filter Pills */}
              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-1">
                {timeScopes.map((scope) => (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => setTimeScope(scope.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      timeScope === scope.id
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {scope.label}
                  </button>
                ))}
              </div>

              {/* Live Status Badge */}
              <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 backdrop-blur-xl shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{t("admin.dashboard.liveBadge")}</span>
              </div>

              {/* Header Reload Button */}
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                title={t("admin.dashboard.reloadTooltip")}
                aria-label={t("admin.dashboard.reloadTooltip")}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted hover:text-cyan-400 hover:bg-white/10 transition-all active:scale-90 disabled:opacity-50 cursor-pointer"
              >
                <RotateCw className={`h-4 w-4 ${isFetching ? "animate-spin text-cyan-400" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </MetalCard>

      {/* Tier 2: 4 Headline KPI Cards (Total Interns, Total Leaders, Active Tasks, System Completion Rate) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5">
        <StatsCard
          title={t("admin.dashboard.totalInterns")}
          value={totalInterns}
          subtitle={t("admin.dashboard.activeInternsSubtitle", { active: activeInterns })}
          icon={<Users className="h-6 w-6 text-primary-light" />}
          href="/admin/interns"
          trend={{
            text: t("admin.dashboard.completed", {
              n: stats?.system?.completedInterns ?? stats?.interns?.completed ?? 0,
            }),
            positive: true,
          }}
        />

        <StatsCard
          title={t("admin.dashboard.totalLeaders")}
          value={totalLeaders}
          subtitle={t("admin.dashboard.managingDepts", {
            n: stats?.system?.activeDepartments ?? departmentDistribution.length,
          })}
          icon={<UserCheck className="h-6 w-6 text-indigo-400" />}
          href="/admin/leaders"
          trend={{
            text: t("admin.dashboard.adminLevel"),
            positive: true,
          }}
        />

        <StatsCard
          title={t("admin.dashboard.pendingApps")}
          value={pendingAppsCount}
          subtitle={t("admin.dashboard.totalApps", { n: totalAppsCount })}
          icon={<FileText className="h-6 w-6 text-amber-400" />}
          href="/admin/onboarding?inviteStatus=USED&applicationStatus=PENDING"
          trend={{
            text:
              pendingAppsCount > 0
                ? t("admin.dashboard.needReview")
                : t("admin.dashboard.allDone"),
            positive: pendingAppsCount === 0,
          }}
        />

        <StatsCard
          title={t("admin.dashboard.retentionRateCardTitle")}
          value={retentionDisplay.value}
          subtitle={retentionDisplay.subtitle}
          icon={<Award className="h-6 w-6 text-emerald-400" />}
          href="/admin/interns"
          trend={retentionDisplay.trend}
        />
      </div>

      {/* Tier 3: Analytics Row (Golden Ratio 65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (65% -> col-span-8): Department Personnel Distribution */}
        <div className="lg:col-span-8 flex flex-col">
          <MetalCard className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                      <Building2 className="h-5 w-5 shrink-0" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      <span className="metal-text">{t("admin.dashboard.departmentDistribution")}</span>
                    </h3>
                  </div>
                  <p className="text-xs text-muted mt-1.5">
                    {t("admin.dashboard.departmentDistributionSubtitle")}
                  </p>
                </div>
                <Link
                  href="/admin/department"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all"
                >
                  {t("common.viewAll")}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="mt-6">
                {departmentDistribution.length > 0 ? (
                  <div className="space-y-6">
                    {/* Recharts BarChart */}
                    <div className="h-72 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={departmentDistribution}
                          margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                          <XAxis
                            dataKey="departmentName"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            tickFormatter={(val) =>
                              typeof val === "string" && val.length > 18
                                ? `${val.substring(0, 18)}...`
                                : String(val)
                            }
                          />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(15, 23, 42, 0.95)",
                              borderColor: "rgba(255, 255, 255, 0.12)",
                              borderRadius: "0.75rem",
                              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.6)",
                              color: "#f8fafc",
                              backdropFilter: "blur(8px)",
                            }}
                            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                          />
                          <Legend
                            verticalAlign="top"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{ paddingBottom: "12px", fontSize: "12px" }}
                          />
                          <Bar
                            dataKey="internCount"
                            name={t("admin.dashboard.colDeptInterns")}
                            fill="#38bdf8"
                            radius={[6, 6, 0, 0]}
                          />
                          <Bar
                            dataKey="leaderCount"
                            name={t("admin.dashboard.colDeptLeaders")}
                            fill="#818cf8"
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Department Cards Breakdown */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {departmentDistribution.map((dept: DepartmentDistribution) => {
                        const isMissingLeader = dept.leaderCount === 0;
                        return (
                          <div
                            key={dept.departmentId}
                            className={`p-3.5 rounded-xl border transition-all ${
                              isMissingLeader
                                ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
                                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-foreground truncate">
                                {dept.departmentName}
                              </p>
                              {isMissingLeader ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-md shrink-0">
                                  <AlertTriangle className="h-3 w-3" />
                                  {t("admin.dashboard.missingLeaderAlert")}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md shrink-0">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {t("admin.dashboard.leaderAssigned", { n: dept.leaderCount })}
                                </span>
                              )}
                            </div>

                            <div className="mt-3 flex items-center justify-between text-xs">
                              <span className="text-muted">{t("admin.dashboard.colDeptInterns")}</span>
                              <span className="font-bold text-foreground">
                                {t("admin.dashboard.internCount", { n: dept.internCount })}
                              </span>
                            </div>

                            <div className="mt-1.5 flex items-center justify-between text-xs">
                              <span className="text-muted">{t("admin.dashboard.colDeptLeaders")}</span>
                              <span className={`font-semibold ${isMissingLeader ? "text-rose-400" : "text-slate-300"}`}>
                                {dept.leaderCount}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted text-center py-6">
                    {t("admin.dashboard.noDeptDistribution")}
                  </p>
                )}
              </div>
            </div>
          </MetalCard>
        </div>

        {/* Right Column (35% -> col-span-4): Task Status Breakdown (Donut Chart) */}
        <div className="lg:col-span-4 flex flex-col">
          <MetalCard className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    <span className="metal-text">{t("admin.dashboard.taskStatusBreakdown")}</span>
                  </h3>
                </div>
                <p className="text-xs text-muted mt-1.5">
                  {t("admin.dashboard.taskStatusSubtitle")}
                </p>
              </div>

              {/* Donut Chart with Centered Total Metric */}
              <div className="relative mt-6 h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={totalDonutValue > 0 ? 4 : 0}
                      dataKey="value"
                      stroke="none"
                    >
                      {displayDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderColor: "rgba(255, 255, 255, 0.12)",
                        borderRadius: "0.75rem",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.6)",
                        color: "#f8fafc",
                        backdropFilter: "blur(8px)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Centered KPI Metric inside Donut */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold chrome-text leading-none tracking-tight">
                    {totalTasks}
                  </span>
                  <span className="text-[11px] font-semibold text-muted mt-1 uppercase tracking-wider">
                    {t("admin.dashboard.totalTasksLabel")}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Breakdown Legend & Percentages */}
            <div className="mt-4 grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
              {donutData.map((item) => {
                const pct = totalTasks > 0 ? Math.round((item.value / totalTasks) * 100) : 0;
                return (
                  <div
                    key={item.name}
                    className="flex flex-col p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[11px] text-muted truncate">{item.name}</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-sm font-bold text-foreground">{item.value}</span>
                      <span className="text-[10px] font-semibold text-muted">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </MetalCard>
        </div>
      </div>

      {/* Tier 4: Operations & Priority Actions Row (Golden Ratio 65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (65% -> col-span-8): Leader Team Performance Table */}
        <div className="lg:col-span-8 flex flex-col">
          <MetalCard className="p-6 flex-1 flex flex-col">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    <UserCheck className="h-5 w-5 shrink-0" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    <span className="metal-text">{t("admin.dashboard.leaderPerformance")}</span>
                  </h3>
                </div>
                <p className="text-xs text-muted mt-1.5">
                  {t("admin.dashboard.showingGroups", {
                    n: displayedLeaderTeams.length,
                    m: leaderTeams.length,
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {leaderTeams.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllLeaders(!showAllLeaders)}
                    className="text-xs font-semibold text-primary-light hover:text-cyan-300 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    {showAllLeaders ? (
                      <>
                        {t("admin.dashboard.collapseTop5")} <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        {t("admin.dashboard.viewAllN", { n: leaderTeams.length })}{" "}
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 flex-1">
              <Table columns="2.2fr 1.3fr 1fr 2.5fr 1.2fr">
                <Table.Header>
                  <span>{t("admin.dashboard.colLeader")}</span>
                  <span>{t("admin.dashboard.colDepartment")}</span>
                  <span>{t("admin.dashboard.colInternCount")}</span>
                  <span>{t("admin.dashboard.colProgress")}</span>
                  <div className="flex items-center justify-between">
                    <span>{t("admin.dashboard.colTaskRisk")}</span>
                    <Table.ReloadButton onReload={refetch} isReloading={isFetching} />
                  </div>
                </Table.Header>

                <Table.Body
                  data={displayedLeaderTeams}
                  emptyMessage={t("admin.dashboard.noLeaderTeams")}
                  render={(team: LeaderTeamProgress) => {
                    const assignments = team.assignments ?? {
                      done: 0,
                      inProgress: 0,
                      review: 0,
                      blocked: 0,
                    };
                    const total =
                      team.totalAssignments ||
                      (assignments.done +
                        assignments.inProgress +
                        assignments.review +
                        assignments.blocked ||
                        1);
                    const percentDone = Math.round((assignments.done / total) * 100);
                    const internCount = team.totalInterns ?? 0;
                    const overdueCount = team.overdueCount ?? 0;

                    return (
                      <Table.Row key={team.leaderId}>
                        <div>
                          <p className="font-bold text-foreground text-sm">
                            {team.leaderName}
                          </p>
                          <p className="text-xs text-muted">{team.leaderEmail}</p>
                        </div>

                        <div>
                          <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                            {team.departmentName}
                          </span>
                        </div>

                        <div>
                          <span className="text-sm font-semibold text-foreground">
                            {t("admin.dashboard.internCount", { n: internCount })}
                          </span>
                        </div>

                        {/* Progress Bar & Completion % */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-emerald-400">
                              {t("admin.dashboard.percentDone", {
                                pct: percentDone,
                                done: assignments.done,
                                total,
                              })}
                            </span>
                            <span className="text-muted text-[11px]">
                              {t("admin.dashboard.inProgressReview", {
                                inProgress: assignments.inProgress,
                                review: assignments.review,
                              })}
                            </span>
                          </div>

                          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden flex">
                            <div
                              className="h-full bg-emerald-400"
                              style={{
                                width: `${(assignments.done / total) * 100}%`,
                              }}
                              title={`Done: ${assignments.done}`}
                            />
                            <div
                              className="h-full bg-cyan-400"
                              style={{
                                width: `${(assignments.inProgress / total) * 100}%`,
                              }}
                              title={`In Progress: ${assignments.inProgress}`}
                            />
                            <div
                              className="h-full bg-amber-400"
                              style={{
                                width: `${(assignments.review / total) * 100}%`,
                              }}
                              title={`Review: ${assignments.review}`}
                            />
                            <div
                              className="h-full bg-rose-400"
                              style={{
                                width: `${(assignments.blocked / total) * 100}%`,
                              }}
                              title={`Blocked: ${assignments.blocked}`}
                            />
                          </div>
                        </div>

                        <div>
                          {overdueCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                              ⚠ {t("admin.dashboard.overdueTasks", { n: overdueCount })}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                              {t("common.onTrack")}
                            </span>
                          )}
                        </div>
                      </Table.Row>
                    );
                  }}
                />
              </Table>
            </div>
          </MetalCard>
        </div>

        {/* Right Column (35% -> col-span-4): Quick Actions & Alerts Panel */}
        <div className="lg:col-span-4 flex flex-col">
          <MetalCard className="p-6 flex-1 flex flex-col justify-between space-y-5">
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                    <Zap className="h-5 w-5 shrink-0" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    <span className="metal-text">{t("admin.dashboard.quickActionsTitle")}</span>
                  </h3>
                </div>
                <p className="text-xs text-muted mt-1.5">
                  {t("admin.dashboard.quickActionsSubtitle")}
                </p>
              </div>

              {/* 2x2 Quick Actions Operational Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Action 1: Review Applications */}
                <Link
                  href="/admin/onboarding?inviteStatus=USED&applicationStatus=PENDING"
                  className="flex flex-col p-3 rounded-xl border border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-md">
                      {pendingAppsCount}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-bold text-foreground group-hover:text-amber-300 transition-colors">
                    {t("admin.dashboard.actionReviewApps")}
                  </p>
                </Link>

                {/* Action 2: Overdue Tasks Modal */}
                <button
                  type="button"
                  onClick={handleOpenOverdueModal}
                  className="flex flex-col p-3 rounded-xl border border-rose-500/25 bg-rose-500/5 hover:bg-rose-500/15 hover:border-rose-500/40 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/15 px-1.5 py-0.5 rounded-md">
                      {overdueTasksCount}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-bold text-foreground group-hover:text-rose-300 transition-colors">
                    {t("admin.dashboard.actionOverdueTasks")}
                  </p>
                </button>

                {/* Action 3: Leader Team */}
                <Link
                  href="/admin/leaders"
                  className="flex flex-col p-3 rounded-xl border border-indigo-500/25 bg-indigo-500/5 hover:bg-indigo-500/15 hover:border-indigo-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <UserCheck className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded-md">
                      {totalLeaders}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-bold text-foreground group-hover:text-indigo-300 transition-colors">
                    {t("admin.dashboard.actionManageLeaders")}
                  </p>
                </Link>

                {/* Action 4: Intern Roster */}
                <Link
                  href="/admin/interns"
                  className="flex flex-col p-3 rounded-xl border border-cyan-500/25 bg-cyan-500/5 hover:bg-cyan-500/15 hover:border-cyan-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <Users className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-500/15 px-1.5 py-0.5 rounded-md">
                      {activeInterns}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-bold text-foreground group-hover:text-cyan-300 transition-colors">
                    {t("admin.dashboard.actionManageInterns")}
                  </p>
                </Link>
              </div>

              {/* Action Alerts List */}
              <div className="space-y-2.5">
                {/* Dynamic action alerts from backend if array */}
                {dynamicAlerts.map((alert: ActionAlert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-rose-500/30 bg-rose-500/10"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 shrink-0">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-rose-300 truncate">{alert.message}</p>
                        <p className="text-[10px] text-muted">
                          {new Date(alert.createdAt).toLocaleString(
                            locale === "vi" ? "vi-VN" : "en-US",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Missing Leader in Department Warning */}
                {missingLeaderDepts.length > 0 && (
                  <Link
                    href="/admin/department"
                    className="flex items-center justify-between p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 shrink-0">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-rose-300">
                          {t("admin.dashboard.missingLeaderDeptsCount", {
                            n: missingLeaderDepts.length,
                          })}
                        </p>
                        <p className="text-[10px] text-muted truncate max-w-[200px]">
                          {missingLeaderDepts.map((d) => d.departmentName).join(", ")}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1 shrink-0">
                      {t("common.handle")} <ExternalLink className="h-3 w-3" />
                    </span>
                  </Link>
                )}

                {/* Dropped Interns Warning */}
                {droppedInternsCount > 0 && (
                  <Link
                    href="/admin/interns?status=DROPPED"
                    className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                        <AlertOctagon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {t("admin.dashboard.droppedInterns", {
                            n: droppedInternsCount,
                          })}
                        </p>
                        <p className="text-[10px] text-muted">{t("admin.dashboard.droppedList")}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-muted group-hover:text-foreground flex items-center gap-1">
                      {t("common.view")} <ExternalLink className="h-3 w-3" />
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mini Recent Activity Section */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {t("admin.dashboard.recentActivityMini")}
                  </span>
                </div>
                <Link
                  href="/admin/activity-logs"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
                >
                  {t("common.viewAll")}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-2">
                {recentActivities.length > 0 ? (
                  recentActivities.slice(0, 3).map((act: ActivityLog) => (
                    <div
                      key={act.id}
                      className="flex items-center gap-2.5 p-2 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
                    >
                      <div className="p-1.5 rounded-lg bg-white/5 text-muted shrink-0">
                        {act.type === "SUBMISSION" ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        ) : act.type === "DAILY_REPORT" ? (
                          <Calendar className="h-3 w-3 text-cyan-400" />
                        ) : (
                          <FileText className="h-3 w-3 text-amber-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{act.title}</p>
                      </div>
                      <span className="text-[10px] text-muted shrink-0">
                        {new Date(act.createdAt).toLocaleTimeString(
                          locale === "vi" ? "vi-VN" : "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted text-center py-3">
                    {t("admin.dashboard.noActivity")}
                  </p>
                )}
              </div>
            </div>
          </MetalCard>
        </div>
      </div>
    </div>
  );
}
