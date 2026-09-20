"use client";

import React, { useState } from "react";
import { Building2, Plus, Loader2, X, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { useCreateDepartment } from "@/hooks/department/useCreateDepartment";
import { useDepartments } from "@/hooks/department/useDepartments";
import {
  PREDEFINED_DEPARTMENTS,
  PREDEFINED_POSITIONS,
  GENERAL_POSITIONS,
} from "@/types/department";

interface CreateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateDepartmentModal({
  isOpen,
  onClose,
}: CreateDepartmentModalProps) {
  const t = useTranslations();
  const { data: deptData } = useDepartments();
  const departments = deptData?.data ?? [];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [addedPositions, setAddedPositions] = useState<string[]>([]);
  const [posInput, setPosInput] = useState("");

  const [deptSuggestIndex, setDeptSuggestIndex] = useState(0);
  const [posSuggestIndex, setPosSuggestIndex] = useState(0);
  const [originalDeptTyped, setOriginalDeptTyped] = useState("");
  const [originalPosTyped, setOriginalPosTyped] = useState("");

  const [nameError, setNameError] = useState("");

  const { mutate: createDepartment, isPending } = useCreateDepartment({
    onSuccess: () => {
      handleClose();
    },
  });

  const handleClose = () => {
    setName("");
    setDescription("");
    setAddedPositions([]);
    setPosInput("");
    setOriginalDeptTyped("");
    setOriginalPosTyped("");
    setNameError("");
    onClose();
  };

  const deptExists = departments.some(
    (d) => d.name.toLowerCase().trim() === name.toLowerCase().trim()
  );

  const availablePredefinedPositions = name.trim()
    ? PREDEFINED_POSITIONS[name.trim()] || GENERAL_POSITIONS
    : GENERAL_POSITIONS;

  const handleAddPosition = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    const trimmed = posInput.trim();
    if (!trimmed) return;
    if (addedPositions.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(t("admin.department.positionExistsWarning"));
      return;
    }
    setAddedPositions([...addedPositions, trimmed]);
    setPosInput("");
    setOriginalPosTyped("");
  };

  const handleRemovePosition = (indexToRemove: number) => {
    setAddedPositions(addedPositions.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError(t("admin.department.deptNameRequired"));
      return;
    }
    if (deptExists) {
      setNameError(t("admin.department.deptNameExistsError"));
      toast.error(t("admin.department.deptNameExistsToast"));
      return;
    }

    createDepartment({
      name: trimmedName,
      description: description.trim() || undefined,
      positions: addedPositions,
    });
  };

  const handleDeptKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      const matches = PREDEFINED_DEPARTMENTS.filter((d) =>
        d.toLowerCase().includes(originalDeptTyped.toLowerCase())
      );
      if (matches.length > 0) {
        e.preventDefault();
        if (matches.length === 1) {
          setName(matches[0]);
        } else {
          const index = deptSuggestIndex % matches.length;
          setName(matches[index]);
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
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-0 sm:p-1 text-left">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4 pr-12">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
            <Building2 className="h-5 w-5 shrink-0" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              {t("admin.department.addDepartmentTitle")}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.department.addDepartmentDescription")}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Department Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
              {t("admin.department.departmentName")}{" "}
              <span className="text-danger font-bold">*</span>
            </label>
            <input
              type="text"
              list="departments-list-create"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setOriginalDeptTyped(e.target.value);
                setDeptSuggestIndex(0);
                if (nameError) setNameError("");
              }}
              onKeyDown={handleDeptKeyDown}
              placeholder={t("admin.department.deptNamePlaceholder")}
              aria-invalid={Boolean(nameError || (name && deptExists))}
              className={`w-full rounded-xl bg-card border px-4 py-2.5 sm:py-3 text-sm text-foreground h-[42px] sm:h-[46px] outline-none transition-all duration-200 placeholder:text-muted/60 ${
                nameError || (name && deptExists)
                  ? "border-danger focus-visible:border-danger focus-visible:ring-2 focus-visible:ring-danger/40"
                  : "border-border hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1"
              }`}
            />
            <datalist id="departments-list-create">
              {PREDEFINED_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} />
              ))}
            </datalist>
            {(nameError || (name && deptExists)) && (
              <p className="text-xs text-danger flex items-center gap-1.5 mt-0.5 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {nameError || t("admin.department.deptNameExistsError")}
                </span>
              </p>
            )}
          </div>

          {/* Department Description */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
                {t("admin.department.deptDescription")}
              </label>
              <span className="text-xs text-muted font-normal">
                {t("admin.department.deptDescriptionOptional")}
              </span>
            </div>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("admin.department.deptDescriptionPlaceholder")}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-all hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 placeholder:text-muted/60 resize-none"
            />
          </div>

          {/* Multiple Positions Input Section */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
                {t("admin.department.jobPositions")}{" "}
                <span className="text-xs text-muted font-normal">
                  ({addedPositions.length})
                </span>
              </label>
            </div>

            {/* Positions tags display */}
            {addedPositions.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2.5 rounded-xl border border-border bg-card/40 max-h-32 overflow-y-auto custom-scrollbar">
                {addedPositions.map((pos, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300"
                  >
                    <span>{pos}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePosition(idx)}
                      className="hover:text-rose-400 transition p-0.5 rounded"
                      aria-label={`Remove ${pos}`}
                    >
                      <X className="h-3 w-3 shrink-0" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add position input row */}
            <div className="flex gap-2">
              <input
                type="text"
                list="positions-list-create"
                value={posInput}
                onChange={(e) => {
                  setPosInput(e.target.value);
                  setOriginalPosTyped(e.target.value);
                  setPosSuggestIndex(0);
                }}
                onKeyDown={handlePosKeyDown}
                placeholder={t("admin.department.addPositionPlaceholder")}
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground h-[42px] sm:h-[46px] outline-none transition-all hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 placeholder:text-muted/60"
              />
              <datalist id="positions-list-create">
                {availablePredefinedPositions.map((pos) => (
                  <option key={pos} value={pos} />
                ))}
              </datalist>
              <button
                type="button"
                onClick={handleAddPosition}
                disabled={!posInput.trim()}
                className="inline-flex h-[42px] sm:h-[46px] items-center justify-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 text-xs sm:text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Add position"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>{t("admin.department.add")}</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="rounded-xl border border-border bg-card/60 px-5 h-[42px] text-xs sm:text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-card hover:text-foreground hover:border-border-strong active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 cursor-pointer select-none disabled:opacity-50"
            >
              {t("admin.department.cancel")}
            </button>
            <button
              type="submit"
              disabled={isPending || deptExists || !name.trim()}
              className="
                group relative inline-flex items-center justify-center gap-2 overflow-hidden
                rounded-xl
                h-[42px] px-6
                bg-gradient-to-r from-(--primary-main) to-(--primary-light)
                text-xs sm:text-sm font-semibold text-white
                shadow-[0_0_25px_rgba(21,174,245,0.25)]
                transition-all duration-300
                hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(21,174,245,0.4)] hover:brightness-110
                active:scale-[0.98]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background
                disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer select-none
              "
            >
              <span className="pointer-events-none absolute inset-y-0 -left-24 w-16 rotate-12 bg-white/30 blur-lg transition-all duration-700 group-hover:left-[130%]" />
              <span className="relative flex items-center gap-2">
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
                )}
                <span>{t("admin.department.create")}</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
