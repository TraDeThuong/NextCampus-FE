"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Plus, Loader2, Paperclip, X, Link } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCreateTask } from "@/hooks/task/useCreateTask";
import { useUploadTaskAttachment } from "@/hooks/task-attachment/useUploadTaskAttachment";
import { taskAttachmentService } from "@/services/task-attachment.service";
import { taskGroupService } from "@/services/task-group.service";
import type { CreateTaskPayload } from "@/types/task";

interface Props {
  onCloseModal?: () => void;
}

export default function TaskCreateModal({ onCloseModal }: Props) {
  const createTask = useCreateTask();
  const uploadAttachment = useUploadTaskAttachment();
  const [files, setFiles] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [links, setLinks] = useState<{ fileName: string; fileUrl: string }[]>([]);

  const addLink = () => {
    const trimmed = linkUrl.trim();
    if (!trimmed) return;
    const fileName = trimmed.split("/").pop()?.split("?")[0] || "link";
    setLinks((prev) => [...prev, { fileName, fileUrl: trimmed }]);
    setLinkUrl("");
  };

  const { data: taskGroupsData } = useQuery({
    queryKey: ["task-groups"],
    queryFn: taskGroupService.getAll,
    staleTime: 60_000,
  });

  const taskGroups = taskGroupsData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskPayload>();

  const onSubmit = (data: CreateTaskPayload) => {
    createTask.mutate(data, {
      onSuccess: (result) => {
        const taskId = result.data.id;
        files.forEach((file) => {
          uploadAttachment.mutate({ taskId, file });
        });
        links.forEach((link) => {
          taskAttachmentService.createTaskAttachmentLink(taskId, link.fileName, link.fileUrl);
        });
        reset();
        setFiles([]);
        setLinks([]);
        onCloseModal?.();
      },
    });
  };

  const isPending = createTask.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-main/10 text-primary-light">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold metal-text">Create Task</h3>
          <p className="text-sm text-muted">
            Fill in the details to create a new task.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Required fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Task title"
              {...register("title", { required: "Title is required" })}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Deadline <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              {...register("deadline", { required: "Deadline is required" })}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary-light/40 focus:outline-none"
            />
            {errors.deadline && (
              <p className="mt-1 text-xs text-red-400">{errors.deadline.message}</p>
            )}
          </div>
        </div>

        {/* Optional fields — row 1 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Code</label>
            <input
              type="text"
              placeholder="e.g. BE1-01"
              {...register("code")}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Priority</label>
            <select
              {...register("priority")}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary-light/40 focus:outline-none"
            >
              <option value="">Select priority...</option>
              <option value="HIGH">P0 — High</option>
              <option value="MEDIUM">P1 — Medium</option>
              <option value="LOW">P2 — Low</option>
            </select>
          </div>
        </div>

        {/* Optional fields — row 2 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Start Date</label>
            <input
              type="date"
              {...register("startDate")}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary-light/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Est. Days</label>
            <input
              type="number"
              min={1}
              placeholder="Number of days"
              {...register("estDays", { valueAsNumber: true, min: { value: 1, message: "Must be at least 1" } })}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none"
            />
            {errors.estDays && (
              <p className="mt-1 text-xs text-red-400">{errors.estDays.message}</p>
            )}
          </div>
        </div>

        {/* Optional fields — row 3 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Phase</label>
            <input
              type="text"
              placeholder="e.g. Phase 1 - Foundation"
              {...register("phase")}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Module</label>
            <input
              type="text"
              placeholder="e.g. Setup"
              {...register("module")}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Task Group */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Task Group</label>
          <select
            {...register("taskGroupId")}
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary-light/40 focus:outline-none"
          >
            <option value="">No group...</option>
            {taskGroups.map((tg) => (
              <option key={tg.id} value={tg.id}>
                {tg.name}
              </option>
            ))}
          </select>
        </div>

        {/* Textareas */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
          <textarea
            rows={2}
            placeholder="Task description..."
            {...register("description")}
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Acceptance Criteria</label>
            <textarea
              rows={2}
              placeholder="Acceptance criteria..."
              {...register("acceptanceCriteria")}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Notes</label>
            <textarea
              rows={2}
              placeholder="Additional notes..."
              {...register("taskNotes")}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Attachments</label>
          <div className="space-y-2">
            {/* File upload */}
            <input
              type="file"
              multiple
              onChange={(e) => {
                const selected = Array.from(e.target.files ?? []);
                setFiles((prev) => [...prev, ...selected]);
              }}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary-main/10 file:px-3 file:py-1 file:text-xs file:text-primary-light file:cursor-pointer focus:border-primary-light/40 focus:outline-none"
            />
            {/* Link input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }}
                placeholder="Or paste a URL..."
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none"
              />
              <Button type="button" variant="glass" size="sm" onClick={addLink} disabled={!linkUrl.trim()}>
                <Link className="h-3 w-3" />
                Add
              </Button>
            </div>
          </div>
          {(files.length > 0 || links.length > 0) && (
            <ul className="mt-2 space-y-1">
              {files.map((f, i) => (
                <li key={`file-${i}`} className="flex items-center gap-2 text-sm text-muted">
                  <Paperclip className="h-3 w-3 shrink-0" />
                  <span className="truncate">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="ml-auto shrink-0 rounded p-0.5 text-muted hover:bg-white/10 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
              {links.map((l, i) => (
                <li key={`link-${i}`} className="flex items-center gap-2 text-sm text-muted">
                  <Link className="h-3 w-3 shrink-0" />
                  <span className="truncate">{l.fileName}</span>
                  <span className="text-xs text-muted/60">{l.fileUrl}</span>
                  <button
                    type="button"
                    onClick={() => setLinks((prev) => prev.filter((_, j) => j !== i))}
                    className="ml-auto shrink-0 rounded p-0.5 text-muted hover:bg-white/10 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="glass"
            size="md"
            disabled={isPending}
            onClick={onCloseModal}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Create Task
          </Button>
        </div>
      </form>
    </div>
  );
}
