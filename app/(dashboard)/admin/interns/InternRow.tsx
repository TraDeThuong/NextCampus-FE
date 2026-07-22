"use client";

import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Trash2, Circle, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import type { Intern } from "@/types/intern";
import { useDeleteIntern } from "@/hooks/intern/useDeleteIntern";
import { useLeaders } from "@/hooks/user/useLeaders";
import { useUpdateIntern } from "@/hooks/intern/useUpdateIntern";
import { useDepartments } from "@/hooks/department/useDepartments";
import { usePositions } from "@/hooks/department/usePositions";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";

type InternRowProps = {
    intern: Intern;
};

export default function InternRow({ intern }: InternRowProps) {
    const router = useRouter();
    const { mutate: deleteIntern, isPending: deleting } = useDeleteIntern();
    const { data: leadersData } = useLeaders();
    const { mutate: updateIntern } = useUpdateIntern();
    const [updatingField, setUpdatingField] = useState<
        "department" | "position" | "leader" | "status" | null
    >(null);
    const [editingLeader, setEditingLeader] = useState(false);
    const [editingDept, setEditingDept] = useState(false);
    const [editingPos, setEditingPos] = useState(false);
    const [editingStatus, setEditingStatus] = useState(false);
    const leaders = leadersData?.data ?? [];
    const { data: deptData } = useDepartments();
    const departments = deptData?.data ?? [];
    const { data: posData } = usePositions(
        editingPos ? (intern.department?.id ?? undefined) : undefined,
    );
    const positions = posData?.data ?? [];
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const endDate = new Date(intern.startDate);
    endDate.setMonth(endDate.getMonth() + intern.duration);

    const fmtDate = (d: Date) =>
        d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });

    const statusBadge: Record<string, string> = {
        ACTIVE: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
        COMPLETED: "border-blue-400/20 bg-blue-500/10 text-blue-300",
        DROPPED: "border-red-400/20 bg-red-500/10 text-red-300",
    };

    return (
        <Modal>
            <Table.Row>
                {/* Intern info */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 text-sm font-bold text-slate-200">
                        {intern.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p
                            className="truncate text-sm font-medium text-white cursor-pointer hover:text-cyan-400 transition"
                            onClick={() =>
                                router.push(`/admin/interns/${intern.id}`)
                            }
                        >
                            {intern.fullName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                            {intern.user.email}
                        </p>
                    </div>
                </div>

                {/* Department */}
                <div className="text-sm text-slate-400">
                    {editingDept ? (
                        <select
                            value={intern.department?.id ?? ""}
                            onChange={(e) => {
                                setUpdatingField("department");
                                updateIntern(
                                    {
                                        id: intern.id,
                                        payload: { departmentId: e.target.value || undefined },
                                    },
                                    { onSettled: () => setUpdatingField(null) },
                                );
                                setEditingDept(false);
                            }}
                            onBlur={() => setEditingDept(false)}
                            autoFocus
                            disabled={updatingField === "department"}
                            className="w-full rounded-lg border border-cyan-400/30 bg-[#0f172a] px-2 py-1 text-xs text-white outline-none"
                        >
                            <option value="">Not set</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setEditingDept(true)}
                            disabled={updatingField === "department"}
                            className="text-left transition hover:text-cyan-400 disabled:opacity-50"
                        >
                            {updatingField === "department" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : intern.department?.name ? (
                                intern.department.name
                            ) : (
                                <span className="italic text-slate-600">Not set</span>
                            )}
                        </button>
                    )}
                </div>

                {/* Position */}
                <div className="text-sm text-slate-400">
                    {editingPos ? (
                        <select
                            value={intern.position?.id ?? ""}
                            onChange={(e) => {
                                setUpdatingField("position");
                                updateIntern(
                                    {
                                        id: intern.id,
                                        payload: { positionId: e.target.value || undefined },
                                    },
                                    { onSettled: () => setUpdatingField(null) },
                                );
                                setEditingPos(false);
                            }}
                            onBlur={() => setEditingPos(false)}
                            autoFocus
                            disabled={updatingField === "position"}
                            className="w-full rounded-lg border border-cyan-400/30 bg-[#0f172a] px-2 py-1 text-xs text-white outline-none"
                        >
                            <option value="">Not set</option>
                            {positions.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setEditingPos(true)}
                            disabled={updatingField === "position"}
                            className="text-left transition hover:text-cyan-400 disabled:opacity-50"
                        >
                            {updatingField === "position" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : intern.position?.name ? (
                                intern.position.name
                            ) : (
                                <span className="italic text-slate-600">Not set</span>
                            )}
                        </button>
                    )}
                </div>

                {/* Leader */}
                <div className="text-sm text-slate-400">
                    {editingLeader ? (
                        <select
                            value={intern.leaderId ?? ""}
                            onChange={(e) => {
                                setUpdatingField("leader");
                                const newLeaderId = e.target.value || null;
                                updateIntern(
                                    {
                                        id: intern.id,
                                        payload: { leaderId: newLeaderId },
                                    },
                                    { onSettled: () => setUpdatingField(null) },
                                );
                                setEditingLeader(false);
                            }}
                            onBlur={() => setEditingLeader(false)}
                            autoFocus
                            disabled={updatingField === "leader"}
                            className="w-full rounded-lg border border-cyan-400/30 bg-[#0f172a] px-2 py-1 text-xs text-white outline-none"
                        >
                            <option value="">Not set</option>
                            {leaders.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.fullName ?? l.email}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setEditingLeader(true)}
                            disabled={updatingField === "leader"}
                            className="text-left transition hover:text-cyan-400 disabled:opacity-50"
                        >
                            {updatingField === "leader" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : intern.leader?.fullName ? (
                                intern.leader.fullName
                            ) : (
                                <span className="italic text-slate-600">Not set</span>
                            )}
                        </button>
                    )}
                </div>

                {/* Duration */}
                <div className="text-sm text-slate-400">
                    <p>{fmtDate(new Date(intern.startDate))}</p>
                    <p className="text-xs text-slate-600">→ {fmtDate(endDate)}</p>
                </div>

                {/* Status */}
                <div>
                    {editingStatus ? (
                        <select
                            value={intern.status}
                            onChange={(e) => {
                                setUpdatingField("status");
                                updateIntern(
                                    {
                                        id: intern.id,
                                        payload: { status: e.target.value as Intern["status"] },
                                    },
                                    { onSettled: () => setUpdatingField(null) },
                                );
                                setEditingStatus(false);
                            }}
                            onBlur={() => setEditingStatus(false)}
                            autoFocus
                            disabled={updatingField === "status"}
                            className="rounded-lg border border-cyan-400/30 bg-[#0f172a] px-2 py-1 text-xs text-white outline-none cursor-pointer"
                        >
                            <option value="ACTIVE" className="bg-[#0b1020] text-emerald-400 font-medium">
                                Active
                            </option>
                            <option value="COMPLETED" className="bg-[#0b1020] text-blue-400 font-medium">
                                Completed
                            </option>
                            <option value="DROPPED" className="bg-[#0b1020] text-red-400 font-medium">
                                Dropped
                            </option>
                        </select>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setEditingStatus(true)}
                            disabled={updatingField === "status"}
                            className="disabled:opacity-50"
                        >
                            {updatingField === "status" ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                                        statusBadge[intern.status] ?? ""
                                    }`}
                                >
                                    <Circle className="h-2 w-2 fill-current" />
                                    {intern.status}
                                </span>
                            )}
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-2xl border border-white/10 bg-[#0f172a] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,.55)] backdrop-blur-2xl">
                            <button
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    router.push(`/admin/interns/${intern.id}`);
                                }}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                            >
                                <Eye className="h-4 w-4" />
                                View
                            </button>

                            {/* <Modal.Open opens={`delete-${intern.id}`}>
                                <button
                                    type="button"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            </Modal.Open> */}
                        </div>
                    )}
                </div>
            </Table.Row>

            {/* Delete confirm modal */}
            <Modal.Window name={`delete-${intern.id}`} size="sm">
                <DeleteConfirm
                    name={intern.fullName}
                    onConfirm={(onCloseModal) => {
                        deleteIntern(intern.id);
                        onCloseModal?.();
                    }}
                />
            </Modal.Window>
        </Modal>
    );
}

function DeleteConfirm({
    name,
    onConfirm,
    onCloseModal,
}: {
    name: string;
    onConfirm: (onCloseModal?: () => void) => void;
    onCloseModal?: () => void;
}) {
    return (
        <div className="px-2 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">
                Delete Intern
            </h3>
            <p className="mt-2 text-sm text-slate-400">
                Are you sure you want to delete{" "}
                <span className="font-medium text-white">{name}</span>?
            </p>
            <div className="mt-6 flex justify-center gap-3">
                <button
                    type="button"
                    onClick={onCloseModal}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 transition hover:text-white"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => onConfirm(onCloseModal)}
                    className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
