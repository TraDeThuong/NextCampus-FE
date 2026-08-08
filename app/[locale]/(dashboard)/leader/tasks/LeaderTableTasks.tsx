"use client";

import { useState, useRef, useEffect, useMemo, useContext } from "react";
import { Layers, MoreHorizontal, Eye, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, Check, ChevronDown, UserPlus, UserX, Sparkles, Building } from "lucide-react";
import { useTranslations } from "next-intl";
import TaskAiRecommendationModal from "./TaskAiRecommendationModal";
import TaskGroupAiAllocationModal from "./TaskGroupAiAllocationModal";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useTaskGroups } from "@/hooks/task-group/useTaskGroups";
import { useTaskGroup } from "@/hooks/task-group/useTaskGroup";
import { useUpdateTaskGroup } from "@/hooks/task-group/useUpdateTaskGroup";
import { useDeleteTaskGroup } from "@/hooks/task-group/useDeleteTaskGroup";
import { useDepartments } from "@/hooks/department/useDepartments";
import { useTasks } from "@/hooks/task/useTasks";
import { useDeleteTask } from "@/hooks/task/useDeleteTask";
import { useInterns } from "@/hooks/intern/useInterns";
import { useAssignTask } from "@/hooks/task-assignment/useAssignTask";
import { useUnassignTask } from "@/hooks/task-assignment/useUnassignTask";
import { useLookupAssignmentIntern } from "@/hooks/intern/useLookupAssignmentIntern";
import { AuthContext } from "@/contexts/AuthContext";
import TaskEditModal from "./TaskEditModal";
import TaskGroupMemberSelector from "./TaskGroupMemberSelector";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import type { TaskGroup, UpdateTaskGroupPayload } from "@/types/task-group";
import type { TaskQueryParams } from "@/types/task";

type GroupAction = { type: "view" | "edit" | "delete"; groupId: string; groupName: string } | null;

const checkIsOverdue = (deadline: string) => {
  const d = new Date(deadline);
  d.setHours(23, 59, 59, 999);
  return d < new Date();
};

export default function LeaderTableTasks() {
  const t = useTranslations("leader.tasks");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [action, setAction] = useState<GroupAction>(null);
  const [taskAction, setTaskAction] = useState<{ type: "edit" | "delete"; taskId: string; taskTitle: string } | null>(null);
  const [taskMenuOpen, setTaskMenuOpen] = useState<string | null>(null);
  const [aiTask, setAiTask] = useState<{ taskId: string; taskTitle: string; isAssigned: boolean } | null>(null);
  const [groupAiModal, setGroupAiModal] = useState<{ groupId: string; groupName: string } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const taskTriggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const taskMenuRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const taskGroupId = searchParams.get("taskGroupId") ?? null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null);
      if (taskMenuRef.current && !taskMenuRef.current.contains(e.target as Node)) setTaskMenuOpen(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const openTaskAction = (a: { type: "edit" | "delete"; taskId: string; taskTitle: string }) => {
    setTaskAction(a);
    setTaskMenuOpen(null);
    taskTriggerRef.current?.click();
  };

  const handleOpenReview = (aId: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("reviewAssignmentId", aId);
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  };

  const { data: groupsData, isLoading: groupsLoading } = useTaskGroups();
  const groups = groupsData?.data ?? [];

  const params: TaskQueryParams = useMemo(() => {
    const p: TaskQueryParams = {};

    const title = searchParams.get("title");
    const code = searchParams.get("code");
    const owner = searchParams.get("owner");
    const priority = searchParams.get("priority");
    const status = searchParams.get("status");
    const phase = searchParams.get("phase");
    const module_ = searchParams.get("module");
    const deadlineFrom = searchParams.get("deadlineFrom");
    const deadlineTo = searchParams.get("deadlineTo");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const sortBy = searchParams.get("sortBy");
    const order = searchParams.get("order");

    if (title) p.title = title;
    if (code) p.code = code;
    if (owner) p.owner = owner;
    if (priority) p.priority = priority as TaskQueryParams["priority"];
    if (status) p.status = status;
    if (phase) p.phase = phase;
    if (module_) p.module = module_;
    if (deadlineFrom) p.deadlineFrom = deadlineFrom;
    if (deadlineTo) p.deadlineTo = deadlineTo;
    if (taskGroupId) p.taskGroupId = taskGroupId;
    if (page) p.page = Number(page);
    p.limit = limit ? Number(limit) : 10;
    if (sortBy) p.sortBy = sortBy as TaskQueryParams["sortBy"];
    if (order) p.order = order as TaskQueryParams["order"];

    return p;
  }, [searchParams, taskGroupId]);

  const { data: tasksData, isLoading: tasksLoading } = useTasks(params);
  const tasks = tasksData?.data ?? [];
  const meta = tasksData?.meta;
  const openAction = (a: GroupAction) => { setAction(a); triggerRef.current?.click(); };

  function goToPage(page: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(page));
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <>
    <Modal>
      <Modal.Open opens="group-action">
        <button ref={triggerRef} className="hidden" />
      </Modal.Open>

      <Modal.Open opens="task-action">
        <button ref={taskTriggerRef} className="hidden" />
      </Modal.Open>

      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Left: Task Groups */}
        <MetalCard className="min-h-[240px] min-w-0">
          <div className="min-w-0 p-4 pb-24">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary-light" />
              <h3 className="text-sm font-semibold metal-text">{t("taskGroups")}</h3>
            </div>
            {groupsLoading ? (
              <div className="flex justify-center py-8"><Spinner size="sm" /></div>
            ) : (
              <ul className="space-y-0.5">
                <li>
                  <button onClick={() => {
                    const p = new URLSearchParams(searchParams.toString());
                    p.delete("taskGroupId");
                    p.set("page", "1");
                    router.push(`${pathname}?${p.toString()}`);
                  }} className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${taskGroupId === null ? "bg-primary-main/10 text-primary-light font-medium" : "text-muted hover:bg-white/5 hover:text-foreground"}`}>
                    {t("allTasks")}
                  </button>
                </li>
                {groups.map((g) => (
                  <li key={g.id} className="group relative flex items-center">
                    <button onClick={() => {
                      const p = new URLSearchParams(searchParams.toString());
                      p.set("taskGroupId", g.id);
                      p.set("page", "1");
                      router.push(`${pathname}?${p.toString()}`);
                    }} className={`flex-1 min-w-0 rounded-xl px-3 py-2 text-left text-sm transition ${taskGroupId === g.id ? "bg-primary-main/10 text-primary-light font-medium" : "text-muted hover:bg-white/5 hover:text-foreground"}`}>
                      <span className="truncate block font-medium">{g.name}</span>
                      {g.department?.name && (
                        <span className="truncate flex items-center gap-1 text-[10px] text-sky-400 font-normal mt-0.5">
                          <Building className="h-2.5 w-2.5 shrink-0" />
                          {g.department.name}
                        </span>
                      )}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === g.id ? null : g.id); }} className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted opacity-0 transition hover:bg-white/10 hover:text-foreground group-hover:opacity-100">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                    {menuOpen === g.id && (
                      <div ref={menuRef} className="absolute right-0 top-full z-50 mt-1 w-32 rounded-xl border border-border bg-[#0f172a] p-1 shadow-[0_16px_48px_rgba(0,0,0,.55)] backdrop-blur-2xl">
                        <button onClick={() => { setMenuOpen(null); openAction({ type: "view", groupId: g.id, groupName: g.name }); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted hover:bg-white/5 hover:text-foreground"><Eye className="h-3 w-3" />{t("view")}</button>
                        <button onClick={() => { setMenuOpen(null); openAction({ type: "edit", groupId: g.id, groupName: g.name }); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted hover:bg-white/5 hover:text-foreground"><Pencil className="h-3 w-3" />{t("edit")}</button>
                        <button onClick={() => { setMenuOpen(null); openAction({ type: "delete", groupId: g.id, groupName: g.name }); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"><Trash2 className="h-3 w-3" />{t("delete")}</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </MetalCard>

        {/* Right: Task Table */}
        <MetalCard className="min-h-[240px] min-w-0">
          <div className="min-w-0 p-4 pb-24">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center">
                <span className="metal-text">{t("tasks")}</span>
                {taskGroupId && groups.find((g) => g.id === taskGroupId) && (
                  <span className="ml-2 font-normal text-muted">— {groups.find((g) => g.id === taskGroupId)!.name}</span>
                )}
              </h3>
              {taskGroupId && (
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    const currentGroup = groups.find((g) => g.id === taskGroupId);
                    if (currentGroup) {
                      setGroupAiModal({ groupId: currentGroup.id, groupName: currentGroup.name });
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-sky-400 border border-sky-500/20 hover:bg-sky-500/10 transition-all font-semibold"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1 animate-pulse" />
                  AI Phân công
                </Button>
              )}
            </div>
            {tasksLoading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : tasks.length > 0 ? (
              <Table columns="70px minmax(160px,1fr) 130px 110px 75px 95px 85px 40px">
                  <Table.Header>
                    <div>{t("colCode")}</div><div>{t("colTitle")}</div><div>{t("colOwner")}</div><div>{t("colSupport")}</div><div>{t("colPriority")}</div><div>{t("colStatus")}</div>
                    <div>{t("colDeadline")}</div><div></div>
                  </Table.Header>
                  <Table.Body data={tasks} render={(task) => (
                    <Table.Row key={task.id}>
                      <div className="font-mono text-xs text-muted">{task.code ?? "—"}</div>
                      <button
                        onClick={() => router.push(`${pathname}/${task.id}`)}
                        className="truncate text-sm text-left hover:text-primary-light transition cursor-pointer"
                      >
                        {task.title}
                      </button>
                      <InlineAssignCell taskId={task.id} assignment={task.assignment} deadline={task.deadline} taskGroupDepartmentId={task.taskGroup?.departmentId} />
                      <div className="text-sm text-muted">{task.assignment?.support?.fullName ?? "—"}</div>
                      <div><PriorityBadge priority={task.priority} /></div>
                      <div><StatusBadge status={task.assignment?.status ?? "UNASSIGNED"} assignmentId={task.assignment?.id} taskId={task.id} onReviewClick={handleOpenReview} /></div>
                      <div className="text-sm text-muted">{new Date(task.deadline).toLocaleDateString("vi-VN")}</div>
                      <div className="relative text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); setTaskMenuOpen(taskMenuOpen === task.id ? null : task.id); }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-white/10 hover:text-foreground"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                        {taskMenuOpen === task.id && (
                          <div ref={taskMenuRef} className="absolute right-0 top-full z-50 mt-1 w-34 rounded-xl border border-border bg-[#0f172a] p-1 shadow-[0_16px_48px_rgba(0,0,0,.55)] backdrop-blur-2xl">
                            {(!task.assignment || !task.assignment.internId) && !checkIsOverdue(task.deadline) && (
                              <button
                                onClick={() => { setTaskMenuOpen(null); setAiTask({ taskId: task.id, taskTitle: task.title, isAssigned: false }); }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-sky-400 hover:bg-sky-500/10 transition font-medium"
                              >
                                <Sparkles className="h-3 w-3 shrink-0" />{t("aiAssign")}
                              </button>
                            )}
                            <button
                              onClick={() => { setTaskMenuOpen(null); router.push(`${pathname}/${task.id}`); }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted hover:bg-white/5 hover:text-foreground"
                            >
                              <Eye className="h-3 w-3" />{t("view")}
                            </button>
                            <button
                              onClick={() => openTaskAction({ type: "edit", taskId: task.id, taskTitle: task.title })}
                              disabled={task.assignment?.status === "DONE"}
                              title={task.assignment?.status === "DONE" ? t("completedTaskReadOnly") : undefined}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted hover:bg-white/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted"
                            >
                              <Pencil className="h-3 w-3" />{t("edit")}
                            </button>
                            <button
                              onClick={() => openTaskAction({ type: "delete", taskId: task.id, taskTitle: task.title })}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3 w-3" />{t("delete")}
                            </button>
                          </div>
                        )}
                      </div>
                    </Table.Row>
                  )} />

                {meta && meta.totalPages > 1 && (
                  <Table.Footer>
                    <div className="flex w-full items-center justify-between gap-4 text-md">
                      <p className="text-muted">
                        {t("pagination", { page: meta.page, totalPages: meta.totalPages, total: meta.total })}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={meta.page <= 1}
                          onClick={() => goToPage(meta.page - 1)}
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        <button
                          disabled={meta.page >= meta.totalPages}
                          onClick={() => goToPage(meta.page + 1)}
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </Table.Footer>
                )}
                </Table>
            ) : (
              <p className="py-12 text-center text-sm text-muted">{t("noTasksFound")}</p>
            )}
          </div>
        </MetalCard>
      </div>

      <Modal.Window name="group-action" size="sm">
        {action?.type === "view" ? <ViewGroup groupId={action.groupId} onReviewClick={handleOpenReview} /> :
         action?.type === "edit" ? <EditGroup groupId={action.groupId} onClose={() => setAction(null)} /> :
         action?.type === "delete" ? <DeleteGroup groupId={action.groupId} groupName={action.groupName} onClose={() => { setAction(null); if (taskGroupId === action.groupId) router.push(pathname); }} /> :
         <div />}
      </Modal.Window>

      <Modal.Window name="task-action" size={taskAction?.type === "edit" ? "md" : "sm"}>
        {taskAction?.type === "edit" ? (
          <TaskEditModal taskId={taskAction.taskId} />
        ) : taskAction?.type === "delete" ? (
          <DeleteTaskConfirm taskId={taskAction.taskId} taskTitle={taskAction.taskTitle} onClose={() => setTaskAction(null)} />
        ) : (
          <div />
        )}
      </Modal.Window>
    </Modal>

    {/* AI Recommendation Modal */}
    {aiTask && (
      <TaskAiRecommendationModal
        taskId={aiTask.taskId}
        taskTitle={aiTask.taskTitle}
        isAssigned={aiTask.isAssigned}
        onClose={() => setAiTask(null)}
      />
    )}

    {/* Group AI Allocation Modal */}
    {groupAiModal && (
      <TaskGroupAiAllocationModal
        groupId={groupAiModal.groupId}
        groupName={groupAiModal.groupName}
        onClose={() => setGroupAiModal(null)}
      />
    )}
    </>
  );
}

/* ─── View Group ────────────────────────────────────────────── */

function ViewGroup({
  groupId,
  onReviewClick,
}: {
  groupId: string;
  onReviewClick: (assignmentId: string, taskId: string) => void;
}) {
  const t = useTranslations("leader.tasks");
  const tv = useTranslations("leader.tasks.viewGroup");
  const { data, isLoading } = useTaskGroup(groupId);
  const { data: tasksData } = useTasks({ taskGroupId: groupId, limit: 5, sortBy: "createdAt", order: "desc" });
  const group = data?.data;
  const tasks = tasksData?.data ?? [];

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="sm" /></div>;
  if (!group) return <p className="py-4 text-center text-sm text-muted">{t("groupNotFound")}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10">
          <Layers className="h-6 w-6 text-purple-400" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-foreground">{group.name}</h3>
          {group.description && <p className="mt-0.5 text-sm text-muted">{group.description}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-white/5 p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{group._count?.tasks ?? 0}</p>
          <p className="mt-0.5 text-xs text-muted">{tv("tasks")}</p>
        </div>
        <div className="rounded-xl border border-border bg-white/5 p-3 text-center">
          <p className="text-sm font-semibold text-foreground">{new Date(group.createdAt).toLocaleDateString("vi-VN")}</p>
          <p className="mt-0.5 text-xs text-muted">{tv("created")}</p>
        </div>
        <div className="rounded-xl border border-border bg-white/5 p-3 text-center">
          <p className="text-sm font-semibold text-foreground">{new Date(group.updatedAt).toLocaleDateString("vi-VN")}</p>
          <p className="mt-0.5 text-xs text-muted">{tv("updated")}</p>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-white/5 p-4">
        <DetailRow label={tv("id")} value={group.id} mono />
        <DetailRow label={tv("department")} value={group.department?.name ?? tv("allDepartments")} />
        <DetailRow label={tv("teamMembers")} value={String(group._count?.members ?? group.members?.length ?? 0)} />
        <DetailRow label={tv("maxWorkload")} value={tv("days", { n: group.maxWorkloadDays })} />
        <DetailRow label={tv("maxActiveTasks")} value={group.maxActiveTasks ? String(group.maxActiveTasks) : tv("unlimited")} />
        <DetailRow label={tv("requireAllMembers")} value={group.requireAllMembers ? tv("yes") : tv("no")} />
        <DetailRow label={tv("description")} value={group.description ?? "—"} />
        <DetailRow label={tv("created")} value={new Date(group.createdAt).toLocaleString("vi-VN")} />
        <DetailRow label={tv("updated")} value={new Date(group.updatedAt).toLocaleString("vi-VN")} />
      </div>

      {tasks.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{t("recentTasks")}</h4>
          <div className="space-y-1">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm">
                <span className="font-mono text-xs text-muted">{t.code ?? "—"}</span>
                <span className="flex-1 truncate text-foreground">{t.title}</span>
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.assignment?.status ?? "UNASSIGNED"} assignmentId={t.assignment?.id} taskId={t.id} onReviewClick={onReviewClick} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Edit Group ────────────────────────────────────────────── */

function EditGroup({
  groupId,
  onClose,
  onCloseModal,
}: {
  groupId: string;
  onClose: () => void;
  onCloseModal?: () => void;
}) {
  const t = useTranslations("leader.tasks");
  const { data, isLoading } = useTaskGroup(groupId);
  const group = data?.data;

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="sm" /></div>;
  if (!group) return <p className="py-4 text-center text-sm text-muted">{t("groupNotFound")}</p>;

  return <EditGroupForm group={group} onClose={() => { onClose(); onCloseModal?.(); }} />;
}

function EditGroupForm({ group, onClose }: { group: TaskGroup; onClose: () => void }) {
  const te = useTranslations("leader.tasks.editGroup");
  const { data: deptData } = useDepartments();
  const departments = deptData?.data ?? [];
  const updateMutation = useUpdateTaskGroup();
  const [departmentId, setDepartmentId] = useState(group.departmentId ?? "");
  const [memberIds, setMemberIds] = useState(
    group.members?.map((member) => member.internId) ?? [],
  );
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateTaskGroupPayload>({
    defaultValues: {
      name: group.name,
      description: group.description ?? "",
      departmentId: group.departmentId ?? "",
      maxWorkloadDays: group.maxWorkloadDays,
      maxActiveTasks: group.maxActiveTasks,
      requireAllMembers: group.requireAllMembers,
    },
  });

  return (
    <form
      onSubmit={handleSubmit((payload) =>
        updateMutation.mutate(
          {
            id: group.id,
            payload: {
              ...payload,
              departmentId: payload.departmentId || null,
              memberIds,
            },
          },
          { onSuccess: onClose },
        ),
      )}
      className="space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10">
          <Pencil className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{te("title")}</h3>
          <p className="mt-0.5 text-sm text-muted">{te("description")}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{te("name")}</label>
          <input type="text" {...register("name", { required: te("nameRequired") })} placeholder={te("namePlaceholder")} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none" />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{te("department")}</label>
          <select
            {...register("departmentId", {
              onChange: (event) => {
                setDepartmentId(event.target.value);
                setMemberIds([]);
              },
            })}
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary-light/40 focus:outline-none"
          >
            <option value="">{te("allDepartments")}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <TaskGroupMemberSelector
          departmentId={departmentId}
          selectedIds={memberIds}
          onChange={setMemberIds}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{te("maxWorkload")}</label>
            <input type="number" min={0.5} step={0.5} {...register("maxWorkloadDays", { valueAsNumber: true })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary-light/40 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{te("maxActiveTasks")}</label>
            <input type="number" min={1} placeholder={te("unlimitedPlaceholder")} {...register("maxActiveTasks", { setValueAs: (value) => (value === "" || value === null || value === undefined) ? null : Number(value) })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none" />
          </div>
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-white/5 p-3">
          <input type="checkbox" {...register("requireAllMembers")} className="mt-0.5 h-4 w-4 accent-sky-500" />
          <span>
            <span className="block text-sm text-foreground">{te("requireAllMembers")}</span>
            <span className="block text-xs text-muted">{te("requireAllMembersDesc")}</span>
          </span>
        </label>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{te("description")}</label>
          <textarea rows={3} {...register("description")} placeholder={te("descriptionPlaceholder")} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none resize-none" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="glass" size="md" onClick={onClose}>{te("cancel")}</Button>
        <Button type="submit" variant="primary" size="md" isLoading={updateMutation.isPending}>{updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Pencil className="h-4 w-4 mr-2" />}{te("saveChanges")}</Button>
      </div>
    </form>
  );
}

/* ─── Delete Group ──────────────────────────────────────────── */

function DeleteGroup({
  groupId,
  groupName,
  onClose,
  onCloseModal,
}: {
  groupId: string;
  groupName: string;
  onClose: () => void;
  onCloseModal?: () => void;
}) {
  const td = useTranslations("leader.tasks.deleteGroup");
  const deleteMutation = useDeleteTaskGroup();
  const handleDelete = () => {
    deleteMutation.mutate(groupId, {
      onSuccess: () => { onClose(); onCloseModal?.(); },
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10">
            <Trash2 className="h-5 w-5 text-danger" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">{td("title")}</h3>
            <p className="text-sm leading-6 text-muted">
              {td.rich("confirm", {
                name: groupName,
                strong: (chunks) => (
                  <strong className="font-semibold text-foreground">{chunks}</strong>
                ),
              })}
            </p>
            <p className="text-sm text-muted">{td("warning")}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button variant="glass" onClick={onClose} disabled={deleteMutation.isPending}>{td("cancel")}</Button>
        <Button variant="danger" isLoading={deleteMutation.isPending} onClick={handleDelete}>{td("delete")}</Button>
      </div>
    </div>
  );
}

/* ─── Delete Task ─────────────────────────────────────────── */

function DeleteTaskConfirm({
  taskId,
  taskTitle,
  onClose,
  onCloseModal,
}: {
  taskId: string;
  taskTitle: string;
  onClose: () => void;
  onCloseModal?: () => void;
}) {
  const td = useTranslations("leader.tasks.deleteTask");
  const deleteTask = useDeleteTask();
  const handleDelete = () => {
    deleteTask.mutate(taskId, {
      onSuccess: () => { onClose(); onCloseModal?.(); },
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10">
            <Trash2 className="h-5 w-5 text-danger" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">{td("title")}</h3>
            <p className="text-sm leading-6 text-muted" dangerouslySetInnerHTML={{ __html: td("confirm", { title: taskTitle }) }} />
            <p className="text-sm text-muted">{td("warning")}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
        <Button variant="glass" onClick={onClose} disabled={deleteTask.isPending}>{td("cancel")}</Button>
        <Button variant="danger" isLoading={deleteTask.isPending} onClick={handleDelete}>{td("delete")}</Button>
      </div>
    </div>
  );
}

/* ─── Inline Assign Cell ──────────────────────────────────── */

function InlineAssignCell({
  taskId,
  assignment,
  deadline,
  taskGroupDepartmentId,
}: {
  taskId: string;
  assignment: { id: string; internId: string; status: string; intern?: { id: string; fullName: string } } | null;
  deadline: string;
  taskGroupDepartmentId?: string | null;
}) {
  const t = useTranslations("leader.tasks");
  const queryClient = useQueryClient();
  const auth = useContext(AuthContext);
  const currentUserId = auth?.state.user?.id;
  const [open, setOpen] = useState(false);
  const [otherInternEmail, setOtherInternEmail] = useState("");
  const [otherInternEmailError, setOtherInternEmailError] = useState("");
  const cellRef = useRef<HTMLDivElement>(null);

  const { data: myInternsData } = useInterns({ leaderId: currentUserId });
  const myInterns = myInternsData?.data ?? [];

  const assignTask = useAssignTask();
  const unassignTask = useUnassignTask();
  const lookupAssignmentIntern = useLookupAssignmentIntern();

  const isPending = assignTask.isPending || unassignTask.isPending || lookupAssignmentIntern.isPending;
  const currentInternId = assignment?.internId ?? null;

  const isOverdue = checkIsOverdue(deadline);
  const isCompleted = assignment?.status === "DONE";
  const canClick = !isCompleted && (!isOverdue || !!assignment);

  console.log("InlineAssignCell Debug:", { taskId, taskGroupDepartmentId, isOverdue });

  // Filter interns by taskGroup department if it belongs to a department
  const filteredMyInterns = taskGroupDepartmentId
    ? myInterns.filter((i) => i.department?.id === taskGroupDepartmentId)
    : myInterns;
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cellRef.current && !cellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleAssign(internId: string, internEmail?: string) {
    try {
      await assignTask.mutateAsync({
        taskId,
        payload: { internId, internEmail },
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["stats"], exact: false });
    } catch {
      // error toast handled by mutation hooks
    }
    setOpen(false);
  }

  async function handleOtherInternLookup() {
    const normalizedEmail = otherInternEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setOtherInternEmailError(
        t.has("invalidInternEmail")
          ? t("invalidInternEmail")
          : "Enter a valid intern email.",
      );
      lookupAssignmentIntern.reset();
      return;
    }

    setOtherInternEmailError("");
    lookupAssignmentIntern.reset();
    try {
      await lookupAssignmentIntern.mutateAsync(normalizedEmail);
    } catch {
      setOtherInternEmailError(
        t.has("otherTeamInternNotFound")
          ? t("otherTeamInternNotFound")
          : "No active intern from another team matches this email.",
      );
    }
  }

  async function handleUnassign() {
    if (!assignment) return;
    try {
      await unassignTask.mutateAsync(taskId);
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["stats"], exact: false });
    } catch {
      // error toast handled by mutation hooks
    }
    setOpen(false);
  }

  const assigneeName = assignment?.intern?.fullName;
  const assigneeEmail = myInterns.find((i) => i.id === assignment?.internId)?.user?.email;

  return (
    <div ref={cellRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending || !canClick}
        title={isCompleted ? t("completedTaskReadOnly") : undefined}
        className={`flex w-full items-center gap-1 rounded-lg px-2 py-1 text-sm transition hover:bg-white/5 disabled:opacity-50 ${
          assigneeName ? "text-foreground" : "text-muted"
        } ${!canClick ? "cursor-not-allowed" : ""}`}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin shrink-0" />
        ) : assigneeName ? (
          <div className="truncate text-left">
            <span className="block truncate text-sm">{assigneeName}</span>
            {assigneeEmail && (
              <span className="block truncate text-[11px] text-muted">{assigneeEmail}</span>
            )}
          </div>
        ) : (
          <span className="flex items-center gap-1">
            <UserPlus className="h-3 w-3" />
            {isOverdue ? t("expired") : t("assign")}
          </span>
        )}
        {!isPending && canClick && <ChevronDown className="h-3 w-3 shrink-0 text-muted" />}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-xl border border-border bg-[#1a1d2e] p-1 shadow-lg">
          {/* My Team & Other Teams (Only show if not overdue) */}
          {!isOverdue && (
            <>
              {filteredMyInterns.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    {t("myTeam")}
                  </div>
                  {filteredMyInterns.map((intern) => (
                    <button
                      key={intern.id}
                      onClick={() => handleAssign(intern.id)}
                      disabled={isPending}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-foreground hover:bg-white/5 transition disabled:opacity-50"
                    >
                      <span className="truncate flex-1 text-left">{intern.fullName}</span>
                      {currentInternId === intern.id && (
                        <Check className="h-3.5 w-3.5 shrink-0 text-primary-light" />
                      )}
                    </button>
                  ))}
                </>
              )}

              <div className="mt-0.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                {t("otherTeams")}
              </div>
              <div className="space-y-2 px-2 pb-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={otherInternEmail}
                    onChange={(event) => {
                      setOtherInternEmail(event.target.value);
                      setOtherInternEmailError("");
                      lookupAssignmentIntern.reset();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleOtherInternLookup();
                      }
                    }}
                    placeholder={
                      t.has("otherTeamEmailPlaceholder")
                        ? t("otherTeamEmailPlaceholder")
                        : "Exact intern email..."
                    }
                    disabled={isPending}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => void handleOtherInternLookup()}
                    disabled={isPending}
                    className="rounded-lg border border-border bg-white/5 px-3 py-2 text-xs text-foreground hover:bg-white/10 disabled:opacity-50"
                  >
                    {lookupAssignmentIntern.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : t.has("checkEmail") ? (
                      t("checkEmail")
                    ) : (
                      "Check"
                    )}
                  </button>
                </div>
                {otherInternEmailError && <p className="text-xs text-red-400">{otherInternEmailError}</p>}
                {lookupAssignmentIntern.data?.data && !otherInternEmailError && (
                  <button
                    type="button"
                    onClick={() => handleAssign(lookupAssignmentIntern.data.data.id, lookupAssignmentIntern.data.data.email)}
                    disabled={isPending}
                    className="flex w-full items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-left hover:bg-emerald-500/10 disabled:opacity-50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-emerald-300">{lookupAssignmentIntern.data.data.fullName}</span>
                      <span className="block truncate text-[11px] text-slate-400">
                        {t.has("internLeader")
                          ? t("internLeader", {
                              name:
                                lookupAssignmentIntern.data.data.leader.fullName ||
                                lookupAssignmentIntern.data.data.leader.email,
                            })
                          : `Leader: ${lookupAssignmentIntern.data.data.leader.fullName || lookupAssignmentIntern.data.data.leader.email}`}
                      </span>
                    </span>
                    <UserPlus className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                  </button>
                )}
              </div>
            </>
          )}

          {/* Unassign */}
          {assignment && (
            <>
              {!isOverdue && <div className="my-0.5 border-t border-border" />}
              <button
                onClick={handleUnassign}
                disabled={isPending}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
              >
                <UserX className="h-3.5 w-3.5" />
                {t("unassign")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Badges ────────────────────────────────────────────────── */

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = { HIGH: "bg-red-500/10 text-red-400", MEDIUM: "bg-amber-500/10 text-amber-400", LOW: "bg-emerald-500/10 text-emerald-400" };
  return <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs ${colors[priority] ?? "bg-white/5 text-muted"}`}>{priority}</span>;
}

function StatusBadge({ status, assignmentId, taskId, onReviewClick }: { status: string; assignmentId?: string; taskId?: string; onReviewClick?: (assignmentId: string, taskId: string) => void }) {
  const colors: Record<string, string> = { DONE: "bg-emerald-500/10 text-emerald-400", IN_PROGRESS: "bg-blue-500/10 text-blue-400", REVIEW: "bg-purple-500/10 text-purple-400", TODO: "bg-white/5 text-muted", BLOCKED: "bg-red-500/10 text-red-400", PENDING_APPROVAL: "bg-amber-500/10 text-amber-400", UNASSIGNED: "bg-orange-500/10 text-orange-400" };

  if (status === "REVIEW" && assignmentId && taskId && onReviewClick) {
    return (
      <button
        onClick={() => onReviewClick(assignmentId, taskId)}
        className={`inline-flex rounded-lg px-2 py-0.5 text-xs cursor-pointer transition hover:opacity-80 hover:scale-105 ${colors[status] ?? "bg-white/5 text-muted"}`}
      >
        {status.replace("_", " ")}
      </button>
    );
  }
  return <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs ${colors[status] ?? "bg-white/5 text-muted"}`}>{status.replace("_", " ")}</span>;
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="w-20 shrink-0 text-xs text-muted">{label}</span>
      <span className={`text-foreground ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
