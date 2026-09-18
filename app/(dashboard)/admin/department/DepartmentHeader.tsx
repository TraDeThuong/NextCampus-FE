"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Building2, Plus, Loader2, X, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCreateDepartment } from "@/hooks/department/useCreateDepartment";
import { useDepartments } from "@/hooks/department/useDepartments";
import { PREDEFINED_DEPARTMENTS, PREDEFINED_POSITIONS, GENERAL_POSITIONS } from "@/types/department";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { toast } from "react-hot-toast";

type FormValues = {
    name: string;
    description?: string;
};

export default function DepartmentHeader() {
    const t = useTranslations();
    const { mutate: createDepartment, isPending } = useCreateDepartment();

    return (
        <Modal>
            <MetalCard>
                <div className="rounded-3xl p-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
                                <Building2 className="h-5 w-5 shrink-0" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold metal-text">
                                    {t("admin.department.title")}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {t("admin.department.description")}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Modal.Open opens="add-department">
                                <button className="flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/20 active:scale-[0.98]">
                                    <Plus className="h-4 w-4 shrink-0" />
                                    {t("admin.department.addDepartment")}
                                </button>
                            </Modal.Open>
                        </div>
                    </div>
                </div>
            </MetalCard>

            <Modal.Window name="add-department" size="sm">
                <AddDepartmentForm
                    isPending={isPending}
                    onSubmit={(name, description, positions) => createDepartment({ name, description, positions })}
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
    onSubmit: (name: string, description: string | undefined, positions: string[]) => void;
    onCloseModal?: () => void;
}) {
    const t = useTranslations();
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

    const handleAddPosition = (e?: React.SyntheticEvent) => {
        e?.preventDefault();
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
            toast.error(t("admin.department.deptNameExistsToast"));
            return;
        }
        onSubmit(data.name.trim(), data.description?.trim() || undefined, addedPositions);
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
            handleAddPosition(e);
        }
    };

    return (
        <div className="px-2 py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                <Building2 className="h-6 w-6 shrink-0" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
                {t("admin.department.addDepartmentTitle")}
            </h3>
            <p className="mt-2 text-sm text-muted">
                {t("admin.department.addDepartmentDescription")}
            </p>

            <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="mt-6 space-y-4 text-left"
            >
                {/* Department Name Input with Autocomplete Datalist */}
                <div className="relative">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
                        {t("admin.department.departmentName")}{" "}
                        <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="text"
                        list="departments-list-header"
                        placeholder={t("admin.department.deptNamePlaceholder")}
                        onKeyDown={handleDeptKeyDown}
                        {...register("name", {
                            required: t("admin.department.deptNameRequired"),
                            onChange: (e) => {
                                setOriginalDeptTyped(e.target.value);
                                setDeptSuggestIndex(0);
                            }
                        })}
                        className={`w-full rounded-xl border bg-card/60 py-3 px-4 text-sm text-foreground outline-none transition focus:border-cyan-400/50 placeholder:text-muted ${
                            errors.name || deptExists
                                ? "border-rose-500/50 focus:border-rose-500"
                                : "border-border dark:border-white/10"
                        }`}
                    />
                    <datalist id="departments-list-header">
                        {PREDEFINED_DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept} />
                        ))}
                    </datalist>
                    {deptExists && (
                        <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {t("admin.department.deptNameExistsError")}
                        </p>
                    )}
                    {errors.name && (
                        <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {errors.name.message}
                        </p>
                    )}
                </div>

                {/* Department Description Textarea */}
                <div className="relative">
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
                        placeholder={t("admin.department.deptDescriptionPlaceholder")}
                        {...register("description")}
                        className="w-full rounded-xl border border-border dark:border-white/10 bg-card/60 py-2.5 px-4 text-sm text-foreground outline-none transition focus:border-cyan-400/50 placeholder:text-muted resize-none"
                    />
                </div>

                {/* Multiple Positions Input Section */}
                {deptName?.trim() && (
                    <div className="space-y-3 pt-2">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                            {t("admin.department.jobPositions")}
                        </label>

                        {/* Positions tags display */}
                        {addedPositions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2 p-3 rounded-xl border border-border dark:border-white/5 bg-card/40">
                                {addedPositions.map((pos, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-400 ring-1 ring-inset ring-cyan-500/20"
                                    >
                                        {pos}
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePosition(idx)}
                                            className="hover:text-rose-400 transition"
                                            aria-label={`Remove ${pos}`}
                                        >
                                            <X className="h-3 w-3 shrink-0" />
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
                                    placeholder={t("admin.department.addPositionPlaceholder")}
                                    className="flex-1 rounded-xl border border-border dark:border-white/10 bg-card/60 py-2.5 px-4 text-sm text-foreground outline-none transition focus:border-cyan-400/50 placeholder:text-muted"
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
                                    className="flex items-center justify-center rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-400/20 px-4 transition shrink-0 active:scale-[0.98] disabled:opacity-50"
                                    aria-label="Add position"
                                >
                                    <Plus className="h-4 w-4 shrink-0" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-center gap-3 pt-4 border-t border-border dark:border-white/5">
                    <button
                        type="button"
                        onClick={onCloseModal}
                        disabled={isPending}
                        className="rounded-xl border border-border dark:border-white/10 bg-card/40 px-5 py-2 text-sm text-muted hover:text-foreground transition disabled:opacity-50"
                    >
                        {t("admin.department.cancel")}
                    </button>
                    <Button
                        type="submit"
                        disabled={isPending || deptExists}
                        variant="glass"
                    >
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            t("admin.department.create")
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
