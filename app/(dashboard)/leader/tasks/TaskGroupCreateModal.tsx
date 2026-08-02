"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Layers, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCreateTaskGroup } from "@/hooks/task-group/useCreateTaskGroup";
import { useDepartments } from "@/hooks/department/useDepartments";
import type { CreateTaskGroupPayload } from "@/types/task-group";
import TaskGroupMemberSelector from "./TaskGroupMemberSelector";

interface Props {
  onCloseModal?: () => void;
}

export default function TaskGroupCreateModal({ onCloseModal }: Props) {
  const createTaskGroup = useCreateTaskGroup();
  const { data: deptData, isLoading: deptsLoading } = useDepartments();
  const departments = deptData?.data ?? [];
  const [departmentId, setDepartmentId] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskGroupPayload>({
    defaultValues: {
      maxWorkloadDays: 10,
      maxActiveTasks: null,
      requireAllMembers: false,
    },
  });

  const onSubmit = (data: CreateTaskGroupPayload) => {
    createTaskGroup.mutate(
      {
        ...data,
        departmentId: data.departmentId || null,
        memberIds,
      },
      {
        onSuccess: () => {
          reset();
          setDepartmentId("");
          setMemberIds([]);
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
            Department (Phòng ban)
          </label>
          <select
            {...register("departmentId", {
              onChange: (event) => {
                setDepartmentId(event.target.value);
                setMemberIds([]);
              },
            })}
            className="w-full rounded-xl border border-white/10 bg-[#121624] py-3 px-4 text-sm text-white outline-none transition focus:border-primary-light/50"
            disabled={deptsLoading}
          >
            <option value="">-- Tất cả phòng ban (Chung) --</option>
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
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Tải tối đa (ngày)
            </label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              {...register("maxWorkloadDays", { valueAsNumber: true })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-primary-light/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Số task active tối đa
            </label>
            <input
              type="number"
              min={1}
              placeholder="Không giới hạn"
              {...register("maxActiveTasks", {
                setValueAs: (value) => (value === "" ? null : Number(value)),
              })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-primary-light/50 placeholder:text-slate-600"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <input
            type="checkbox"
            {...register("requireAllMembers")}
            className="mt-0.5 h-4 w-4 accent-sky-500"
          />
          <span>
            <span className="block text-sm text-white">Dùng đủ thành viên</span>
            <span className="block text-[11px] text-slate-500">
              Khi xác nhận, mỗi thành viên phải tham gia ít nhất một task với vai trò Owner hoặc Support.
            </span>
          </span>
        </label>

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
