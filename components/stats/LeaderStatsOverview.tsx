"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useLeaderStats } from "@/hooks/stats/useLeaderStats";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import { useAuth } from "@/hooks/auth/useAuth";
import StatsCard from "./StatsCard";
import Spinner from "../ui/Spinner";
import MetalCard from "../ui/MetalCard";
import TaskAssignmentModal from "./TaskAssignmentModal";
import PendingApprovalModal from "./PendingApprovalModal";
import Table from "../ui/Table";
import type { AssignmentDetail, InternTeamProgress } from "@/types/stats";
import type { AssignmentStatus } from "@/types/task-assignment";
import {
  Users,
  CheckCircle2,
  FileCheck,
  Award,
  ShieldAlert,
  ShieldCheck,
  Clock,
  FileText,
  RotateCw,
  ExternalLink,
  Zap,
  AlertTriangle,
  LayoutDashboard,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const STATUS_MODAL_PAGE_SIZE = 10;

export default function LeaderStatsOverview() {
  const t = useTranslations("leader.dashboard");
  const locale = useLocale();
  const { data: response, isLoading, isError, isFetching, refetch } = useLeaderStats();
  const {
    state: { user },
  } = useAuth();

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    assignments: AssignmentDetail[];
    status: AssignmentStatus | null;
    page: number;
  }>({
    isOpen: false,
    title: "",
    assignments: [],
    status: null,
    page: 1,
  });

  const [pendingModalOpen, setPendingModalOpen] = useState(false);

  const statusAssignmentsQuery = useTaskAssignments(
    {
      assignedBy: user?.id,
      status: modalConfig.status ?? undefined,
      page: modalConfig.page,
      limit: STATUS_MODAL_PAGE_SIZE,
      sortBy: "assignedAt",
      order: "desc",
    },
    modalConfig.isOpen && Boolean(modalConfig.status && user?.id),
  );

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
            <h3 className="text-xl font-bold text-foreground">{t("loadError")}</h3>
            <p className="text-xs text-muted leading-relaxed">
              {response?.message ||
                (locale === "vi"
                  ? "Không thể lấy dữ liệu thống kê từ máy chủ. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại."
                  : "Unable to retrieve Leader statistics from the server. Please check your network connection and try again.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-lg disabled:opacity-50 active:scale-95"
          >
            <RotateCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {t("retry")}
          </button>
        </div>
      </MetalCard>
    );
  }

  const stats = response.data;
  const rawOverdue = stats.overdueAssignments ?? [];
  const overdueAssignments = rawOverdue.filter((a) => a.isOverdue);
  const internProgress = stats.internProgress ?? [];

  const activeWorkloadDays = stats.workload?.activeWorkloadDays ?? stats.activeWorkloadDays ?? 0;

  const todaySubmitted = stats.dailyReportRate?.todaySubmitted ?? 0;
  const totalActiveInterns =
    stats.dailyReportRate?.totalActiveInterns ??
    stats.dailyReportRate?.totalInterns ??
    ("activeInterns" in stats.interns ? stats.interns.activeInterns : stats.interns.active) ??
    0;

  const pendingSubmissions =
    (typeof stats.submissions === "object" && "pendingSubmissionsCount" in stats.submissions
      ? stats.submissions.pendingSubmissionsCount
      : stats.submissions?.pending) ?? 0;

  const activeInternsCount =
    ("activeInterns" in stats.interns ? stats.interns.activeInterns : stats.interns.active) ?? 0;
  const totalInternsCount =
    ("totalInterns" in stats.interns ? stats.interns.totalInterns : stats.interns.total) ?? 0;
  const completedInternsCount =
    ("completed" in stats.interns ? stats.interns.completed : 0) ?? 0;

  const avgEvalScore = stats.evaluations?.avgScore ?? stats.weeklyEvaluations?.avgScore ?? 0;
  const totalEvals = stats.evaluations?.totalEvaluations ?? stats.weeklyEvaluations?.total ?? 0;

  const rawStatusAssignments = Array.isArray(statusAssignmentsQuery.data?.data)
    ? statusAssignmentsQuery.data.data
    : Array.isArray(statusAssignmentsQuery.data)
      ? (statusAssignmentsQuery.data as unknown as typeof statusAssignmentsQuery.data.data)
      : [];

  const statusAssignments: AssignmentDetail[] = rawStatusAssignments.map(
    (assignment) => ({
      id: assignment.id,
      status: assignment.status,
      taskTitle: assignment.task?.title || "—",
      taskPriority: assignment.task?.priority || "MEDIUM",
      taskDeadline: assignment.task?.deadline || null,
      isOverdue:
        assignment.status !== "DONE" &&
        Boolean(
          assignment.task?.deadline &&
            new Date(assignment.task.deadline) < new Date(),
        ),
      internName:
        assignment.intern?.fullName || assignment.intern?.user?.fullName || "—",
      internEmail: assignment.intern?.user?.email || "",
      leaderName: assignment.assigner?.fullName || "—",
    }),
  );

  const modalAssignments = modalConfig.status
    ? statusAssignments
    : modalConfig.assignments;
  const statusMeta = statusAssignmentsQuery.data?.meta;

  const statusLabels: Record<string, string> = {
    PENDING_APPROVAL: t("statusPendingApproval"),
    TODO: t("statusTodo"),
    IN_PROGRESS: t("statusInProgress"),
    REVIEW: t("statusReview"),
    DONE: t("statusDone"),
    BLOCKED: t("statusBlocked"),
  };

  const statusColors: Record<
    string,
    { border: string; bg: string; hoverBg: string; text: string; textBold: string; hex: string }
  > = {
    DONE: {
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/10",
      hoverBg: "hover:bg-emerald-500/20",
      text: "text-emerald-400",
      textBold: "text-emerald-300",
      hex: "#10b981",
    },
    IN_PROGRESS: {
      border: "border-cyan-500/20",
      bg: "bg-cyan-500/10",
      hoverBg: "hover:bg-cyan-500/20",
      text: "text-cyan-400",
      textBold: "text-cyan-300",
      hex: "#06b6d4",
    },
    REVIEW: {
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
      hoverBg: "hover:bg-amber-500/20",
      text: "text-amber-400",
      textBold: "text-amber-300",
      hex: "#f59e0b",
    },
    BLOCKED: {
      border: "border-rose-500/20",
      bg: "bg-rose-500/10",
      hoverBg: "hover:bg-rose-500/20",
      text: "text-rose-400",
      textBold: "text-rose-300",
      hex: "#f43f5e",
    },
    TODO: {
      border: "border-white/10",
      bg: "bg-white/5",
      hoverBg: "hover:bg-white/10",
      text: "text-muted",
      textBold: "text-foreground",
      hex: "#64748b",
    },
    PENDING_APPROVAL: {
      border: "border-purple-500/20",
      bg: "bg-purple-500/10",
      hoverBg: "hover:bg-purple-500/20",
      text: "text-purple-400",
      textBold: "text-purple-300",
      hex: "#a855f7",
    },
  };

  const statusKeyToStatsKey: Record<string, string> = {
    PENDING_APPROVAL: "pendingApproval",
    TODO: "todo",
    IN_PROGRESS: "inProgress",
    REVIEW: "review",
    DONE: "done",
    BLOCKED: "blocked",
  };

  const getStatusCount = (key: string): number => {
    return (
      (stats.assignments?.byStatus as Record<string, number> | undefined)?.[
        statusKeyToStatsKey[key]
      ] ??
      stats.tasksByStatus?.[statusKeyToStatsKey[key]] ??
      stats.tasksByStatus?.[key] ??
      0
    );
  };

  const totalTeamTasks = Object.keys(statusColors).reduce(
    (sum, key) => sum + getStatusCount(key),
    0,
  );

  const donutData = Object.entries(statusColors)
    .map(([key, config]) => ({
      key,
      name: statusLabels[key] || key,
      value: getStatusCount(key),
      color: config.hex,
    }))
    .filter((d) => d.value > 0);

  const displayDonutData =
    donutData.length > 0
      ? donutData
      : [{ key: "EMPTY", name: t("totalTasksLabel"), value: 1, color: "#334155" }];

  const selectedStatusTotal = modalConfig.status
    ? getStatusCount(modalConfig.status)
    : modalAssignments.length;

  const handleOpenStatusModal = (statusKey: AssignmentStatus) => {
    setModalConfig({
      isOpen: true,
      title: t("statusDetailTitle", { status: statusLabels[statusKey] ?? statusKey }),
      assignments: [],
      status: statusKey,
      page: 1,
    });
  };

  const handleOpenOverdueModal = () => {
    setModalConfig({
      isOpen: true,
      title: t("overdueListTitle", { count: overdueAssignments.length }),
      assignments: overdueAssignments,
      status: null,
      page: 1,
    });
  };

  const leaderDisplayName = user?.fullName || "Leader";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Modal View Task Details */}
      <TaskAssignmentModal
        isOpen={modalConfig.isOpen}
        onClose={() =>
          setModalConfig((current) => ({
            ...current,
            isOpen: false,
            status: null,
            page: 1,
          }))
        }
        title={modalConfig.title}
        assignments={modalAssignments}
        isLoading={Boolean(modalConfig.status) && statusAssignmentsQuery.isLoading}
        isError={Boolean(modalConfig.status) && statusAssignmentsQuery.isError}
        onRetry={modalConfig.status ? () => statusAssignmentsQuery.refetch() : undefined}
        page={modalConfig.page}
        totalPages={modalConfig.status ? statusMeta?.totalPages ?? 1 : 1}
        totalItems={
          modalConfig.status ? statusMeta?.total ?? selectedStatusTotal : selectedStatusTotal
        }
        onPageChange={
          modalConfig.status
            ? (page) => setModalConfig((current) => ({ ...current, page }))
            : undefined
        }
      />

      {/* Modal Cross-Team Pending Approvals */}
      <PendingApprovalModal
        isOpen={pendingModalOpen}
        onClose={() => setPendingModalOpen(false)}
      />

      {/* Tier 1: Header Banner (Top Executive Leader Banner) */}
      <MetalCard>
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <LayoutDashboard className="h-5 w-5 shrink-0" />
                </div>
                <h1 className="text-2xl font-bold metal-text">
                  {t("welcomeBack", { name: leaderDisplayName })}
                </h1>
                <span className="hidden sm:inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-0.5 text-xs font-semibold text-indigo-300">
                  {t("badge")}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{t("description")}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Live Status Badge */}
              <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-300 backdrop-blur-xl shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{t("liveBadge")}</span>
              </div>

              {/* Header Reload Button */}
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                title={t("reloadTooltip")}
                aria-label={t("reloadTooltip")}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted hover:text-indigo-400 hover:bg-white/10 transition-all active:scale-90 disabled:opacity-50 cursor-pointer"
              >
                <RotateCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin text-indigo-400" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </MetalCard>

      {/* Tier 2: 4 Core Headline KPI Cards (Aligned with Golden Ratio standard) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5">
        <StatsCard
          title={t("activeInterns")}
          value={activeInternsCount}
          subtitle={t("activeInternsSubtitle", { total: totalInternsCount })}
          icon={<Users className="h-6 w-6 text-primary-light" />}
          href="/leader/interns?status=ACTIVE"
          trend={{
            text: t("completedCount", { count: completedInternsCount }),
            positive: true,
          }}
        />

        <StatsCard
          title={t("activeWorkloadDays")}
          value={t("workloadDaysCount", { n: activeWorkloadDays })}
          subtitle={t("workloadDaysSubtitle")}
          icon={<Clock className="h-6 w-6 text-cyan-400" />}
          href="/leader/tasks"
          trend={{
            text:
              activeWorkloadDays > 10
                ? t("riskLevelDanger")
                : activeWorkloadDays > 7
                  ? t("riskLevelWarning")
                  : t("riskLevelHealthy"),
            positive: activeWorkloadDays <= 7,
          }}
        />

        <StatsCard
          title={t("overdueTasks")}
          value={overdueAssignments.length}
          subtitle={t("overdueTasksSubtitle")}
          icon={<ShieldAlert className="h-6 w-6 text-rose-400" />}
          onCardClick={handleOpenOverdueModal}
          trend={{
            text: overdueAssignments.length > 0 ? t("remindInterns") : t("onTrack"),
            positive: overdueAssignments.length === 0,
          }}
        />

        <StatsCard
          title={t("avgScore")}
          value={`${avgEvalScore}/10`}
          subtitle={t("avgScoreSubtitle", { count: totalEvals })}
          icon={<Award className="h-6 w-6 text-emerald-400" />}
          href="/leader/weekly-evaluation"
          trend={{
            text: t("avgScoreLabel"),
            positive: avgEvalScore >= 7,
          }}
        />
      </div>

      {/* Tier 3: Operations & Status Breakdown (Golden Ratio 65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (65% -> col-span-8): Detailed Intern Progress Table */}
        <div className="lg:col-span-8 flex flex-col">
          <MetalCard className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light/10 text-primary-light border border-primary-light/20 shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                      <Users className="h-5 w-5 shrink-0" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      <span className="metal-text">{t("internProgressTitle")}</span>
                    </h3>
                  </div>
                  <p className="text-xs text-muted mt-1.5">{t("internProgressDesc")}</p>
                </div>
                <Link
                  href="/leader/interns"
                  className="text-xs text-primary-light hover:text-cyan-300 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl border border-primary-light/20 bg-primary-light/5 hover:bg-primary-light/10 transition-all"
                >
                  {locale === "vi" ? "Xem tất cả" : "View all"}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="mt-6">
                <Table columns="2fr 1.8fr 1fr 1.2fr 1.2fr">
                  <Table.Header>
                    <span>{t("colIntern")}</span>
                    <span>{t("colTaskProgress")}</span>
                    <span>{t("colAvgScore")}</span>
                    <span>{t("colTodayReport")}</span>
                    <div className="flex items-center justify-between">
                      <span>{t("colHealthStatus")}</span>
                      <Table.ReloadButton onReload={refetch} isReloading={isFetching} />
                    </div>
                  </Table.Header>

                  <Table.Body
                    data={internProgress}
                    emptyMessage={t("noInterns")}
                    render={(intern: InternTeamProgress) => {
                      const internName = intern.fullName || intern.internName || "Thực tập sinh";
                      const internEmail = intern.email || intern.internEmail || "";
                      const overdueCount = intern.overdueTasks ?? intern.overdueCount ?? 0;
                      const total = intern.totalTasks || 1;
                      const percent =
                        intern.completionRate ??
                        Math.round((intern.completedTasks / total) * 100);
                      const isTodayReport = intern.lastReportDate
                        ? new Date(intern.lastReportDate).toDateString() ===
                          new Date().toDateString()
                        : false;

                      return (
                        <Table.Row key={intern.internId}>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-foreground overflow-hidden">
                              {intern.avatarUrl ? (
                                <Image
                                  src={intern.avatarUrl}
                                  alt={internName}
                                  width={36}
                                  height={36}
                                  className="h-full w-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <span>{internName.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-foreground text-sm truncate">
                                {internName}
                              </p>
                              <p className="text-xs text-muted truncate">{internEmail}</p>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-foreground font-semibold">
                                {t("taskCount", {
                                  completed: intern.completedTasks,
                                  total: intern.totalTasks,
                                })}
                              </span>
                              <span className="text-muted">{percent}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full bg-primary-light rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <span className="text-sm font-extrabold text-foreground">
                              {intern.avgScore > 0 ? `${intern.avgScore}/10` : t("notGraded")}
                            </span>
                          </div>

                          <div>
                            {isTodayReport ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold leading-none text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
                                <CheckCircle2 className="h-3 w-3 shrink-0" />
                                {t("reportSubmittedToday")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold leading-none text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                                <Clock className="h-3 w-3 shrink-0" />
                                {t("reportNotSubmittedToday")}
                              </span>
                            )}
                          </div>

                          <div>
                            {intern.healthStatus === "HEALTHY" && (
                              <span className="inline-flex items-center justify-center text-xs font-semibold leading-none text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
                                {t("healthy")}
                              </span>
                            )}
                            {intern.healthStatus === "WARNING" && (
                              <span className="inline-flex items-center justify-center text-xs font-semibold leading-none text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                                {t("warning", { count: overdueCount })}
                              </span>
                            )}
                            {intern.healthStatus === "DANGER" && (
                              <span className="inline-flex items-center justify-center text-xs font-semibold leading-none text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1.5 rounded-lg">
                                {t("danger", { count: overdueCount })}
                              </span>
                            )}
                          </div>
                        </Table.Row>
                      );
                    }}
                  />
                </Table>
              </div>
            </div>
          </MetalCard>
        </div>

        {/* Right Column (35% -> col-span-4): Task Status Donut & Quick Actions */}
        <div className="lg:col-span-4 flex flex-col">
          <MetalCard className="p-6 flex-1 flex flex-col justify-between space-y-6">
            <div>
              {/* Task Status Heading */}
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    <span className="metal-text">{t("taskStatusTitle")}</span>
                  </h3>
                </div>
                <p className="text-xs text-muted mt-1.5">{t("taskStatusSubtitle")}</p>
              </div>

              {/* Donut Chart */}
              <div className="relative mt-4 h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={78}
                      paddingAngle={totalTeamTasks > 0 ? 4 : 0}
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

                {/* Center Total Counter */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold chrome-text leading-none tracking-tight">
                    {totalTeamTasks}
                  </span>
                  <span className="text-[11px] font-semibold text-muted mt-1 uppercase tracking-wider">
                    {t("totalTasksLabel")}
                  </span>
                </div>
              </div>

              {/* Clickable Status Chips Grid */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {Object.entries(statusColors).map(([key, color]) => {
                  const count = getStatusCount(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleOpenStatusModal(key as AssignmentStatus)}
                      className={`p-2 rounded-xl border ${color.border} ${color.bg} ${color.hoverBg} transition-all cursor-pointer text-center group active:scale-95`}
                    >
                      <p className={`text-[10px] ${color.text} font-medium truncate`}>
                        {statusLabels[key]}
                      </p>
                      <p className={`text-sm font-bold ${color.textBold} mt-0.5`}>{count}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Shortcuts Grid */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-foreground">{t("quickActions")}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Shortcut 1: Review Submissions */}
                <Link
                  href="/leader/tasks?status=REVIEW"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-500/40 transition-all group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-medium text-foreground group-hover:text-amber-300 transition-colors truncate">
                      {t("actionReviewSubmissions")}
                    </span>
                  </div>
                  {pendingSubmissions > 0 && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                      {pendingSubmissions}
                    </span>
                  )}
                </Link>

                {/* Shortcut 2: Pending Cross-team Approvals */}
                <button
                  type="button"
                  onClick={() => setPendingModalOpen(true)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-purple-500/25 bg-purple-500/5 hover:bg-purple-500/15 hover:border-purple-500/40 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="text-xs font-medium text-foreground group-hover:text-purple-300 transition-colors truncate">
                      {t("actionPendingApprovals")}
                    </span>
                  </div>
                  {getStatusCount("PENDING_APPROVAL") > 0 && (
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                      {getStatusCount("PENDING_APPROVAL")}
                    </span>
                  )}
                </button>

                {/* Shortcut 3: Daily Reports */}
                <Link
                  href="/leader/daily-reports"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-indigo-500/25 bg-indigo-500/5 hover:bg-indigo-500/15 hover:border-indigo-500/40 transition-all group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span className="text-xs font-medium text-foreground group-hover:text-indigo-300 transition-colors truncate">
                      {t("actionDailyReports")}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                    {todaySubmitted}/{totalActiveInterns}
                  </span>
                </Link>

                {/* Shortcut 4: Weekly Evaluation */}
                <Link
                  href="/leader/weekly-evaluation"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/15 hover:border-emerald-500/40 transition-all group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Award className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-medium text-foreground group-hover:text-emerald-300 transition-colors truncate">
                      {t("actionWeeklyEvaluation")}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-md shrink-0">
                    {avgEvalScore}
                  </span>
                </Link>
              </div>
            </div>
          </MetalCard>
        </div>
      </div>
    </div>
  );
}
