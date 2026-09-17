"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Shield, Loader2, CheckSquare, Square } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useCreateRole } from "@/hooks/rbac/useCreateRole";
import { usePermissions } from "@/hooks/rbac/usePermissions";
import type { Permission } from "@/types/rbac";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESOURCE_LABELS: Record<string, string> = {
  USER: "Quản lý Người dùng",
  ROLE: "Quản lý Vai trò",
  ROLE_PERMISSION: "Phân quyền Vai trò",
  PERMISSION: "Danh mục Quyền",
  NOTIFICATION: "Thông báo & Email",
  NOTIFICATION_TEMPLATE: "Mẫu Thông báo",
  NOTIFICATION_SETTING: "Cài đặt Thông báo",
  AUDIT_LOG: "Nhật ký Kiểm toán",
  MAINTENANCE: "Bảo trì Hệ thống",
  API_KEY: "API Keys",
  WEBHOOK: "Webhooks",
  SYSTEM_CONFIG: "Cấu hình Hệ thống",
  CRON_JOB: "Tác vụ Tự động (Cron)",
  DEPARTMENT: "Phòng ban",
  POSITION: "Vị trí Chuyên môn",
  LEADER: "Người hướng dẫn (Leader)",
  INTERN: "Thực tập sinh (Intern)",
  APPLICATION: "Hồ sơ Ứng tuyển",
  APPLICATION_INVITE: "Thư mời Ứng tuyển",
  TASK_GROUP: "Nhóm Công việc",
  TASK: "Nhiệm vụ & Đính kèm",
  TASK_ASSIGNMENT: "Phân công Nhiệm vụ",
  TASK_SUBMISSION: "Bài nộp Nhiệm vụ",
  MEETING: "Cuộc họp & Điểm danh",
  ABSENCE: "Nghỉ phép",
  DAILY_REPORT: "Báo cáo Tiến độ Ngày",
  WEEKLY_EVALUATION: "Bảng Đánh giá Tuần",
};

export default function CreateRoleModal({ isOpen, onClose }: CreateRoleModalProps) {
  const t = useTranslations();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [nameError, setNameError] = useState("");

  const { data: permissionsRes } = usePermissions();
  const permissions = permissionsRes?.data ?? [];

  const { mutate: createRole, isPending } = useCreateRole({
    onSuccess: () => {
      handleClose();
    },
  });

  const handleClose = () => {
    setName("");
    setDescription("");
    setSelectedPermissionIds([]);
    setNameError("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim().toUpperCase().replace(/\s+/g, "_");
    if (!trimmedName) {
      setNameError("Vui lòng nhập tên vai trò");
      return;
    }
    if (trimmedName.length < 3) {
      setNameError("Tên vai trò tối thiểu 3 ký tự");
      return;
    }
    setNameError("");

    createRole({
      name: trimmedName,
      description: description.trim() || undefined,
      permissionIds: selectedPermissionIds.length > 0 ? selectedPermissionIds : undefined,
    });
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    const res = perm.resource || "OTHER";
    if (!acc[res]) acc[res] = [];
    acc[res].push(perm);
    return acc;
  }, {});

  const togglePermission = (id: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const toggleGroup = (groupPermissions: Permission[]) => {
    const groupIds = groupPermissions.map((p) => p.id);
    const allSelected = groupIds.every((id) => selectedPermissionIds.includes(id));
    if (allSelected) {
      setSelectedPermissionIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedPermissionIds((prev) => Array.from(new Set([...prev, ...groupIds])));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {t("admin.roles.createModal.title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("admin.roles.createModal.description")}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("admin.roles.createModal.nameLabel")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value.toUpperCase());
                if (nameError) setNameError("");
              }}
              placeholder={t("admin.roles.createModal.namePlaceholder")}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition hover:border-border-strong focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 placeholder:text-muted"
            />
            {nameError && (
              <p className="mt-1 text-xs font-medium text-rose-500">{nameError}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("admin.roles.createModal.descLabel")}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("admin.roles.createModal.descPlaceholder")}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition hover:border-border-strong focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 placeholder:text-muted resize-none"
            />
          </div>

          {/* Initial Permissions Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("admin.roles.createModal.selectInitialPermissions")} ({selectedPermissionIds.length}/{permissions.length})
              </label>
              {permissions.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPermissionIds(
                      selectedPermissionIds.length === permissions.length
                        ? []
                        : permissions.map((p) => p.id),
                    )
                  }
                  className="text-xs text-cyan-400 hover:underline"
                >
                  {selectedPermissionIds.length === permissions.length
                    ? t("admin.roles.permissionsModal.deselectAll")
                    : t("admin.roles.permissionsModal.selectAll")}
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto rounded-xl border border-border bg-background/50 p-3 space-y-4">
              {Object.entries(groupedPermissions).map(([resource, perms]) => {
                const groupIds = perms.map((p) => p.id);
                const allSelected = groupIds.every((id) => selectedPermissionIds.includes(id));

                return (
                  <div key={resource} className="rounded-lg border border-border/60 bg-card/40 p-3">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                      <span className="text-xs font-bold text-foreground">
                        {RESOURCE_LABELS[resource] || resource}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleGroup(perms)}
                        className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                      >
                        {allSelected ? (
                          <CheckSquare className="h-3.5 w-3.5" />
                        ) : (
                          <Square className="h-3.5 w-3.5" />
                        )}
                        <span>{allSelected ? "Bỏ nhóm" : "Chọn nhóm"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {perms.map((perm) => {
                        const isChecked = selectedPermissionIds.includes(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-2.5 rounded-lg p-2 text-xs transition cursor-pointer ${
                              isChecked
                                ? "bg-cyan-500/10 border border-cyan-400/30 text-cyan-200"
                                : "hover:bg-card border border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.id)}
                              className="mt-0.5 rounded border-border text-cyan-500 focus:ring-cyan-400/30"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold">{perm.name}</p>
                              {perm.description && (
                                <p className="text-[10px] opacity-75 truncate">
                                  {perm.description}
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-card hover:text-foreground disabled:opacity-50"
            >
              {t("admin.roles.createModal.cancelBtn")}
            </button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{t("admin.roles.createModal.submitBtn")}</span>
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
