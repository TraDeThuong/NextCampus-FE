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
import { AssignmentDetail } from "@/types/stats";
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
} from "lucide-react";

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

  const stats = response.data;

  const rawOverdue = stats.overdueAssignments ?? [];
  const overdueAssignments = rawOverdue.filter((a) => a.isOverdue);
  const leaderTeams = stats.leaderTeams ?? [];
  const recentActivities = stats.recentActivities ?? [];

  const displayedLeaderTeams = showAllLeaders
    ? leaderTeams
    : leaderTeams.slice(0, 5);

  const handleOpenOverdueModal = () => {
    setModalConfig({
      isOpen: true,
      title: t("admin.dashboard.overdueModalTitle", { n: overdueAssignments.length }),
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

      {/* Level 1: Health & Performance KPI Cards (KPIs "Sống") */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title={t("admin.dashboard.activeInterns")}
          value={stats.interns.active}
          subtitle={t("admin.dashboard.retentionRate", { pct: Math.round((stats.interns.active / (stats.interns.total || 1)) * 100) })}
          icon={<Users className="h-6 w-6 text-primary-light" />}
          href="/admin/interns?status=ACTIVE"
          trend={{
            text: t("admin.dashboard.completed", { n: stats.interns.completed }),
            positive: true,
          }}
        />

        <StatsCard
          title={t("admin.dashboard.leaderTeam")}
          value={stats.system.leaders}
          subtitle={t("admin.dashboard.managingDepts", { n: stats.system.departments })}
          icon={<UserCheck className="h-6 w-6 text-indigo-400" />}
          href="/admin/leaders"
          trend={{
            text: t("admin.dashboard.adminLevel"),
            positive: true,
          }}
        />

        <StatsCard
          title={t("admin.dashboard.pendingApps")}
          value={stats.applications.pending}
          subtitle={t("admin.dashboard.totalApps", { n: stats.applications.total })}
          icon={<FileText className="h-6 w-6 text-amber-400" />}
          href="/admin/onboarding?inviteStatus=USED&applicationStatus=PENDING"
          trend={{
            text: stats.applications.pending > 0 ? t("admin.dashboard.needReview") : t("admin.dashboard.allDone"),
            positive: stats.applications.pending === 0,
          }}
        />
      </div>

      {/* Level 2: Executive Leader Team Performance Table (Top 5 + View All Toggle) */}
      <MetalCard className="p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-indigo-400 shrink-0" />
              <span className="metal-text">{t("admin.dashboard.leaderPerformance")}</span>
            </h3>
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
              render={(team) => {
                const total = team.totalAssignments || 1;
                const percentDone = Math.round((team.assignments.done / total) * 100);

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
                        {t("admin.dashboard.internCount", { n: team.totalInterns })}
                      </span>
                    </div>

                    {/* Progress Bar & Completion % */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-400">
                          {t("admin.dashboard.percentDone", { pct: percentDone, done: team.assignments.done, total: team.totalAssignments })}
                        </span>
                        <span className="text-muted text-[11px]">
                          {t("admin.dashboard.inProgressReview", { inProgress: team.assignments.inProgress, review: team.assignments.review })}
                        </span>
                      </div>

                      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden flex">
                        <div
                          className="h-full bg-emerald-400"
                          style={{
                            width: `${(team.assignments.done / total) * 100}%`,
                          }}
                          title={`Done: ${team.assignments.done}`}
                        />
                        <div
                          className="h-full bg-cyan-400"
                          style={{
                            width: `${(team.assignments.inProgress / total) * 100}%`,
                          }}
                          title={`In Progress: ${team.assignments.inProgress}`}
                        />
                        <div
                          className="h-full bg-amber-400"
                          style={{
                            width: `${(team.assignments.review / total) * 100}%`,
                          }}
                          title={`Review: ${team.assignments.review}`}
                        />
                        <div
                          className="h-full bg-rose-400"
                          style={{
                            width: `${(team.assignments.blocked / total) * 100}%`,
                          }}
                          title={`Blocked: ${team.assignments.blocked}`}
                        />
                      </div>
                    </div>

                    <div>
                      {team.overdueCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                          ⚠ {t("admin.dashboard.overdueTasks", { n: team.overdueCount })}
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

      {/* Level 3: Recent Activity Log & System Alerts (Grid 2 cột) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity Log (Nhật ký hoạt động gần đây) */}
        <MetalCard className="p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              {t("admin.dashboard.recentActivity")}
            </h3>
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
              recentActivities.slice(0, 3).map((act) => (
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
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              {t("admin.dashboard.actionAlerts")}
            </h3>
          </div>

          <div className="mt-5 space-y-3.5">
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
                    {t("admin.dashboard.pendingAppsCount", { n: stats.applications.pending })}
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
                    {t("admin.dashboard.overdueTasksCount", { n: stats.tasks.overdue })}
                  </p>
                  <p className="text-[11px] text-muted">{t("admin.dashboard.clickToSeeOverdue")}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                {t("common.details")} <Eye className="h-3.5 w-3.5" />
              </span>
            </button>

            {/* Action Item 3: Dropped Interns */}
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
                    {t("admin.dashboard.droppedInterns", { n: stats.interns.dropped })}
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
