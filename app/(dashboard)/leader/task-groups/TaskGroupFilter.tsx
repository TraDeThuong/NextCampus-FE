"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import { useDepartments } from "@/hooks/department/useDepartments";

export default function TaskGroupFilter() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { data: deptData } = useDepartments();
  const departments = deptData?.data ?? [];

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <MetalCard className="px-6 py-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Search */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t("leader.taskGroups.groupName")}
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder={t("leader.taskGroups.searchPlaceholder")}
              defaultValue={searchParams.get("search") ?? ""}
              onChange={(e) => updateParam("search", e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition hover:border-white/20 focus:border-cyan-400/50"
            />
          </div>
        </div>

        {/* Department Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t("leader.taskGroups.department")}
          </label>
          <select
            value={searchParams.get("departmentId") ?? ""}
            onChange={(e) => updateParam("departmentId", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#0f172a] py-2.5 px-4 text-sm text-white outline-none transition hover:border-white/20 focus:border-cyan-400/50"
          >
            <option value="">{t("leader.taskGroups.allDepartments")}</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {t("leader.taskGroups.status")}
          </label>
          <select
            value={searchParams.get("status") ?? ""}
            onChange={(e) => updateParam("status", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#0f172a] py-2.5 px-4 text-sm text-white outline-none transition hover:border-white/20 focus:border-cyan-400/50"
          >
            <option value="">{t("leader.taskGroups.allStatuses")}</option>
            <option value="ACTIVE">{t("leader.taskGroups.statusActive")}</option>
            <option value="COMPLETED">{t("leader.taskGroups.statusCompleted")}</option>
            <option value="ARCHIVED">{t("leader.taskGroups.statusArchived")}</option>
          </select>
        </div>
      </div>
    </MetalCard>
  );
}
