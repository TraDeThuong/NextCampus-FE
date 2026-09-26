"use client";

import { useMemo, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { X, RotateCcw } from "lucide-react";
import FilterSelect from "@/components/ui/FilterSelect";
import { DateRangePicker } from "@/components/ui/DatePicker";
import MetalCard from "@/components/ui/MetalCard";

export default function InternTaskFilters() {
  const t = useTranslations("intern.tasks");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const search = searchParams.get("search") ?? "";
  const paramStatus = searchParams.get("status") ?? "";
  const paramPriority = searchParams.get("priority") ?? "";
  const paramDeadlineFrom = searchParams.get("deadlineFrom") ?? "";
  const paramDeadlineTo = searchParams.get("deadlineTo") ?? "";
  const paramRole = searchParams.get("role") ?? "ALL";

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const STATUS_OPTIONS = useMemo(
    () => [
      { value: "TODO", label: t("statusTodo") },
      { value: "IN_PROGRESS", label: t("statusInProgress") },
      { value: "REVIEW", label: t("statusReview") },
      { value: "DONE", label: t("statusDone") },
      { value: "BLOCKED", label: t("statusBlocked") },
      { value: "PENDING_APPROVAL", label: t("statusPendingApproval") },
    ],
    [t],
  );

  const PRIORITY_OPTIONS = useMemo(
    () => [
      { value: "HIGH", label: t("priorityHigh") },
      { value: "MEDIUM", label: t("priorityMedium") },
      { value: "LOW", label: t("priorityLow") },
    ],
    [t],
  );

  const handleDebouncedSearch = (val: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = val.trim();
      if (trimmed) {
        params.set("search", trimmed);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (start) {
      params.set("deadlineFrom", start);
    } else {
      params.delete("deadlineFrom");
    }
    if (end) {
      params.set("deadlineTo", end);
    } else {
      params.delete("deadlineTo");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearDateRange = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("deadlineFrom");
    params.delete("deadlineTo");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRoleChange = (role: "ALL" | "OWNER" | "SUPPORT") => {
    const params = new URLSearchParams(searchParams.toString());
    if (role === "ALL") {
      params.delete("role");
    } else {
      params.set("role", role);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearAll = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasFilters = Boolean(
    search ||
      paramStatus ||
      paramPriority ||
      paramDeadlineFrom ||
      paramDeadlineTo ||
      (paramRole && paramRole !== "ALL"),
  );

  return (
    <MetalCard className="px-6 py-5">
      <div className="space-y-4">
        {/* Role Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-border/40">
          <button
            type="button"
            onClick={() => handleRoleChange("ALL")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              paramRole === "ALL"
                ? "border border-cyan-300 bg-cyan-100/90 text-cyan-800 shadow-sm dark:border-cyan-500/40 dark:bg-cyan-500/20 dark:text-cyan-300 dark:shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                : "border border-border/70 bg-surface-elevated text-muted hover:bg-slate-100 hover:text-foreground dark:hover:bg-white/5 dark:hover:text-foreground"
            }`}
          >
            {t("roleAll")}
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("OWNER")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              paramRole === "OWNER"
                ? "border border-emerald-300 bg-emerald-100/90 text-emerald-800 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-300 dark:shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "border border-border/70 bg-surface-elevated text-muted hover:bg-slate-100 hover:text-foreground dark:hover:bg-white/5 dark:hover:text-foreground"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
            {t("roleOwner")}
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("SUPPORT")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              paramRole === "SUPPORT"
                ? "border border-purple-300 bg-purple-100/90 text-purple-800 shadow-sm dark:border-purple-500/40 dark:bg-purple-500/20 dark:text-purple-300 dark:shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                : "border border-border/70 bg-surface-elevated text-muted hover:bg-slate-100 hover:text-foreground dark:hover:bg-white/5 dark:hover:text-foreground"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 dark:bg-purple-400"></span>
            {t("roleSupport")}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          {/* 1. Search by Code or Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
              {t("searchCodeOrTitle")}
            </label>
            <div className="relative">
              <input
                type="text"
                key={`search-${search}`}
                defaultValue={search}
                placeholder={t("searchPlaceholder")}
                onChange={(e) => handleDebouncedSearch(e.target.value)}
                className="w-full h-[46px] rounded-2xl border border-border bg-card px-5 pr-10 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
              />
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition p-0.5 rounded cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Status Filter */}
          <FilterSelect
            label={t("status")}
            filterField="status"
            options={STATUS_OPTIONS}
          />

          {/* 3. Priority Filter */}
          <FilterSelect
            label={t("priority")}
            filterField="priority"
            options={PRIORITY_OPTIONS}
          />

          {/* 4. Deadline DateRangePicker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
              {t("deadline")}
            </label>
            <DateRangePicker
              startDate={paramDeadlineFrom}
              endDate={paramDeadlineTo}
              onChange={handleDateRangeChange}
              onClear={handleClearDateRange}
              placeholder={t("filterDeadline")}
              className="w-full [&>button]:w-full [&>button]:h-[46px] [&>button]:rounded-2xl [&>button]:px-5 [&>button]:text-sm [&>button]:justify-start [&>button]:text-left [&>button>[role=button]]:ml-auto"
            />
          </div>
        </div>

        {/* Active Filter Pills & Reset Button */}
        {hasFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/40">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted font-medium">
                {t("activeFilters")}:
              </span>

              {search && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                  {t("searchCodeOrTitle")}: {search}
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="hover:text-rose-500 transition cursor-pointer"
                    aria-label="Remove search filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {paramStatus && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                  {t("status")}:{" "}
                  {STATUS_OPTIONS.find((s) => s.value === paramStatus)?.label ??
                    paramStatus}
                  <button
                    type="button"
                    onClick={() => handleClearParam("status")}
                    className="hover:text-rose-500 transition cursor-pointer"
                    aria-label="Remove status filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {paramPriority && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                  {t("priority")}:{" "}
                  {PRIORITY_OPTIONS.find((p) => p.value === paramPriority)?.label ??
                    paramPriority}
                  <button
                    type="button"
                    onClick={() => handleClearParam("priority")}
                    className="hover:text-rose-500 transition cursor-pointer"
                    aria-label="Remove priority filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {(paramDeadlineFrom || paramDeadlineTo) && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-300">
                  {t("deadline")}: {paramDeadlineFrom || "..."} →{" "}
                  {paramDeadlineTo || "..."}
                  <button
                    type="button"
                    onClick={handleClearDateRange}
                    className="hover:text-rose-500 transition cursor-pointer"
                    aria-label="Remove deadline filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-cyan-400 transition py-1 px-2.5 rounded-lg hover:bg-card active:scale-95 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span>{t("clearFilters")}</span>
            </button>
          </div>
        )}
      </div>
    </MetalCard>
  );
}
