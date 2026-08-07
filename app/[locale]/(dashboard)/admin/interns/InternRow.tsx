"use client";

import { useRouter } from "next/navigation";
import { MoreVertical, Eye, Trash2, Circle, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";

import type { Intern } from "@/types/intern";
import { useDeleteIntern } from "@/hooks/intern/useDeleteIntern";
import { useLeaders } from "@/hooks/leader/useLeaders";
import { useUpdateIntern } from "@/hooks/intern/useUpdateIntern";
import { usePositions } from "@/hooks/department/usePositions";
import { useDepartments } from "@/hooks/department/useDepartments";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import InlineSelect from "@/components/ui/InlineSelect";

type InternRowProps = {
    intern: Intern;
};

export default function InternRow({ intern }: InternRowProps) {
    const t = useTranslations();
    const router = useRouter();
    const { mutate: deleteIntern } = useDeleteIntern();
    const { data: leadersData } = useLeaders();
    const { mutate: updateIntern } = useUpdateIntern();
    const [updatingField, setUpdatingField] = useState<
        "department" | "position" | "leader" | "status" | null
    >(null);
    const leaders = useMemo(() => leadersData?.data ?? [], [leadersData?.data]);

    const { data: deptsData } = useDepartments();
    const departments = deptsData?.data ?? [];

    const { data: posData } = usePositions(intern.department?.id ?? undefined);
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

    const handleLeaderChange = useCallback(
        (newLeaderId: string | null) => {
            setUpdatingField("leader");
            const selectedLeader = newLeaderId
                ? leaders.find((l) => l.userId === newLeaderId)
                : null;
            const hasSingleDepartment = selectedLeader?.departments?.length === 1;

            updateIntern(
                {
                    id: intern.id,
                    payload: {
                        leaderId: newLeaderId,
                        ...(hasSingleDepartment ? {
                            departmentId: selectedLeader.departments[0].id,
                        } : {
                            departmentId: null,
                            positionId: null,
                        }),
                    },
                },
                { onSettled: () => setUpdatingField(null) },
            );
        },
        [intern.id, leaders, updateIntern],
    );

    const handlePositionChange = useCallback(
        (newPositionId: string | null) => {
            setUpdatingField("position");
            updateIntern(
                {
                    id: intern.id,
                    payload: { positionId: newPositionId || undefined },
                },
                { onSettled: () => setUpdatingField(null) },
            );
        },
        [intern.id, updateIntern],
    );

    const handleDepartmentChange = useCallback(
        (newDepartmentId: string | null) => {
            setUpdatingField("department");
            updateIntern(
                {
                    id: intern.id,
                    payload: {
                        departmentId: newDepartmentId,
                        positionId: null,
                    },
                },
                { onSettled: () => setUpdatingField(null) },
            );
        },
        [intern.id, updateIntern],
    );

    const handleStatusChange = useCallback(
        (newStatus: Intern["status"]) => {
            setUpdatingField("status");
            updateIntern(
                {
                    id: intern.id,
                    payload: { status: newStatus },
                },
                { onSettled: () => setUpdatingField(null) },
            );
        },
        [intern.id, updateIntern],
    );

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
                    <InlineSelect
                        ariaLabel="Department"
                        value={intern.department?.id ?? null}
                        placeholder={t("admin.interns.notSet")}
                        loading={updatingField === "department"}
                        onChange={handleDepartmentChange}
                        options={[
                            { value: null, label: t("admin.interns.notSet") },
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
                        value={intern.position?.id ?? null}
                        placeholder={t("admin.interns.notSet")}
                        loading={updatingField === "position"}
                        onChange={handlePositionChange}
                        options={[
                            { value: null, label: t("admin.interns.notSet") },
                            ...positions.map((p) => ({
                                value: p.id,
                                label: p.name,
                            })),
                        ]}
                    />
                </div>

                {/* Leader */}
                <div className="text-sm text-slate-400">
                    <InlineSelect
                        ariaLabel="Leader"
                        value={intern.leaderId}
                        placeholder={t("admin.interns.notSet")}
                        loading={updatingField === "leader"}
                        onChange={handleLeaderChange}
                        options={[
                            { value: null, label: t("admin.interns.notSet") },
                            ...leaders.map((l) => ({
                                value: l.userId,
                                label: l.user.fullName ? `${l.user.fullName} (${l.user.email})` : l.user.email,
                            })),
                        ]}
                    />
                </div>

                {/* Duration */}
                <div className="text-sm text-slate-400">
                    <p>{fmtDate(new Date(intern.startDate))}</p>
                    <p className="text-xs text-slate-600">→ {fmtDate(endDate)}</p>
                </div>

                {/* Status */}
                <div>
                    <InlineSelect
                        ariaLabel="Status"
                        value={intern.status}
                        placeholder={t("admin.interns.colStatus")}
                        loading={updatingField === "status"}
                        onChange={(val) => handleStatusChange(val as Intern["status"])}
                        options={[
                            { value: "ACTIVE", label: t("admin.interns.active") },
                            { value: "COMPLETED", label: t("admin.interns.completed") },
                            { value: "DROPPED", label: t("admin.interns.dropped") },
                        ]}
                        renderTrigger={(label) => (
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                                    statusBadge[intern.status] ?? ""
                                }`}
                            >
                                <Circle className="h-2 w-2 fill-current" />
                                {label}
                            </span>
                        )}
                    />
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
                                {t("admin.interns.view")}
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



/* ─── DeleteConfirm ──────────────────────────────────────────── */

function DeleteConfirm({
    name,
    onConfirm,
    onCloseModal,
}: {
    name: string;
    onConfirm: (onCloseModal?: () => void) => void;
    onCloseModal?: () => void;
}) {
    const t = useTranslations();
    return (
        <div className="px-2 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">
                {t("admin.interns.deleteTitle")}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
                {t("admin.interns.deleteConfirm", { name })}
            </p>
            <div className="mt-6 flex justify-center gap-3">
                <button
                    type="button"
                    onClick={onCloseModal}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 transition hover:text-white"
                >
                    {t("admin.interns.cancel")}
                </button>
                <button
                    type="button"
                    onClick={() => onConfirm(onCloseModal)}
                    className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                >
                    {t("admin.interns.delete")}
                </button>
            </div>
        </div>
    );
}
