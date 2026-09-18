"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useRef } from "react";
import { X, RotateCcw } from "lucide-react";

import FilterSelect from "@/components/ui/FilterSelect";
import MetalCard from "@/components/ui/MetalCard";
import { useDepartments } from "@/hooks/department/useDepartments";

export default function LeaderFilter() {
    const t = useTranslations();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const { data: deptData } = useDepartments();

    const paramFullName = searchParams.get("fullName") ?? "";
    const paramDepartment = searchParams.get("department") ?? "";
    const paramStatus = searchParams.get("isActive") ?? "";

    const searchInputRef = useRef<HTMLInputElement>(null);
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
            { value: "true", label: t("admin.leaders.active") },
            { value: "false", label: t("admin.leaders.inactive") },
        ],
        [t],
    );

    const handleSearchChange = (val: string) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            const trimmed = val.trim();
            if (trimmed) {
                params.set("fullName", trimmed);
            } else {
                params.delete("fullName");
            }
            params.set("page", "1");
            router.push(`${pathname}?${params.toString()}`);
        }, 300);
    };

    const clearField = (key: string) => {
        if (key === "fullName" && searchInputRef.current) {
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
        params.delete("fullName");
        params.delete("department");
        params.delete("isActive");
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const activeFilterCount =
        (paramFullName ? 1 : 0) +
        (paramDepartment ? 1 : 0) +
        (paramStatus ? 1 : 0);

    return (
        <MetalCard className="px-6 py-5">
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Search Full Name / Email */}
                    <div className="flex flex-col gap-3">
                        <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
                            {t("admin.leaders.search")}
                        </label>
                        <div className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                key={`search-leader-${paramFullName}`}
                                defaultValue={paramFullName}
                                placeholder={t("admin.leaders.searchPlaceholder")}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted pr-10"
                            />
                            {paramFullName && (
                                <button
                                    type="button"
                                    onClick={() => clearField("fullName")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4 shrink-0" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Department */}
                    <FilterSelect
                        label={t("admin.leaders.filterDepartment")}
                        filterField="department"
                        options={departmentOptions}
                        placeholder={t("admin.leaders.allDepartments")}
                    />

                    {/* Filter Status */}
                    <FilterSelect
                        label={t("admin.leaders.filterStatus")}
                        filterField="isActive"
                        options={statusOptions}
                        placeholder={t("admin.leaders.allStatus")}
                    />
                </div>

                {/* Active Filter Badges & Clear All */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border dark:border-white/5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted font-medium">
                                {t("admin.leaders.activeFilters")}:
                            </span>

                            {paramFullName && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                                    {t("admin.leaders.search")}: {paramFullName}
                                    <button
                                        type="button"
                                        onClick={() => clearField("fullName")}
                                        className="hover:text-rose-400 transition"
                                        aria-label="Remove search filter"
                                    >
                                        <X className="h-3 w-3 shrink-0" />
                                    </button>
                                </span>
                            )}

                            {paramDepartment && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                                    {t("admin.leaders.filterDepartment")}: {paramDepartment}
                                    <button
                                        type="button"
                                        onClick={() => clearField("department")}
                                        className="hover:text-rose-400 transition"
                                        aria-label="Remove department filter"
                                    >
                                        <X className="h-3 w-3 shrink-0" />
                                    </button>
                                </span>
                            )}

                            {paramStatus && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                                    {t("admin.leaders.filterStatus")}:{" "}
                                    {paramStatus === "true"
                                        ? t("admin.leaders.active")
                                        : t("admin.leaders.inactive")}
                                    <button
                                        type="button"
                                        onClick={() => clearField("isActive")}
                                        className="hover:text-rose-400 transition"
                                        aria-label="Remove status filter"
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
                            {t("admin.leaders.clearFilters")}
                        </button>
                    </div>
                )}
            </div>
        </MetalCard>
    );
}

