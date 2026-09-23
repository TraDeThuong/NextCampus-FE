"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import DateTimePicker from "@/components/ui/DateTimePicker";
import { usePermissions } from "@/hooks/rbac/usePermissions";
import { useCreateApiKey } from "@/hooks/integration/useCreateApiKey";
import type { CreateApiKeyResult } from "@/types/integration";

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: CreateApiKeyResult) => void;
}

export default function CreateApiKeyModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateApiKeyModalProps) {
  const t = useTranslations("admin.settings.apiKeys.modal");
  const [name, setName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data: permRes } = usePermissions();
  const allPermissions = permRes?.data ?? [];

  const createMutation = useCreateApiKey({
    onSuccess: (res) => {
      onClose();
      setName("");
      setExpiresAt("");
      setSelectedPermissions([]);
      onSuccess(res);
    },
  });

  const togglePermission = (permName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName)
        ? prev.filter((p) => p !== permName)
        : [...prev, permName]
    );
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === allPermissions.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allPermissions.map((p) => p.name));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate({
      name: name.trim(),
      permissions: selectedPermissions,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("title")} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 px-1 py-1">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted">
            {t("nameLabel")} <span className="text-red-400">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            required
            autoFocus
          />
        </div>

        <div>
          <DateTimePicker
            label={t("expiresLabel")}
            value={expiresAt}
            onChange={(val) => setExpiresAt(val)}
            onClear={() => setExpiresAt("")}
            placeholder={t("expiresLabel")}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t("permissionsLabel")} ({selectedPermissions.length})
            </label>
            {allPermissions.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-medium text-primary-light hover:underline"
              >
                {selectedPermissions.length === allPermissions.length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto rounded-xl border border-border/40 bg-card/40 p-2.5 space-y-1">
            {allPermissions.length === 0 ? (
              <p className="text-xs text-muted text-center py-3">
                Đang tải danh sách quyền...
              </p>
            ) : (
              allPermissions.map((perm) => {
                const isChecked = selectedPermissions.includes(perm.name);
                return (
                  <label
                    key={perm.id}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-primary-light/10 text-foreground"
                        : "hover:bg-card-hover text-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePermission(perm.name)}
                      className="rounded border-border text-primary-main focus:ring-primary-light"
                    />
                    <span className="font-mono text-[11px]">{perm.name}</span>
                    {perm.description && (
                      <span className="text-[11px] text-muted/70 truncate">
                        - {perm.description}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!name.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <KeyRound className="h-4 w-4 mr-1.5" />
            )}
            {t("submit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
