"use client";

import { Users } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useInterns } from "@/hooks/intern/useInterns";

interface Props {
  departmentId?: string | null;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function TaskGroupMemberSelector({
  departmentId,
  selectedIds,
  onChange,
}: Props) {
  const { state } = useAuth();
  const { data, isLoading } = useInterns({
    status: "ACTIVE",
    departmentId: departmentId || undefined,
    leaderId: state.user?.role === "LEADER" ? state.user.id : undefined,
    sortBy: "fullName",
    order: "asc",
    limit: 100,
  });
  const interns = data?.data ?? [];

  const toggle = (internId: string) => {
    onChange(
      selectedIds.includes(internId)
        ? selectedIds.filter((id) => id !== internId)
        : [...selectedIds, internId],
    );
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
          <Users className="h-3.5 w-3.5 text-sky-400" />
          Thành viên Task Group
        </label>
        <span className="text-xs text-sky-400">Đã chọn {selectedIds.length}</span>
      </div>
      <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-2">
        {isLoading ? (
          <p className="px-2 py-3 text-center text-xs text-slate-500">
            Đang tải danh sách TTS...
          </p>
        ) : interns.length === 0 ? (
          <p className="px-2 py-3 text-center text-xs text-slate-500">
            Không có TTS active phù hợp với leader/phòng ban đã chọn.
          </p>
        ) : (
          interns.map((intern) => (
            <label
              key={intern.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition hover:bg-white/5"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(intern.id)}
                onChange={() => toggle(intern.id)}
                className="h-4 w-4 rounded border-white/20 bg-transparent accent-sky-500"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-white">
                  {intern.fullName}
                </span>
                <span className="block truncate text-[11px] text-slate-500">
                  {intern.user.email}
                  {intern.position?.name ? ` · ${intern.position.name}` : ""}
                </span>
              </span>
            </label>
          ))
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">
        AI chỉ được phép phân công những TTS được chọn tại đây.
      </p>
    </div>
  );
}
