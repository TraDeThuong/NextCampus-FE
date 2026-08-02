"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Building2, Plus, Loader2, X } from "lucide-react";
import { useCreateDepartment } from "@/hooks/department/useCreateDepartment";
import { useDepartments } from "@/hooks/department/useDepartments";
import { PREDEFINED_DEPARTMENTS, PREDEFINED_POSITIONS, GENERAL_POSITIONS } from "@/types/department";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toast } from "react-hot-toast";

type FormValues = {
    name: string;
};

export default function DepartmentHeader() {
    const { mutate: createDepartment, isPending } = useCreateDepartment();

    return (
        <Modal>
            <MetalCard>
                <div className="rounded-3xl p-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold metal-text">
                                Department Management
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Create and manage departments and their job positions.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Modal.Open opens="add-department">
                                <button className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20">
                                    <Plus className="h-4 w-4" />
                                    Add Department
                                </button>
                            </Modal.Open>
                        </div>
                    </div>
                </div>
            </MetalCard>

            <Modal.Window name="add-department" size="sm">
                <AddDepartmentForm
                    isPending={isPending}
                    onSubmit={(name, positions) => createDepartment({ name, positions })}
                />
            </Modal.Window>
        </Modal>
    );
}

function AddDepartmentForm({
    isPending,
    onSubmit,
    onCloseModal,
}: {
    isPending: boolean;
    onSubmit: (name: string, positions: string[]) => void;
    onCloseModal?: () => void;
}) {
    const { data: deptData } = useDepartments();
    const departments = deptData?.data ?? [];

    const [addedPositions, setAddedPositions] = useState<string[]>([]);
    const [posInput, setPosInput] = useState("");

    const [deptSuggestIndex, setDeptSuggestIndex] = useState(0);
    const [posSuggestIndex, setPosSuggestIndex] = useState(0);

    const [originalDeptTyped, setOriginalDeptTyped] = useState("");
    const [originalPosTyped, setOriginalPosTyped] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<FormValues>();

    const deptName = watch("name");

    // Warnings detection
    const deptExists = departments.some(
        (d) => d.name.toLowerCase().trim() === (deptName || "").toLowerCase().trim()
    );

    const availablePredefinedPositions = deptName
        ? PREDEFINED_POSITIONS[deptName] || GENERAL_POSITIONS
        : GENERAL_POSITIONS;

    const handleAddPosition = (e: React.MouseEvent) => {
        e.preventDefault();
        const trimmed = posInput.trim();
        if (!trimmed) return;
        setAddedPositions([...addedPositions, trimmed]);
        setPosInput("");
        setOriginalPosTyped("");
    };

    const handleRemovePosition = (indexToRemove: number) => {
        setAddedPositions(addedPositions.filter((_, i) => i !== indexToRemove));
    };

    const handleFormSubmit = (data: FormValues) => {
        if (!data.name.trim()) return;
        if (deptExists) {
            toast.error("Department name already exists.");
            return;
        }
        onSubmit(data.name.trim(), addedPositions);
        reset();
        setAddedPositions([]);
        setPosInput("");
        setOriginalDeptTyped("");
        setOriginalPosTyped("");
        if (onCloseModal) onCloseModal();
    };

    const handleDeptKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Tab") {
            const matches = PREDEFINED_DEPARTMENTS.filter((d) =>
                d.toLowerCase().includes(originalDeptTyped.toLowerCase())
            );
            if (matches.length > 0) {
                e.preventDefault();
                if (matches.length === 1) {
                    setValue("name", matches[0]);
                } else {
                    const index = deptSuggestIndex % matches.length;
                    setValue("name", matches[index]);
                    setDeptSuggestIndex(index + 1);
                }
            }
        }
    };

    const handlePosKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Tab") {
            const matches = availablePredefinedPositions.filter((p) =>
                p.toLowerCase().includes(originalPosTyped.toLowerCase())
            );
            if (matches.length > 0) {
                e.preventDefault();
                if (matches.length === 1) {
                    setPosInput(matches[0]);
                } else {
                    const index = posSuggestIndex % matches.length;
                    setPosInput(matches[index]);
                    setPosSuggestIndex(index + 1);
                }
            }
        } else if (e.key === "Enter") {
            e.preventDefault();
            handleAddPosition(e as any);
        }
    };

    return (
        <div className="px-2 py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                <Building2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">
                Add Department
            </h3>
            <p className="mt-2 text-sm text-slate-400">
                Type the name of the new department and add its positions.
            </p>

            <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="mt-6 space-y-4 text-left"
            >
                {/* Department Name Input with Autocomplete Datalist */}
                <div className="relative">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Department Name
                    </label>
                    <input
                        type="text"
                        list="departments-list-header"
                        placeholder="e.g. Engineering, Marketing App..."
                        onKeyDown={handleDeptKeyDown}
                        {...register("name", {
                            required: "Department name is required",
                            onChange: (e) => {
                                setOriginalDeptTyped(e.target.value);
                                setDeptSuggestIndex(0);
                            }
                        })}
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600"
                    />
                    <datalist id="departments-list-header">
                        {PREDEFINED_DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept} />
                        ))}
                    </datalist>
                    {deptExists && (
                        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                            ⚠️ Error: This department name already exists.
                        </p>
                    )}
                </div>
                {errors.name && (
                    <p className="text-sm text-red-400">
                        {errors.name.message}
                    </p>
                )}

                {/* Multiple Positions Input Section */}
                {deptName?.trim() && (
                    <div className="space-y-3 pt-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                            Job Positions
                        </label>

                        {/* Positions tags display */}
                        {addedPositions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                                {addedPositions.map((pos, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 ring-1 ring-inset ring-cyan-500/20"
                                    >
                                        {pos}
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePosition(idx)}
                                            className="hover:text-red-400 transition"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="space-y-1">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    list="positions-list-header"
                                    value={posInput}
                                    onChange={(e) => {
                                        setPosInput(e.target.value);
                                        setOriginalPosTyped(e.target.value);
                                        setPosSuggestIndex(0);
                                    }}
                                    onKeyDown={handlePosKeyDown}
                                    placeholder="Add position (e.g. Backend Intern)..."
                                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-white outline-none transition focus:border-cyan-400/50 placeholder:text-slate-600"
                                />
                                <datalist id="positions-list-header">
                                    {availablePredefinedPositions.map((pos) => (
                                        <option key={pos} value={pos} />
                                    ))}
                                </datalist>
                                <button
                                    type="button"
                                    onClick={handleAddPosition}
                                    disabled={!posInput.trim()}
                                    className="flex items-center justify-center rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-400/20 px-4 transition shrink-0"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-center gap-3 pt-4 border-t border-white/5">
                    <button
                        type="button"
                        onClick={onCloseModal}
                        disabled={isPending}
                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 transition hover:text-white disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <Button
                        type="submit"
                        disabled={isPending || deptExists}
                        variant="glass"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            "Create"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
