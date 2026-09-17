"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Calendar, CheckCircle, AlertTriangle, Clock, Timer, Layers, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import Table from "@/components/ui/Table";
import { useTaskAnalytics } from "@/hooks/task/useTaskAnalytics";
import { useTaskGroups } from "@/hooks/task-group/useTaskGroups";
import { useTasks } from "@/hooks/task/useTasks";
import type { TaskStatusDistribution, TaskQueryParams } from "@/types/task";

type TimePreset = "week" | "month" | "custom";
type ModalType = "tasks" | "groups" | "done";
type DateRange = { from: string; to: string; queryFrom: string; queryTo: string };

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCustomBoundary(value: string, endOfDay: boolean): string | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  return date.toISOString();
}

function getWeekRange(): DateRange {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return {
    from: formatLocalDate(monday),
    to: formatLocalDate(sunday),
    queryFrom: monday.toISOString(),
    queryTo: sunday.toISOString(),
  };
}

function getMonthRange(): DateRange {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return {
    from: formatLocalDate(first),
    to: formatLocalDate(last),
    queryFrom: first.toISOString(),
    queryTo: last.toISOString(),
  };
}

function getStatusCount(byStatus: TaskStatusDistribution[], status: string): number {
  return byStatus.find((s) => s.status === status)?.count ?? 0;
}

export default function LeaderTaskStats() {
  const t = useTranslations("leader.tasks");
  const [preset, setPreset] = useState<TimePreset>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [modal, setModal] = useState<{
    type: ModalType; title: string; filters: TaskQueryParams;
    groups?: { id: string; name: string; description: string | null; _count?: { tasks: number } }[];
  } | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dateFrom = useMemo(() => {
    if (preset === "week") return getWeekRange().queryFrom;
    if (preset === "custom") return getCustomBoundary(customFrom, false);
    if (preset === "month") return getMonthRange().queryFrom;
    return undefined;
  }, [preset, customFrom]);

  const dateTo = useMemo(() => {
    if (preset === "week") return getWeekRange().queryTo;
    if (preset === "custom") return getCustomBoundary(customTo, true);
    if (preset === "month") return getMonthRange().queryTo;
    return undefined;
  }, [preset, customTo]);

  const { data: response, isLoading } = useTaskAnalytics(undefined, dateFrom, dateTo);
  const analytics = response?.data;

  const { data: taskGroupsData } = useTaskGroups();
  const totalGroups = taskGroupsData?.data?.length ?? 0;

  const { data: reviewTasksData, isLoading: reviewLoading } = useTasks({ status: "REVIEW", limit: 10 });
  const reviewTasks = reviewTasksData?.data ?? [];
  const reviewTaskCount = reviewTasksData?.meta.total ?? 0;

  const overview = analytics?.overview;
  const doneCount = overview ? getStatusCount(overview.byStatus, "DONE") : 0;
  const inProgressCount = overview ? getStatusCount(overview.byStatus, "IN_PROGRESS") : 0;
  const highPriorityCount = overview?.byPriority.find((p) => p.priority === "HIGH")?.count ?? 0;
  const completionRate = overview && overview.totalTasks > 0 ? Math.round((doneCount / overview.totalTasks) * 100) : 0;

  const presetLabel = preset === "week" ? `${getWeekRange().from} – ${getWeekRange().to}` : preset === "month" ? `${getMonthRange().from} – ${getMonthRange().to}` : customFrom || customTo ? `${customFrom || "…"} – ${customTo || "…"}` : t("customRange");

  const dateFilters = useMemo<TaskQueryParams>(() => ({
    ...(dateFrom ? { deadlineFrom: dateFrom } : {}),
    ...(dateTo ? { deadlineTo: dateTo } : {}),
  }), [dateFrom, dateTo]);

  const overdueDeadlineTo = useMemo(() => {
    const now = new Date();
    return dateTo && new Date(dateTo) < now ? dateTo : now.toISOString();
  }, [dateTo]);

  const openReview = (assignmentId: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("reviewAssignmentId", assignmentId);
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant={preset === "week" ? "primary" : "glass"} size="sm" onClick={() => setPreset("week")}><Calendar className="h-3.5 w-3.5" />{t("thisWeek")}</Button>
          <Button variant={preset === "month" ? "primary" : "glass"} size="sm" onClick={() => setPreset("month")}><Calendar className="h-3.5 w-3.5" />{t("thisMonth")}</Button>
          <Button variant={preset === "custom" ? "primary" : "glass"} size="sm" onClick={() => setPreset("custom")}><Clock className="h-3.5 w-3.5" />{t("custom")}</Button>
          {preset === "custom" && (
            <div className="flex items-center gap-2">
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary-light/40 focus:outline-none" />
              <span className="text-sm text-muted">–</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary-light/40 focus:outline-none" />
            </div>
          )}
          <span className="ml-2 text-xs text-muted">{t("deadline")}: {presetLabel}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Spinner /></div>
        ) : overview ? (
          <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,700px)_minmax(280px,1fr)]">
            <div className="grid grid-cols-2 gap-4">
              <StatButton icon={<Timer className="h-5 w-5 text-blue-400" />} color="blue" value={overview.totalTasks} label={t("totalTasks")} onClick={() => setModal({ type: "tasks", title: t("totalTasks"), filters: dateFilters })} />
              <StatButton icon={<Layers className="h-5 w-5 text-purple-400" />} color="purple" value={totalGroups} label={t("totalGroups")} onClick={() => setModal({ type: "groups", title: t("totalGroups"), filters: {}, groups: taskGroupsData?.data ?? [] })} />
              <StatButton icon={<CheckCircle className="h-5 w-5 text-emerald-400" />} color="emerald" value={doneCount} label={t("done")} sub={`${completionRate}%`} onClick={() => setModal({ type: "done", title: t("done"), filters: { ...dateFilters, status: "DONE" } })} />
              <StatButton icon={<Clock className="h-5 w-5 text-amber-400" />} color="amber" value={inProgressCount} label={t("inProgress")} onClick={() => setModal({ type: "tasks", title: t("inProgress"), filters: { ...dateFilters, status: "IN_PROGRESS" } })} />
              <StatButton icon={<AlertTriangle className="h-5 w-5 text-red-400" />} color="red" value={overview.overdueTasks} label={t("overdue")} onClick={() => setModal({ type: "tasks", title: t("overdue"), filters: { ...dateFilters, deadlineTo: overdueDeadlineTo, statusNot: "DONE" } })} />
              <StatButton icon={<AlertTriangle className="h-5 w-5 text-red-400" />} color="red" value={highPriorityCount} label={t("highPriority")} onClick={() => setModal({ type: "tasks", title: t("highPriority"), filters: { ...dateFilters, priority: "HIGH" } })} />
            </div>

            <MetalCard className="relative overflow-hidden border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.12)]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-transparent to-fuchsia-500/5 pointer-events-none" />
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none" />
              <div className="relative p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20"><Eye className="h-4 w-4 text-purple-300" /></div>
                  <h3 className="text-md font-bold tracking-wide uppercase bg-gradient-to-r from-purple-300 via-fuchsia-300 to-purple-200 bg-clip-text text-transparent">{t("awaitingReview")}</h3>
                  {!reviewLoading && <span className="ml-auto rounded-full bg-purple-500/30 px-2.5 py-0.5 text-xs font-bold text-purple-200 border border-purple-400/30">{reviewTaskCount}</span>}
                </div>
                {reviewLoading ? (
                  <div className="flex justify-center py-6"><Spinner size="sm" /></div>
                ) : reviewTasks.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted">{t("noTasksAwaitingReview")}</p>
                ) : (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                    {reviewTasks.map((task) => (
                      <button key={task.id} onClick={() => task.assignment?.id && openReview(task.assignment.id)} className="w-full text-left rounded-xl border border-purple-400/20 bg-purple-500/10 px-3 py-2.5 hover:border-purple-400/40 hover:bg-purple-500/20 transition-all cursor-pointer">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-purple-300/80">{task.code ?? "—"}</span>
                          <span className="inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/30">REVIEW</span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-foreground line-clamp-2">{task.title}</p>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                          {task.assignment?.intern?.fullName && <span className="text-purple-300/70">{task.assignment.intern.fullName}</span>}
                          {task.deadline && <span className="text-slate-500">{new Date(task.deadline).toLocaleDateString("vi-VN")}</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </MetalCard>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted">{t("noData")}</p>
        )}
      </div>

      {modal && createPortal(
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="relative w-fit min-w-[420px] max-w-[90vw] max-h-[85vh] overflow-auto rounded-4xl border border-border bg-card p-6 shadow-glass">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold metal-text">{modal.title}</h3>
              <button onClick={() => setModal(null)} className="rounded-xl border border-border bg-card p-1.5 text-muted hover:bg-card-hover hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            {modal.type === "groups" ? <GroupTable groups={modal.groups ?? []} /> :
             modal.type === "done" ? <DoneTaskTable filters={modal.filters} /> :
             <TaskTable filters={modal.filters} />}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function StatButton({ icon, color, value, label, sub, onClick }: { icon: React.ReactNode; color: string; value: number; label: string; sub?: string; onClick: () => void }) {
  return (
    <button className="text-left hover:cursor-pointer" onClick={onClick}>
      <MetalCard>
        <div className="flex items-center gap-3 p-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-${color}-500/10`}>{icon}</div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted">{label}{sub && <span className={`ml-2 font-medium text-${color}-400`}>{sub}</span>}</p>
          </div>
        </div>
      </MetalCard>
    </button>
  );
}

function TaskTable({ filters }: { filters: TaskQueryParams }) {
  const t = useTranslations("leader.tasks");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTasks({ ...filters, page, limit: 20 });
  const tasks = data?.data ?? [];
  const meta = data?.meta;
  const router = useRouter();

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="sm" /></div>;
  if (tasks.length === 0) return <p className="py-8 text-center text-sm text-muted">{t("noTasksFound")}</p>;

  return (
    <>
      <p className="mb-3 text-xs text-muted">{t("tasksFound", { count: meta?.total ?? tasks.length, plural: (meta?.total ?? tasks.length) !== 1 ? "s" : "" })}</p>
      <Table columns="80px 1fr 100px 70px 100px">
        <Table.Header><div>{t("colCode")}</div><div>{t("colTitle")}</div><div>{t("colOwner")}</div><div>{t("colPriority")}</div><div>{t("colDeadline")}</div></Table.Header>
        <Table.Body data={tasks} render={(task) => (
          <Table.Row key={task.id} onClick={() => router.push(`/leader/tasks/${task.id}`)}>
            <div className="font-mono text-sm text-muted">{task.code ?? "—"}</div>
            <div className="truncate text-sm">{task.title}</div>
            <div className="text-sm text-muted">{task.assignment?.intern?.fullName ?? "—"}</div>
            <div><PriorityBadge priority={task.priority} /></div>
            <div className="text-sm text-muted">{new Date(task.deadline).toLocaleDateString("vi-VN")}</div>
          </Table.Row>
        )} />
        {meta && meta.totalPages > 1 && (
          <Table.Footer>
            <TaskTablePagination meta={meta} onPageChange={setPage} />
          </Table.Footer>
        )}
      </Table>
    </>
  );
}

function DoneTaskTable({ filters }: { filters: TaskQueryParams }) {
  const t = useTranslations("leader.tasks");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTasks({ ...filters, page, limit: 20 });
  const tasks = data?.data ?? [];
  const meta = data?.meta;
  const router = useRouter();

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="sm" /></div>;
  if (tasks.length === 0) return <p className="py-8 text-center text-sm text-muted">{t("noDoneTasksFound")}</p>;

  return (
    <>
      <p className="mb-3 text-xs text-muted">{t("doneTasksFound", { count: meta?.total ?? tasks.length, plural: (meta?.total ?? tasks.length) !== 1 ? "s" : "" })}</p>
      <Table columns="80px 1fr 100px 100px 70px 100px">
        <Table.Header><div>{t("colCode")}</div><div>{t("colTitle")}</div><div>{t("colOwner")}</div><div>{t("colPhase")}</div><div>{t("colPriority")}</div><div>{t("colDeadline")}</div></Table.Header>
        <Table.Body data={tasks} render={(task) => (
          <Table.Row key={task.id} onClick={() => router.push(`/leader/tasks/${task.id}`)}>
            <div className="font-mono text-sm text-muted">{task.code ?? "—"}</div>
            <div className="truncate text-sm">{task.title}</div>
            <div className="text-sm text-muted">{task.assignment?.intern?.fullName ?? "—"}</div>
            <div className="text-sm text-muted">{task.phase ?? "—"}</div>
            <div><PriorityBadge priority={task.priority} /></div>
            <div className="text-sm text-muted">{new Date(task.deadline).toLocaleDateString("vi-VN")}</div>
          </Table.Row>
        )} />
        {meta && meta.totalPages > 1 && (
          <Table.Footer>
            <TaskTablePagination meta={meta} onPageChange={setPage} />
          </Table.Footer>
        )}
      </Table>
    </>
  );
}

function TaskTablePagination({
  meta,
  onPageChange,
}: {
  meta: { total: number; page: number; totalPages: number };
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("leader.tasks");

  return (
    <div className="flex w-full items-center justify-between gap-4 text-sm">
      <p className="text-muted">
        {t("pagination", { page: meta.page, totalPages: meta.totalPages, total: meta.total })}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function GroupTable({ groups }: { groups: { id: string; name: string; description: string | null; _count?: { tasks: number } }[] }) {
  const t = useTranslations("leader.tasks");
  const [page, setPage] = useState(1);
  const limit = 20;
  const totalPages = Math.ceil(groups.length / limit);
  const visibleGroups = groups.slice((page - 1) * limit, page * limit);

  if (groups.length === 0) return <p className="py-8 text-center text-sm text-muted">{t("noGroupsFound")}</p>;
  return (
    <>
      <p className="mb-3 text-xs text-muted">{t("groupsCount", { count: groups.length, plural: groups.length !== 1 ? "s" : "" })}</p>
      <Table columns="1fr 80px">
        <Table.Header><div>{t("colName")}</div><div>{t("colTasks")}</div></Table.Header>
        <Table.Body data={visibleGroups} render={(g) => (
          <Table.Row key={g.id}>
            <div><p className="text-sm font-medium text-foreground">{g.name}</p>{g.description && <p className="text-xs text-muted">{g.description}</p>}</div>
            <div className="text-sm text-muted">{g._count?.tasks ?? 0}</div>
          </Table.Row>
        )} />
        {totalPages > 1 && (
          <Table.Footer>
            <TaskTablePagination
              meta={{ total: groups.length, page, totalPages }}
              onPageChange={setPage}
            />
          </Table.Footer>
        )}
      </Table>
    </>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = { HIGH: "bg-red-500/10 text-red-400", MEDIUM: "bg-amber-500/10 text-amber-400", LOW: "bg-emerald-500/10 text-emerald-400" };
  return <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs ${colors[priority] ?? "bg-white/5 text-muted"}`}>{priority}</span>;
}
