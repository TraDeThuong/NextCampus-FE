"use client";

import { useState, useRef, useEffect, useMemo, useContext } from "react";
import { createPortal } from "react-dom";
import { Layers, MoreHorizontal, Eye, Pencil, Trash2, Loader2, Paperclip, FileText, Film, FileArchive, ImageIcon, ChevronLeft, ChevronRight, Check, ChevronDown, UserPlus, UserX } from "lucide-react";
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
import { useTasks } from "@/hooks/task/useTasks";
import { useDeleteTask } from "@/hooks/task/useDeleteTask";
import { useTaskAttachments } from "@/hooks/task-attachment/useTaskAttachments";
import { useDeleteTaskAttachment } from "@/hooks/task-attachment/useDeleteTaskAttachment";
import { useInterns } from "@/hooks/intern/useInterns";
import { useCreateTaskAssignment } from "@/hooks/task-assignment/useCreateTaskAssignment";
import { useUpdateTaskAssignment } from "@/hooks/task-assignment/useUpdateTaskAssignment";
import { useDeleteTaskAssignment } from "@/hooks/task-assignment/useDeleteTaskAssignment";
import { AuthContext } from "@/contexts/AuthContext";
import TaskEditModal from "./TaskEditModal";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import type { UpdateTaskGroupPayload } from "@/types/task-group";
import type { TaskQueryParams } from "@/types/task";

type GroupAction = { type: "view" | "edit" | "delete"; groupId: string; groupName: string } | null;

export default function LeaderTableTasks() {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [action, setAction] = useState<GroupAction>(null);
  const [attachPopover, setAttachPopover] = useState<{ taskId: string; taskTitle: string } | null>(null);
  const [taskAction, setTaskAction] = useState<{ type: "edit" | "delete"; taskId: string; taskTitle: string } | null>(null);
  const [taskMenuOpen, setTaskMenuOpen] = useState<string | null>(null);
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

  const { data: groupsData, isLoading: groupsLoading } = useTaskGroups();
  const groups = groupsData?.data ?? [];

  const params: TaskQueryParams = useMemo(() => {
    const p: TaskQueryParams = {};

    const title = searchParams.get("title");
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
    if (priority) p.priority = priority as TaskQueryParams["priority"];
    if (status) p.status = status;
    if (phase) p.phase = phase;
    if (module_) p.module = module_;
    if (deadlineFrom) p.deadlineFrom = deadlineFrom;
    if (deadlineTo) p.deadlineTo = deadlineTo;
    if (taskGroupId) p.taskGroupId = taskGroupId;
    if (page) p.page = Number(page);
    p.limit = limit ? Number(limit) : 20;
    if (sortBy) p.sortBy = sortBy as TaskQueryParams["sortBy"];
    if (order) p.order = order as TaskQueryParams["order"];

    return p;
  }, [searchParams, taskGroupId]);

  const { data: tasksData, isLoading: tasksLoading } = useTasks(params);
  const tasks = tasksData?.data ?? [];
  const meta = tasksData?.meta;
  const totalTasks = meta?.total ?? 0;

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* Left: Task Groups */}
        <MetalCard>
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary-light" />
              <h3 className="text-sm font-semibold metal-text">Task Groups</h3>
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
                    All Tasks<span className="ml-2 text-xs text-muted">({totalTasks})</span>
                  </button>
                </li>
                {groups.map((g) => (
                  <li key={g.id} className="group relative flex items-center">
                    <button onClick={() => {
                      const p = new URLSearchParams(searchParams.toString());
                      p.set("taskGroupId", g.id);
                      p.set("page", "1");
                      router.push(`${pathname}?${p.toString()}`);
                    }} className={`flex-1 rounded-xl px-3 py-2 text-left text-sm transition ${taskGroupId === g.id ? "bg-primary-main/10 text-primary-light font-medium" : "text-muted hover:bg-white/5 hover:text-foreground"}`}>
                      <span className="truncate">{g.name}</span>
                      <span className="ml-2 text-xs text-muted">({g._count?.tasks ?? 0})</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === g.id ? null : g.id); }} className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted opacity-0 transition hover:bg-white/10 hover:text-foreground group-hover:opacity-100">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                    {menuOpen === g.id && (
                      <div ref={menuRef} className="absolute right-0 top-full z-50 mt-1 w-32 rounded-xl border border-border bg-card p-1 shadow-lg">
                        <button onClick={() => { setMenuOpen(null); openAction({ type: "view", groupId: g.id, groupName: g.name }); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted hover:bg-white/5 hover:text-foreground"><Eye className="h-3 w-3" />View</button>
                        <button onClick={() => { setMenuOpen(null); openAction({ type: "edit", groupId: g.id, groupName: g.name }); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted hover:bg-white/5 hover:text-foreground"><Pencil className="h-3 w-3" />Edit</button>
                        <button onClick={() => { setMenuOpen(null); openAction({ type: "delete", groupId: g.id, groupName: g.name }); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"><Trash2 className="h-3 w-3" />Delete</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </MetalCard>

        {/* Right: Task Table */}
        <MetalCard>
          <div className="p-4">
            <h3 className="mb-3 text-sm font-semibold metal-text">
              Tasks
              {taskGroupId && groups.find((g) => g.id === taskGroupId) && (
                <span className="ml-2 font-normal text-muted">— {groups.find((g) => g.id === taskGroupId)!.name}</span>
              )}
            </h3>
            {tasksLoading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : tasks.length > 0 ? (
              <div className="overflow-x-auto">
                <Table columns="100px 240px 140px 90px 110px 120px 130px 100px 80px 120px 200px 60px 50px" className="min-w-[2000px]">
                  <Table.Header>
                    <div>Code</div><div>Title</div><div>Owner</div><div>Priority</div><div>Status</div>
                    <div>Deadline</div><div>Phase</div><div>Module</div><div>Est Days</div><div>Start Date</div><div>Description</div><div>Att</div><div></div>
                  </Table.Header>
                  <Table.Body data={tasks} render={(task) => (
                    <Table.Row key={task.id}>
                      <div className="font-mono text-xs text-muted">{task.code ?? "—"}</div>
                      <div className="truncate text-sm">{task.title}</div>
                      <InlineAssignCell taskId={task.id} assignment={task.assignment} />
                      <div><PriorityBadge priority={task.priority} /></div>
                      <div><StatusBadge status={task.assignment?.status ?? "—"} /></div>
                      <div className="text-sm text-muted">{new Date(task.deadline).toLocaleDateString("vi-VN")}</div>
                      <div className="text-sm text-muted">{task.phase ?? "—"}</div>
                      <div className="text-sm text-muted">{task.module ?? "—"}</div>
                      <div className="text-sm text-muted">{task.estDays ?? "—"}</div>
                      <div className="text-sm text-muted">{task.startDate ? new Date(task.startDate).toLocaleDateString("vi-VN") : "—"}</div>
                      <div className="truncate text-xs text-muted">{task.description ?? "—"}</div>
                      <div className="text-center text-sm text-muted">
                        {task.attachments?.length > 0 ? (
                          <button onClick={() => setAttachPopover({ taskId: task.id, taskTitle: task.title })} className="flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-primary-light hover:bg-primary-main/10">
                            <Paperclip className="h-3 w-3" />
                            {task.attachments.length}
                          </button>
                        ) : "0"}
                      </div>
                      <div className="relative text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); setTaskMenuOpen(taskMenuOpen === task.id ? null : task.id); }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-white/10 hover:text-foreground"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                        {taskMenuOpen === task.id && (
                          <div ref={taskMenuRef} className="absolute right-0 top-full z-50 mt-1 w-28 rounded-xl border border-border bg-card p-1 shadow-lg">
                            <button
                              onClick={() => openTaskAction({ type: "edit", taskId: task.id, taskTitle: task.title })}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-muted hover:bg-white/5 hover:text-foreground"
                            >
                              <Pencil className="h-3 w-3" />Edit
                            </button>
                            <button
                              onClick={() => openTaskAction({ type: "delete", taskId: task.id, taskTitle: task.title })}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3 w-3" />Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </Table.Row>
                  )} />

                {meta && meta.totalPages > 1 && (
                  <Table.Footer>
                    <div className="flex w-full items-center justify-between gap-4 text-sm">
                      <p className="text-muted">
                        Page {meta.page} of {meta.totalPages} &middot;{" "}
                        {meta.total} total
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
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-muted">No tasks found.</p>
            )}
          </div>
        </MetalCard>
      </div>

      <Modal.Window name="group-action" size="sm">
        {action?.type === "view" ? <ViewGroup groupId={action.groupId} /> :
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

    {attachPopover && createPortal(
      <TaskAttachmentsPopover taskId={attachPopover.taskId} taskTitle={attachPopover.taskTitle} onClose={() => setAttachPopover(null)} />,
      document.body,
    )}
    </>
  );
}

/* ─── Task Attachments Popover ─────────────────────────────── */

function TaskAttachmentsPopover({ taskId, taskTitle, onClose }: { taskId: string; taskTitle: string; onClose: () => void }) {
  const { data: attachData, isLoading } = useTaskAttachments(taskId);
  const deleteAttachment = useDeleteTaskAttachment();
  const attachments = attachData?.data ?? [];

  const getIcon = (mime: string) => {
    const t = mime.split("/")[0];
    if (t === "image") return <ImageIcon className="h-4 w-4 shrink-0 text-emerald-400" />;
    if (t === "video") return <Film className="h-4 w-4 shrink-0 text-cyan-400" />;
    if (mime.includes("zip") || mime.includes("rar") || mime.includes("7z")) return <FileArchive className="h-4 w-4 shrink-0 text-indigo-400" />;
    if (mime.includes("pdf") || mime.includes("document") || mime.includes("sheet")) return <FileText className="h-4 w-4 shrink-0 text-amber-400" />;
    return <Paperclip className="h-4 w-4 shrink-0 text-muted" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-4xl border border-white/10 bg-background p-5 shadow-glass">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-primary-light" />
            <h3 className="text-sm font-semibold metal-text truncate max-w-[300px]">{taskTitle}</h3>
          </div>
          <span className="text-xs text-muted">{attachments.length} attachment{attachments.length !== 1 ? "s" : ""}</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner size="sm" /></div>
        ) : attachments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">No attachments.</p>
        ) : (
          <ul className="space-y-1 max-h-80 overflow-y-auto">
            {attachments.map((a) => (
              <li key={a.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/5 group">
                {getIcon(a.mimeType)}
                <div className="min-w-0 flex-1">
                  <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-sm text-foreground hover:text-primary-light transition">
                    {a.fileName}
                  </a>
                  <p className="text-xs text-muted">
                    {formatSize(a.fileSize)}{formatSize(a.fileSize) ? " · " : ""}{a.mimeType}
                  </p>
                </div>
                <button
                  onClick={() => deleteAttachment.mutate({ taskId, attachmentId: a.id })}
                  disabled={deleteAttachment.isPending}
                  className="shrink-0 rounded p-1 text-muted opacity-0 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 transition disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ─── View Group ────────────────────────────────────────────── */

function ViewGroup({ groupId }: { groupId: string }) {
  const { data, isLoading } = useTaskGroup(groupId);
  const { data: tasksData } = useTasks({ taskGroupId: groupId, limit: 5, sortBy: "createdAt", order: "desc" });
  const group = data?.data;
  const tasks = tasksData?.data ?? [];

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="sm" /></div>;
  if (!group) return <p className="py-4 text-center text-sm text-muted">Group not found.</p>;

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
          <p className="mt-0.5 text-xs text-muted">Tasks</p>
        </div>
        <div className="rounded-xl border border-border bg-white/5 p-3 text-center">
          <p className="text-sm font-semibold text-foreground">{new Date(group.createdAt).toLocaleDateString("vi-VN")}</p>
          <p className="mt-0.5 text-xs text-muted">Created</p>
        </div>
        <div className="rounded-xl border border-border bg-white/5 p-3 text-center">
          <p className="text-sm font-semibold text-foreground">{new Date(group.updatedAt).toLocaleDateString("vi-VN")}</p>
          <p className="mt-0.5 text-xs text-muted">Updated</p>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-white/5 p-4">
        <DetailRow label="ID" value={group.id} mono />
        <DetailRow label="Description" value={group.description ?? "—"} />
        <DetailRow label="Created" value={new Date(group.createdAt).toLocaleString("vi-VN")} />
        <DetailRow label="Updated" value={new Date(group.updatedAt).toLocaleString("vi-VN")} />
      </div>

      {tasks.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Recent Tasks</h4>
          <div className="space-y-1">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm">
                <span className="font-mono text-xs text-muted">{t.code ?? "—"}</span>
                <span className="flex-1 truncate text-foreground">{t.title}</span>
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.assignment?.status ?? "—"} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Edit Group ────────────────────────────────────────────── */

function EditGroup({ groupId, onClose }: { groupId: string; onClose: () => void }) {
  const { data, isLoading } = useTaskGroup(groupId);
  const updateMutation = useUpdateTaskGroup();
  const group = data?.data;
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateTaskGroupPayload>({ values: group ? { name: group.name, description: group.description ?? "" } : undefined });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size="sm" /></div>;
  if (!group) return <p className="py-4 text-center text-sm text-muted">Group not found.</p>;

  return (
    <form onSubmit={handleSubmit((payload) => updateMutation.mutate({ id: groupId, payload }, { onSuccess: onClose }))} className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10">
          <Pencil className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Edit Group</h3>
          <p className="mt-0.5 text-sm text-muted">Update name and description.</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
          <input type="text" {...register("name", { required: "Name is required" })} placeholder="Group name" className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none" />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
          <textarea rows={3} {...register("description")} placeholder="Optional description..." className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none resize-none" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="glass" size="md" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary" size="md" isLoading={updateMutation.isPending}>{updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}Save Changes</Button>
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
  const deleteMutation = useDeleteTaskGroup();
  const handleDelete = () => {
    deleteMutation.mutate(groupId, {
      onSuccess: () => { onClose(); onCloseModal?.(); },
    });
  };

  return (
    <div className="space-y-6">
      {/* Warning */}
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10">
            <Trash2 className="h-5 w-5 text-danger" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">
              Delete task group?
            </h3>

            <p className="text-sm leading-6 text-muted">
              You &aposre about to permanently delete{" "}
              <span className="font-semibold text-foreground">
                `&qout`{groupName}`&qout`
              </span>
              .
            </p>

            <p className="text-sm text-muted">
              This action cannot be undone. All tasks associated with this
              group may become ungrouped depending on system settings.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button
          variant="glass"
          onClick={onClose}
          disabled={deleteMutation.isPending}
        >
          Cancel
        </Button>

        <Button
          variant="danger"
          isLoading={deleteMutation.isPending}
          onClick={handleDelete}
        >
          Delete Group
        </Button>
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
            <h3 className="text-base font-semibold text-foreground">Delete task?</h3>
            <p className="text-sm leading-6 text-muted">
              You&apos;re about to permanently delete{" "}
              <span className="font-semibold text-foreground">&ldquo;{taskTitle}&rdquo;</span>.
            </p>
            <p className="text-sm text-muted">This action cannot be undone.</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
        <Button variant="glass" onClick={onClose} disabled={deleteTask.isPending}>Cancel</Button>
        <Button variant="danger" isLoading={deleteTask.isPending} onClick={handleDelete}>Delete Task</Button>
      </div>
    </div>
  );
}

/* ─── Inline Assign Cell ──────────────────────────────────── */

function InlineAssignCell({
  taskId,
  assignment,
}: {
  taskId: string;
  assignment: { id: string; internId: string; intern?: { id: string; fullName: string } } | null;
}) {
  const queryClient = useQueryClient();
  const auth = useContext(AuthContext);
  const currentUserId = auth?.state.user?.id;
  const [open, setOpen] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);

  const { data: myInternsData } = useInterns({ leaderId: currentUserId });
  const { data: allInternsData } = useInterns();
  const myInterns = myInternsData?.data ?? [];
  const otherInterns = (allInternsData?.data ?? []).filter((i) => i.leaderId !== currentUserId);

  const createAssignment = useCreateTaskAssignment();
  const updateAssignment = useUpdateTaskAssignment();
  const deleteAssignment = useDeleteTaskAssignment();

  const isPending = createAssignment.isPending || updateAssignment.isPending || deleteAssignment.isPending;
  const currentInternId = assignment?.internId ?? null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cellRef.current && !cellRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleAssign(internId: string) {
    console.log("[InlineAssignCell] handleAssign", { taskId, internId, hasAssignment: !!assignment, assignmentId: assignment?.id });
    try {
      if (assignment?.id) {
        await updateAssignment.mutateAsync({ id: assignment.id, payload: { internId } });
      } else {
        await createAssignment.mutateAsync({ taskId, internId });
      }
      queryClient.invalidateQueries({ queryKey: ["tasks"] }, { exact: false });
      queryClient.invalidateQueries({ queryKey: ["stats"] }, { exact: false });
    } catch {
      // error toast handled by mutation hooks
    }
    setOpen(false);
  }

  async function handleUnassign() {
    if (!assignment) return;
    try {
      await deleteAssignment.mutateAsync(assignment.id);
      queryClient.invalidateQueries({ queryKey: ["tasks"] }, { exact: false });
      queryClient.invalidateQueries({ queryKey: ["stats"] }, { exact: false });
    } catch {
      // error toast handled by mutation hooks
    }
    setOpen(false);
  }

  const assigneeName = assignment?.intern?.fullName;

  return (
    <div ref={cellRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className={`flex w-full items-center gap-1 rounded-lg px-2 py-1 text-sm transition hover:bg-white/5 disabled:opacity-50 ${
          assigneeName ? "text-foreground" : "text-muted"
        }`}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin shrink-0" />
        ) : assigneeName ? (
          <span className="truncate">{assigneeName}</span>
        ) : (
          <span className="flex items-center gap-1">
            <UserPlus className="h-3 w-3" />
            Assign
          </span>
        )}
        <ChevronDown className="h-3 w-3 shrink-0 text-muted" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-xl border border-border bg-[#1a1d2e] p-1 shadow-lg">
          {/* My Team */}
          {myInterns.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                My Team
              </div>
              {myInterns.map((intern) => (
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

          {/* Other Teams */}
          {otherInterns.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted mt-0.5">
                Other Teams
              </div>
              {otherInterns.map((intern) => (
                <button
                  key={intern.id}
                  onClick={() => handleAssign(intern.id)}
                  disabled={isPending}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-foreground hover:bg-white/5 transition disabled:opacity-50"
                >
                  <span className="truncate flex-1 text-left">
                    {intern.fullName}
                    {intern.leader?.fullName && (
                      <span className="ml-1 text-xs text-muted">({intern.leader.fullName})</span>
                    )}
                  </span>
                  {currentInternId === intern.id && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary-light" />
                  )}
                </button>
              ))}
            </>
          )}

          {/* Unassign */}
          {assignment && (
            <>
              <div className="my-0.5 border-t border-border" />
              <button
                onClick={handleUnassign}
                disabled={isPending}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
              >
                <UserX className="h-3.5 w-3.5" />
                Unassign
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { DONE: "bg-emerald-500/10 text-emerald-400", IN_PROGRESS: "bg-blue-500/10 text-blue-400", REVIEW: "bg-purple-500/10 text-purple-400", TODO: "bg-white/5 text-muted", BLOCKED: "bg-red-500/10 text-red-400", PENDING_APPROVAL: "bg-amber-500/10 text-amber-400" };
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
