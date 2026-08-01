"use client";

import { useState } from "react";
import { Settings, Briefcase, X, Edit3, Loader2, Plus } from "lucide-react";
import type { Department } from "@/types/department";
import { useCreatePosition } from "@/hooks/department/useCreatePosition";
import { useUpdatePosition } from "@/hooks/department/useUpdatePosition";
import { useDeletePosition } from "@/hooks/department/useDeletePosition";
import { PREDEFINED_POSITIONS, GENERAL_POSITIONS } from "@/types/department";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";

type DepartmentRowProps = {
    department: Department;
};

export default function DepartmentRow({ department }: DepartmentRowProps) {
    return (
        <Modal>
            <Table.Row>
                {/* Department Name */}
                <div className="text-sm font-medium text-white min-w-0 pr-4 relative">
                    <span>
                        {department.name}
                    </span>
                </div>

                {/* Positions badges */}
                <div className="flex flex-wrap items-center">
                    {department.positions.length === 0 ? (
                        <span className="text-xs text-slate-500 italic">No positions</span>
                    ) : (
                        department.positions.map((pos) => (
                            <span
                                key={pos.id}
                                className="inline-flex items-center rounded-md bg-cyan-400/10 px-2 py-0.5 text-xs font-medium text-cyan-400 ring-1 ring-inset ring-cyan-400/20 mr-1.5 mb-1"
                            >
                                {pos.name}
                            </span>
                        ))
                    )}
                </div>

                {/* Leaders */}
                <div className="text-sm min-w-0 pr-4">
                    {department.leaders && department.leaders.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {department.leaders.map((leader) => {
                                const name = leader.user.fullName;
                                const email = leader.user.email;
                                return (
                                    <div key={leader.id} className="flex flex-col min-w-0">
                                        <span className="font-medium text-white truncate" title={name || "No name"}>
                                            {name || "No name"}
                                        </span>
                                        <span className="text-xs text-slate-400 truncate" title={email}>
                                            {email}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <span className="text-xs text-slate-500 italic">No leader</span>
                    )}
                </div>

                {/* Actions Button — Leader: Manage Positions directly (no dropdown needed since it's the only action) */}
                <div className="text-right pr-4">
                    <Modal.Open opens={`leader-manage-positions-${department.id}`}>
                        <button
                            type="button"
                            title="Manage Positions"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
                        >
                            <Settings className="h-4 w-4" />
                        </button>
                    </Modal.Open>
                </div>
            </Table.Row>

            <Modal.Window name={`leader-manage-positions-${department.id}`} size="md">
                <ManagePositions department={department} />
            </Modal.Window>
        </Modal>
    );
}

function ManagePositions({
    department,
}: {
    department: Department;
}) {
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

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
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
            handleAdd(e as unknown as React.FormEvent);
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
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-cyan-400" />
                Positions of {department.name}
            </h3>

            {/* List existing positions */}
            <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-1 custom-scrollbar">
                {department.positions.length === 0 ? (
                    <p className="text-sm text-slate-500 italic py-2">No positions defined yet.</p>
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
                                            list={`leader-positions-list-${pos.id}`}
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
                                        <datalist id={`leader-positions-list-${pos.id}`}>
                                            {predefinedForDept.map((posName) => (
                                                <option key={posName} value={posName} />
                                            ))}
                                        </datalist>
                                        {editPosExists && (
                                            <p className="absolute left-0 top-full z-10 text-[9px] text-yellow-500 bg-[#0f172a] border border-yellow-500/20 px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                                                ⚠️ Warning: Already exists in this department
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
                                                    if (confirm(`Are you sure you want to delete position "${pos.name}"?`)) {
                                                        deletePosition({ id: pos.id, departmentId: department.id });
                                                    }
                                                }}
                                                className="p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add new position */}
            <form onSubmit={handleAdd} className="flex flex-col gap-2 border-t border-white/10 pt-4">
                <div className="flex gap-2 relative">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            list={`leader-positions-list-add-${department.id}`}
                            value={newPositionName}
                            onChange={(e) => {
                                setNewPositionName(e.target.value);
                                setOriginalNewPosTyped(e.target.value);
                                setAddPosSuggestIdx(0);
                            }}
                            onKeyDown={handleAddPosKeyDown}
                            placeholder="Add position (e.g. NodeJS Intern)..."
                            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 px-4 text-sm text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600"
                            disabled={creating}
                        />
                        <datalist id={`leader-positions-list-add-${department.id}`}>
                            {predefinedForDept.map((posName) => (
                                <option key={posName} value={posName} />
                            ))}
                        </datalist>
                        {newPosExists && (
                            <p className="absolute left-0 top-full z-10 text-[9px] text-yellow-500 bg-[#0f172a] border border-yellow-500/20 px-1.5 py-0.5 rounded shadow-md whitespace-nowrap mt-0.5">
                                ⚠️ Warning: Already exists in this department
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={creating || !newPositionName.trim() || newPosExists}
                        className="flex items-center justify-center rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition shrink-0"
                    >
                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </button>
                </div>
            </form>
        </div>
    );
}
