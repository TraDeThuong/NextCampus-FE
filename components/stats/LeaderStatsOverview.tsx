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
import Table from "../ui/Table";
import { AssignmentDetail } from "@/types/stats";
import type { AssignmentStatus } from "@/types/task-assignment";
import { Users, CheckCircle2, FileCheck, Award, ShieldAlert } from "lucide-react";

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

  const statusKeyToStatsKey: Record<string, keyof typeof stats.assignments.byStatus> = {
    PENDING_APPROVAL: "pendingApproval",
    TODO: "todo",
    IN_PROGRESS: "inProgress",
    REVIEW: "review",
    DONE: "done",
    BLOCKED: "blocked",
  };

  const selectedStatusTotal = modalConfig.status
    ? stats.assignments.byStatus[statusKeyToStatsKey[modalConfig.status]]
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatsCard
          title={t("activeInterns")}
          value={stats.interns.active}
          subtitle={t("activeInternsSubtitle", { total: stats.interns.total })}
          icon={<Users className="h-6 w-6 text-primary-light" />}
          href="/leader/interns?status=ACTIVE"
          trend={{
            text: t("completedCount", { count: stats.interns.completed }),
            positive: true,
          }}
        />

        <StatsCard
          title={t("pendingSubmissions")}
          value={stats.submissions.pending}
          subtitle={t("approvedSubmissions", { count: stats.submissions.approved })}
          icon={<FileCheck className="h-6 w-6 text-amber-400" />}
          href="/leader/tasks?status=REVIEW"
          trend={{
            text: stats.submissions.pending > 0 ? t("needsApproval") : t("approvalDone"),
            positive: stats.submissions.pending === 0,
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
          value={`${stats.weeklyEvaluations.avgScore}/10`}
          subtitle={t("avgScoreSubtitle", { count: stats.weeklyEvaluations.total })}
          icon={<Award className="h-6 w-6 text-emerald-400" />}
          href="/leader/weekly-evaluation"
          trend={{
            text: t("avgScoreLabel"),
            positive: stats.weeklyEvaluations.avgScore >= 7,
          }}
        />

        <PendingApprovalCard onOpenModal={() => setPendingModalOpen(true)} />
      </div>

      <MetalCard className="p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary-light shrink-0" />
              <span className="metal-text">{t("internProgressTitle")}</span>
            </h3>
            <p className="text-xs text-muted mt-1">{t("internProgressDesc")}</p>
          </div>
        </div>

        <div className="mt-6">
          <Table columns="1.8fr 1.8fr 1.2fr 1.5fr">
            <Table.Header>
              <span>{t("colIntern")}</span>
              <span>{t("colTaskProgress")}</span>
              <span>{t("colAvgScore")}</span>
              <span>{t("colHealthStatus")}</span>
            </Table.Header>

            <Table.Body
              data={internProgress}
              render={(intern) => {
                const total = intern.totalTasks || 1;
                const percent = Math.round((intern.completedTasks / total) * 100);

                return (
                  <Table.Row key={intern.internId}>
                    <div>
                      <p className="font-bold text-foreground text-sm">{intern.internName}</p>
                      <p className="text-xs text-muted">{intern.internEmail}</p>
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
                      {intern.healthStatus === "HEALTHY" && (
                        <span className="inline-flex items-center justify-center text-xs font-semibold leading-none text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
                          {t("healthy")}
                        </span>
                      )}
                      {intern.healthStatus === "WARNING" && (
                        <span className="inline-flex items-center justify-center text-xs font-semibold leading-none text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                          {t("warning", { count: intern.overdueCount })}
                        </span>
                      )}
                      {intern.healthStatus === "DANGER" && (
                        <span className="inline-flex items-center justify-center text-xs font-semibold leading-none text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1.5 rounded-lg">
                          {t("danger", { count: intern.overdueCount })}
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
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary-light" />
            {t("taskStatusTitle")}
          </h3>
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
                {stats.assignments.byStatus[statusKeyToStatsKey[key]] ?? 0}
              </p>
            </button>
          ))}
        </div>
      </MetalCard>
    </div>
  );
}
