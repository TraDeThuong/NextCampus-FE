"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useMemo, useCallback } from "react";
import { X, RotateCcw } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import FilterSelect from "@/components/ui/FilterSelect";
import { useDepartments } from "@/hooks/department/useDepartments";

export default function TaskGroupFilter() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const paramSearch = searchParams.get("search") ?? "";
  const paramDepartmentId = searchParams.get("departmentId") ?? "";
  const paramStatus = searchParams.get("status") ?? "";

  const searchInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: deptData } = useDepartments();
  const departments = useMemo(() => deptData?.data ?? [], [deptData]);

  const deptOptions = useMemo(
    () =>
      departments.map((dept) => ({
        value: dept.id,
        label: dept.name,
      })),
    [departments],
  );

  const statusOptions = useMemo(
    () => [
      { value: "ACTIVE", label: t("leader.taskGroups.statusActive") },
      { value: "COMPLETED", label: t("leader.taskGroups.statusCompleted") },
      { value: "ARCHIVED", label: t("leader.taskGroups.statusArchived") },
    ],
    [t],
  );

  const updateSearch = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        const trimmed = value.trim();
        if (trimmed) {
          params.set("search", trimmed);
        } else {
          params.delete("search");
        }
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
      }, 300);
    },
    [pathname, router, searchParams],
  );

  const clearSearch = useCallback(() => {
    if (searchInputRef.current) searchInputRef.current.value = "";
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const handleClearAll = useCallback(() => {
    if (searchInputRef.current) searchInputRef.current.value = "";
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("departmentId");
    params.delete("status");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const hasFilters = Boolean(paramSearch || paramDepartmentId || paramStatus);

  return (
    <MetalCard className="px-6 py-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Search Input */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            {t("leader.taskGroups.groupName")}
          </label>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              key={`search-filter-${paramSearch}`}
              defaultValue={paramSearch}
              placeholder={t("leader.taskGroups.searchPlaceholder")}
              onChange={(e) => updateSearch(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card py-3 px-5 pr-10 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-cyan-400 focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
            />
            {paramSearch && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition p-0.5 rounded"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* Department Filter */}
        <div className="flex flex-col gap-3">
          <FilterSelect
            label={t("leader.taskGroups.department")}
            filterField="departmentId"
            options={deptOptions}
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-3">
          <FilterSelect
            label={t("leader.taskGroups.status")}
            filterField="status"
            options={statusOptions}
          />
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4 flex items-center justify-end border-t border-border/40 pt-3">
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted transition hover:bg-card hover:text-foreground active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t("leader.taskGroups.resetFilter")}</span>
          </button>
        </div>
      )}
    </MetalCard>
  );
}
