"use client";

import { useMemo, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { X, RotateCcw } from "lucide-react";
import FilterSelect from "@/components/ui/FilterSelect";
import { DateRangePicker } from "@/components/ui/DatePicker";
import MetalCard from "@/components/ui/MetalCard";

export default function ActivityLogFilter() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const paramSearch = searchParams.get("search") ?? "";
  const paramAction = searchParams.get("action") ?? "";
  const paramTargetType = searchParams.get("targetType") ?? "";
  const paramFrom = searchParams.get("from") ?? searchParams.get("createdFrom") ?? "";
  const paramTo = searchParams.get("to") ?? searchParams.get("createdTo") ?? "";
  const paramOrder = searchParams.get("order") ?? "desc";

  const searchInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    if (searchInputRef.current) searchInputRef.current.value = "";
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (start) {
      params.set("from", start);
      params.delete("createdFrom");
    } else {
      params.delete("from");
      params.delete("createdFrom");
    }
    if (end) {
      params.set("to", end);
      params.delete("createdTo");
    } else {
      params.delete("to");
      params.delete("createdTo");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearDateRange = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("createdFrom");
    params.delete("to");
    params.delete("createdTo");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearAll = () => {
    if (searchInputRef.current) searchInputRef.current.value = "";
    const params = new URLSearchParams();
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const ACTION_OPTIONS = useMemo(
    () => [
      { value: "UPDATE_INTERN", label: "Cập nhật thực tập sinh (UPDATE_INTERN)" },
      { value: "CREATE_USER", label: "Tạo người dùng (CREATE_USER)" },
      { value: "UPDATE_USER", label: "Cập nhật người dùng (UPDATE_USER)" },
      { value: "DELETE_USER", label: "Xóa người dùng (DELETE_USER)" },
      { value: "LOGIN", label: "Đăng nhập (LOGIN)" },
      { value: "LOGOUT", label: "Đăng xuất (LOGOUT)" },
      { value: "CREATE_TASK", label: "Tạo nhiệm vụ (CREATE_TASK)" },
      { value: "UPDATE_TASK", label: "Cập nhật nhiệm vụ (UPDATE_TASK)" },
      { value: "DELETE_TASK", label: "Xóa nhiệm vụ (DELETE_TASK)" },
      { value: "ASSIGN_TASK", label: "Giao nhiệm vụ (ASSIGN_TASK)" },
      { value: "CREATE_SUBMISSION", label: "Nộp bài (CREATE_SUBMISSION)" },
      { value: "REVIEW_SUBMISSION", label: "Đánh giá bài nộp (REVIEW_SUBMISSION)" },
      { value: "CREATE_DAILY_REPORT", label: "Tạo báo cáo ngày (CREATE_DAILY_REPORT)" },
      { value: "CREATE_EVALUATION", label: "Tạo đánh giá tuần (CREATE_EVALUATION)" },
      { value: "SUBMIT_APPLICATION", label: "Nộp đơn ứng tuyển (SUBMIT_APPLICATION)" },
      { value: "APPROVE_APPLICATION", label: "Duyệt đơn ứng tuyển (APPROVE_APPLICATION)" },
      { value: "REJECT_APPLICATION", label: "Từ chối đơn ứng tuyển (REJECT_APPLICATION)" },
      { value: "UPDATE_NOTIFICATION_SETTING", label: "Cập nhật thông báo (UPDATE_NOTIFICATION_SETTING)" },
      { value: "UPDATE_MEETING_ATTENDANCE", label: "Điểm danh cuộc họp (UPDATE_MEETING_ATTENDANCE)" },
    ],
    [],
  );

  const TARGET_TYPE_OPTIONS = useMemo(
    () => [
      { value: "INTERN", label: "Thực tập sinh (INTERN)" },
      { value: "USER", label: "Người dùng (USER)" },
      { value: "TASK", label: "Nhiệm vụ (TASK)" },
      { value: "MEETING", label: "Cuộc họp (MEETING)" },
      { value: "APPLICATION", label: "Đơn ứng tuyển (APPLICATION)" },
      { value: "DAILY_REPORT", label: "Báo cáo ngày (DAILY_REPORT)" },
      { value: "WEEKLY_EVALUATION", label: "Đánh giá tuần (WEEKLY_EVALUATION)" },
      { value: "REGULATION", label: "Quy định (REGULATION)" },
      { value: "NOTIFICATION_SETTING", label: "Cài đặt thông báo (NOTIFICATION_SETTING)" },
      { value: "SYSTEM_SETTING", label: "Cấu hình hệ thống (SYSTEM_SETTING)" },
    ],
    [],
  );

  const ORDER_OPTIONS = useMemo(
    () => [
      { value: "desc", label: t("admin.activityLogs.newestFirst") },
      { value: "asc", label: t("admin.activityLogs.oldestFirst") },
    ],
    [t],
  );

  const activeFilterCount =
    (paramSearch ? 1 : 0) +
    (paramAction ? 1 : 0) +
    (paramTargetType ? 1 : 0) +
    (paramFrom || paramTo ? 1 : 0) +
    (paramOrder && paramOrder !== "desc" ? 1 : 0);

  return (
    <MetalCard className="px-6 py-5">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 items-end">
          {/* Search by Actor or Keyword */}
          <div className="flex flex-col gap-3">
            <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
              {t("admin.activityLogs.filterSearch")}
            </label>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                key={`search-act-${paramSearch}`}
                defaultValue={paramSearch}
                placeholder={t("admin.activityLogs.searchPlaceholder")}
                onChange={(e) => handleDebouncedSearch(e.target.value)}
                className="w-full h-[46px] rounded-2xl border border-border bg-card px-5 pr-10 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
              />
              {paramSearch && (
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

          {/* Date Range Picker (Standardized Cyberpunk - Zero Native Input) */}
          <div className="flex flex-col gap-3">
            <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
              {t("admin.activityLogs.filterTime")}
            </label>
            <DateRangePicker
              startDate={paramFrom}
              endDate={paramTo}
              onChange={handleDateRangeChange}
              onClear={handleClearDateRange}
              placeholder={t("admin.activityLogs.filterTime")}
              className="w-full [&>button]:w-full [&>button]:h-[46px] [&>button]:rounded-2xl [&>button]:px-5 [&>button]:text-sm [&>button]:justify-start [&>button]:text-left [&>button>[role=button]]:ml-auto"
            />
          </div>

          {/* Filter by Action */}
          <FilterSelect
            label={t("admin.activityLogs.filterAction")}
            filterField="action"
            options={ACTION_OPTIONS}
          />

          {/* Filter by Target Type */}
          <FilterSelect
            label={t("admin.activityLogs.filterTargetType")}
            filterField="targetType"
            options={TARGET_TYPE_OPTIONS}
          />

          {/* Filter by Order */}
          <FilterSelect
            label={t("admin.activityLogs.filterOrder")}
            filterField="order"
            options={ORDER_OPTIONS}
          />
        </div>

        {/* Active Filter Pills & Clear All */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border dark:border-white/5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted font-medium">
                {t("admin.activityLogs.activeFilters")}:
              </span>

              {paramSearch && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("admin.activityLogs.filterSearch")}: {paramSearch}
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="hover:text-rose-400 transition cursor-pointer"
                    aria-label="Remove search filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {(paramFrom || paramTo) && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("admin.activityLogs.filterTime")}: {paramFrom || "..."} → {paramTo || "..."}
                  <button
                    type="button"
                    onClick={handleClearDateRange}
                    className="hover:text-rose-400 transition cursor-pointer"
                    aria-label="Remove date range filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {paramAction && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("admin.activityLogs.filterAction")}: {paramAction}
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete("action");
                      params.set("page", "1");
                      router.push(`${pathname}?${params.toString()}`);
                    }}
                    className="hover:text-rose-400 transition cursor-pointer"
                    aria-label="Remove action filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {paramTargetType && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("admin.activityLogs.filterTargetType")}: {paramTargetType}
                  <button
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete("targetType");
                      params.set("page", "1");
                      router.push(`${pathname}?${params.toString()}`);
                    }}
                    className="hover:text-rose-400 transition cursor-pointer"
                    aria-label="Remove target type filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-cyan-400 transition py-1 px-2 rounded-lg hover:bg-card active:scale-95 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              {t("admin.activityLogs.clearFilters")}
            </button>
          </div>
        )}
      </div>
    </MetalCard>
  );
}
