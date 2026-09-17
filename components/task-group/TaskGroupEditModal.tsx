"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Layers, Loader2, X, Search, Check } from "lucide-react";
import { useUpdateTaskGroup } from "@/hooks/task-group/useUpdateTaskGroup";
import { useDepartments } from "@/hooks/department/useDepartments";
import { useInterns } from "@/hooks/intern/useInterns";
import type { TaskGroup, TaskGroupStatus } from "@/types/task-group";

interface TaskGroupEditModalProps {
  taskGroup: TaskGroup;
  onCloseModal?: () => void;
}

export default function TaskGroupEditModal({
  taskGroup,
  onCloseModal,
}: TaskGroupEditModalProps) {
  const t = useTranslations();
  const { mutate: updateGroup, isPending } = useUpdateTaskGroup();
  const { data: deptData } = useDepartments();
  const { data: internsData } = useInterns({ limit: 100 });

  const departments = deptData?.data ?? [];
  const allInterns = internsData?.data ?? [];

  const [name, setName] = useState(taskGroup.name);
  const [description, setDescription] = useState(taskGroup.description || "");
  const [departmentId, setDepartmentId] = useState<string>(
    taskGroup.departmentId || "",
  );
  const [status, setStatus] = useState<TaskGroupStatus>(taskGroup.status || "ACTIVE");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    taskGroup.members?.map((m) => m.internId) || [],
  );
  const [searchIntern, setSearchIntern] = useState("");
  const [maxWorkloadDays, setMaxWorkloadDays] = useState(
    taskGroup.maxWorkloadDays || 14,
  );
  const [nameError, setNameError] = useState("");

  const filteredInterns = allInterns.filter((intern) => {
    if (!intern.user?.isActive && intern.status !== "ACTIVE") return false;
    const matchesSearch =
      intern.fullName.toLowerCase().includes(searchIntern.toLowerCase()) ||
      (intern.user?.email || "").toLowerCase().includes(searchIntern.toLowerCase());
    const matchesDept = !departmentId || intern.department?.id === departmentId;
    return matchesSearch && matchesDept;
  });

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(t("leader.taskGroups.nameRequired"));
      return;
    }
    setNameError("");

    updateGroup(
      {
        id: taskGroup.id,
        payload: {
          name: name.trim(),
          description: description.trim() || null,
          departmentId: departmentId || null,
          status,
          memberIds: selectedMemberIds,
          maxWorkloadDays,
        },
      },
      {
        onSuccess: () => {
          onCloseModal?.();
        },
      },
    );
  };

  return (
    <div className="px-2 py-4 text-left">
      <div className="flex items-center gap-2 mb-2">
        <Layers className="w-5 h-5 text-cyan-400 shrink-0" />
        <h2 className="text-lg font-bold text-white">
          {t("leader.taskGroups.editTitle")}
        </h2>
      </div>
      <p className="text-xs text-slate-400 mb-5">
        {t("leader.taskGroups.editDescription")}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            {t("leader.taskGroups.nameLabel")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError("");
            }}
            placeholder={t("leader.taskGroups.namePlaceholder")}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3 text-sm text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600"
          />
          {nameError && (
            <p className="text-xs text-red-400 mt-1">{nameError}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            {t("leader.taskGroups.descLabel")}
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("leader.taskGroups.descPlaceholder")}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600 resize-none"
          />
        </div>

        {/* Department & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              {t("leader.taskGroups.deptLabel")}
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] py-2.5 px-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
            >
              <option value="">{t("leader.taskGroups.selectDept")}</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              {t("leader.taskGroups.statusLabel")}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskGroupStatus)}
              className="w-full rounded-xl border border-white/10 bg-[#0f172a] py-2.5 px-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
            >
              <option value="ACTIVE">{t("leader.taskGroups.statusActive")}</option>
              <option value="COMPLETED">{t("leader.taskGroups.statusCompleted")}</option>
              <option value="ARCHIVED">{t("leader.taskGroups.statusArchived")}</option>
            </select>
          </div>
        </div>

        {/* Max workload days */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            {t("leader.taskGroups.maxWorkloadLabel")}
          </label>
          <input
            type="number"
            min={1}
            max={90}
            value={maxWorkloadDays}
            onChange={(e) => setMaxWorkloadDays(parseInt(e.target.value, 10) || 14)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
          />
        </div>

        {/* Member allocation multi-select */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {t("leader.taskGroups.selectMembersLabel")} ({selectedMemberIds.length})
            </label>
          </div>

          {/* Selected chips */}
          {selectedMemberIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2 max-h-20 overflow-y-auto p-2 bg-white/[0.02] border border-white/5 rounded-xl">
              {selectedMemberIds.map((id) => {
                const intern = allInterns.find((i) => i.id === id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-300 ring-1 ring-inset ring-cyan-500/20"
                  >
                    {intern?.fullName || id}
                    <button
                      type="button"
                      onClick={() => toggleMember(id)}
                      className="hover:text-red-400 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Search intern input */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={searchIntern}
              onChange={(e) => setSearchIntern(e.target.value)}
              placeholder={t("leader.taskGroups.searchInternPlaceholder")}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600"
            />
          </div>

          {/* Interns list searchable and scrollable max-h-48 */}
          <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl border border-white/5 bg-[#090d16] p-1.5 custom-scrollbar">
            {filteredInterns.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center italic">
                {t("leader.taskGroups.noMembers")}
              </p>
            ) : (
              filteredInterns.map((intern) => {
                const isSelected = selectedMemberIds.includes(intern.id);
                return (
                  <div
                    key={intern.id}
                    onClick={() => toggleMember(intern.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                      isSelected
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                        : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-white">{intern.fullName}</p>
                      <p className="text-[11px] text-slate-400">
                        {intern.position?.name || intern.department?.name || intern.user?.email}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onCloseModal}
            disabled={isPending}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 hover:text-white transition"
          >
            {t("leader.taskGroups.cancel")}
          </button>
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("leader.taskGroups.updating")}
              </>
            ) : (
              t("leader.taskGroups.saveChanges")
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
