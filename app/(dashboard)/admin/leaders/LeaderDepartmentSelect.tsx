"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUpdateLeader } from "@/hooks/leader/useUpdateLeader";
import type { Department } from "@/types/department";
import {
    MAX_LEADER_DEPARTMENTS,
    type Leader,
} from "@/types/leader";

type LeaderDepartmentSelectProps = {
    leader: Leader;
    departments: Department[];
};

export default function LeaderDepartmentSelect({
    leader,
    departments,
}: LeaderDepartmentSelectProps) {
    const [open, setOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const { mutate: updateLeader, isPending } = useUpdateLeader();
    const selectedIds = leader.departments.map((department) => department.id);
    const selectedIdSet = new Set(selectedIds);

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

    const handleToggle = (departmentId: string) => {
        const selected = selectedIdSet.has(departmentId);
        if (!selected && selectedIds.length >= MAX_LEADER_DEPARTMENTS) {
            toast.error(
                `A leader can manage at most ${MAX_LEADER_DEPARTMENTS} departments.`,
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
        if (leader.departments.length === 0) return "Not set";
        if (leader.departments.length === 1) return leader.departments[0].name;
        return `${leader.departments.length} departments`;
    })();

    return (
        <div ref={selectRef} className="relative">
            <button
                type="button"
                aria-label={`Departments managed by ${leader.user.fullName ?? leader.user.email}`}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
                disabled={isPending}
                className="flex w-full items-center gap-1 text-left transition hover:text-cyan-400 disabled:opacity-50"
            >
                {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
                ) : (
                    <>
                        <span
                            className={`min-w-0 truncate ${
                                leader.departments.length === 0
                                    ? "italic text-slate-500"
                                    : "text-white"
                            }`}
                            title={leader.departments
                                .map((department) => department.name)
                                .join(", ")}
                        >
                            {label}
                        </span>
                        <ChevronDown
                            className={`h-3 w-3 shrink-0 text-slate-500 transition-transform ${
                                open ? "rotate-180" : ""
                            }`}
                        />
                    </>
                )}
            </button>

            {open && (
                <div
                    role="listbox"
                    aria-label="Managed departments"
                    aria-multiselectable="true"
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            event.preventDefault();
                            setOpen(false);
                        }
                    }}
                    className="absolute left-0 top-full z-50 mt-1 w-[280px] rounded-xl border border-white/10 bg-[#0f172a] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,.55)] backdrop-blur-2xl"
                >
                    <p className="px-3 py-2 text-xs text-slate-500">
                        Select up to {MAX_LEADER_DEPARTMENTS} departments
                    </p>
                    <div className="max-h-[240px] overflow-y-auto">
                        {departments.length === 0 ? (
                            <p className="px-3 py-3 text-sm italic text-slate-500">
                                No departments available.
                            </p>
                        ) : departments.map((department) => {
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
                                    disabled={isPending}
                                    onClick={() => handleToggle(department.id)}
                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50 ${
                                        selected
                                            ? "bg-cyan-400/10 text-cyan-400"
                                            : limitReached
                                              ? "cursor-not-allowed text-slate-600"
                                              : "text-slate-300 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    <span className="min-w-0 flex-1 truncate text-left">
                                        {department.name}
                                    </span>
                                    {selected && (
                                        <Check className="h-3.5 w-3.5 shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
