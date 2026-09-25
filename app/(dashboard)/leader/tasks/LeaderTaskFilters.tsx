"use client";

import { useMemo, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { X, RotateCcw, Clock } from "lucide-react";
import FilterSelect from "@/components/ui/FilterSelect";
import SortSelect from "@/components/ui/SortSelect";
import { DateRangePicker } from "@/components/ui/DatePicker";
import MetalCard from "@/components/ui/MetalCard";

export default function LeaderTaskFilters() {
  const t = useTranslations("leader.tasks");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const paramCode = searchParams.get("code") ?? "";
  const paramTitle = searchParams.get("title") ?? "";
  const paramOwner = searchParams.get("owner") ?? "";
  const paramStatus = searchParams.get("status") ?? "";
  const paramPhase = searchParams.get("phase") ?? "";
  const paramDeadlineFrom = searchParams.get("deadlineFrom") ?? "";
  const paramDeadlineTo = searchParams.get("deadlineTo") ?? "";
  const paramSortBy = searchParams.get("sortBy") ?? "";
  const paramOrder = searchParams.get("order") ?? "";

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const STATUS_OPTIONS = useMemo(
    () => [
      { value: "TODO", label: t("statusTodo") },
      { value: "IN_PROGRESS", label: t("statusInProgress") },
      { value: "REVIEW", label: t("statusReview") },
      { value: "DONE", label: t("statusDone") },
      { value: "BLOCKED", label: t("statusBlocked") },
      { value: "PENDING_APPROVAL", label: t("statusPendingApproval") },
      { value: "EXTENSION_PENDING", label: t("statusExtensionPending") },
    ],
    [t],
  );

  const SORT_OPTIONS = useMemo(
    () => [
      { sortBy: "createdAt", order: "desc", label: t("sortNewestFirst") },
      { sortBy: "createdAt", order: "asc", label: t("sortOldestFirst") },
      { sortBy: "title", order: "asc", label: t("sortTitleAZ") },
      { sortBy: "title", order: "desc", label: t("sortTitleZA") },
      { sortBy: "deadline", order: "asc", label: t("sortDeadlineEarliest") },
      { sortBy: "deadline", order: "desc", label: t("sortDeadlineLatest") },
      { sortBy: "priority", order: "desc", label: t("sortPriorityHighLow") },
      { sortBy: "priority", order: "asc", label: t("sortPriorityLowHigh") },
    ],
    [t],
  );

  const handleDebouncedParam = (key: string, val: string) => {
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

  const handleClearAll = () => {
    const params = new URLSearchParams();
    const taskGroupId = searchParams.get("taskGroupId");
    if (taskGroupId) params.set("taskGroupId", taskGroupId);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeFilterCount =
    (paramCode ? 1 : 0) +
    (paramTitle ? 1 : 0) +
    (paramOwner ? 1 : 0) +
    (paramStatus ? 1 : 0) +
    (paramPhase ? 1 : 0) +
    (paramDeadlineFrom || paramDeadlineTo ? 1 : 0) +
    (paramSortBy && (paramSortBy !== "createdAt" || paramOrder !== "desc") ? 1 : 0);

  return (
    <MetalCard className="px-6 py-5">
      <div className="space-y-4">
        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-3">
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("status");
              params.set("page", "1");
              router.push(`${pathname}?${params.toString()}`);
            }}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer ${
              !paramStatus
                ? "bg-primary-main/20 text-primary-light border border-primary-light/40 shadow-[0_0_12px_rgba(21,174,245,0.2)]"
                : "border border-border/60 bg-card/60 text-muted hover:text-foreground hover:bg-card"
            }`}
          >
            {t("allTasks")}
          </button>

          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("status", "REVIEW");
              params.set("page", "1");
              router.push(`${pathname}?${params.toString()}`);
            }}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
              paramStatus === "REVIEW"
                ? "bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                : "border border-border/60 bg-card/60 text-muted hover:text-foreground hover:bg-card"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            {t("statusReview")}
          </button>

          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("status", "EXTENSION_PENDING");
              params.set("page", "1");
              router.push(`${pathname}?${params.toString()}`);
            }}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
              paramStatus === "EXTENSION_PENDING"
                ? "bg-amber-500/25 text-amber-300 border border-amber-400/60 shadow-[0_0_14px_rgba(245,158,11,0.25)] animate-pulse"
                : "border border-amber-500/30 bg-amber-500/10 text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/15"
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>{t("tabExtensionRequests")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("status", "BLOCKED");
              params.set("page", "1");
              router.push(`${pathname}?${params.toString()}`);
            }}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
              paramStatus === "BLOCKED"
                ? "bg-rose-500/20 text-rose-300 border border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
                : "border border-border/60 bg-card/60 text-muted hover:text-foreground hover:bg-card"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            {t("statusBlocked")}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-end">
          {/* 1. Code Search */}
          <div className="flex flex-col gap-3">
            <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
              {t("searchCode")}
            </label>
            <div className="relative">
              <input
                type="text"
                key={`code-${paramCode}`}
                defaultValue={paramCode}
                placeholder={t("searchCodePlaceholder")}
                onChange={(e) => handleDebouncedParam("code", e.target.value)}
                className="w-full h-[46px] rounded-2xl border border-border bg-card px-5 pr-10 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
              />
              {paramCode && (
                <button
                  type="button"
                  onClick={() => handleClearParam("code")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition p-0.5 rounded cursor-pointer"
                  aria-label="Clear code search"
                >
                  <X className="h-4 w-4 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Title Search */}
          <div className="flex flex-col gap-3">
            <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
              {t("searchTitle")}
            </label>
            <div className="relative">
              <input
                type="text"
                key={`title-${paramTitle}`}
                defaultValue={paramTitle}
                placeholder={t("searchTitlePlaceholder")}
                onChange={(e) => handleDebouncedParam("title", e.target.value)}
                className="w-full h-[46px] rounded-2xl border border-border bg-card px-5 pr-10 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
              />
              {paramTitle && (
                <button
                  type="button"
                  onClick={() => handleClearParam("title")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition p-0.5 rounded cursor-pointer"
                  aria-label="Clear title search"
                >
                  <X className="h-4 w-4 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* 3. Owner Search */}
          <div className="flex flex-col gap-3">
            <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
              {t("searchOwner")}
            </label>
            <div className="relative">
              <input
                type="text"
                key={`owner-${paramOwner}`}
                defaultValue={paramOwner}
                placeholder={t("searchOwnerPlaceholder")}
                onChange={(e) => handleDebouncedParam("owner", e.target.value)}
                className="w-full h-[46px] rounded-2xl border border-border bg-card px-5 pr-10 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
              />
              {paramOwner && (
                <button
                  type="button"
                  onClick={() => handleClearParam("owner")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition p-0.5 rounded cursor-pointer"
                  aria-label="Clear owner search"
                >
                  <X className="h-4 w-4 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* 4. Status Filter */}
          <FilterSelect
            label={t("status")}
            filterField="status"
            options={STATUS_OPTIONS}
          />

          {/* 5. Phase Search */}
          <div className="flex flex-col gap-3">
            <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
              {t("searchPhase")}
            </label>
            <div className="relative">
              <input
                type="text"
                key={`phase-${paramPhase}`}
                defaultValue={paramPhase}
                placeholder={t("searchPhasePlaceholder")}
                onChange={(e) => handleDebouncedParam("phase", e.target.value)}
                className="w-full h-[46px] rounded-2xl border border-border bg-card px-5 pr-10 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
              />
              {paramPhase && (
                <button
                  type="button"
                  onClick={() => handleClearParam("phase")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition p-0.5 rounded cursor-pointer"
                  aria-label="Clear phase search"
                >
                  <X className="h-4 w-4 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* 6. Sort Select */}
          <SortSelect label={t("sort")} options={SORT_OPTIONS} />

          {/* 7. Deadline DateRangePicker (Zero native date input) */}
          <div className="flex flex-col gap-3 sm:col-span-2">
            <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
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
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border dark:border-white/5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted font-medium">
                {t("activeFilters")}:
              </span>

              {paramCode && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("searchCode")}: {paramCode}
                  <button
                    type="button"
                    onClick={() => handleClearParam("code")}
                    className="hover:text-rose-400 transition cursor-pointer"
                    aria-label="Remove code filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {paramTitle && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("searchTitle")}: {paramTitle}
                  <button
                    type="button"
                    onClick={() => handleClearParam("title")}
                    className="hover:text-rose-400 transition cursor-pointer"
                    aria-label="Remove title filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {paramOwner && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("searchOwner")}: {paramOwner}
                  <button
                    type="button"
                    onClick={() => handleClearParam("owner")}
                    className="hover:text-rose-400 transition cursor-pointer"
                    aria-label="Remove owner filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {paramStatus && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("status")}: {STATUS_OPTIONS.find((s) => s.value === paramStatus)?.label ?? paramStatus}
                  <button
                    type="button"
                    onClick={() => handleClearParam("status")}
                    className="hover:text-rose-400 transition cursor-pointer"
                    aria-label="Remove status filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {paramPhase && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("searchPhase")}: {paramPhase}
                  <button
                    type="button"
                    onClick={() => handleClearParam("phase")}
                    className="hover:text-rose-400 transition cursor-pointer"
                    aria-label="Remove phase filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {(paramDeadlineFrom || paramDeadlineTo) && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("deadline")}: {paramDeadlineFrom || "..."} → {paramDeadlineTo || "..."}
                  <button
                    type="button"
                    onClick={handleClearDateRange}
                    className="hover:text-rose-400 transition cursor-pointer"
                    aria-label="Remove deadline filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {paramSortBy && (paramSortBy !== "createdAt" || paramOrder !== "desc") && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("sort")}: {SORT_OPTIONS.find((s) => s.sortBy === paramSortBy && s.order === paramOrder)?.label ?? `${paramSortBy}:${paramOrder}`}
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete("sortBy");
                      params.delete("order");
                      params.set("page", "1");
                      router.push(`${pathname}?${params.toString()}`);
                    }}
                    className="hover:text-rose-400 transition cursor-pointer"
                    aria-label="Remove sort filter"
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
