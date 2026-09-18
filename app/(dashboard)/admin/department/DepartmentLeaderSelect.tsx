"use client";

import { useEffect, useRef, useState, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUpdateLeader } from "@/hooks/leader/useUpdateLeader";
import type { Department } from "@/types/department";
import { MAX_LEADER_DEPARTMENTS, type Leader } from "@/types/leader";
import { toast } from "react-hot-toast";

type DepartmentLeaderSelectProps = {
    department: Department;
    leaders: Leader[];
    loading: boolean;
    error: boolean;
};

export default function DepartmentLeaderSelect({
    department,
    leaders,
    loading,
    error,
}: DepartmentLeaderSelectProps) {
    const t = useTranslations();
    const [open, setOpen] = useState(false);
    const [updatingLeaderId, setUpdatingLeaderId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();

    const { mutate: updateLeader, isPending: updating } = useUpdateLeader();

    const assignedLeaders = department.leaders ?? [];
    const assignedLeaderIds = new Set(assignedLeaders.map((leader) => leader.id));

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

    const handleLeaderToggle = (leader: Leader) => {
        const isAssigned = assignedLeaderIds.has(leader.id);
        const currentDepartmentIds = leader.departments.map(
            (item) => item.id,
        );

        if (
            !isAssigned &&
            currentDepartmentIds.length >= MAX_LEADER_DEPARTMENTS
        ) {
            toast.error(
                t("admin.department.maxDepartmentsToast", { n: MAX_LEADER_DEPARTMENTS }),
            );
            return;
        }

        const departmentIds = isAssigned
            ? currentDepartmentIds.filter((id) => id !== department.id)
            : [...currentDepartmentIds, department.id];

        setUpdatingLeaderId(leader.id);
        setOpen(false);
        updateLeader(
            {
                id: leader.id,
                payload: {
                    departmentIds,
                    position: null,
                },
            },
            { onSettled: () => setUpdatingLeaderId(null) },
        );
    };

    const triggerLabel = (() => {
        if (loading) return t("admin.department.loadingLeaders");
        if (error) return t("admin.department.leadersUnavailable");
        if (assignedLeaders.length === 0) return t("admin.department.selectLeader");
        const firstLeaderName = assignedLeaders[0].user.fullName ?? assignedLeaders[0].user.email;
        if (assignedLeaders.length > 1) {
            return t("admin.department.multiLeaders", {
                name: firstLeaderName,
                count: assignedLeaders.length - 1,
            });
        }
        return firstLeaderName;
    })();

    const filteredLeaders = leaders.filter((l) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const name = (l.user.fullName ?? "").toLowerCase();
        const email = l.user.email.toLowerCase();
        return name.includes(q) || email.includes(q);
    });

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                type="button"
                aria-label={`Select leaders for ${department.name}`}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listboxId}
                onClick={() => setOpen((current) => !current)}
                disabled={loading || error || updating}
                className="flex w-full items-center justify-between gap-1.5 text-left text-muted transition hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/50 rounded-lg py-1 px-1.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading || updating ? (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-cyan-400" />
                ) : (
                    <>
                        <span
                            className={`min-w-0 truncate text-xs sm:text-sm ${
                                assignedLeaders.length === 0
                                    ? "italic text-muted"
                                    : "font-medium text-foreground"
                            }`}
                            title={triggerLabel}
                        >
                            {triggerLabel}
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
                        aria-label={`Leaders for ${department.name}`}
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
                        {/* Header and Quick Search */}
                        <div className="px-2 pt-1 pb-2">
                            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                                {t("admin.department.selectLeader")}
                            </p>
                            {leaders.length > 5 && (
                                <div className="relative mb-2">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t("admin.department.searchLeaderDropdown")}
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

                        {/* Leader options */}
                        <div className="max-h-[240px] overflow-y-auto space-y-1 custom-scrollbar pr-1">
                            {filteredLeaders.length === 0 ? (
                                <p className="px-3 py-3 text-xs italic text-muted text-center">
                                    {t("admin.department.noLeadersAvailable")}
                                </p>
                            ) : (
                                filteredLeaders.map((leader) => {
                                    const isAssigned = assignedLeaderIds.has(leader.id);
                                    const displayName =
                                        leader.user.fullName ?? leader.user.email;
                                    const currentDepartments = leader.departments
                                        .map((item) => item.name)
                                        .join(", ");

                                    return (
                                        <button
                                            key={leader.id}
                                            type="button"
                                            role="option"
                                            aria-selected={isAssigned}
                                            disabled={updating}
                                            onClick={() => handleLeaderToggle(leader)}
                                            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors disabled:opacity-50 ${
                                                isAssigned
                                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-400/20"
                                                    : "text-muted hover:bg-white/5 hover:text-foreground border border-transparent"
                                            }`}
                                        >
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-xs sm:text-sm font-medium">
                                                    {displayName}
                                                </span>
                                                <span className="block truncate text-[11px] text-muted">
                                                    {leader.user.email}
                                                    {!isAssigned && currentDepartments
                                                        ? ` · ${currentDepartments}`
                                                        : ""}
                                                </span>
                                            </span>
                                            {updatingLeaderId === leader.id ? (
                                                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-cyan-400" />
                                            ) : isAssigned ? (
                                                <Check className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                                            ) : null}
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
