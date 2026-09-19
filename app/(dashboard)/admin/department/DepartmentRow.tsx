"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import {
    MoreVertical,
    Trash2,
    Edit3,
    X,
    Loader2,
    Settings,
    Briefcase,
    Building2,
    Plus,
    AlertCircle,
} from "lucide-react";
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
import Button from "@/components/ui/Button";
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
    const { mutate: deleteDepartment, isPending: deletingDept } = useDeleteDepartment();
    const { mutate: updateDepartment, isPending: updatingDept } = useUpdateDepartment();

    const [menuOpen, setMenuOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuId = useId();

    const updateMenuPosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        if (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw) {
            setMenuOpen(false);
            return;
        }

        const MENU_WIDTH = Math.min(160, vw - 24);
        const ESTIMATED_HEIGHT = 160;
        const spaceBelow = vh - rect.bottom;
        const spaceAbove = rect.top;

        const openUpward = spaceBelow < ESTIMATED_HEIGHT && spaceAbove > spaceBelow;

        const maxHeight = openUpward
            ? Math.min(260, Math.max(100, spaceAbove - 16))
            : Math.min(260, Math.max(100, spaceBelow - 16));

        const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, vw - MENU_WIDTH - 8));

        setMenuStyle({
            position: "fixed",
            top: openUpward ? undefined : rect.bottom + 6,
            bottom: openUpward ? vh - rect.top + 6 : undefined,
            left,
            width: MENU_WIDTH,
            maxHeight,
            overflowY: "auto",
            zIndex: 9999,
        });
    }, [setMenuOpen]);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!menuOpen) {
            updateMenuPosition();
            setMenuOpen(true);
        } else {
            setMenuOpen(false);
        }
    };

    useEffect(() => {
        if (!menuOpen) return;
        updateMenuPosition();
        window.addEventListener("scroll", updateMenuPosition, true);
        window.addEventListener("resize", updateMenuPosition);
        return () => {
            window.removeEventListener("scroll", updateMenuPosition, true);
            window.removeEventListener("resize", updateMenuPosition);
        };
    }, [menuOpen, updateMenuPosition]);

    useEffect(() => {
        if (!menuOpen) return;
        function handleClickOutside(e: MouseEvent | TouchEvent) {
            const target = e.target as Node;
            if (
                menuRef.current &&
                !menuRef.current.contains(target) &&
                triggerRef.current &&
                !triggerRef.current.contains(target)
            ) {
                setMenuOpen(false);
            }
        }
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setMenuOpen(false);
                triggerRef.current?.focus();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside, { passive: true });
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [menuOpen]);

    return (
        <Modal>
            <Table.Row>
                {/* Department Name */}
                <div className="text-sm font-semibold text-foreground min-w-0 pr-4 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span className="truncate">{department.name}</span>
                </div>

                {/* Description */}
                <div
                    className="text-xs text-muted min-w-0 pr-4 truncate"
                    title={department.description || t("admin.department.defaultDescription")}
                >
                    {department.description || t("admin.department.defaultDescription")}
                </div>

                {/* Positions Count */}
                <div className="flex items-center">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400 ring-1 ring-inset ring-cyan-500/20">
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
                <div className="relative text-right">
                    <button
                        ref={triggerRef}
                        type="button"
                        aria-label="Department actions"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        aria-controls={menuId}
                        onClick={toggleMenu}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted transition hover:border-white/10 hover:bg-white/5 hover:text-foreground active:scale-[0.98]"
                    >
                        <MoreVertical className="h-4 w-4 shrink-0" />
                    </button>

                    {menuOpen &&
                        typeof document !== "undefined" &&
                        createPortal(
                            <div
                                id={menuId}
                                ref={menuRef}
                                role="menu"
                                style={menuStyle}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") setMenuOpen(false);
                                }}
                                className="rounded-xl border border-border dark:border-white/10 bg-card/95 p-1 shadow-[0_12px_36px_rgba(0,0,0,.45)] backdrop-blur-2xl text-left"
                            >
                                <Modal.Open opens={`edit-department-${department.id}`}>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground transition hover:bg-white/5"
                                    >
                                        <Edit3 className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                                        {t("admin.department.editDepartment")}
                                    </button>
                                </Modal.Open>

                                <Modal.Open opens={`manage-positions-${department.id}`}>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground transition hover:bg-white/5"
                                    >
                                        <Settings className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                        {t("admin.department.positions")}
                                    </button>
                                </Modal.Open>

                                <Modal.Open opens={`delete-department-${department.id}`}>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 shrink-0" />
                                        {t("admin.department.delete")}
                                    </button>
                                </Modal.Open>
                            </div>,
                            document.body,
                        )}
                </div>
            </Table.Row>

            <Modal.Window name={`edit-department-${department.id}`} size="md">
                <EditDepartmentModal
                    department={department}
                    isUpdating={updatingDept}
                    onUpdate={(payload) => updateDepartment({ id: department.id, payload })}
                />
            </Modal.Window>

            <Modal.Window name={`manage-positions-${department.id}`} size="md">
                <ManagePositions department={department} />
            </Modal.Window>

            <Modal.Window name={`delete-department-${department.id}`} size="sm">
                <DeleteConfirm
                    name={department.name}
                    isDeleting={deletingDept}
                    onConfirm={(onCloseModal) => {
                        deleteDepartment(department.id, {
                            onSuccess: () => onCloseModal?.(),
                        });
                    }}
                />
            </Modal.Window>
        </Modal>
    );
}

function EditDepartmentModal({
    department,
    isUpdating,
    onUpdate,
    onCloseModal,
}: {
    department: Department;
    isUpdating: boolean;
    onUpdate: (payload: { name: string; description?: string | null }) => void;
    onCloseModal?: () => void;
}) {
    const t = useTranslations();
    const { data: deptData } = useDepartments();
    const departments = deptData?.data ?? [];

    const { mutate: createPosition, isPending: creatingPos } = useCreatePosition();
    const { mutate: updatePosition } = useUpdatePosition();
    const { mutate: deletePosition } = useDeletePosition();

    const [deptName, setDeptName] = useState(department.name);
    const [deptDescription, setDeptDescription] = useState(department.description || "");
    const [newPositionName, setNewPositionName] = useState("");
    const [editingPosId, setEditingPosId] = useState<string | null>(null);
    const [editingPosName, setEditingPosName] = useState("");

    const predefinedForDept = PREDEFINED_POSITIONS[deptName] || GENERAL_POSITIONS;

    const deptExists = departments.some(
        (d) => d.id !== department.id && d.name.toLowerCase().trim() === deptName.toLowerCase().trim(),
    );

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deptName.trim()) return;
        if (deptExists) {
            toast.error(t("admin.department.deptNameExistsToast"));
            return;
        }
        const trimmedDesc = deptDescription.trim();
        const currentDesc = department.description || "";
        if (deptName.trim() !== department.name || trimmedDesc !== currentDesc) {
            onUpdate({
                name: deptName.trim(),
                description: trimmedDesc || null,
            });
        }
        onCloseModal?.();
    };

    const handleAddPosition = (e?: React.SyntheticEvent) => {
        e?.preventDefault();
        const trimmed = newPositionName.trim();
        if (!trimmed) return;
        const exists = department.positions.some(
            (p) => p.name.toLowerCase().trim() === trimmed.toLowerCase(),
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
            },
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
                <h3 className="text-lg font-bold text-foreground">
                    {t("admin.department.editDepartmentTitle")}
                </h3>
            </div>
            <p className="text-sm text-muted mb-6">
                {t("admin.department.editDepartmentDescription")}
            </p>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Department Name */}
                <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
                        {t("admin.department.departmentName")}{" "}
                        <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={deptName}
                        onChange={(e) => setDeptName(e.target.value)}
                        placeholder={t("admin.department.deptNamePlaceholder")}
                        className={`w-full rounded-xl border bg-card/60 py-2.5 px-4 text-sm text-foreground outline-none transition focus:border-cyan-400/50 placeholder:text-muted ${
                            deptExists || !deptName.trim()
                                ? "border-rose-500/50"
                                : "border-border dark:border-white/10"
                        }`}
                    />
                    {deptExists && (
                        <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {t("admin.department.deptNameExistsError")}
                        </p>
                    )}
                </div>

                {/* Department Description */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                            {t("admin.department.deptDescription")}
                        </label>
                        <span className="text-[11px] text-muted font-normal">
                            {t("admin.department.deptDescriptionOptional")}
                        </span>
                    </div>
                    <textarea
                        rows={2}
                        value={deptDescription}
                        onChange={(e) => setDeptDescription(e.target.value)}
                        placeholder={t("admin.department.deptDescriptionPlaceholder")}
                        className="w-full rounded-xl border border-border dark:border-white/10 bg-card/60 py-2.5 px-4 text-sm text-foreground outline-none transition focus:border-cyan-400/50 placeholder:text-muted resize-none"
                    />
                </div>

                {/* Positions Management */}
                <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                        {t("admin.department.jobPositions")} ({department.positions.length})
                    </label>

                    {/* Dynamic positions list */}
                    <div className="space-y-2 max-h-52 overflow-y-auto mb-3 pr-1 custom-scrollbar">
                        {department.positions.length === 0 ? (
                            <p className="text-xs text-muted italic py-2">
                                {t("admin.department.noPositionsDefined")}
                            </p>
                        ) : (
                            department.positions.map((pos) => (
                                <div
                                    key={pos.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-border dark:border-white/5 bg-card/40 px-3 py-2"
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
                                            className="flex-1 rounded-lg border border-cyan-400/40 bg-card px-2 py-1 text-sm text-foreground outline-none"
                                        />
                                    ) : (
                                        <span className="text-sm text-foreground font-medium">
                                            {pos.name}
                                        </span>
                                    )}

                                    <div className="flex items-center gap-1 shrink-0">
                                        {editingPosId === pos.id ? (
                                            <button
                                                type="button"
                                                onClick={() => setEditingPosId(null)}
                                                className="p-1 rounded-lg hover:bg-white/5 text-muted hover:text-foreground"
                                                aria-label="Cancel editing position"
                                            >
                                                <X className="h-4 w-4 shrink-0" />
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingPosId(pos.id);
                                                        setEditingPosName(pos.name);
                                                    }}
                                                    className="p-1 rounded-lg hover:bg-white/5 text-muted hover:text-cyan-400 transition"
                                                    aria-label={`Edit ${pos.name}`}
                                                >
                                                    <Edit3 className="h-4 w-4 shrink-0" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm(t("admin.department.deletePositionConfirm", { name: pos.name }))) {
                                                            deletePosition({ id: pos.id, departmentId: department.id });
                                                        }
                                                    }}
                                                    className="p-1 rounded-lg hover:bg-rose-500/10 text-muted hover:text-rose-400 transition"
                                                    aria-label={`Delete ${pos.name}`}
                                                >
                                                    <Trash2 className="h-4 w-4 shrink-0" />
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
                            className="flex-1 rounded-xl border border-border dark:border-white/10 bg-card/60 py-2 px-3 text-sm text-foreground outline-none transition focus:border-cyan-400/50 placeholder:text-muted"
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
                            className="flex items-center justify-center rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-400/20 px-3 transition shrink-0 disabled:opacity-50 active:scale-[0.98]"
                            aria-label="Add position"
                        >
                            {creatingPos ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Plus className="h-4 w-4 shrink-0" />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-white/10">
                    <button
                        type="button"
                        onClick={onCloseModal}
                        disabled={isUpdating}
                        className="rounded-xl border border-border dark:border-white/10 bg-card/40 px-5 py-2 text-sm text-muted hover:text-foreground transition disabled:opacity-50"
                    >
                        {t("admin.department.cancel")}
                    </button>
                    <Button
                        type="submit"
                        disabled={deptExists || !deptName.trim() || isUpdating}
                        variant="glass"
                    >
                        {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        ) : (
                            t("admin.department.saveChanges")
                        )}
                    </Button>
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
        (p) => p.name.toLowerCase().trim() === newPositionName.toLowerCase().trim(),
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
            },
        );
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addPosition();
    };

    const handleAddPosKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Tab") {
            const matches = predefinedForDept.filter((p) =>
                p.toLowerCase().includes(originalNewPosTyped.toLowerCase()),
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
                p.toLowerCase().includes(originalEditPosTyped.toLowerCase()),
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
                <h3 className="text-lg font-bold text-foreground">
                    {t("admin.department.positionsOf", { name: department.name })}
                </h3>
            </div>

            {/* List existing positions */}
            <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-1 custom-scrollbar">
                {department.positions.length === 0 ? (
                    <p className="text-sm text-muted italic py-2">{t("admin.department.noPositionsDefined")}</p>
                ) : (
                    department.positions.map((pos) => {
                        const editPosExists = department.positions.some(
                            (p) => p.id !== pos.id && p.name.toLowerCase().trim() === editingPosName.toLowerCase().trim(),
                        );

                        return (
                            <div
                                key={pos.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-border dark:border-white/5 bg-card/40 px-3.5 py-2 relative"
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
                                            className="w-full rounded-lg border border-cyan-400/40 bg-card px-2 py-1 text-sm text-foreground outline-none"
                                            autoFocus
                                        />
                                        <datalist id={`positions-list-${pos.id}`}>
                                            {predefinedForDept.map((posName) => (
                                                <option key={posName} value={posName} />
                                            ))}
                                        </datalist>
                                        {editPosExists && (
                                            <p className="absolute left-0 top-full z-10 text-[10px] text-amber-400 bg-card border border-amber-400/20 px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                                                {t("admin.department.positionExistsWarning")}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-sm text-foreground font-medium">
                                        {pos.name}
                                    </span>
                                )}

                                <div className="flex items-center gap-1 shrink-0">
                                    {editingPosId === pos.id ? (
                                        <button
                                            type="button"
                                            onClick={() => setEditingPosId(null)}
                                            className="p-1 rounded-lg hover:bg-white/5 text-muted hover:text-foreground"
                                            aria-label="Cancel edit"
                                        >
                                            <X className="h-4 w-4 shrink-0" />
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
                                                className="p-1 rounded-lg hover:bg-white/5 text-muted hover:text-cyan-400 transition"
                                                aria-label={`Edit ${pos.name}`}
                                            >
                                                <Edit3 className="h-4 w-4 shrink-0" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (confirm(t("admin.department.deletePositionConfirm", { name: pos.name }))) {
                                                        deletePosition({ id: pos.id, departmentId: department.id });
                                                    }
                                                }}
                                                className="p-1 rounded-lg hover:bg-rose-500/10 text-muted hover:text-rose-400 transition"
                                                aria-label={`Delete ${pos.name}`}
                                            >
                                                <Trash2 className="h-4 w-4 shrink-0" />
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
            <form onSubmit={handleAdd} className="flex flex-col gap-2 border-t border-border dark:border-white/10 pt-4">
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
                            className="w-full rounded-xl border border-border dark:border-white/10 bg-card/60 py-2 px-4 text-sm text-foreground outline-none transition focus:border-cyan-400/50 placeholder:text-muted"
                            disabled={creating}
                        />
                        <datalist id={`positions-list-add-${department.id}`}>
                            {predefinedForDept.map((posName) => (
                                <option key={posName} value={posName} />
                            ))}
                        </datalist>
                        {newPosExists && (
                            <p className="absolute left-0 top-full z-10 text-[10px] text-amber-400 bg-card border border-amber-400/20 px-1.5 py-0.5 rounded shadow-md whitespace-nowrap mt-0.5">
                                {t("admin.department.positionExistsWarning")}
                            </p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        disabled={creating || !newPositionName.trim()}
                        variant="glass"
                    >
                        {creating ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : t("admin.department.add")}
                    </Button>
                </div>
            </form>
        </div>
    );
}

function DeleteConfirm({
    name,
    isDeleting,
    onConfirm,
    onCloseModal,
}: {
    name: string;
    isDeleting: boolean;
    onConfirm: (close?: () => void) => void;
    onCloseModal?: () => void;
}) {
    const t = useTranslations();
    return (
        <div className="px-2 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
                <Trash2 className="h-6 w-6 shrink-0" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
                {t("admin.department.deleteTitle")}
            </h3>
            <p className="mt-2 text-sm text-muted">
                {t("admin.department.deleteConfirm", { name })}
            </p>
            <div className="mt-6 flex justify-center gap-3">
                <button
                    type="button"
                    onClick={onCloseModal}
                    disabled={isDeleting}
                    className="rounded-xl border border-border dark:border-white/10 bg-card/40 px-5 py-2 text-sm text-muted hover:text-foreground disabled:opacity-50 transition"
                >
                    {t("admin.department.cancel")}
                </button>
                <Button
                    type="button"
                    variant="danger"
                    disabled={isDeleting}
                    onClick={() => onConfirm(onCloseModal)}
                >
                    {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    ) : (
                        t("admin.department.delete")
                    )}
                </Button>
            </div>
        </div>
    );
}
