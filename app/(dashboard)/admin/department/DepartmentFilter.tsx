"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { X, RotateCcw } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";

export default function DepartmentFilter() {
    const t = useTranslations();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const paramName = searchParams.get("name") ?? "";
    const paramLeader = searchParams.get("leader") ?? "";

    const nameInputRef = useRef<HTMLInputElement>(null);
    const leaderInputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const updateFilter = (key: string, value: string) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            const trimmed = value.trim();
            if (trimmed) {
                params.set(key, trimmed);
            } else {
                params.delete(key);
            }
            params.set("page", "1");
            router.push(`${pathname}?${params.toString()}`);
        }, 300);
    };

    const clearField = (key: "name" | "leader") => {
        if (key === "name" && nameInputRef.current) {
            nameInputRef.current.value = "";
        }
        if (key === "leader" && leaderInputRef.current) {
            leaderInputRef.current.value = "";
        }
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleClearAll = () => {
        if (nameInputRef.current) nameInputRef.current.value = "";
        if (leaderInputRef.current) leaderInputRef.current.value = "";
        const params = new URLSearchParams(searchParams.toString());
        params.delete("name");
        params.delete("leader");
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const activeFilterCount = (paramName ? 1 : 0) + (paramLeader ? 1 : 0);

    return (
        <MetalCard className="px-6 py-5">
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-3">
                        <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
                            {t("admin.department.searchDepartment")}
                        </label>
                        <div className="relative">
                            <input
                                ref={nameInputRef}
                                type="text"
                                key={`name-filter-${paramName}`}
                                defaultValue={paramName}
                                placeholder={t("admin.department.searchDeptPlaceholder")}
                                onChange={(e) => updateFilter("name", e.target.value)}
                                className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
                            />
                            {paramName && (
                                <button
                                    type="button"
                                    onClick={() => clearField("name")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition"
                                    aria-label="Clear department search"
                                >
                                    <X className="h-4 w-4 shrink-0" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
                            {t("admin.department.searchLeader")}
                        </label>
                        <div className="relative">
                            <input
                                ref={leaderInputRef}
                                type="text"
                                key={`leader-filter-${paramLeader}`}
                                defaultValue={paramLeader}
                                placeholder={t("admin.department.searchLeaderPlaceholder")}
                                onChange={(e) => updateFilter("leader", e.target.value)}
                                className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
                            />
                            {paramLeader && (
                                <button
                                    type="button"
                                    onClick={() => clearField("leader")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition"
                                    aria-label="Clear leader search"
                                >
                                    <X className="h-4 w-4 shrink-0" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Active Filter Badges & Clear Button */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted font-medium">
                                {t("admin.department.activeFilters")}:
                            </span>
                            {paramName && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                                    {t("admin.department.colDepartment")}: {paramName}
                                    <button
                                        type="button"
                                        onClick={() => clearField("name")}
                                        className="hover:text-rose-400 transition"
                                        aria-label="Remove department filter"
                                    >
                                        <X className="h-3 w-3 shrink-0" />
                                    </button>
                                </span>
                            )}
                            {paramLeader && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-300">
                                    {t("admin.department.colLeader")}: {paramLeader}
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
                        </div>

                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-cyan-400 transition py-1 px-2 rounded-lg hover:bg-card"
                        >
                            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                            {t("admin.department.clearFilters")}
                        </button>
                    </div>
                )}
            </div>
        </MetalCard>
    );
}
