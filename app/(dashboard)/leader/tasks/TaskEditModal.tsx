"use client";

import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useUpdateTask } from "@/hooks/task/useUpdateTask";
import { useTask } from "@/hooks/task/useTask";
import type { UpdateTaskPayload } from "@/types/task";

const TODAY = new Date().toISOString().split("T")[0];

interface Props {
  taskId: string;
  onClose?: () => void;
  onCloseModal?: () => void;
}

export default function TaskEditModal({ taskId, onClose, onCloseModal }: Props) {
  const queryClient = useQueryClient();
  const updateTask = useUpdateTask();

  const { data: taskData, isLoading } = useTask(taskId);

  const task = taskData?.data;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdateTaskPayload>({
    mode: "onBlur",
    values: task
      ? {
          title: task.title,
          description: task.description ?? "",
          deadline: task.deadline ? task.deadline.split("T")[0] : "",
          priority: task.priority ?? undefined,
          code: task.code ?? "",
          startDate: task.startDate ? task.startDate.split("T")[0] : "",
          estDays: task.estDays ?? undefined,
          phase: task.phase ?? "",
          module: task.module ?? "",
          acceptanceCriteria: task.acceptanceCriteria ?? "",
          taskNotes: task.taskNotes ?? "",
          taskGroupId: task.taskGroupId ?? undefined,
        }
      : undefined,
  });

  const deadlineVal = watch("deadline");

  const onSubmit = async (data: UpdateTaskPayload) => {
    const payload: UpdateTaskPayload = {
      ...data,
      estDays: data.estDays || undefined,
      startDate: data.startDate || undefined,
      taskGroupId: data.taskGroupId || undefined,
      priority: data.priority || undefined,
      code: data.code || undefined,
      description: data.description || undefined,
      phase: data.phase || undefined,
      module: data.module || undefined,
      acceptanceCriteria: data.acceptanceCriteria || undefined,
      taskNotes: data.taskNotes || undefined,
    };

    try {
      await updateTask.mutateAsync({ id: taskId, payload });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      onClose?.();
      onCloseModal?.();
    } catch {
      // onError toast handled by useUpdateTask
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="md" />
      </div>
    );
  }

  if (!task) {
    return <p className="py-8 text-center text-sm text-muted">Task not found.</p>;
  }

  const inputClass = (name: keyof UpdateTaskPayload, extra = "") =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none ${
      errors[name]
        ? "border-red-400/60 focus:border-red-400"
        : "border-border bg-card focus:border-primary-light/40"
    } ${extra}`;

  const ErrorMsg = ({ name }: { name: keyof UpdateTaskPayload }) =>
    errors[name] ? (
      <p className="mt-1 text-xs text-red-400">{errors[name]?.message}</p>
    ) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
          <Pencil className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold metal-text">Edit Task</h3>
          <p className="text-sm text-muted">{task.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Task title"
              {...register("title", {
                required: "Title is required",
                maxLength: { value: 255, message: "Title must be under 255 characters" },
              })}
              className={inputClass("title")}
            />
            <ErrorMsg name="title" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Deadline <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              {...register("deadline", {
                required: "Deadline is required",
                validate: (v) => !v || v >= TODAY || "Deadline cannot be in the past",
              })}
              className={inputClass("deadline")}
            />
            <ErrorMsg name="deadline" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Code</label>
            <input
              type="text"
              placeholder="e.g. BE1-01"
              {...register("code", {
                pattern: { value: /^[A-Za-z0-9._-]*$/, message: "Only letters, numbers, . _ - allowed" },
                maxLength: { value: 50, message: "Code must be under 50 characters" },
              })}
              className={inputClass("code")}
            />
            <ErrorMsg name="code" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Priority</label>
            <select
              {...register("priority", {
                validate: (v) => !v || ["HIGH", "MEDIUM", "LOW"].includes(v) || "Invalid priority",
              })}
              className={inputClass("priority", "bg-card")}
            >
              <option value="">Select priority...</option>
              <option value="HIGH">P0 — High</option>
              <option value="MEDIUM">P1 — Medium</option>
              <option value="LOW">P2 — Low</option>
            </select>
            <ErrorMsg name="priority" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Start Date</label>
            <input
              type="date"
              {...register("startDate", {
                validate: (v) => {
                  if (!v) return true;
                  if (deadlineVal && v > deadlineVal) return "Start date must be before deadline";
                  return true;
                },
              })}
              className={inputClass("startDate")}
            />
            <ErrorMsg name="startDate" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Est. Days</label>
            <input
              type="number"
              min={1}
              placeholder="Number of days"
              {...register("estDays", {
                valueAsNumber: true,
                min: { value: 1, message: "Must be at least 1 day" },
                max: { value: 365, message: "Must be under 365 days" },
              })}
              className={inputClass("estDays")}
            />
            <ErrorMsg name="estDays" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Phase</label>
            <input
              type="text"
              placeholder="e.g. Phase 1"
              {...register("phase", { maxLength: { value: 100, message: "Phase must be under 100 characters" } })}
              className={inputClass("phase")}
            />
            <ErrorMsg name="phase" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Module</label>
            <input
              type="text"
              placeholder="e.g. Setup"
              {...register("module", { maxLength: { value: 100, message: "Module must be under 100 characters" } })}
              className={inputClass("module")}
            />
            <ErrorMsg name="module" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
          <textarea
            rows={2}
            placeholder="Task description..."
            {...register("description", { maxLength: { value: 2000, message: "Description must be under 2000 characters" } })}
            className={inputClass("description", "resize-none")}
          />
          <ErrorMsg name="description" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Acceptance Criteria</label>
            <textarea
              rows={2}
              placeholder="Acceptance criteria..."
              {...register("acceptanceCriteria", { maxLength: { value: 2000, message: "Must be under 2000 characters" } })}
              className={inputClass("acceptanceCriteria", "resize-none")}
            />
            <ErrorMsg name="acceptanceCriteria" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Notes</label>
            <textarea
              rows={2}
              placeholder="Additional notes..."
              {...register("taskNotes", { maxLength: { value: 2000, message: "Must be under 2000 characters" } })}
              className={inputClass("taskNotes", "resize-none")}
            />
            <ErrorMsg name="taskNotes" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="glass" size="md" disabled={updateTask.isPending} onClick={onCloseModal}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={updateTask.isPending}>
            {updateTask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
