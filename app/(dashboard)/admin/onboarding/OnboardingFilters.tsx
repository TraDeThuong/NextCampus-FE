"use client";

import { useMemo, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { X, RotateCcw } from "lucide-react";

import FilterSelect from "@/components/ui/FilterSelect";
import MetalCard from "@/components/ui/MetalCard";
import { useDepartments } from "@/hooks/department/useDepartments";

export default function OnboardingFilters() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { data: deptData } = useDepartments();
  const departments = useMemo(() => deptData?.data ?? [], [deptData]);

  const paramEmail = searchParams.get("email") ?? "";
  const paramInviteStatus = searchParams.get("inviteStatus") ?? "";
  const paramAppStatus = searchParams.get("applicationStatus") ?? "";
  const paramDepartmentId = searchParams.get("departmentId") ?? "";
  const paramPositionId = searchParams.get("positionId") ?? "";

  const searchInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const inviteStatusOptions = useMemo(
    () => [
      { value: "UNUSED", label: t("admin.onboarding.inviteStatus_UNUSED") },
      { value: "ACTIVE", label: t("admin.onboarding.inviteStatus_ACTIVE") },
      { value: "USED", label: t("admin.onboarding.inviteStatus_USED") },
      { value: "EXPIRED", label: t("admin.onboarding.inviteStatus_EXPIRED") },
      { value: "REVOKED", label: t("admin.onboarding.inviteStatus_REVOKED") },
    ],
    [t],
  );

  const applicationStatusOptions = useMemo(
    () => [
      { value: "PENDING", label: t("admin.onboarding.appStatus_PENDING") },
      { value: "APPROVED", label: t("admin.onboarding.appStatus_APPROVED") },
      { value: "REJECTED", label: t("admin.onboarding.appStatus_REJECTED") },
    ],
    [t],
  );

  const departmentOptions = useMemo(
    () => departments.map((d) => ({ value: d.id, label: d.name })),
    [departments],
  );

  const positionOptions = useMemo(() => {
    const seen = new Set<string>();
    const result: { value: string; label: string }[] = [];
    for (const dept of departments) {
      for (const pos of dept.positions ?? []) {
        if (!seen.has(pos.id)) {
          seen.add(pos.id);
          result.push({ value: pos.id, label: pos.name });
        }
      }
    }
    return result;
  }, [departments]);

  const handleSearchChange = (val: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = val.trim();
      if (trimmed) {
        params.set("email", trimmed);
      } else {
        params.delete("email");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
  };

  const clearField = (key: string) => {
    if (key === "email" && searchInputRef.current) {
      searchInputRef.current.value = "";
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearAll = () => {
    if (searchInputRef.current) searchInputRef.current.value = "";
    const params = new URLSearchParams(searchParams.toString());
    params.delete("email");
    params.delete("inviteStatus");
    params.delete("applicationStatus");
    params.delete("departmentId");
    params.delete("positionId");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeFilterCount =
    (paramEmail ? 1 : 0) +
    (paramInviteStatus ? 1 : 0) +
    (paramAppStatus ? 1 : 0) +
    (paramDepartmentId ? 1 : 0) +
    (paramPositionId ? 1 : 0);

  const selectedDeptName = useMemo(() => {
    return departments.find((d) => d.id === paramDepartmentId)?.name ?? paramDepartmentId;
  }, [departments, paramDepartmentId]);

  const selectedPosName = useMemo(() => {
    return positionOptions.find((p) => p.value === paramPositionId)?.label ?? paramPositionId;
  }, [positionOptions, paramPositionId]);

  return (
    <MetalCard className="px-6 py-5">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Email search */}
          <div className="flex flex-col gap-3">
            <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
              {t("admin.onboarding.search")}
            </label>

            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                key={`search-onboarding-${paramEmail}`}
                placeholder={t("admin.onboarding.searchPlaceholder")}
                defaultValue={paramEmail}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted pr-10"
              />
              {paramEmail && (
                <button
                  type="button"
                  onClick={() => clearField("email")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* Invite status */}
          <FilterSelect
            label={t("admin.onboarding.inviteStatus")}
            filterField="inviteStatus"
            options={inviteStatusOptions}
          />

          {/* Application status */}
          <FilterSelect
            label={t("admin.onboarding.applicationStatus")}
            filterField="applicationStatus"
            options={applicationStatusOptions}
          />

          {/* Department */}
          <FilterSelect
            label={t("admin.onboarding.assignedDepartment")}
            filterField="departmentId"
            options={departmentOptions}
          />

          {/* Position */}
          <FilterSelect
            label={t("admin.onboarding.assignedPosition")}
            filterField="positionId"
            options={positionOptions}
          />
        </div>

        {/* Active Filter Badges & Clear All */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border dark:border-white/5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted font-medium">
                {t("admin.onboarding.activeFilters")}:
              </span>

              {paramEmail && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("admin.onboarding.search")}: {paramEmail}
                  <button
                    type="button"
                    onClick={() => clearField("email")}
                    className="hover:text-rose-400 transition"
                    aria-label="Remove search filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {paramInviteStatus && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("admin.onboarding.inviteStatus")}:{" "}
                  {t(`admin.onboarding.inviteStatus_${paramInviteStatus}`)}
                  <button
                    type="button"
                    onClick={() => clearField("inviteStatus")}
                    className="hover:text-rose-400 transition"
                    aria-label="Remove invite status filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {paramAppStatus && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("admin.onboarding.applicationStatus")}:{" "}
                  {t(`admin.onboarding.appStatus_${paramAppStatus}`)}
                  <button
                    type="button"
                    onClick={() => clearField("applicationStatus")}
                    className="hover:text-rose-400 transition"
                    aria-label="Remove app status filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {paramDepartmentId && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("admin.onboarding.assignedDepartment")}: {selectedDeptName}
                  <button
                    type="button"
                    onClick={() => clearField("departmentId")}
                    className="hover:text-rose-400 transition"
                    aria-label="Remove department filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}

              {paramPositionId && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                  {t("admin.onboarding.assignedPosition")}: {selectedPosName}
                  <button
                    type="button"
                    onClick={() => clearField("positionId")}
                    className="hover:text-rose-400 transition"
                    aria-label="Remove position filter"
                  >
                    <X className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-cyan-400 transition py-1 px-2 rounded-lg hover:bg-card active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              {t("admin.onboarding.clearFilters")}
            </button>
          </div>
        )}
      </div>
    </MetalCard>
  );
}
