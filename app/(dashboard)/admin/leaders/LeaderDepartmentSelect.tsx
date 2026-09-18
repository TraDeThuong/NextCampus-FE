"use client";

import { useEffect, useRef, useState, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import { useUpdateLeader } from "@/hooks/leader/useUpdateLeader";
import type { Department } from "@/types/department";
import { MAX_LEADER_DEPARTMENTS, type Leader } from "@/types/leader";

type LeaderDepartmentSelectProps = {
    leader: Leader;
    departments: Department[];
};

export default function LeaderDepartmentSelect({
    leader,
    departments,
}: LeaderDepartmentSelectProps) {
    const t = useTranslations();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    const { mutate: updateLeader, isPending } = useUpdateLeader();
    const selectedIds = leader.departments.map((department) => department.id);
    const selectedIdSet = new Set(selectedIds);

    const updatePosition = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const openUpward = spaceBelow < 280 && rect.top > 280;

            setDropdownStyle({
                position: "fixed",
                top: openUpward ? undefined : rect.bottom + 6,
                bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
                left: Math.max(8, Math.min(rect.left, window.innerWidth - 320)),
                width: Math.max(rect.width, 300),
                zIndex: 9999,
            });
        }
    }, []);

    useEffect(() => {
        if (open) {
            updatePosition();
            window.addEventListener("scroll", updatePosition, true);
            window.addEventListener("resize", updatePosition);
        }
        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [open, updatePosition]);

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            const target = event.target as Node;
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(target) &&
                triggerRef.current &&
                !triggerRef.current.contains(target)
            ) {
                setOpen(false);
            }
        }

        if (open) document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [open]);

    const handleToggle = (departmentId: string) => {
        const selected = selectedIdSet.has(departmentId);
        if (!selected && selectedIds.length >= MAX_LEADER_DEPARTMENTS) {
            toast.error(
                t("admin.leaders.maxDepartments", { n: MAX_LEADER_DEPARTMENTS }),
            );
            return;
        }

        const departmentIds = selected
            ? selectedIds.filter((id) => id !== departmentId)
            : [...selectedIds, departmentId];

        updateLeader({
            id: leader.id,
            payload: { departmentIds, position: null },
        });
    };

    const label = (() => {
        if (leader.departments.length === 0) return t("admin.leaders.notSet");
        if (leader.departments.length === 1) return leader.departments[0].name;
        return t("admin.leaders.multiDepartments", { n: leader.departments.length });
    })();

    const filteredDepartments = departments.filter((d) => {
        if (!searchQuery.trim()) return true;
        return d.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                type="button"
                aria-label={`Departments managed by ${leader.user.fullName ?? leader.user.email}`}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listboxId}
                onClick={() => setOpen((current) => !current)}
                disabled={isPending}
                className="flex w-full items-center justify-between gap-1.5 text-left text-muted transition hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/50 rounded-lg py-1 px-1.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-cyan-400" />
                ) : (
                    <>
                        <span
                            className={`min-w-0 truncate text-xs sm:text-sm ${
                                leader.departments.length === 0
                                    ? "italic text-muted"
                                    : "font-medium text-foreground"
                            }`}
                            title={leader.departments
                                .map((department) => department.name)
                                .join(", ")}
                        >
                            {label}
                        </span>
                        <ChevronDown
                            className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-200 ${
                                open ? "rotate-180" : ""
                            }`}
                        />
                    </>
                )}
            </button>

            {open &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        id={listboxId}
                        ref={dropdownRef}
                        role="listbox"
                        aria-label="Managed departments"
                        aria-multiselectable="true"
                        style={dropdownStyle}
                        onKeyDown={(event) => {
                            if (event.key === "Escape") {
                                event.preventDefault();
                                setOpen(false);
                            }
                        }}
                        className="rounded-2xl border border-border dark:border-white/10 bg-card/95 p-2 shadow-[0_16px_48px_rgba(0,0,0,.55)] backdrop-blur-2xl"
                    >
                        {/* Header & Quick search */}
                        <div className="px-2 pt-1 pb-2">
                            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                {t("admin.leaders.selectDepartments", { n: MAX_LEADER_DEPARTMENTS })}
                            </p>
                            {departments.length > 5 && (
                                <div className="relative mb-2">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t("admin.leaders.searchDepartmentDropdown")}
                                        className="w-full rounded-lg border border-border dark:border-white/10 bg-card/60 py-1.5 pl-8 pr-7 text-xs text-foreground placeholder:text-muted outline-none focus:border-cyan-400/50"
                                        autoFocus
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Department Options */}
                        <div className="max-h-[240px] overflow-y-auto space-y-1 custom-scrollbar pr-1">
                            {filteredDepartments.length === 0 ? (
                                <p className="px-3 py-3 text-xs italic text-muted text-center">
                                    {t("admin.leaders.noDepartmentsAvailable")}
                                </p>
                            ) : (
                                filteredDepartments.map((department) => {
                                    const selected = selectedIdSet.has(department.id);
                                    const limitReached =
                                        !selected &&
                                        selectedIds.length >= MAX_LEADER_DEPARTMENTS;

                                    return (
                                        <button
                                            key={department.id}
                                            type="button"
                                            role="option"
                                            aria-selected={selected}
                                            aria-disabled={limitReached}
                                            disabled={isPending || limitReached}
                                            onClick={() => handleToggle(department.id)}
                                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors disabled:opacity-50 ${
                                                selected
                                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-400/20"
                                                    : limitReached
                                                      ? "cursor-not-allowed text-muted/40 border border-transparent"
                                                      : "text-muted hover:bg-white/5 hover:text-foreground border border-transparent"
                                            }`}
                                        >
                                            <span className="min-w-0 flex-1 truncate text-xs sm:text-sm font-medium">
                                                {department.name}
                                            </span>
                                            {selected && (
                                                <Check className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}

