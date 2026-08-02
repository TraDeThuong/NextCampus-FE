"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useUpdateLeader } from "@/hooks/leader/useUpdateLeader";
import type { Department } from "@/types/department";
import {
    MAX_LEADER_DEPARTMENTS,
    type Leader,
} from "@/types/leader";
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
    const [open, setOpen] = useState(false);
    const [updatingLeaderId, setUpdatingLeaderId] = useState<string | null>(null);
    const selectRef = useRef<HTMLDivElement>(null);
    const { mutate: updateLeader, isPending: updating } = useUpdateLeader();

    const assignedLeaders = department.leaders ?? [];
    const assignedLeaderIds = new Set(assignedLeaders.map((leader) => leader.id));

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target as Node)
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
                `A leader can manage at most ${MAX_LEADER_DEPARTMENTS} departments.`,
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
        if (loading) return "Loading leaders...";
        if (error) return "Leaders unavailable";
        if (assignedLeaders.length === 0) return "Select leader";
        return (
            assignedLeaders[0].user.fullName ??
            assignedLeaders[0].user.email
        );
    })();

    return (
        <div ref={selectRef} className="relative">
            <button
                type="button"
                aria-label={`Select leaders for ${department.name}`}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
                disabled={loading || error}
                className="flex w-full items-center gap-1.5 text-left text-slate-300 transition hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                ) : (
                    <>
                        <span
                            className={`min-w-0 truncate ${
                                assignedLeaders.length === 0
                                    ? "italic text-slate-500"
                                    : "font-medium text-white"
                            }`}
                            title={triggerLabel}
                        >
                            {triggerLabel}
                        </span>
                        <ChevronDown
                            className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${
                                open ? "rotate-180" : ""
                            }`}
                        />
                    </>
                )}
            </button>

            {open && (
                <div
                    role="listbox"
                    aria-label={`Leaders for ${department.name}`}
                    aria-multiselectable="true"
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            event.preventDefault();
                            setOpen(false);
                        }
                    }}
                    className="absolute left-0 top-full z-50 mt-1 w-[300px] rounded-xl border border-white/10 bg-[#0f172a] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,.55)] backdrop-blur-2xl"
                >
                    <p className="px-3 py-2 text-xs text-slate-500">
                        Select leader
                    </p>
                    <div className="max-h-[260px] overflow-y-auto">
                        {leaders.length === 0 ? (
                            <p className="px-3 py-3 text-sm italic text-slate-500">
                                No leaders available.
                            </p>
                        ) : (
                            leaders.map((leader) => {
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
                                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors disabled:opacity-50 ${
                                            isAssigned
                                                ? "bg-cyan-400/10 text-cyan-400"
                                                : "text-slate-300 hover:bg-white/5 hover:text-white"
                                        }`}
                                    >
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium">
                                                {displayName}
                                            </span>
                                            <span className="block truncate text-xs text-slate-500">
                                                {leader.user.email}
                                                {!isAssigned && currentDepartments
                                                    ? ` - ${currentDepartments}`
                                                    : ""}
                                            </span>
                                        </span>
                                        {updatingLeaderId === leader.id ? (
                                            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                                        ) : isAssigned ? (
                                            <Check className="h-3.5 w-3.5 shrink-0" />
                                        ) : null}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
