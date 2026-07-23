"use client";

import { useState, useMemo } from "react";
import { Calendar, CheckCircle, AlertTriangle, Clock, Timer, Layers, X } from "lucide-react";
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

function getWeekRange(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { from: monday.toISOString().split("T")[0], to: sunday.toISOString().split("T")[0] };
}

function getMonthRange(): { from: string; to: string } {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from: first.toISOString().split("T")[0], to: last.toISOString().split("T")[0] };
}

function getStatusCount(byStatus: TaskStatusDistribution[], status: string): number {
  return byStatus.find((s) => s.status === status)?.count ?? 0;
}

export default function LeaderTaskStats() {
  const [preset, setPreset] = useState<TimePreset>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [modal, setModal] = useState<{
    type: ModalType;
    title: string;
    filters: TaskQueryParams;
    groups?: { id: string; name: string; description: string | null; _count?: { tasks: number } }[];
  } | null>(null);

  const dateFrom = useMemo(() => {
    if (preset === "week") return getWeekRange().from;
    if (preset === "custom" && customFrom) return customFrom;
    if (preset === "month") return getMonthRange().from;
    return undefined;
  }, [preset, customFrom]);

  const dateTo = useMemo(() => {
    if (preset === "week") return getWeekRange().to;
    if (preset === "custom" && customTo) return customTo;
    if (preset === "month") return getMonthRange().to;
    return undefined;
  }, [preset, customTo]);

  const { data: response, isLoading } = useTaskAnalytics(undefined, dateFrom, dateTo);
  const analytics = response?.data;

  const { data: taskGroupsData } = useTaskGroups();
  const totalGroups = taskGroupsData?.data?.length ?? 0;

  const overview = analytics?.overview;
  const doneCount = overview ? getStatusCount(overview.byStatus, "DONE") : 0;
  const inProgressCount = overview ? getStatusCount(overview.byStatus, "IN_PROGRESS") : 0;
  const highPriorityCount =
    overview?.byPriority.find((p) => p.priority === "HIGH")?.count ?? 0;
  const completionRate =
    overview && overview.totalTasks > 0
      ? Math.round((doneCount / overview.totalTasks) * 100)
      : 0;

  const presetLabel =
    preset === "week"
      ? `${getWeekRange().from} – ${getWeekRange().to}`
      : preset === "month"
        ? `${getMonthRange().from} – ${getMonthRange().to}`
        : "Custom range";

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <div className="space-y-6">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Button variant={preset === "week" ? "primary" : "glass"} size="sm" onClick={() => setPreset("week")}>
            <Calendar className="h-3.5 w-3.5" />This Week
          </Button>
          <Button variant={preset === "month" ? "primary" : "glass"} size="sm" onClick={() => setPreset("month")}>
            <Calendar className="h-3.5 w-3.5" />This Month
          </Button>
          <Button variant={preset === "custom" ? "primary" : "glass"} size="sm" onClick={() => setPreset("custom")}>
            <Clock className="h-3.5 w-3.5" />Custom
          </Button>
          {preset === "custom" && (
            <div className="flex items-center gap-2">
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary-light/40 focus:outline-none" />
              <span className="text-sm text-muted">–</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:border-primary-light/40 focus:outline-none" />
            </div>
          )}
          <span className="ml-2 text-xs text-muted">{presetLabel}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Spinner /></div>
        ) : overview ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatButton icon={<Timer className="h-5 w-5 text-blue-400" />} color="blue" value={overview.totalTasks} label="Total Tasks" onClick={() => setModal({ type: "tasks", title: "Total Tasks", filters: {} })} />
            <StatButton icon={<Layers className="h-5 w-5 text-purple-400" />} color="purple" value={totalGroups} label="Total Groups" onClick={() => setModal({ type: "groups", title: "Total Groups", filters: {}, groups: taskGroupsData?.data ?? [] })} />
            <StatButton icon={<CheckCircle className="h-5 w-5 text-emerald-400" />} color="emerald" value={doneCount} label="Done" sub={`${completionRate}%`} onClick={() => setModal({ type: "done", title: "Done Tasks", filters: { status: "DONE" } })} />
            <StatButton icon={<Clock className="h-5 w-5 text-amber-400" />} color="amber" value={inProgressCount} label="In Progress" onClick={() => setModal({ type: "tasks", title: "In Progress Tasks", filters: { status: "IN_PROGRESS" } })} />
            <StatButton icon={<AlertTriangle className="h-5 w-5 text-red-400" />} color="red" value={overview.overdueTasks} label="Overdue" onClick={() => setModal({ type: "tasks", title: "Overdue Tasks", filters: { deadlineTo: today, statusNot: "DONE" } })} />
            <StatButton icon={<AlertTriangle className="h-5 w-5 text-red-400" />} color="red" value={highPriorityCount} label="High Priority" onClick={() => setModal({ type: "tasks", title: "High Priority Tasks", filters: { priority: "HIGH" } })} />
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted">No data available.</p>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-[min(94vw,56rem)] max-h-[calc(100vh-3rem)] overflow-y-auto rounded-4xl border border-border bg-card p-6 shadow-glass">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold metal-text">{modal.title}</h3>
              <button onClick={() => setModal(null)} className="rounded-xl border border-border bg-card p-1.5 text-muted hover:bg-card-hover hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            {modal.type === "groups" ? (
              <GroupTable groups={modal.groups ?? []} />
            ) : modal.type === "done" ? (
              <DoneTaskTable filters={modal.filters} />
            ) : (
              <TaskTable filters={modal.filters} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Stat Button ─────────────────────────────────────────────── */

function StatButton({
  icon, color, value, label, sub, onClick,
}: {
  icon: React.ReactNode; color: string; value: number; label: string; sub?: string; onClick: () => void;
}) {
  return (
    <button className="text-left" onClick={onClick}>
      <MetalCard>
        <div className="flex items-center gap-3 p-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-${color}-500/10`}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted">
              {label}
              {sub && <span className={`ml-2 font-medium text-${color}-400`}>{sub}</span>}
            </p>
          </div>
        </div>
      </MetalCard>
    </button>
  );
}

/* ─── Task Table (default) ───────────────────────────────────── */

function TaskTable({ filters }: { filters: TaskQueryParams }) {
  const { data, isLoading } = useTasks({ ...filters, limit: 20 });
  const tasks = data?.data ?? [];

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="sm" /></div>;
  if (tasks.length === 0) return <p className="py-8 text-center text-sm text-muted">No tasks found.</p>;

  return (
    <>
      <p className="mb-3 text-xs text-muted">{tasks.length} task{tasks.length !== 1 ? "s" : ""} found</p>
      <Table columns="80px 1fr 100px 70px 100px">
        <Table.Header>
          <div>Code</div><div>Title</div><div>Owner</div><div>Priority</div><div>Deadline</div>
        </Table.Header>
        <Table.Body data={tasks} render={(task) => (
          <Table.Row key={task.id}>
            <div className="font-mono text-sm text-muted">{task.code ?? "—"}</div>
            <div className="truncate text-sm">{task.title}</div>
            <div className="text-sm text-muted">{task.assignment?.intern?.fullName ?? "—"}</div>
            <div><PriorityBadge priority={task.priority} /></div>
            <div className="text-sm text-muted">{new Date(task.deadline).toLocaleDateString("vi-VN")}</div>
          </Table.Row>
        )} />
      </Table>
    </>
  );
}

/* ─── Done Task Table ─────────────────────────────────────────── */

function DoneTaskTable({ filters }: { filters: TaskQueryParams }) {
  const { data, isLoading } = useTasks({ ...filters, limit: 20 });
  const tasks = data?.data ?? [];

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="sm" /></div>;
  if (tasks.length === 0) return <p className="py-8 text-center text-sm text-muted">No done tasks found.</p>;

  return (
    <>
      <p className="mb-3 text-xs text-muted">{tasks.length} done task{tasks.length !== 1 ? "s" : ""}</p>
      <Table columns="80px 1fr 100px 100px 70px 100px">
        <Table.Header>
          <div>Code</div><div>Title</div><div>Owner</div><div>Phase</div><div>Priority</div><div>Deadline</div>
        </Table.Header>
        <Table.Body data={tasks} render={(task) => (
          <Table.Row key={task.id}>
            <div className="font-mono text-sm text-muted">{task.code ?? "—"}</div>
            <div className="truncate text-sm">{task.title}</div>
            <div className="text-sm text-muted">{task.assignment?.intern?.fullName ?? "—"}</div>
            <div className="text-sm text-muted">{task.phase ?? "—"}</div>
            <div><PriorityBadge priority={task.priority} /></div>
            <div className="text-sm text-muted">{new Date(task.deadline).toLocaleDateString("vi-VN")}</div>
          </Table.Row>
        )} />
      </Table>
    </>
  );
}

/* ─── Group Table ─────────────────────────────────────────────── */

function GroupTable({ groups }: { groups: { id: string; name: string; description: string | null; _count?: { tasks: number } }[] }) {
  if (groups.length === 0) return <p className="py-8 text-center text-sm text-muted">No groups found.</p>;
  return (
    <>
      <p className="mb-3 text-xs text-muted">{groups.length} group{groups.length !== 1 ? "s" : ""}</p>
      <Table columns="1fr 80px">
        <Table.Header><div>Name</div><div>Tasks</div></Table.Header>
        <Table.Body data={groups} render={(g) => (
          <Table.Row key={g.id}>
            <div>
              <p className="text-sm font-medium text-foreground">{g.name}</p>
              {g.description && <p className="text-xs text-muted">{g.description}</p>}
            </div>
            <div className="text-sm text-muted">{g._count?.tasks ?? 0}</div>
          </Table.Row>
        )} />
      </Table>
    </>
  );
}

/* ─── Priority Badge ──────────────────────────────────────────── */

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    HIGH: "bg-red-500/10 text-red-400",
    MEDIUM: "bg-amber-500/10 text-amber-400",
    LOW: "bg-emerald-500/10 text-emerald-400",
  };
  return <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs ${colors[priority] ?? "bg-white/5 text-muted"}`}>{priority}</span>;
}
