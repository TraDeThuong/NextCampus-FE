"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { MoreVertical, Eye, Trash2, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

import type { Leader } from "@/types/leader";
import { useDeleteLeader } from "@/hooks/leader/useDeleteLeader";
import { useUpdateLeader } from "@/hooks/leader/useUpdateLeader";
import { useDepartments } from "@/hooks/department/useDepartments";
import { updateUserService } from "@/services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import InlineSelect from "@/components/ui/InlineSelect";

type LeaderRowProps = {
    leader: Leader;
};

export default function LeaderRow({ leader }: LeaderRowProps) {
    const router = useRouter();
    const { mutate: deleteLeader, isPending: deleting } = useDeleteLeader();
    const { mutate: updateLeader } = useUpdateLeader();
    const { data: deptData } = useDepartments();
    const departments = deptData?.data ?? [];

    const selectedDept = departments.find((d) => d.id === leader.departmentId);
    const availablePositions = selectedDept ? selectedDept.positions : [];

    const [updatingField, setUpdatingField] = useState<
        "department" | "position" | null
    >(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleDepartmentChange = useCallback(
        (newDeptId: string | null) => {
            setUpdatingField("department");
            updateLeader(
                {
                    id: leader.id,
                    payload: {
                        departmentId: newDeptId || null,
                        position: null,
                    },
                },
                { onSettled: () => setUpdatingField(null) },
            );
        },
        [leader.id, updateLeader],
    );

    const handlePositionChange = useCallback(
        (newPos: string | null) => {
            setUpdatingField("position");
            updateLeader(
                {
                    id: leader.id,
                    payload: { position: newPos || null },
                },
                { onSettled: () => setUpdatingField(null) },
            );
        },
        [leader.id, updateLeader],
    );

    const queryClient = useQueryClient();
    const { mutate: toggleActive } = useMutation({
        mutationFn: (isActive: boolean) =>
            updateUserService(leader.userId, { isActive }),
        onSuccess: () => {
            toast.success("Leader status updated.");
            queryClient.invalidateQueries({ queryKey: ["leaders"] });
        },
        onError: () => toast.error("Failed to update status."),
    });

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <Modal>
            <Table.Row>
                {/* Leader info */}
                <div className="flex items-center gap-3 min-w-0">
                    {leader.user.avatarUrl ? (
                        <Image
                            src={leader.user.avatarUrl}
                            alt={leader.user.fullName ?? ""}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-blue-800 text-sm font-bold text-slate-200">
                            {(leader.user.fullName ?? leader.user.email)
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p
                            className="truncate text-sm font-medium text-white cursor-pointer hover:text-cyan-400 transition"
                            onClick={() =>
                                router.push(`/admin/leaders/${leader.id}`)
                            }
                        >
                            {leader.user.fullName ?? leader.user.email}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                            {leader.user.email}
                        </p>
                    </div>
                </div>

                {/* Department */}
                <div className="text-sm text-slate-400">
                    <InlineSelect
                        ariaLabel="Department"
                        value={leader.departmentId}
                        placeholder="Not set"
                        loading={updatingField === "department"}
                        onChange={handleDepartmentChange}
                        options={[
                            { value: null, label: "Not set" },
                            ...departments.map((d) => ({
                                value: d.id,
                                label: d.name,
                            })),
                        ]}
                    />
                </div>

                {/* Position */}
                <div className="text-sm text-slate-400">
                    <InlineSelect
                        ariaLabel="Position"
                        value={leader.position}
                        placeholder="Not set"
                        loading={updatingField === "position"}
                        disabled={!leader.departmentId}
                        onDisabledClick={() => toast.error("Please select a department first.")}
                        onChange={handlePositionChange}
                        options={[
                            { value: null, label: "Not set" },
                            ...availablePositions.map((pos) => ({
                                value: pos.name,
                                label: pos.name,
                            })),
                        ]}
                    />
                </div>

                {/* Intern Count */}
                <div className="text-sm text-white font-medium">
                    {leader.internCount ?? 0}
                </div>

                {/* Status */}
                <div>
                    <select
                        value={leader.user.isActive ? "true" : "false"}
                        onChange={(e) => toggleActive(e.target.value === "true")}
                        className={`rounded-lg border px-2 py-1 text-xs font-medium outline-none cursor-pointer transition-colors ${
                            leader.user.isActive
                                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-400 font-semibold"
                                : "border-red-400/30 bg-red-500/10 text-red-400 font-semibold"
                        }`}
                    >
                        <option value="true" className="bg-[#0b1020] text-emerald-400 font-medium">
                            Active
                        </option>
                        <option value="false" className="bg-[#0b1020] text-red-400 font-medium">
                            Inactive
                        </option>
                    </select>
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
                                    router.push(`/admin/leaders/${leader.id}`);
                                }}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                            >
                                <Eye className="h-4 w-4" />
                                View
                            </button>

                            <Modal.Open opens={`delete-leader-${leader.id}`}>
                                <button
                                    type="button"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            </Modal.Open>
                        </div>
                    )}
                </div>
            </Table.Row>

            <Modal.Window name={`delete-leader-${leader.id}`} size="sm">
                <DeleteConfirm
                    name={leader.user.fullName ?? leader.user.email}
                    onConfirm={(onCloseModal) => {
                        deleteLeader(leader.id);
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
    onConfirm: (close?: () => void) => void;
    onCloseModal?: () => void;
}) {
    return (
        <div className="px-2 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">
                Delete Leader
            </h3>
            <p className="mt-2 text-sm text-slate-400">
                Remove leader record for{" "}
                <span className="font-medium text-white">{name}</span>?
                This does not delete the user account.
            </p>
            <div className="mt-6 flex justify-center gap-3">
                <button
                    onClick={onCloseModal}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 hover:text-white"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onConfirm(onCloseModal)}
                    className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-500"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
