"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
  Eye,
  Clock,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronUp,
  Calendar,
  Building2,
  CheckSquare,
  TrendingUp,
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
} from "recharts";

export default function AdminStatsOverview() {
  const t = useTranslations();
  const { data: response, isLoading, isError, refetch } = useAdminStats();

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

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !response?.success) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/10 p-6 text-center text-danger space-y-3">
        <p className="font-semibold">{t("admin.dashboard.errorLoad")}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-danger text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
        >
          {t("common.retry")}
        </button>
      </div>
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
  const totalLeaders = stats?.system?.activeLeaders ?? stats?.system?.leaders ?? 0;
  const activeTasks = stats?.tasks?.activeTasks ?? stats?.assignments?.byStatus?.inProgress ?? 0;
  const totalTasks = stats?.tasks?.totalTasks ?? stats?.tasks?.total ?? 0;
  const completedTasks = stats?.tasks?.completedTasks ?? 0;
  const systemCompletionRate = stats?.tasks?.systemCompletionRate ?? stats?.systemCompletionRate ?? 0;

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
    0;

  const droppedInternsCount =
    actionAlertsObj?.droppedInternsCount ??
    stats?.system?.droppedInterns ??
    stats?.interns?.dropped ??
    0;

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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Modal View Details */}
      <TaskAssignmentModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
        assignments={modalConfig.assignments}
      />

      {/* Header Banner */}
      <div className="border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-foreground metal-text">
              {t("admin.dashboard.title")}
            </h1>
            <span className="rounded-full border border-primary-light/30 bg-primary-light/10 px-3 py-0.5 text-xs font-semibold text-primary-light">
              {t("admin.dashboard.badge")}
            </span>
          </div>
          <p className="text-sm text-muted mt-1">
            {t("admin.dashboard.subtitle")}
          </p>
        </div>
      </div>

      {/* Level 1: 4 Headline KPI Cards (Total Interns, Total Leaders, Active Tasks, System Completion Rate) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
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
            n: stats?.system?.activeDepartments ?? stats?.system?.departments ?? 0,
          })}
          icon={<UserCheck className="h-6 w-6 text-indigo-400" />}
          href="/admin/leaders"
          trend={{
            text: t("admin.dashboard.adminLevel"),
            positive: true,
          }}
        />

        <StatsCard
          title={t("admin.dashboard.activeTasks")}
          value={activeTasks}
          subtitle={`Tổng số: ${totalTasks} task`}
          icon={<CheckSquare className="h-6 w-6 text-cyan-400" />}
          href="/admin/interns"
          trend={{
            text: `${completedTasks} hoàn thành`,
            positive: true,
          }}
        />

        <StatsCard
          title={t("admin.dashboard.systemCompletionRate")}
          value={`${systemCompletionRate}%`}
          subtitle="Tiến độ toàn hệ thống"
          icon={<TrendingUp className="h-6 w-6 text-emerald-400" />}
          trend={{
            text: systemCompletionRate >= 70 ? "Mục tiêu đạt chuẩn" : "Cần đẩy mạnh",
            positive: systemCompletionRate >= 70,
          }}
        />
      </div>

      {/* Level 2: Executive Leader Team Performance Table (Top 5 + View All Toggle) */}
      <MetalCard className="p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-indigo-400 shrink-0" />
              <h3 className="text-xl font-bold text-foreground">
                <span className="metal-text">{t("admin.dashboard.leaderPerformance")}</span>
              </h3>
            </div>
            <p className="text-xs text-muted mt-1">
              {t("admin.dashboard.showingGroups", { n: displayedLeaderTeams.length, m: leaderTeams.length })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {leaderTeams.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllLeaders(!showAllLeaders)}
                className="text-xs font-semibold text-primary-light hover:underline flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 cursor-pointer"
              >
                {showAllLeaders ? (
                  <>
                    {t("admin.dashboard.collapseTop5")} <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    {t("admin.dashboard.viewAllN", { n: leaderTeams.length })} <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Table columns="2fr 1.2fr 1fr 2.5fr 1fr">
            <Table.Header>
              <span>{t("admin.dashboard.colLeader")}</span>
              <span>{t("admin.dashboard.colDepartment")}</span>
              <span>{t("admin.dashboard.colInternCount")}</span>
              <span>{t("admin.dashboard.colProgress")}</span>
              <span>{t("admin.dashboard.colTaskRisk")}</span>
            </Table.Header>

            <Table.Body
              data={displayedLeaderTeams}
              render={(team: LeaderTeamProgress) => {
                const assignments = team.assignments ?? {
                  done: 0,
                  inProgress: 0,
                  review: 0,
                  blocked: 0,
                };
                const total =
                  team.totalAssignments ||
                  ((assignments.done +
                    assignments.inProgress +
                    assignments.review +
                    assignments.blocked) ||
                    1);
                const percentDone = Math.round(
                  (assignments.done / total) * 100,
                );
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

      {/* Level 3: Department Distribution Card with Recharts BarChart & Breakdown */}
      <MetalCard className="p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-cyan-400 shrink-0" />
              <h3 className="text-xl font-bold text-foreground">
                <span className="metal-text">{t("admin.dashboard.departmentDistribution")}</span>
              </h3>
            </div>
            <p className="text-xs text-muted mt-1">
              {t("admin.dashboard.departmentDistributionSubtitle")}
            </p>
          </div>
          <Link
            href="/admin/department"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
          >
            {t("common.viewAll")}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-6">
          {departmentDistribution.length > 0 ? (
            <div className="space-y-6">
              {/* Recharts BarChart with ResponsiveContainer */}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {departmentDistribution.map((dept: DepartmentDistribution) => {
                  const isMissingLeader = dept.leaderCount === 0;
                  return (
                    <div
                      key={dept.departmentId}
                      className={`p-4 rounded-2xl border transition-all ${
                        isMissingLeader
                          ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-foreground truncate">
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

                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-muted">{t("admin.dashboard.colDeptInterns")}</span>
                        <span className="font-bold text-foreground">
                          {t("admin.dashboard.internCount", { n: dept.internCount })}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs">
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
      </MetalCard>

      {/* Level 4: Recent Activity Log & System Alerts (Grid 2 cột) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity Log */}
        <MetalCard className="p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400 shrink-0" />
              <h3 className="text-lg font-semibold text-foreground">
                {t("admin.dashboard.recentActivity")}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/activity-logs"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
              >
                {t("common.viewAll")}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 3).map((act: ActivityLog) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5 shrink-0">
                    {act.type === "SUBMISSION" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : act.type === "DAILY_REPORT" ? (
                      <Calendar className="h-4 w-4 text-cyan-400" />
                    ) : (
                      <FileText className="h-4 w-4 text-amber-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {act.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      {act.description}
                    </p>
                  </div>

                  <span className="text-[10px] text-muted shrink-0">
                    {new Date(act.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted text-center py-6">
                {t("admin.dashboard.noActivity")}
              </p>
            )}
          </div>
        </MetalCard>

        {/* System Action Alerts & Status Breakdown */}
        <MetalCard className="p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
              <h3 className="text-lg font-semibold text-foreground">
                {t("admin.dashboard.actionAlerts")}
              </h3>
            </div>
          </div>

          <div className="mt-5 space-y-3.5">
            {/* Dynamic action alerts from backend if array */}
            {dynamicAlerts.map((alert: ActionAlert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 shrink-0">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-rose-300 truncate">{alert.message}</p>
                    <p className="text-[10px] text-muted">
                      {new Date(alert.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Action Item 1: Applications Pending */}
            <Link
              href="/admin/onboarding?inviteStatus=USED&applicationStatus=PENDING"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-amber-300 transition-colors">
                    {t("admin.dashboard.pendingAppsCount", {
                      n: pendingAppsCount,
                    })}
                  </p>
                  <p className="text-[11px] text-muted">{t("admin.dashboard.needApproveReject")}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                {t("common.handle")} <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </Link>

            {/* Action Item 2: Overdue Tasks Alert */}
            <button
              type="button"
              onClick={handleOpenOverdueModal}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-rose-300 transition-colors">
                    {t("admin.dashboard.overdueTasksCount", {
                      n: overdueTasksCount,
                    })}
                  </p>
                  <p className="text-[11px] text-muted">{t("admin.dashboard.clickToSeeOverdue")}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                {t("common.details")} <Eye className="h-3.5 w-3.5" />
              </span>
            </button>

            {/* Action Item 3: Missing Leader in Department */}
            {missingLeaderDepts.length > 0 && (
              <Link
                href="/admin/department"
                className="flex items-center justify-between p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-rose-300">
                      {missingLeaderDepts.length} phòng ban chưa có Leader phụ trách
                    </p>
                    <p className="text-[11px] text-muted truncate max-w-xs">
                      {missingLeaderDepts.map((d) => d.departmentName).join(", ")}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  {t("common.handle")} <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </Link>
            )}

            {/* Action Item 4: Dropped Interns */}
            <Link
              href="/admin/interns?status=DROPPED"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <AlertOctagon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {t("admin.dashboard.droppedInterns", {
                      n: droppedInternsCount,
                    })}
                  </p>
                  <p className="text-[11px] text-muted">{t("admin.dashboard.droppedList")}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted group-hover:text-foreground flex items-center gap-1">
                {t("common.view")} <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </MetalCard>
      </div>
    </div>
  );
}
