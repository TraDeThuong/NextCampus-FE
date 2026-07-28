"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  Circle,
  User,
  Hash,
  CheckCircle2,
  Play,
  AlertTriangle,
  PauseCircle,
  ListTodo,
} from "lucide-react";

import { useInternDetail } from "@/hooks/intern/useInternDetail";
import { useTaskAssignments } from "@/hooks/task-assignment/useTaskAssignments";
import { useDailyReports } from "@/hooks/daily-report/useDailyReports";
import { useWeeklyEvaluations } from "@/hooks/weekly-evaluation/useWeeklyEvaluations";
import { useTaskSubmissions } from "@/hooks/task-submission/useTaskSubmissions";
import type { Intern } from "@/types/intern";
import type { TaskAssignment } from "@/types/task-assignment";
import type { DailyReport } from "@/types/daily-report";
import type { TaskSubmission } from "@/types/task-submission";
import type { WeeklyEvaluation } from "@/types/weekly-evaluation";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import StatsCard from "@/components/stats/StatsCard";
import Table from "@/components/ui/Table";
import InternTasksModal from "../InternTasksModal";

// ─── Status / Priority badge styles ───────────────────────────────────────

const assignmentStatusBadge: Record<string, string> = {
  TODO: "border-sky-400/20 bg-sky-500/10 text-sky-300",
  IN_PROGRESS: "border-blue-400/20 bg-blue-500/10 text-blue-300",
  REVIEW: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  DONE: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  BLOCKED: "border-red-400/20 bg-red-500/10 text-red-300",
  PENDING_APPROVAL: "border-purple-400/20 bg-purple-500/10 text-purple-300",
};

const priorityBadge: Record<string, string> = {
  HIGH: "border-red-400/20 bg-red-500/10 text-red-300",
  MEDIUM: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  LOW: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
};

const internStatusBadge: Record<string, string> = {
  ACTIVE: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  COMPLETED: "border-blue-400/20 bg-blue-500/10 text-blue-300",
  DROPPED: "border-red-400/20 bg-red-500/10 text-red-300",
};

const reviewStatusBadge: Record<string, string> = {
  APPROVED: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  REJECTED: "border-red-400/20 bg-red-500/10 text-red-300",
  PENDING: "border-amber-400/20 bg-amber-500/10 text-amber-300",
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

function endDate(startDate: string, durationMonths: number) {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + durationMonths);
  return d;
}

// ─── Sub-components ───────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-4 last:border-b-0">
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span className="text-slate-500">{icon}</span>
        <span>{label}</span>
      </div>
      <span className="text-sm font-medium text-slate-200">{value}</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function LeaderInternDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data, isLoading, isError } = useInternDetail(id);
  const intern = data?.data;

  const { data: assignData } = useTaskAssignments({
    internId: id,
    limit: 100,
  });
  const assignments = assignData?.data ?? [];

  const { data: reportData } = useDailyReports({
    internId: id,
    sortBy: "createdAt",
    order: "desc",
    limit: 5,
  });
  const reports = reportData?.data ?? [];

  const { data: evalData } = useWeeklyEvaluations({
    internId: id,
    sortBy: "week",
    order: "desc",
  });
  const evaluations = evalData?.data ?? [];

  const { data: subData } = useTaskSubmissions({
    internId: id,
    sortBy: "submittedAt",
    order: "desc",
    limit: 5,
  });
  const submissions = subData?.data ?? [];

  const [showTasksModal, setShowTasksModal] = useState(false);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Error / Not found ──
  if (isError || !intern) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <p className="text-slate-400">Intern not found.</p>
        <button
          onClick={() => router.push("/leader/interns")}
          className="text-sm text-cyan-400 transition hover:text-cyan-300"
        >
          Back to Interns
        </button>
      </div>
    );
  }

  // ── KPI computation ──
  const now = new Date();
  const totalTasks = assignments.length;
  const completedTasks = assignments.filter((a) => a.status === "DONE").length;
  const inProgressTasks = assignments.filter(
    (a) => a.status === "IN_PROGRESS",
  ).length;
  const overdueTasks = assignments.filter(
    (a) => new Date(a.task.deadline) < now && a.status !== "DONE",
  ).length;
  const blockedTasks = assignments.filter(
    (a) => a.status === "BLOCKED",
  ).length;

  // ── Weekly eval averages ──
  const count = evaluations.length || 1;
  const avgCommunication =
    evaluations.reduce((s, e) => s + e.communication, 0) / count;
  const avgAttitude =
    evaluations.reduce((s, e) => s + e.attitude, 0) / count;
  const avgLearning =
    evaluations.reduce((s, e) => s + e.learning, 0) / count;
  const avgCoding =
    evaluations.reduce((s, e) => s + e.coding, 0) / count;
  const avgTotalScore =
    evaluations.reduce((s, e) => s + e.totalScore, 0) / count;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/leader/interns")}
        className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Interns
      </button>

      {/* Header */}
      <InternHeader intern={intern} />

      {/* Personal + Internship info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PersonalInfo intern={intern} />
        <InternshipInfo intern={intern} />
      </div>

      {/* Discord */}
      {intern.discordUsername && <DiscordCard intern={intern} />}

      {/* Task KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatsCard
          title="Total Tasks"
          value={totalTasks}
          icon={<ListTodo className="h-5 w-5 text-sky-400" />}
        />
        <StatsCard
          title="Completed"
          value={completedTasks}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        />
        <StatsCard
          title="In Progress"
          value={inProgressTasks}
          icon={<Play className="h-5 w-5 text-blue-400" />}
        />
        <StatsCard
          title="Overdue"
          value={overdueTasks}
          icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
        />
        <StatsCard
          title="Blocked"
          value={blockedTasks}
          icon={<PauseCircle className="h-5 w-5 text-amber-400" />}
        />
      </div>

      {/* Task List Table */}
      <TaskListTable
        assignments={assignments}
        onTaskClick={() => setShowTasksModal(true)}
      />

      {/* Daily Reports + Weekly Evaluations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DailyReportsSection reports={reports} />
        <EvaluationSummary
          evaluations={evaluations}
          avgCommunication={avgCommunication}
          avgAttitude={avgAttitude}
          avgLearning={avgLearning}
          avgCoding={avgCoding}
          avgTotalScore={avgTotalScore}
        />
      </div>

      {/* Recent Submissions */}
      <SubmissionsSection submissions={submissions} />

      {/* Tasks Modal */}
      {showTasksModal && (
        <InternTasksModal
          intern={intern}
          onClose={() => setShowTasksModal(false)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Header
// ═══════════════════════════════════════════════════════════════════════════

function InternHeader({ intern }: { intern: Intern }) {
  const joined = formatShortDate(intern.createdAt);

  return (
    <MetalCard className="px-6 py-6">
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 text-2xl font-bold text-white shadow-lg">
          {intern.fullName?.[0] ?? "?"}
        </div>

        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{intern.fullName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {intern.user.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Joined {joined}
            </span>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            internStatusBadge[intern.status] ?? ""
          }`}
        >
          <Circle className="h-2 w-2 fill-current" />
          {intern.status}
        </span>
      </div>
    </MetalCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Personal Info Card
// ═══════════════════════════════════════════════════════════════════════════

function PersonalInfo({ intern }: { intern: Intern }) {
  return (
    <MetalCard className="px-6 py-5">
      <h2 className="metal-text mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
        Personal Information
      </h2>
      <InfoRow
        icon={<Mail className="h-4 w-4" />}
        label="Email"
        value={intern.user.email}
      />
      <InfoRow
        icon={<Phone className="h-4 w-4" />}
        label="Phone"
        value={intern.phone}
      />
      <InfoRow
        icon={<User className="h-4 w-4" />}
        label="Account Status"
        value={
          <span
            className={
              intern.user.isActive ? "text-emerald-400" : "text-red-400"
            }
          >
            {intern.user.isActive ? "Active" : "Inactive"}
          </span>
        }
      />
    </MetalCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Internship Info Card
// ═══════════════════════════════════════════════════════════════════════════

function InternshipInfo({ intern }: { intern: Intern }) {
  const periodStart = formatDate(intern.startDate);
  const periodEnd = formatDate(
    endDate(intern.startDate, intern.duration).toISOString(),
  );

  return (
    <MetalCard className="px-6 py-5">
      <h2 className="metal-text mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
        Internship Information
      </h2>
      <InfoRow
        icon={<Building2 className="h-4 w-4" />}
        label="Department"
        value={
          intern.department?.name ?? (
            <span className="italic text-slate-500">Not set</span>
          )
        }
      />
      <InfoRow
        icon={<Briefcase className="h-4 w-4" />}
        label="Position"
        value={
          intern.position?.name ?? (
            <span className="italic text-slate-500">Not set</span>
          )
        }
      />
      <InfoRow
        icon={<User className="h-4 w-4" />}
        label="Leader"
        value={
          intern.leader?.fullName ?? (
            <span className="italic text-slate-500">Not assigned</span>
          )
        }
      />
      <InfoRow
        icon={<Calendar className="h-4 w-4" />}
        label="Period"
        value={`${periodStart} → ${periodEnd}`}
      />
      <InfoRow
        icon={<Clock className="h-4 w-4" />}
        label="Duration"
        value={`${intern.duration} month${intern.duration > 1 ? "s" : ""}`}
      />
    </MetalCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Discord Card
// ═══════════════════════════════════════════════════════════════════════════

function DiscordCard({ intern }: { intern: Intern }) {
  return (
    <MetalCard className="px-6 py-5">
      <h2 className="metal-text mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
        Discord
      </h2>
      <InfoRow
        icon={<Hash className="h-4 w-4" />}
        label="Username"
        value={intern.discordUsername}
      />
      <InfoRow
        icon={<CheckCircle2 className="h-4 w-4" />}
        label="Role Granted"
        value={
          <span
            className={
              intern.discordRoleGranted ? "text-emerald-400" : "text-slate-500"
            }
          >
            {intern.discordRoleGranted ? "Yes" : "No"}
          </span>
        }
      />
    </MetalCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Task List Table
// ═══════════════════════════════════════════════════════════════════════════

function TaskListTable({
  assignments,
  onTaskClick,
}: {
  assignments: TaskAssignment[];
  onTaskClick: () => void;
}) {
  const tableColumns = "80px minmax(0,2fr) minmax(0,1fr) 90px 110px";

  return (
    <MetalCard className="px-6 py-5">
      <h2 className="metal-text mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
        Assigned Tasks
      </h2>

      {assignments.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No tasks assigned yet.
        </p>
      ) : (
        <Table columns={tableColumns}>
          <Table.Header>
            <Table.Row>
              <div>Code</div>
              <div>Title</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Deadline</div>
            </Table.Row>
          </Table.Header>
          <Table.Body
            data={assignments}
            render={(a) => (
              <Table.Row key={a.id}>
                <span
                  className="cursor-pointer font-mono text-xs text-cyan-400 hover:text-cyan-300"
                  onClick={onTaskClick}
                >
                  {a.task.code ?? "—"}
                </span>
                <span
                  className="cursor-pointer truncate text-sm text-slate-200 hover:text-white"
                  onClick={onTaskClick}
                >
                  {a.task.title}
                </span>
                <span
                  className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                    assignmentStatusBadge[a.status] ?? ""
                  }`}
                >
                  {a.status.replace("_", " ")}
                </span>
                <span
                  className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                    priorityBadge[a.task.priority] ?? ""
                  }`}
                >
                  {a.task.priority}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(a.task.deadline)}
                </span>
              </Table.Row>
            )}
          />
        </Table>
      )}
    </MetalCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Recent Daily Reports
// ═══════════════════════════════════════════════════════════════════════════

function DailyReportsSection({ reports }: { reports: DailyReport[] }) {
  return (
    <MetalCard className="px-6 py-5">
      <h2 className="metal-text mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
        Recent Daily Reports
      </h2>
      {reports.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No daily reports yet.
        </p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-white/5 bg-white/5 px-4 py-3"
            >
              <p className="text-xs text-slate-500">
                {formatDate(r.createdAt)}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-300">
                {r.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </MetalCard>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Weekly Evaluation Summary
// ═══════════════════════════════════════════════════════════════════════════

function EvaluationSummary({
  evaluations,
  avgCommunication,
  avgAttitude,
  avgLearning,
  avgCoding,
  avgTotalScore,
}: {
  evaluations: WeeklyEvaluation[];
  avgCommunication: number;
  avgAttitude: number;
  avgLearning: number;
  avgCoding: number;
  avgTotalScore: number;
}) {
  return (
    <MetalCard className="px-6 py-5">
      <h2 className="metal-text mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
        Weekly Evaluations
      </h2>
      {evaluations.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No evaluations yet.
        </p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-3">
            <ScorePill label="Comm." value={avgCommunication} />
            <ScorePill label="Attitude" value={avgAttitude} />
            <ScorePill label="Learning" value={avgLearning} />
            <ScorePill label="Coding" value={avgCoding} />
            <ScorePill label="Total" value={avgTotalScore} highlight />
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto">
            {evaluations.slice(0, 5).map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs"
              >
                <span className="font-semibold text-slate-300">
                  Week {e.week}
                </span>
                <div className="flex gap-3 text-slate-400">
                  <span>C:{e.communication}</span>
                  <span>A:{e.attitude}</span>
                  <span>L:{e.learning}</span>
                  <span>C:{e.coding}</span>
                </div>
                <span className="font-semibold text-cyan-400">
                  {e.totalScore.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </MetalCard>
  );
}

function ScorePill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
        highlight
          ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
          : "border-white/10 bg-white/5 text-slate-300"
      }`}
    >
      <span className="text-slate-500">{label}</span>
      <span>{value.toFixed(1)}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Recent Submissions
// ═══════════════════════════════════════════════════════════════════════════

function SubmissionsSection({
  submissions,
}: {
  submissions: TaskSubmission[];
}) {
  const tableColumns = "60px minmax(0,1fr) 100px 110px";

  return (
    <MetalCard className="px-6 py-5">
      <h2 className="metal-text mb-4 text-sm font-semibold uppercase tracking-[0.18em]">
        Recent Submissions
      </h2>
      {submissions.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No submissions yet.
        </p>
      ) : (
        <Table columns={tableColumns}>
          <Table.Header>
            <Table.Row>
              <div>#</div>
              <div>Task</div>
              <div>Status</div>
              <div>Date</div>
            </Table.Row>
          </Table.Header>
          <Table.Body
            data={submissions}
            render={(s) => (
              <Table.Row key={s.id}>
                <span className="text-sm font-semibold text-slate-400">
                  #{s.attempt}
                </span>
                <div className="truncate">
                  <span className="text-sm text-slate-200">
                    {s.assignment.task.title}
                  </span>
                </div>
                <span
                  className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                    reviewStatusBadge[s.reviewStatus] ?? ""
                  }`}
                >
                  {s.reviewStatus}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(s.submittedAt)}
                </span>
              </Table.Row>
            )}
          />
        </Table>
      )}
    </MetalCard>
  );
}
