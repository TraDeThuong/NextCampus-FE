"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, Edit3, X, Loader2, Settings, Briefcase, Building2, Plus } from "lucide-react";
import type { Department } from "@/types/department";
import type { Leader } from "@/types/leader";
import { useDeleteDepartment } from "@/hooks/department/useDeleteDepartment";
import { useUpdateDepartment } from "@/hooks/department/useUpdateDepartment";
import { useCreatePosition } from "@/hooks/department/useCreatePosition";
import { useUpdatePosition } from "@/hooks/department/useUpdatePosition";
import { useDeletePosition } from "@/hooks/department/useDeletePosition";
import { useDepartments } from "@/hooks/department/useDepartments";
import { PREDEFINED_POSITIONS, GENERAL_POSITIONS } from "@/types/department";
import { useTranslations } from "next-intl";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import { toast } from "react-hot-toast";
import DepartmentLeaderSelect from "./DepartmentLeaderSelect";

type DepartmentRowProps = {
    department: Department;
    leaders: Leader[];
    leadersLoading: boolean;
    leadersError: boolean;
};

export default function DepartmentRow({
    department,
    leaders,
    leadersLoading,
    leadersError,
}: DepartmentRowProps) {
    const t = useTranslations();
    const { mutate: deleteDepartment } = useDeleteDepartment();
    const { mutate: updateDepartment } = useUpdateDepartment();

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

    return (
        <Modal>
            <Table.Row>
                {/* Department Name */}
                <div className="text-sm font-semibold text-white min-w-0 pr-4 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span className="truncate">{department.name}</span>
                </div>

                {/* Description */}
                <div className="text-xs text-slate-400 min-w-0 pr-4 truncate" title={department.description || t("admin.department.defaultDescription")}>
                    {department.description || t("admin.department.defaultDescription")}
                </div>

                {/* Positions Count */}
                <div className="flex items-center">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-300 ring-1 ring-inset ring-cyan-400/20">
                        <Briefcase className="h-3 w-3 shrink-0" />
                        {t("admin.department.positionsCount", { count: department.positions.length })}
                    </span>
                </div>

                {/* Leaders */}
                <div className="text-sm min-w-0 pr-4">
                    <DepartmentLeaderSelect
                        department={department}
                        leaders={leaders}
                        loading={leadersLoading}
                        error={leadersError}
                    />
                </div>

                {/* Actions Dropdown */}
                <div className="relative text-right pr-4" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-white/10 bg-[#0f172a] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,.55)] backdrop-blur-2xl text-left">
                            <Modal.Open opens={`edit-department-${department.id}`}>
                                <button
                                    type="button"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                                >
                                    <Edit3 className="h-4 w-4" />
                                    {t("admin.department.editDepartment")}
                                </button>
                            </Modal.Open>

                            <Modal.Open opens={`manage-positions-${department.id}`}>
                                <button
                                    type="button"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                                >
                                    <Settings className="h-4 w-4" />
                                    {t("admin.department.positions")}
                                </button>
                            </Modal.Open>

                            <Modal.Open opens={`delete-department-${department.id}`}>
                                <button
                                    type="button"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {t("admin.department.delete")}
                                </button>
                            </Modal.Open>
                        </div>
                    )}
                </div>
            </Table.Row>

            <Modal.Window name={`edit-department-${department.id}`} size="md">
                <EditDepartmentModal
                    department={department}
                    onUpdateName={(name) => updateDepartment({ id: department.id, payload: { name } })}
                />
            </Modal.Window>

            <Modal.Window name={`manage-positions-${department.id}`} size="md">
                <ManagePositions department={department} />
            </Modal.Window>

            <Modal.Window name={`delete-department-${department.id}`} size="sm">
                <DeleteConfirm
                    name={department.name}
                    onConfirm={(onCloseModal) => {
                        deleteDepartment(department.id);
                        onCloseModal?.();
                    }}
                />
            </Modal.Window>
        </Modal>
    );
}

function EditDepartmentModal({
    department,
    onUpdateName,
    onCloseModal,
}: {
    department: Department;
    onUpdateName: (name: string) => void;
    onCloseModal?: () => void;
}) {
    const t = useTranslations();
    const { data: deptData } = useDepartments();
    const departments = deptData?.data ?? [];

    const { mutate: createPosition, isPending: creatingPos } = useCreatePosition();
    const { mutate: updatePosition } = useUpdatePosition();
    const { mutate: deletePosition } = useDeletePosition();

    const [deptName, setDeptName] = useState(department.name);
    const [newPositionName, setNewPositionName] = useState("");
    const [editingPosId, setEditingPosId] = useState<string | null>(null);
    const [editingPosName, setEditingPosName] = useState("");

    const predefinedForDept = PREDEFINED_POSITIONS[deptName] || GENERAL_POSITIONS;

    const deptExists = departments.some(
        (d) => d.id !== department.id && d.name.toLowerCase().trim() === deptName.toLowerCase().trim()
    );

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deptName.trim()) return;
        if (deptExists) {
            toast.error(t("admin.department.deptNameExistsToast"));
            return;
        }
        if (deptName.trim() !== department.name) {
            onUpdateName(deptName.trim());
        }
        onCloseModal?.();
    };

    const handleAddPosition = (e?: React.SyntheticEvent) => {
        e?.preventDefault();
        const trimmed = newPositionName.trim();
        if (!trimmed) return;
        const exists = department.positions.some(
            (p) => p.name.toLowerCase().trim() === trimmed.toLowerCase()
        );
        if (exists) {
            toast.error(t("admin.department.positionExistsWarning"));
            return;
        }
        createPosition(
            { name: trimmed, departmentId: department.id },
            {
                onSuccess: () => {
                    setNewPositionName("");
                },
            }
        );
    };

    const handleUpdatePos = (posId: string, currentName: string) => {
        const trimmed = editingPosName.trim();
        if (trimmed && trimmed !== currentName) {
            updatePosition({ id: posId, payload: { name: trimmed } });
        }
        setEditingPosId(null);
    };

    return (
        <div className="px-2 py-6 text-left">
            <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-cyan-400 shrink-0" />
                <h3 className="text-lg font-bold text-white">
                    {t("admin.department.editDepartmentTitle")}
                </h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">
                {t("admin.department.editDepartmentDescription")}
            </p>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Department Name */}
                <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        {t("admin.department.departmentName")}
                    </label>
                    <input
                        type="text"
                        value={deptName}
                        onChange={(e) => setDeptName(e.target.value)}
                        placeholder={t("admin.department.deptNamePlaceholder")}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600"
                    />
                    {deptExists && (
                        <p className="text-xs text-red-400 mt-1.5">
                            {t("admin.department.deptNameExistsError")}
                        </p>
                    )}
                </div>

                {/* Positions Management */}
                <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                        {t("admin.department.jobPositions")} ({department.positions.length})
                    </label>

                    {/* Dynamic positions list */}
                    <div className="space-y-2 max-h-52 overflow-y-auto mb-3 pr-1 custom-scrollbar">
                        {department.positions.length === 0 ? (
                            <p className="text-xs text-slate-500 italic py-2">
                                {t("admin.department.noPositionsDefined")}
                            </p>
                        ) : (
                            department.positions.map((pos) => (
                                <div
                                    key={pos.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2"
                                >
                                    {editingPosId === pos.id ? (
                                        <input
                                            type="text"
                                            value={editingPosName}
                                            onChange={(e) => setEditingPosName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleUpdatePos(pos.id, pos.name);
                                                } else if (e.key === "Escape") {
                                                    setEditingPosId(null);
                                                }
                                            }}
                                            onBlur={() => handleUpdatePos(pos.id, pos.name)}
                                            autoFocus
                                            className="flex-1 rounded-lg border border-cyan-400/30 bg-[#0f172a] px-2 py-1 text-sm text-white outline-none"
                                        />
                                    ) : (
                                        <span className="text-sm text-slate-300 font-medium">
                                            {pos.name}
                                        </span>
                                    )}

                                    <div className="flex items-center gap-1 shrink-0">
                                        {editingPosId === pos.id ? (
                                            <button
                                                type="button"
                                                onClick={() => setEditingPosId(null)}
                                                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingPosId(pos.id);
                                                        setEditingPosName(pos.name);
                                                    }}
                                                    className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-cyan-400 transition"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm(t("admin.department.deletePositionConfirm", { name: pos.name }))) {
                                                            deletePosition({ id: pos.id, departmentId: department.id });
                                                        }
                                                    }}
                                                    className="p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Position Dynamic Field */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            list={`positions-list-edit-${department.id}`}
                            value={newPositionName}
                            onChange={(e) => setNewPositionName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddPosition(e);
                                }
                            }}
                            placeholder={t("admin.department.addPositionPlaceholder")}
                            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-sm text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600"
                        />
                        <datalist id={`positions-list-edit-${department.id}`}>
                            {predefinedForDept.map((pos) => (
                                <option key={pos} value={pos} />
                            ))}
                        </datalist>
                        <button
                            type="button"
                            onClick={handleAddPosition}
                            disabled={!newPositionName.trim() || creatingPos}
                            className="flex items-center justify-center rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-400/20 px-3 transition shrink-0 disabled:opacity-50"
                        >
                            {creatingPos ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={onCloseModal}
                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 hover:text-white transition"
                    >
                        {t("admin.department.cancel")}
                    </button>
                    <button
                        type="submit"
                        disabled={deptExists || !deptName.trim()}
                        className="rounded-xl bg-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition"
                    >
                        {t("admin.department.saveChanges")}
                    </button>
                </div>
            </form>
        </div>
    );
}

function ManagePositions({
    department,
}: {
    department: Department;
    onCloseModal?: () => void;
}) {
    const t = useTranslations();
    const { mutate: createPosition, isPending: creating } = useCreatePosition();
    const { mutate: updatePosition } = useUpdatePosition();
    const { mutate: deletePosition } = useDeletePosition();

    const predefinedForDept = PREDEFINED_POSITIONS[department.name] || GENERAL_POSITIONS;

    const [newPositionName, setNewPositionName] = useState("");
    const [addPosSuggestIdx, setAddPosSuggestIdx] = useState(0);
    const [originalNewPosTyped, setOriginalNewPosTyped] = useState("");

    const [editingPosId, setEditingPosId] = useState<string | null>(null);
    const [editingPosName, setEditingPosName] = useState("");
    const [editPosSuggestIdx, setEditPosSuggestIdx] = useState(0);
    const [originalEditPosTyped, setOriginalEditPosTyped] = useState("");

    const newPosExists = department.positions.some(
        (p) => p.name.toLowerCase().trim() === newPositionName.toLowerCase().trim()
    );

    const addPosition = () => {
        const trimmed = newPositionName.trim();
        if (!trimmed) return;
        createPosition(
            {
                name: trimmed,
                departmentId: department.id,
            },
            {
                onSuccess: () => {
                    setNewPositionName("");
                    setOriginalNewPosTyped("");
                },
            }
        );
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addPosition();
    };

    const handleAddPosKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Tab") {
            const matches = predefinedForDept.filter((p) =>
                p.toLowerCase().includes(originalNewPosTyped.toLowerCase())
            );
            if (matches.length > 0) {
                e.preventDefault();
                if (matches.length === 1) {
                    setNewPositionName(matches[0]);
                } else {
                    const index = addPosSuggestIdx % matches.length;
                    setNewPositionName(matches[index]);
                    setAddPosSuggestIdx(index + 1);
                }
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            addPosition();
        }
    };

    const handleEditPosKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, posId: string, originalName: string) => {
        if (e.key === "Tab") {
            const matches = predefinedForDept.filter((p) =>
                p.toLowerCase().includes(originalEditPosTyped.toLowerCase())
            );
            if (matches.length > 0) {
                e.preventDefault();
                if (matches.length === 1) {
                    setEditingPosName(matches[0]);
                } else {
                    const index = editPosSuggestIdx % matches.length;
                    setEditingPosName(matches[index]);
                    setEditPosSuggestIdx(index + 1);
                }
            }
        } else if (e.key === "Enter") {
            if (editingPosName.trim() && editingPosName.trim() !== originalName) {
                updatePosition({
                    id: posId,
                    payload: { name: editingPosName.trim() },
                });
            }
            setEditingPosId(null);
        } else if (e.key === "Escape") {
            setEditingPosId(null);
        }
    };

    return (
        <div className="px-2 py-4 text-left">
            <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-cyan-400 shrink-0" />
                <h3 className="text-lg font-bold text-white">
                    {t("admin.department.positionsOf", { name: department.name })}
                </h3>
            </div>

            {/* List existing positions */}
            <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-1 custom-scrollbar">
                {department.positions.length === 0 ? (
                    <p className="text-sm text-slate-500 italic py-2">{t("admin.department.noPositionsDefined")}</p>
                ) : (
                    department.positions.map((pos) => {
                        const editPosExists = department.positions.some(
                            (p) => p.id !== pos.id && p.name.toLowerCase().trim() === editingPosName.toLowerCase().trim()
                        );

                        return (
                            <div
                                key={pos.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-2 relative"
                            >
                                {editingPosId === pos.id ? (
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            list={`positions-list-${pos.id}`}
                                            value={editingPosName}
                                            onChange={(e) => {
                                                setEditingPosName(e.target.value);
                                                setOriginalEditPosTyped(e.target.value);
                                                setEditPosSuggestIdx(0);
                                            }}
                                            onKeyDown={(e) => handleEditPosKeyDown(e, pos.id, pos.name)}
                                            onBlur={() => {
                                                if (editingPosName.trim() && editingPosName.trim() !== pos.name) {
                                                    updatePosition({
                                                        id: pos.id,
                                                        payload: { name: editingPosName.trim() },
                                                    });
                                                }
                                                setEditingPosId(null);
                                            }}
                                            className="w-full rounded-lg border border-cyan-400/30 bg-[#0f172a] px-2 py-1 text-sm text-white outline-none"
                                            autoFocus
                                        />
                                        <datalist id={`positions-list-${pos.id}`}>
                                            {predefinedForDept.map((posName) => (
                                                <option key={posName} value={posName} />
                                            ))}
                                        </datalist>
                                        {editPosExists && (
                                            <p className="absolute left-0 top-full z-10 text-[9px] text-yellow-500 bg-[#0f172a] border border-yellow-500/20 px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                                                {t("admin.department.positionExistsWarning")}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-sm text-slate-300 font-medium">
                                        {pos.name}
                                    </span>
                                )}

                                <div className="flex items-center gap-1 shrink-0">
                                    {editingPosId === pos.id ? (
                                        <button
                                            type="button"
                                            onClick={() => setEditingPosId(null)}
                                            className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingPosId(pos.id);
                                                    setEditingPosName(pos.name);
                                                    setOriginalEditPosTyped(pos.name);
                                                    setEditPosSuggestIdx(0);
                                                }}
                                                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-cyan-400 transition"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm(t("admin.department.deletePositionConfirm", { name: pos.name }))) {
                                                        deletePosition({ id: pos.id, departmentId: department.id });
                                                    }
                                                }}
                                                className="p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add new position with autocomplete and warning */}
            <form onSubmit={handleAdd} className="flex flex-col gap-2 border-t border-white/10 pt-4">
                <div className="flex gap-2 relative">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            list={`positions-list-add-${department.id}`}
                            value={newPositionName}
                            onChange={(e) => {
                                      setNewPositionName(e.target.value);
                                      setOriginalNewPosTyped(e.target.value);
                                      setAddPosSuggestIdx(0);
                            }}
                            onKeyDown={handleAddPosKeyDown}
                            placeholder={t("admin.department.addPositionPlaceholderRow")}
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-4 text-sm text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600"
                            disabled={creating}
                        />
                        <datalist id={`positions-list-add-${department.id}`}>
                            {predefinedForDept.map((posName) => (
                                <option key={posName} value={posName} />
                            ))}
                        </datalist>
                        {newPosExists && (
                            <p className="absolute left-0 top-full z-10 text-[9px] text-yellow-500 bg-[#0f172a] border border-yellow-500/20 px-1.5 py-0.5 rounded shadow-md whitespace-nowrap mt-0.5">
                                {t("admin.department.positionExistsWarning")}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={creating || !newPositionName.trim()}
                        className="flex items-center justify-center rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition shrink-0"
                    >
                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : t("admin.department.add")}
                    </button>
                </div>
            </form>
        </div>
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
    const t = useTranslations();
    return (
        <div className="px-2 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">
                {t("admin.department.deleteTitle")}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
                {t("admin.department.deleteConfirm", { name })}
            </p>
            <div className="mt-6 flex justify-center gap-3">
                <button
                    onClick={onCloseModal}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 hover:text-white"
                >
                    {t("admin.department.cancel")}
                </button>
                <button
                    onClick={() => onConfirm(onCloseModal)}
                    className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-500"
                >
                    {t("admin.department.delete")}
                </button>
            </div>
        </div>
    );
}
