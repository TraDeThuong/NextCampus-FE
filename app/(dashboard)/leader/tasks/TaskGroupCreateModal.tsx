"use client";

import { useForm } from "react-hook-form";
import { Layers, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCreateTaskGroup } from "@/hooks/task-group/useCreateTaskGroup";
import { useDepartments } from "@/hooks/department/useDepartments";
import type { CreateTaskGroupPayload } from "@/types/task-group";

interface Props {
  onCloseModal?: () => void;
}

export default function TaskGroupCreateModal({ onCloseModal }: Props) {
  const createTaskGroup = useCreateTaskGroup();
  const { data: deptData, isLoading: deptsLoading } = useDepartments();
  const departments = deptData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskGroupPayload>();

  const onSubmit = (data: CreateTaskGroupPayload) => {
    createTaskGroup.mutate(
      {
        ...data,
        departmentId: data.departmentId || null,
      },
      {
        onSuccess: () => {
          reset();
          onCloseModal?.();
        },
      },
    );
  };

  const isPending = createTaskGroup.isPending;

  return (
    <div className="px-2 py-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-main/10 text-primary-light">
        <Layers className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">
        Create Task Group
      </h3>
      <p className="mt-2 text-sm text-slate-400">
        Create a new group to organize tasks.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-4 text-left"
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Group Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Backend Crawl Project"
            {...register("name", { required: "Name is required" })}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white outline-none transition focus:border-primary-light/50 placeholder:text-slate-600"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Department (Department)
          </label>
          <select
            {...register("departmentId")}
            className="w-full rounded-xl border border-white/10 bg-[#121624] py-3 px-4 text-sm text-white outline-none transition focus:border-primary-light/50"
            disabled={deptsLoading}
          >
            <option value="">-- All departments (General) --</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-300">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Description (optional)"
            {...register("description")}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white outline-none transition focus:border-primary-light/50 placeholder:text-slate-600 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCloseModal}
            disabled={isPending}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-300 transition hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <Button type="submit" variant="glass" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Layers className="h-4 w-4 mr-2" />
            )}
            Create Group
          </Button>
        </div>
      </form>
    </div>
  );
}
