"use client";

import { useState } from "react";
import Link from "next/link";
import { useLeaderStats } from "@/hooks/stats/useLeaderStats";
import StatsCard from "./StatsCard";
import Spinner from "../ui/Spinner";
import MetalCard from "../ui/MetalCard";
import TaskAssignmentModal from "./TaskAssignmentModal";
import PendingApprovalCard from "./PendingApprovalCard";
import PendingApprovalModal from "./PendingApprovalModal";
import Table from "../ui/Table";
import { AssignmentDetail } from "@/types/stats";
import {
  Users,
  CheckCircle2,
  FileCheck,
  Award,
  ShieldAlert,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

export default function LeaderStatsOverview() {
  const { data: response, isLoading, isError, refetch } = useLeaderStats();

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    assignments: AssignmentDetail[];
  }>({
    isOpen: false,
    title: "",
    assignments: [],
  });

  const [pendingModalOpen, setPendingModalOpen] = useState(false);

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
        <p className="font-semibold">Failed to load Leader statistics. Please check your network connection.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-danger text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = response.data;
  const allAssignments = stats.recentAssignments ?? [];
  const rawOverdue = stats.overdueAssignments ?? [];
  const overdueAssignments = rawOverdue.filter((a) => a.isOverdue);
  const internProgress = stats.internProgress ?? [];

  const handleOpenStatusModal = (statusKey: string, statusTitle: string) => {
    const filtered = allAssignments.filter((a) => a.status === statusKey);
    setModalConfig({
      isOpen: true,
      title: `Team Task Details — Status: ${statusTitle}`,
      assignments: filtered,
    });
  };

  const handleOpenOverdueModal = () => {
    setModalConfig({
      isOpen: true,
      title: `Team Overdue Task List (${overdueAssignments.length})`,
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

      {/* Modal Pending Approval */}
      <PendingApprovalModal
        isOpen={pendingModalOpen}
        onClose={() => setPendingModalOpen(false)}
      />

      {/* Header Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground metal-text">
            Leader Team Operations Center
          </h1>
          <p className="text-sm text-muted">
            Directly manage interns, approve submissions & monitor team work progress
          </p>
        </div>
      </div>

      {/* Action-Oriented KPI Cards (Chỉ 5 chỉ số có giá trị hành động) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Managed Interns"
          value={stats.interns.active}
          subtitle={`Total: ${stats.interns.total} interns`}
          icon={<Users className="h-6 w-6 text-primary-light" />}
          href="/leader/interns?status=ACTIVE"
          trend={{
            text: `${stats.interns.completed} completed`,
            positive: true,
          }}
        />

        <StatsCard
          title="Pending Submissions"
          value={stats.submissions.pending}
          subtitle={`${stats.submissions.approved} approved`}
          icon={<FileCheck className="h-6 w-6 text-amber-400" />}
          href="/leader/review?status=PENDING"
          trend={{
            text: stats.submissions.pending > 0 ? "Needs review" : "Review completed",
            positive: stats.submissions.pending === 0,
          }}
        />

        <StatsCard
          title="Overdue Tasks in Team"
          value={overdueAssignments.length}
          subtitle="Tasks past deadline"
          icon={<ShieldAlert className="h-6 w-6 text-rose-400" />}
          onCardClick={handleOpenOverdueModal}
          trend={{
            text: overdueAssignments.length > 0 ? "Remind interns" : "On schedule",
            positive: overdueAssignments.length === 0,
          }}
        />

        <StatsCard
          title="Team Average Score"
          value={`${stats.weeklyEvaluations.avgScore}/10`}
          subtitle={`${stats.weeklyEvaluations.total} evaluations`}
          icon={<Award className="h-6 w-6 text-emerald-400" />}
          href="/leader/weekly-evaluation"
          trend={{
            text: "Team average score",
            positive: stats.weeklyEvaluations.avgScore >= 7,
          }}
        />

        <PendingApprovalCard onOpenModal={() => setPendingModalOpen(true)} />

        {/* Action Item 1: Pending Submissions */}
        <Link
          href="/leader/review?status=PENDING"
          className="group relative overflow-hidden rounded-[24px] border border-amber-500/30 bg-amber-500/10 p-5 hover:border-amber-500/60 hover:bg-amber-500/15 transition-all shadow-glass"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center justify-center text-[11px] font-bold uppercase tracking-wider leading-none text-amber-400 bg-amber-500/20 px-2.5 py-1.5 rounded-full border border-amber-500/30">
                Action required
              </span>
              <h3 className="text-2xl font-black text-amber-300 mt-2">
                {stats.submissions.pending} Pending Submissions
              </h3>
              <p className="text-xs text-muted mt-1">
                Submissions from interns waiting for Leader to score & give feedback
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 group-hover:scale-110 transition-transform">
              <FileCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:underline">
            Go to grading page <ExternalLink className="h-3.5 w-3.5" />
          </div>
        </Link>

        {/* Action Item 2: Overdue Tasks Alert */}
        <button
          type="button"
          onClick={handleOpenOverdueModal}
          className="group text-left relative overflow-hidden rounded-[24px] border border-rose-500/30 bg-rose-500/10 p-5 hover:border-rose-500/60 hover:bg-rose-500/15 transition-all shadow-glass cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center justify-center text-[11px] font-bold uppercase tracking-wider leading-none text-rose-400 bg-rose-500/20 px-2.5 py-1.5 rounded-full border border-rose-500/30">
                Progress warning
              </span>
              <h3 className="text-2xl font-black text-rose-300 mt-2">
                {overdueAssignments.length} Overdue Tasks
              </h3>
              <p className="text-xs text-muted mt-1">
                Tasks assigned to interns have passed their deadline and are not yet completed
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-300 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-rose-400 group-hover:underline">
            View overdue tasks ↗
          </div>
        </button>

        {/* Action Item 3: Weekly Evaluation Action */}
        <Link
          href="/leader/weekly-evaluation"
          className="group relative overflow-hidden rounded-[24px] border border-indigo-500/30 bg-indigo-500/10 p-5 hover:border-indigo-500/60 hover:bg-indigo-500/15 transition-all shadow-glass"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center justify-center text-[11px] font-bold uppercase tracking-wider leading-none text-indigo-400 bg-indigo-500/20 px-2.5 py-1.5 rounded-full border border-indigo-500/30">
                Periodic evaluation
              </span>
              <h3 className="text-2xl font-black text-indigo-300 mt-2">
                Grade Weekly Evaluation
              </h3>
              <p className="text-xs text-muted mt-1">
                Current team average score: <strong className="text-foreground">{stats.weeklyEvaluations.avgScore}/10</strong>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 group-hover:scale-110 transition-transform">
              <Award className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:underline">
            Go to evaluation page <ExternalLink className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

      {/* Intern Progress Table in Team */}
      <MetalCard className="p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary-light shrink-0" />
              <span className="metal-text">Detailed Intern Progress in Team</span>
            </h3>
            <p className="text-xs text-muted mt-1">
              Monitor work completion progress and average scores of each individual
            </p>
          </div>
          <Link
            href="/leader/interns"
            className="text-xs font-semibold text-primary-light hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary-light/30 bg-primary-light/10"
          >
            Manage Interns <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-6">
          <Table columns="2.5fr 1.5fr 1.2fr 1.5fr">
            <Table.Header>
              <span>Intern</span>
              <span>Task Progress</span>
              <span>Avg Score</span>
              <span>Progress Status</span>
            </Table.Header>

            <Table.Body
              data={internProgress}
              render={(intern) => {
                const total = intern.totalTasks || 1;
                const percent = Math.round((intern.completedTasks / total) * 100);

                return (
                  <Table.Row key={intern.internId}>
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        {intern.internName}
                      </p>
                      <p className="text-xs text-muted">{intern.internEmail}</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-foreground font-semibold">
                          {intern.completedTasks}/{intern.totalTasks} Task
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
                        {intern.avgScore > 0 ? `${intern.avgScore}/10` : "Not scored"}
                      </span>
                    </div>

                    <div>
                      {intern.healthStatus === "HEALTHY" && (
                        <span className="inline-flex items-center justify-center text-xs font-semibold leading-none text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
                          On track
                        </span>
                      )}

                      {intern.healthStatus === "WARNING" && (
                        <span className="inline-flex items-center justify-center text-xs font-semibold leading-none text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                          Needs attention ({intern.overdueCount} overdue)
                        </span>
                      )}

                      {intern.healthStatus === "DANGER" && (
                        <span className="inline-flex items-center justify-center text-xs font-semibold leading-none text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1.5 rounded-lg">
                          At risk ({intern.overdueCount} overdue)
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

      {/* Task Status Clickable Breakdown */}
      <MetalCard className="p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary-light" />
            Team Task Status Distribution
          </h3>
          <span className="text-xs text-muted">Click each row to view task list</span>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <button
            type="button"
            onClick={() => handleOpenStatusModal("PENDING_APPROVAL", "Pending Approval")}
            className="p-3 rounded-xl border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 transition-all cursor-pointer"
          >
            <p className="text-xs text-purple-400 font-medium">Pending</p>
            <p className="text-xl font-bold text-purple-300 mt-1">
              {stats.assignments.byStatus.pendingApproval}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenStatusModal("TODO", "To Do")}
            className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
          >
            <p className="text-xs text-muted font-medium">To Do</p>
            <p className="text-xl font-bold text-foreground mt-1">
              {stats.assignments.byStatus.todo}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenStatusModal("IN_PROGRESS", "In Progress")}
            className="p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all cursor-pointer"
          >
            <p className="text-xs text-cyan-400 font-medium">In Progress</p>
            <p className="text-xl font-bold text-cyan-300 mt-1">
              {stats.assignments.byStatus.inProgress}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenStatusModal("REVIEW", "Pending Review")}
            className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <p className="text-xs text-amber-400 font-medium">Pending</p>
            <p className="text-xl font-bold text-amber-300 mt-1">
              {stats.assignments.byStatus.review}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenStatusModal("DONE", "Done")}
            className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            <p className="text-xs text-emerald-400 font-medium">Done</p>
            <p className="text-xl font-bold text-emerald-300 mt-1">
              {stats.assignments.byStatus.done}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenStatusModal("BLOCKED", "Blocked")}
            className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            <p className="text-xs text-rose-400 font-medium">Blocked</p>
            <p className="text-xl font-bold text-rose-300 mt-1">
              {stats.assignments.byStatus.blocked}
            </p>
          </button>
        </div>
      </MetalCard>
    </div>
  );
}
