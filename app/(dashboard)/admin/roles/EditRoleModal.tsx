"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Edit3, Loader2, Lock } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useUpdateRole } from "@/hooks/rbac/useUpdateRole";
import type { Role } from "@/types/rbac";

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

function EditRoleForm({
  role,
  onClose,
}: {
  role: Role;
  onClose: () => void;
}) {
  const t = useTranslations();
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description || "");
  const [nameError, setNameError] = useState("");

  const { mutate: updateRole, isPending } = useUpdateRole({
    onSuccess: () => {
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim().toUpperCase().replace(/\s+/g, "_");
    if (!role.isSystem && !trimmedName) {
      setNameError("Vui lòng nhập tên vai trò");
      return;
    }
    setNameError("");

    updateRole({
      id: role.id,
      payload: {
        name: role.isSystem ? undefined : trimmedName,
        description: description.trim() || undefined,
      },
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-400/30 bg-indigo-500/10 text-indigo-400">
          <Edit3 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {t("admin.roles.editModal.title")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("admin.roles.editModal.description")}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("admin.roles.editModal.nameLabel")}
            </label>
            {role.isSystem && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400">
                <Lock className="h-3 w-3" />
                <span>Vai trò hệ thống (Cố định tên)</span>
              </span>
            )}
          </div>
          <input
            type="text"
            value={name}
            disabled={role.isSystem}
            onChange={(e) => {
              setName(e.target.value.toUpperCase());
              if (nameError) setNameError("");
            }}
            className={`w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition ${
              role.isSystem
                ? "opacity-60 cursor-not-allowed bg-muted/20"
                : "hover:border-border-strong focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30"
            }`}
          />
          {nameError && (
            <p className="mt-1 text-xs font-medium text-rose-500">{nameError}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("admin.roles.editModal.descLabel")}
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition hover:border-border-strong focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 placeholder:text-muted resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-card hover:text-foreground disabled:opacity-50"
          >
            {t("admin.roles.editModal.cancelBtn")}
          </button>
          <Button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{t("admin.roles.editModal.submitBtn")}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function EditRoleModal({
  isOpen,
  onClose,
  role,
}: EditRoleModalProps) {
  if (!role) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <EditRoleForm key={role.id} role={role} onClose={onClose} />
    </Modal>
  );
}
