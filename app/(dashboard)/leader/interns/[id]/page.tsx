"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
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
  CheckCircle2,
  Play,
  AlertTriangle,
  PauseCircle,
  ListTodo,
  Layers,
  XCircle,
  ShieldCheck,
  ShieldAlert,
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
import InternshipSummaryExportButton from "@/components/pdf/InternshipSummaryExportButton";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const assignmentStatusBadge: Record<string, string> = {
  TODO: "border-sky-400/30 bg-sky-500/10 text-sky-400",
  IN_PROGRESS: "border-blue-400/30 bg-blue-500/10 text-blue-400",
  REVIEW: "border-amber-400/30 bg-amber-500/10 text-amber-400",
  DONE: "border-emerald-400/30 bg-emerald-500/10 text-emerald-400",
  BLOCKED: "border-rose-400/30 bg-rose-500/10 text-rose-400",
  PENDING_APPROVAL: "border-purple-400/30 bg-purple-500/10 text-purple-400",
};

const priorityBadge: Record<string, string> = {
  HIGH: "border-rose-400/30 bg-rose-500/10 text-rose-400",
  MEDIUM: "border-amber-400/30 bg-amber-500/10 text-amber-400",
  LOW: "border-emerald-400/30 bg-emerald-500/10 text-emerald-400",
};

const internStatusBadge: Record<string, string> = {
  ACTIVE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  COMPLETED: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  DROPPED: "border-rose-500/30 bg-rose-500/10 text-rose-400",
};

const reviewStatusBadge: Record<string, string> = {
  APPROVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  REJECTED: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

function formatDate(dateStr?: string | null, locale = "vi") {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr?: string | null, locale = "vi") {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-GB", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function endDate(startDate: string, durationMonths: number) {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + durationMonths);
  return d;
}

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "data" in data && Array.isArray((data as { data: unknown }).data)) {
    return (data as { data: T[] }).data;
  }
  return [];
}

export default function LeaderInternDetailPage() {
  return (
    <ProtectedRoute requiredPermissions={["INTERN_READ"]}>
      <LeaderInternDetailContent />
    </ProtectedRoute>
  );
}

function LeaderInternDetailContent() {
  const t = useTranslations("leader.interns");
  const td = useTranslations("leader.interns.detail");
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data, isLoading, isError, refetch } = useInternDetail(id);
  const intern = data?.data;

  const { data: assignData } = useTaskAssignments({ internId: id, limit: 100 }, Boolean(intern?.id));
  const assignments = extractArray<TaskAssignment>(assignData?.data);

  const { data: reportData } = useDailyReports({ internId: id, sortBy: "createdAt", order: "desc", limit: 5 });
  const reports = extractArray<DailyReport>(reportData?.data);

  const { data: evalData } = useWeeklyEvaluations({ internId: id, sortBy: "week", order: "desc" });
  const evaluations = extractArray<WeeklyEvaluation>(evalData?.data);

  const { data: subData } = useTaskSubmissions({ internId: id, sortBy: "submittedAt", order: "desc", limit: 5 });
  const submissions = extractArray<TaskSubmission>(subData?.data);

  const [showTasksModal, setShowTasksModal] = useState(false);

  if (isLoading) {
    return (
      <MetalCard className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </MetalCard>
    );
  }

  if (isError || !intern) {
    return (
      <MetalCard className="flex flex-col items-center justify-center gap-4 py-24 text-center px-4">
        <div className="rounded-2xl bg-rose-500/10 p-4 border border-rose-500/20 shadow-inner">
          <XCircle className="h-8 w-8 text-rose-400" />
        </div>
        <p className="text-muted font-medium">{td("notFound")}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20 active:scale-95"
          >
            {t("tasksModalFetchError")}
          </button>
          <button
            type="button"
            onClick={() => router.push("/leader/interns")}
            className="group flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground transition-all duration-300 hover:bg-card hover:text-cyan-400 hover:border-cyan-500/50 active:scale-95 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
            {td("backToInterns")}
          </button>
        </div>
      </MetalCard>
    );
  }

  const now = new Date();
  const totalTasks = assignments.length;
  const completedTasks = assignments.filter((a) => a.status === "DONE").length;
  const inProgressTasks = assignments.filter((a) => a.status === "IN_PROGRESS").length;
  const overdueTasks = assignments.filter((a) => new Date(a.task.deadline) < now && a.status !== "DONE").length;
  const blockedTasks = assignments.filter((a) => a.status === "BLOCKED").length;

  const count = evaluations.length || 1;
  const avgCommunication = evaluations.reduce((s, e) => s + e.communication, 0) / count;
  const avgAttitude = evaluations.reduce((s, e) => s + e.attitude, 0) / count;
  const avgLearning = evaluations.reduce((s, e) => s + e.learning, 0) / count;
  const avgCoding = evaluations.reduce((s, e) => s + e.coding, 0) / count;
  const avgTotalScore = evaluations.reduce((s, e) => s + e.totalScore, 0) / count;

  const statusLabels: Record<string, string> = {
    ACTIVE: t("statusActive"),
    COMPLETED: t("statusCompleted"),
    DROPPED: t("statusDropped"),
  };

  return (
    <div className="mx-auto w-full space-y-6">
      {/* Top Back Action */}
      <div>
        <button
          type="button"
          onClick={() => router.push("/leader/interns")}
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-all py-2 px-3.5 rounded-xl border border-border/60 dark:border-white/10 bg-card/60 hover:bg-card active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-500/50 shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
          <span>{td("backToInterns")}</span>
        </button>
      </div>

      {/* Header Banner */}
      <InternHeader intern={intern} statusLabels={statusLabels} />

      {/* KPI Stat Cards (Adhering to Rule 49-51: mobile 2-col, rotate-6/scale-110 micro-interaction, odd count headline KPI) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5 md:gap-5">
        <StatsCard
          className="col-span-2 md:col-span-1"
          title={td("totalTasks")}
          value={totalTasks}
          icon={<ListTodo className="h-5 w-5 sm:h-6 sm:w-6 text-sky-400" />}
        />
        <StatsCard
          title={t("completed")}
          value={completedTasks}
          icon={<CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />}
        />
        <StatsCard
          title={td("inProgress")}
          value={inProgressTasks}
          icon={<Play className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />}
        />
        <StatsCard
          title={td("overdue")}
          value={overdueTasks}
          icon={<AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-400" />}
        />
        <StatsCard
          title={td("blocked")}
          value={blockedTasks}
          icon={<PauseCircle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />}
        />
      </div>

      {/* Main Content Grid: Personal Info & Program Placement */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PersonalInfo intern={intern} />
        <InternshipInfo intern={intern} />
      </div>

      {/* Assigned Tasks Section */}
      <TaskListTable
        assignments={assignments}
        onTaskClick={() => setShowTasksModal(true)}
      />

      {/* Daily Reports & Evaluations Grid */}
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

      {/* Submissions Section */}
      <SubmissionsSection submissions={submissions} />

      {/* Intern Tasks Detail Modal (Portal + Rule 46) */}
      {showTasksModal && (
        <InternTasksModal
          intern={intern}
          onClose={() => setShowTasksModal(false)}
        />
      )}
    </div>
  );
}

/* ─── Header Banner ────────────────────────────────────────── */

function InternHeader({
  intern,
  statusLabels,
}: {
  intern: Intern;
  statusLabels: Record<string, string>;
}) {
  const td = useTranslations("leader.interns.detail");
  const locale = useLocale();
  const joined = formatShortDate(intern.createdAt, locale);

  return (
    <MetalCard>
      <div className="p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar with initial (No green dot) */}
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 font-bold text-2xl sm:text-3xl text-white shadow-xl border border-white/10 ring-1 ring-white/10 overflow-hidden">
              {intern.fullName ? intern.fullName.charAt(0).toUpperCase() : "?"}
            </div>

            <div className="space-y-1 min-w-0">
              {/* Rule 44: Icon + Heading in flex container, no direct flex on h1 */}
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground truncate">
                  {intern.fullName}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted">
                <span className="flex items-center gap-1.5 hover:text-foreground transition-colors truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {intern.user.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {td("joined", { date: joined })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <InternshipSummaryExportButton internId={intern.id} />
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold tracking-wide uppercase transition shadow-sm ${
                internStatusBadge[intern.status] ?? "border-border text-muted"
              }`}
            >
              <Circle className="h-2 w-2 fill-current" />
              {statusLabels[intern.status] ?? intern.status}
            </span>
          </div>
        </div>
      </div>
    </MetalCard>
  );
}

/* ─── Personal Info Card ───────────────────────────────────── */

function PersonalInfo({ intern }: { intern: Intern }) {
  const td = useTranslations("leader.interns.detail");
  const t = useTranslations("leader.interns");

  return (
    <MetalCard>
      <div className="p-6 h-full flex flex-col justify-between">
        <div>
          {/* Rule 44: Icon + Heading */}
          <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-4">
            <User className="h-5 w-5 text-primary-light shrink-0" />
            <h2 className="text-base sm:text-lg font-bold tracking-wide metal-text">
              {td("personalInfo")}
            </h2>
          </div>

          <div className="space-y-4">
            <InfoRow
              icon={Mail}
              label={td("email")}
              value={intern.user.email}
            />
            <InfoRow
              icon={Phone}
              label={td("phone")}
              value={intern.phone || "—"}
            />
            <div className="flex items-center justify-between py-2 border-b border-border/20 last:border-b-0">
              <div className="flex items-center gap-3 text-sm font-medium text-muted">
                {intern.user.isActive ? (
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
                )}
                <span>{td("accountStatus")}</span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                  intern.user.isActive
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                }`}
              >
                <Circle className="h-1.5 w-1.5 fill-current" />
                {intern.user.isActive ? t("active") : td("inactive")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </MetalCard>
  );
}

/* ─── Internship Info Card ─────────────────────────────────── */

function InternshipInfo({ intern }: { intern: Intern }) {
  const td = useTranslations("leader.interns.detail");
  const t = useTranslations("leader.interns");
  const locale = useLocale();

  const periodStart = formatDate(intern.startDate, locale);
  const periodEnd = formatDate(endDate(intern.startDate, intern.duration).toISOString(), locale);

  return (
    <MetalCard>
      <div className="p-6 h-full flex flex-col justify-between">
        <div>
          {/* Rule 44: Icon + Heading */}
          <div className="flex items-center gap-2 border-b border-border/40 pb-3 mb-4">
            <Briefcase className="h-5 w-5 text-primary-light shrink-0" />
            <h2 className="text-base sm:text-lg font-bold tracking-wide metal-text">
              {td("internshipInfo")}
            </h2>
          </div>

          <div className="space-y-4">
            <InfoRow
              icon={Building2}
              label={t("department")}
              value={intern.department?.name ?? <span className="italic text-muted">{t("notSet")}</span>}
            />
            <InfoRow
              icon={Briefcase}
              label={t("position")}
              value={intern.position?.name ?? <span className="italic text-muted">{t("notSet")}</span>}
            />
            <InfoRow
              icon={User}
              label={td("leader")}
              value={intern.leader?.fullName ?? <span className="italic text-muted">{td("notAssigned")}</span>}
            />
            <InfoRow
              icon={Calendar}
              label={td("period")}
              value={`${periodStart} — ${periodEnd}`}
            />
            <InfoRow
              icon={Clock}
              label={td("duration")}
              value={td("durationMonths", { n: intern.duration, plural: intern.duration > 1 ? "s" : "" })}
              valueClass="bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20 text-xs font-semibold"
            />
          </div>
        </div>
      </div>
    </MetalCard>
  );
}

/* ─── Assigned Tasks Section ───────────────────────────────── */

const TASK_COLUMNS = "minmax(80px,0.8fr) minmax(200px,2.5fr) 110px 110px 130px";

function TaskListTable({
  assignments,
  onTaskClick,
}: {
  assignments: TaskAssignment[];
  onTaskClick: () => void;
}) {
  const td = useTranslations("leader.interns.detail");
  const t = useTranslations("leader.interns");
  const locale = useLocale();

  return (
    <MetalCard>
      <div className="p-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-5">
          {/* Rule 44: Icon + Heading */}
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-primary-light shrink-0" />
            <h2 className="text-base sm:text-lg font-bold tracking-wide metal-text">
              {td("assignedTasks")}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {assignments.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onTaskClick}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted transition hover:border-cyan-500/40 hover:bg-card hover:text-foreground active:scale-95 shadow-sm"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>{t("tasksModalRegistry")}</span>
          </button>
        </div>

        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/10 text-muted mb-2">
              <ListTodo className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted">{td("noTasksAssigned")}</p>
          </div>
        ) : (
          <Table columns={TASK_COLUMNS}>
            <Table.Header>
              <div>{td("colCode")}</div>
              <div>{td("colTitle")}</div>
              <div>{td("colStatus")}</div>
              <div>{td("colPriority")}</div>
              <div>{td("colDeadline")}</div>
            </Table.Header>
            <Table.Body
              data={assignments}
              render={(a: TaskAssignment) => (
                <Table.Row key={a.id}>
                  <button
                    type="button"
                    onClick={onTaskClick}
                    className="cursor-pointer font-mono text-xs text-cyan-400 hover:text-cyan-300 text-left transition-colors"
                  >
                    {a.task.code ?? "—"}
                  </button>
                  <button
                    type="button"
                    onClick={onTaskClick}
                    className="cursor-pointer truncate text-sm font-medium text-foreground hover:text-cyan-400 text-left transition-colors"
                  >
                    {a.task.title}
                  </button>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        assignmentStatusBadge[a.status] ?? "border-border text-muted"
                      }`}
                    >
                      <Circle className="h-1.5 w-1.5 fill-current" />
                      {a.status.replace("_", " ")}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        priorityBadge[a.task.priority] ?? "border-border text-muted"
                      }`}
                    >
                      {a.task.priority}
                    </span>
                  </div>
                  <div className="text-xs text-muted">
                    {formatDate(a.task.deadline, locale)}
                  </div>
                </Table.Row>
              )}
            />
          </Table>
        )}
      </div>
    </MetalCard>
  );
}

/* ─── Daily Reports Section ────────────────────────────────── */

function DailyReportsSection({ reports }: { reports: DailyReport[] }) {
  const td = useTranslations("leader.interns.detail");
  const locale = useLocale();

  return (
    <MetalCard>
      <div className="p-6 h-full flex flex-col justify-between">
        <div>
          {/* Rule 44: Icon + Heading */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-light shrink-0" />
              <h2 className="text-base sm:text-lg font-bold tracking-wide metal-text">
                {td("recentDailyReports")}
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {reports.length}
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/10 text-muted mb-2">
                <Calendar className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted">{td("noDailyReports")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-border/40 bg-card/60 p-3.5 transition-all hover:border-cyan-500/30 hover:bg-card shadow-sm"
                >
                  <p className="text-xs text-muted font-medium">
                    {formatDate(r.createdAt, locale)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-foreground/90 leading-relaxed">
                    {r.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MetalCard>
  );
}

/* ─── Weekly Evaluations Summary ───────────────────────────── */

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
  const td = useTranslations("leader.interns.detail");

  return (
    <MetalCard>
      <div className="p-6 h-full flex flex-col justify-between">
        <div>
          {/* Rule 44: Icon + Heading */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-light shrink-0" />
              <h2 className="text-base sm:text-lg font-bold tracking-wide metal-text">
                {td("weeklyEvaluations")}
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {evaluations.length}
            </span>
          </div>

          {evaluations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/10 text-muted mb-2">
                <Clock className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted">{td("noEvaluations")}</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2 sm:gap-2.5">
                <ScorePill label={td("comm")} value={avgCommunication} />
                <ScorePill label={td("attitude")} value={avgAttitude} />
                <ScorePill label={td("learning")} value={avgLearning} />
                <ScorePill label={td("coding")} value={avgCoding} />
                <ScorePill label={td("total")} value={avgTotalScore} highlight />
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {evaluations.slice(0, 5).map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-3.5 py-2.5 text-xs transition-all hover:border-cyan-500/30 hover:bg-card shadow-sm"
                  >
                    <span className="font-semibold text-foreground">
                      {td("weekNum", { n: e.week })}
                    </span>
                    <div className="flex gap-2.5 text-muted">
                      <span>C:{e.communication}</span>
                      <span>A:{e.attitude}</span>
                      <span>L:{e.learning}</span>
                      <span>C:{e.coding}</span>
                    </div>
                    <span className="font-bold text-cyan-400">
                      {e.totalScore.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
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
          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
          : "border-border/60 bg-card/60 text-muted-foreground"
      }`}
    >
      <span className="text-muted">{label}:</span>
      <span className={highlight ? "text-cyan-400 font-bold" : "text-foreground font-semibold"}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

/* ─── Recent Submissions Section ───────────────────────────── */

const SUBMISSION_COLUMNS = "60px minmax(0,1.5fr) 120px 120px";

function SubmissionsSection({
  submissions,
}: {
  submissions: TaskSubmission[];
}) {
  const td = useTranslations("leader.interns.detail");
  const locale = useLocale();

  return (
    <MetalCard>
      <div className="p-6">
        {/* Rule 44: Icon + Heading */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary-light shrink-0" />
            <h2 className="text-base sm:text-lg font-bold tracking-wide metal-text">
              {td("recentSubmissions")}
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            {submissions.length}
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/10 text-muted mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted">{td("noSubmissions")}</p>
          </div>
        ) : (
          <Table columns={SUBMISSION_COLUMNS}>
            <Table.Header>
              <div>{td("colAttempt")}</div>
              <div>{td("colTask")}</div>
              <div>{td("colStatus")}</div>
              <div>{td("colDate")}</div>
            </Table.Header>
            <Table.Body
              data={submissions}
              render={(s: TaskSubmission) => (
                <Table.Row key={s.id}>
                  <span className="text-sm font-semibold font-mono text-muted">
                    #{s.attempt}
                  </span>
                  <div className="truncate">
                    <span className="text-sm font-medium text-foreground">
                      {s.assignment.task.title}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        reviewStatusBadge[s.reviewStatus] ?? "border-border text-muted"
                      }`}
                    >
                      <Circle className="h-1.5 w-1.5 fill-current" />
                      {s.reviewStatus}
                    </span>
                  </div>
                  <div className="text-xs text-muted">
                    {formatDate(s.submittedAt, locale)}
                  </div>
                </Table.Row>
              )}
            />
          </Table>
        )}
      </div>
    </MetalCard>
  );
}

/* ─── Helpers ──────────────────────────────────────────────── */

function InfoRow({
  icon: Icon,
  label,
  value,
  valueClass = "text-foreground font-medium",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/20 last:border-b-0">
      <div className="flex items-center gap-3 text-sm font-medium text-muted">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span>{label}</span>
      </div>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}
