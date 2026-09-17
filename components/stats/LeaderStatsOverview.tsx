"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLeaderStats } from "@/hooks/stats/useLeaderStats";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import { useAuth } from "@/hooks/auth/useAuth";
import StatsCard from "./StatsCard";
import Spinner from "../ui/Spinner";
import MetalCard from "../ui/MetalCard";
import TaskAssignmentModal from "./TaskAssignmentModal";
import PendingApprovalCard from "./PendingApprovalCard";
import PendingApprovalModal from "./PendingApprovalModal";
import Image from "next/image";
import Table from "../ui/Table";
import type { AssignmentDetail } from "@/types/stats";
import type { AssignmentStatus } from "@/types/task-assignment";
import { Users, CheckCircle2, FileCheck, Award, ShieldAlert, Clock, FileText } from "lucide-react";

const STATUS_MODAL_PAGE_SIZE = 10;

export default function LeaderStatsOverview() {
  const t = useTranslations("leader.dashboard");
  const { data: response, isLoading, isError, refetch } = useLeaderStats();
  const { state: { user } } = useAuth();

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
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !response?.success) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/10 p-6 text-center text-danger space-y-3">
        <p className="font-semibold">{t("loadError")}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-danger text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
        >
          {t("retry")}
        </button>
      </div>
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
  const todayRate =
    stats.dailyReportRate?.todayRate ??
    stats.dailyReportRate?.percentage ??
    (totalActiveInterns > 0 ? Math.round((todaySubmitted / totalActiveInterns) * 100) : 0);
  const weeklyRate = stats.dailyReportRate?.weeklyRate ?? stats.dailyReportRate?.weeklySubmissionRate ?? 0;

  const reportRateRisk: "HEALTHY" | "WARNING" | "DANGER" =
    todayRate >= 80 ? "HEALTHY" : todayRate >= 50 ? "WARNING" : "DANGER";

  const pendingSubmissions =
    (typeof stats.submissions === "object" && "pendingSubmissionsCount" in stats.submissions
      ? stats.submissions.pendingSubmissionsCount
      : stats.submissions?.pending) ?? 0;

  const approvedSubmissions =
    (typeof stats.submissions === "object" && "approvedSubmissionsCount" in stats.submissions
      ? stats.submissions.approvedSubmissionsCount
      : stats.submissions?.approved) ?? 0;

  const activeInternsCount =
    ("activeInterns" in stats.interns ? stats.interns.activeInterns : stats.interns.active) ?? 0;
  const totalInternsCount =
    ("totalInterns" in stats.interns ? stats.interns.totalInterns : stats.interns.total) ?? 0;
  const completedInternsCount =
    ("completed" in stats.interns ? stats.interns.completed : 0) ?? 0;

  const avgEvalScore = stats.evaluations?.avgScore ?? stats.weeklyEvaluations?.avgScore ?? 0;
  const totalEvals = stats.evaluations?.totalEvaluations ?? stats.weeklyEvaluations?.total ?? 0;

  const statusAssignments: AssignmentDetail[] =
    statusAssignmentsQuery.data?.data.map((assignment) => ({
      id: assignment.id,
      status: assignment.status,
      taskTitle: assignment.task.title,
      taskPriority: assignment.task.priority,
      taskDeadline: assignment.task.deadline,
      isOverdue:
        assignment.status !== "DONE" &&
        Boolean(
          assignment.task.deadline &&
          new Date(assignment.task.deadline) < new Date(),
        ),
      internName: assignment.intern.fullName ?? assignment.intern.user.fullName,
      internEmail: assignment.intern.user.email,
      leaderName: assignment.assigner.fullName,
    })) ?? [];

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

  const statusColors: Record<string, { border: string; bg: string; hoverBg: string; text: string; textBold: string }> = {
    PENDING_APPROVAL: {
      border: "border-purple-500/20", bg: "bg-purple-500/10", hoverBg: "hover:bg-purple-500/20",
      text: "text-purple-400", textBold: "text-purple-300",
    },
    TODO: {
      border: "border-white/10", bg: "bg-white/5", hoverBg: "hover:bg-white/10",
      text: "text-muted", textBold: "text-foreground",
    },
    IN_PROGRESS: {
      border: "border-cyan-500/20", bg: "bg-cyan-500/10", hoverBg: "hover:bg-cyan-500/20",
      text: "text-cyan-400", textBold: "text-cyan-300",
    },
    DONE: {
      border: "border-emerald-500/20", bg: "bg-emerald-500/10", hoverBg: "hover:bg-emerald-500/20",
      text: "text-emerald-400", textBold: "text-emerald-300",
    },
    BLOCKED: {
      border: "border-rose-500/20", bg: "bg-rose-500/10", hoverBg: "hover:bg-rose-500/20",
      text: "text-rose-400", textBold: "text-rose-300",
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

  const selectedStatusTotal = modalConfig.status
    ? (stats.assignments?.byStatus as Record<string, number> | undefined)?.[statusKeyToStatsKey[modalConfig.status]] ??
      stats.tasksByStatus?.[statusKeyToStatsKey[modalConfig.status]] ??
      stats.tasksByStatus?.[modalConfig.status] ??
      0
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

  return (
    <div className="space-y-8 animate-fadeIn">
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
        totalItems={modalConfig.status ? statusMeta?.total ?? selectedStatusTotal : selectedStatusTotal}
        onPageChange={
          modalConfig.status
            ? (page) => setModalConfig((current) => ({ ...current, page }))
            : undefined
        }
      />

      <PendingApprovalModal
        isOpen={pendingModalOpen}
        onClose={() => setPendingModalOpen(false)}
      />

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground metal-text">
            {t("title")}
          </h1>
          <p className="text-sm text-muted">{t("description")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
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
          trend={{
            text: activeWorkloadDays > 10 ? t("riskLevelDanger") : activeWorkloadDays > 7 ? t("riskLevelWarning") : t("riskLevelHealthy"),
            positive: activeWorkloadDays <= 7,
          }}
        />

        <StatsCard
          title={t("dailyReportRate")}
          value={`${todayRate}%`}
          subtitle={`Hôm nay: ${todaySubmitted}/${totalActiveInterns} • Tuần: ${weeklyRate}%`}
          icon={<FileText className="h-6 w-6 text-indigo-400" />}
          href="/leader/daily-reports"
          trend={{
            text: reportRateRisk === "HEALTHY" ? t("riskLevelHealthy") : reportRateRisk === "WARNING" ? t("riskLevelWarning") : t("riskLevelDanger"),
            positive: reportRateRisk === "HEALTHY",
          }}
        />

        <StatsCard
          title={t("pendingSubmissions")}
          value={pendingSubmissions}
          subtitle={t("approvedSubmissions", { count: approvedSubmissions })}
          icon={<FileCheck className="h-6 w-6 text-amber-400" />}
          href="/leader/tasks?status=REVIEW"
          trend={{
            text: pendingSubmissions > 0 ? t("needsApproval") : t("approvalDone"),
            positive: pendingSubmissions === 0,
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

        <PendingApprovalCard onOpenModal={() => setPendingModalOpen(true)} />
      </div>

      <MetalCard className="p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary-light shrink-0" />
              <h3 className="text-xl font-bold text-foreground">
                <span className="metal-text">{t("internProgressTitle")}</span>
              </h3>
            </div>
            <p className="text-xs text-muted mt-1">{t("internProgressDesc")}</p>
          </div>
        </div>

        <div className="mt-6">
          <Table columns="2fr 1.8fr 1fr 1.2fr 1.2fr">
            <Table.Header>
              <span>{t("colIntern")}</span>
              <span>{t("colTaskProgress")}</span>
              <span>{t("colAvgScore")}</span>
              <span>{t("colTodayReport")}</span>
              <span>{t("colHealthStatus")}</span>
            </Table.Header>

            <Table.Body
              data={internProgress}
              render={(intern) => {
                const internName = intern.fullName || intern.internName || "Thực tập sinh";
                const internEmail = intern.email || intern.internEmail || "";
                const overdueCount = intern.overdueTasks ?? intern.overdueCount ?? 0;
                const total = intern.totalTasks || 1;
                const percent = intern.completionRate ?? Math.round((intern.completedTasks / total) * 100);
                const isTodayReport = intern.lastReportDate ? new Date(intern.lastReportDate).toDateString() === new Date().toDateString() : false;

                return (
                  <Table.Row key={intern.internId}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-foreground overflow-hidden">
                        {intern.avatarUrl ? (
                          <Image src={intern.avatarUrl} alt={internName} width={36} height={36} className="h-full w-full object-cover" unoptimized />
                        ) : (
                          <span>{internName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-sm truncate">{internName}</p>
                        <p className="text-xs text-muted truncate">{internEmail}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-foreground font-semibold">
                          {t("taskCount", { completed: intern.completedTasks, total: intern.totalTasks })}
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
      </MetalCard>

      <MetalCard className="p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary-light shrink-0" />
            <h3 className="text-lg font-semibold text-foreground">
              {t("taskStatusTitle")}
            </h3>
          </div>
          <span className="text-xs text-muted">{t("taskStatusSubtitle")}</span>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center">
          {Object.entries(statusColors).map(([key, color]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleOpenStatusModal(key as AssignmentStatus)}
              className={`p-3 rounded-xl border ${color.border} ${color.bg} ${color.hoverBg} transition-all cursor-pointer`}
            >
              <p className={`text-xs ${color.text} font-medium`}>
                {statusLabels[key]}
              </p>
              <p className={`text-xl font-bold ${color.textBold} mt-1`}>
                {(stats.assignments?.byStatus as Record<string, number> | undefined)?.[statusKeyToStatsKey[key]] ??
                  stats.tasksByStatus?.[statusKeyToStatsKey[key]] ??
                  stats.tasksByStatus?.[key] ??
                  0}
              </p>
            </button>
          ))}
        </div>
      </MetalCard>
    </div>
  );
}
