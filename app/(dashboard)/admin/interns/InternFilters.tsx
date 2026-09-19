"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useRef } from "react";
import { X, RotateCcw } from "lucide-react";

import FilterSelect from "@/components/ui/FilterSelect";
import MetalCard from "@/components/ui/MetalCard";
import { useDepartments } from "@/hooks/department/useDepartments";

export default function InternFilters() {
    const t = useTranslations();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const { data: deptData } = useDepartments();

    const paramFullName = searchParams.get("fullName") ?? "";
    const paramDepartment = searchParams.get("department") ?? "";
    const paramPosition = searchParams.get("position") ?? "";
    const paramLeader = searchParams.get("leader") ?? "";
    const paramStatus = searchParams.get("status") ?? "";

    const searchFullNameRef = useRef<HTMLInputElement>(null);
    const searchPositionRef = useRef<HTMLInputElement>(null);
    const searchLeaderRef = useRef<HTMLInputElement>(null);
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
            { value: "ACTIVE", label: t("admin.interns.active") },
            { value: "COMPLETED", label: t("admin.interns.completed") },
            { value: "DROPPED", label: t("admin.interns.dropped") },
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
        if (key === "leader" && searchLeaderRef.current) {
            searchLeaderRef.current.value = "";
        }
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleClearAll = () => {
        if (searchFullNameRef.current) searchFullNameRef.current.value = "";
        if (searchPositionRef.current) searchPositionRef.current.value = "";
        if (searchLeaderRef.current) searchLeaderRef.current.value = "";
        const params = new URLSearchParams(searchParams.toString());
        params.delete("fullName");
        params.delete("department");
        params.delete("position");
        params.delete("leader");
        params.delete("status");
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const activeFilterCount =
        (paramFullName ? 1 : 0) +
        (paramDepartment ? 1 : 0) +
        (paramPosition ? 1 : 0) +
        (paramLeader ? 1 : 0) +
        (paramStatus ? 1 : 0);

    const getStatusLabel = (st: string) => {
        switch (st) {
            case "ACTIVE":
                return t("admin.interns.active");
            case "COMPLETED":
                return t("admin.interns.completed");
            case "DROPPED":
                return t("admin.interns.dropped");
            default:
                return st;
        }
    };

    return (
        <MetalCard className="px-6 py-5">
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {/* Search Full Name / Email */}
                    <div className="flex flex-col gap-3">
                        <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
                            {t("admin.interns.search")}
                        </label>
                        <div className="relative">
                            <input
                                ref={searchFullNameRef}
                                type="text"
                                key={`search-fn-${paramFullName}`}
                                defaultValue={paramFullName}
                                placeholder={t("admin.interns.searchPlaceholder")}
                                onChange={(e) =>
                                    handleDebouncedChange("fullName", e.target.value)
                                }
                                className="w-full rounded-2xl border border-border bg-card py-3 px-5 pr-10 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
                            />
                            {paramFullName && (
                                <button
                                    type="button"
                                    onClick={() => clearField("fullName")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition p-0.5 rounded"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4 shrink-0" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Department */}
                    <FilterSelect
                        label={t("admin.interns.filterDepartment")}
                        filterField="department"
                        options={departmentOptions}
                    />

                    {/* Filter Position */}
                    <div className="flex flex-col gap-3">
                        <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
                            {t("admin.interns.filterPosition")}
                        </label>
                        <div className="relative">
                            <input
                                ref={searchPositionRef}
                                type="text"
                                key={`search-pos-${paramPosition}`}
                                defaultValue={paramPosition}
                                placeholder={t("admin.interns.positionPlaceholder")}
                                onChange={(e) =>
                                    handleDebouncedChange("position", e.target.value)
                                }
                                className="w-full rounded-2xl border border-border bg-card py-3 px-5 pr-10 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
                            />
                            {paramPosition && (
                                <button
                                    type="button"
                                    onClick={() => clearField("position")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition p-0.5 rounded"
                                    aria-label="Clear position filter"
                                >
                                    <X className="h-4 w-4 shrink-0" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Leader */}
                    <div className="flex flex-col gap-3">
                        <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
                            {t("admin.interns.filterLeader")}
                        </label>
                        <div className="relative">
                            <input
                                ref={searchLeaderRef}
                                type="text"
                                key={`search-ldr-${paramLeader}`}
                                defaultValue={paramLeader}
                                placeholder={t("admin.interns.leaderPlaceholder")}
                                onChange={(e) =>
                                    handleDebouncedChange("leader", e.target.value)
                                }
                                className="w-full rounded-2xl border border-border bg-card py-3 px-5 pr-10 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
                            />
                            {paramLeader && (
                                <button
                                    type="button"
                                    onClick={() => clearField("leader")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition p-0.5 rounded"
                                    aria-label="Clear leader filter"
                                >
                                    <X className="h-4 w-4 shrink-0" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Status */}
                    <FilterSelect
                        label={t("admin.interns.filterStatus")}
                        filterField="status"
                        options={statusOptions}
                    />
                </div>

                {/* Active Filter Badges & Clear All */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border dark:border-white/5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted font-medium">
                                {t("admin.interns.activeFilters")}:
                            </span>

                            {paramFullName && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                                    {t("admin.interns.search")}: {paramFullName}
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
                                    {t("admin.interns.filterDepartment")}: {paramDepartment}
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

                            {paramPosition && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                                    {t("admin.interns.filterPosition")}: {paramPosition}
                                    <button
                                        type="button"
                                        onClick={() => clearField("position")}
                                        className="hover:text-rose-400 transition"
                                        aria-label="Remove position filter"
                                    >
                                        <X className="h-3 w-3 shrink-0" />
                                    </button>
                                </span>
                            )}

                            {paramLeader && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                                    {t("admin.interns.filterLeader")}: {paramLeader}
                                    <button
                                        type="button"
                                        onClick={() => clearField("leader")}
                                        className="hover:text-rose-400 transition"
                                        aria-label="Remove leader filter"
                                    >
                                        <X className="h-3 w-3 shrink-0" />
                                    </button>
                                </span>
                            )}

                            {paramStatus && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                                    {t("admin.interns.filterStatus")}: {getStatusLabel(paramStatus)}
                                    <button
                                        type="button"
                                        onClick={() => clearField("status")}
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
                            {t("admin.interns.clearFilters")}
                        </button>
                    </div>
                )}
            </div>
        </MetalCard>
    );
}