"use client";

import React, { useState } from "react";
import { Building2, Edit3, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import type { Department } from "@/types/department";
import { useUpdateDepartment } from "@/hooks/department/useUpdateDepartment";
import { useDepartments } from "@/hooks/department/useDepartments";

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
}

function EditDepartmentForm({
  department,
  onClose,
}: {
  department: Department;
  onClose: () => void;
}) {
  const t = useTranslations();
  const { data: deptData } = useDepartments();
  const departments = deptData?.data ?? [];

  const [name, setName] = useState(department.name);
  const [description, setDescription] = useState(department.description || "");
  const [nameError, setNameError] = useState("");

  const { mutate: updateDepartment, isPending } = useUpdateDepartment({
    onSuccess: () => {
      onClose();
    },
  });

  const deptExists = departments.some(
    (d) =>
      d.id !== department.id &&
      d.name.toLowerCase().trim() === name.toLowerCase().trim()
  );

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

    const trimmedDesc = description.trim();
    const currentDesc = department.description || "";

    if (trimmedName !== department.name || trimmedDesc !== currentDesc) {
      updateDepartment({
        id: department.id,
        payload: {
          name: trimmedName,
          description: trimmedDesc || null,
        },
      });
    } else {
      onClose();
    }
  };

  return (
    <div className="p-0 sm:p-1 text-left">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4 pr-12">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
          <Building2 className="h-5 w-5 shrink-0" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              {t("admin.department.editDepartmentTitle")}
            </h3>
            <span className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
              {department.name}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("admin.department.editDepartmentDescription")}
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
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError("");
            }}
            placeholder={t("admin.department.deptNamePlaceholder")}
            aria-invalid={Boolean(nameError || deptExists)}
            className={`w-full rounded-xl bg-card border px-4 py-2.5 sm:py-3 text-sm text-foreground h-[42px] sm:h-[46px] outline-none transition-all duration-200 placeholder:text-muted/60 ${
              nameError || deptExists
                ? "border-danger focus-visible:border-danger focus-visible:ring-2 focus-visible:ring-danger/40"
                : "border-border hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1"
            }`}
          />
          {(nameError || deptExists) && (
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
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("admin.department.deptDescriptionPlaceholder")}
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-all hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 placeholder:text-muted/60 resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
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
                <Edit3 className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              )}
              <span>{t("admin.department.saveChanges")}</span>
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditDepartmentModal({
  isOpen,
  onClose,
  department,
}: EditDepartmentModalProps) {
  if (!department) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <EditDepartmentForm
        key={department.id}
        department={department}
        onClose={onClose}
      />
    </Modal>
  );
}
