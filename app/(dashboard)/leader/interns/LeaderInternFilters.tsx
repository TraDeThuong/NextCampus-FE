"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useRef } from "react";
import { X, RotateCcw } from "lucide-react";

import FilterSelect from "@/components/ui/FilterSelect";
import MetalCard from "@/components/ui/MetalCard";
import { useDepartments } from "@/hooks/department/useDepartments";

export default function LeaderInternFilters() {
  const t = useTranslations("leader.interns");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { data: deptData } = useDepartments();

  const paramFullName = searchParams.get("fullName") ?? "";
  const paramDepartment = searchParams.get("department") ?? "";
  const paramPosition = searchParams.get("position") ?? "";
  const paramStatus = searchParams.get("status") ?? "";

  const searchFullNameRef = useRef<HTMLInputElement>(null);
  const searchPositionRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const departmentOptions = useMemo(
    () =>
      (deptData?.data ?? []).map((d) => ({
        value: d.name,
        label: d.name,
      })),
    [deptData?.data],
  );

  const statusOptions = useMemo(
    () => [
      { value: "ACTIVE", label: t("statusActive") },
      { value: "COMPLETED", label: t("statusCompleted") },
      { value: "DROPPED", label: t("statusDropped") },
    ],
    [t],
  );

  const handleDebouncedChange = (key: string, val: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = val.trim();
      if (trimmed) {
        params.set(key, trimmed);
      } else {
        params.delete(key);
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
  };

  const clearField = (key: string) => {
    if (key === "fullName" && searchFullNameRef.current) {
      searchFullNameRef.current.value = "";
    }
    if (key === "position" && searchPositionRef.current) {
      searchPositionRef.current.value = "";
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearAll = () => {
    if (searchFullNameRef.current) searchFullNameRef.current.value = "";
    if (searchPositionRef.current) searchPositionRef.current.value = "";
    router.push(pathname);
  };

  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; value: string }[] = [];
    if (paramFullName) {
      list.push({ key: "fullName", label: t("search"), value: paramFullName });
    }
    if (paramDepartment) {
      list.push({ key: "department", label: t("department"), value: paramDepartment });
    }
    if (paramPosition) {
      list.push({ key: "position", label: t("position"), value: paramPosition });
    }
    if (paramStatus) {
      const match = statusOptions.find((o) => o.value === paramStatus);
      list.push({
        key: "status",
        label: t("status"),
        value: match ? match.label : paramStatus,
      });
    }
    return list;
  }, [paramFullName, paramDepartment, paramPosition, paramStatus, statusOptions, t]);

  return (
    <MetalCard className="px-6 py-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Full Name / Email Search with Debounce & Clear */}
        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
            {t("search")}
          </label>
          <div className="relative">
            <input
              ref={searchFullNameRef}
              type="text"
              placeholder={t("searchPlaceholder")}
              defaultValue={paramFullName}
              onChange={(e) => handleDebouncedChange("fullName", e.target.value)}
              className="w-full h-[42px] sm:h-[46px] rounded-xl border border-border bg-card px-4 py-2.5 sm:py-3 pr-10 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted cursor-text"
            />
            {paramFullName && (
              <button
                type="button"
                onClick={() => clearField("fullName")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 transition"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Department FilterSelect */}
        <FilterSelect
          label={t("filterDepartment")}
          filterField="department"
          options={departmentOptions}
        />

        {/* Position Search with Debounce & Clear */}
        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
            {t("filterPosition")}
          </label>
          <div className="relative">
            <input
              ref={searchPositionRef}
              type="text"
              placeholder={t("positionPlaceholder")}
              defaultValue={paramPosition}
              onChange={(e) => handleDebouncedChange("position", e.target.value)}
              className="w-full h-[42px] sm:h-[46px] rounded-xl border border-border bg-card px-4 py-2.5 sm:py-3 pr-10 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted cursor-text"
            />
            {paramPosition && (
              <button
                type="button"
                onClick={() => clearField("position")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-1 transition"
                aria-label="Clear position"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status FilterSelect */}
        <FilterSelect
          label={t("filterStatus")}
          filterField="status"
          options={statusOptions}
        />
      </div>

      {/* Active Filter Badges */}
      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
          <span className="text-xs text-muted font-medium mr-1">
            {t("activeFilters")}:
          </span>
          {activeFilters.map((af) => (
            <span
              key={af.key}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary-light/30 bg-primary-light/10 px-2.5 py-1 text-xs font-medium text-primary-light backdrop-blur-md"
            >
              <span>{af.label}: <strong className="text-foreground">{af.value}</strong></span>
              <button
                type="button"
                onClick={() => clearField(af.key)}
                className="hover:text-white transition"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition ml-1 py-1 px-2 rounded-lg hover:bg-white/5 active:scale-95"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t("clearFilters")}</span>
          </button>
        </div>
      )}
    </MetalCard>
  );
}
