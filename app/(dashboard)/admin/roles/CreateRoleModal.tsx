"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Shield, Loader2, CheckSquare, Square, AlertCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useCreateRole } from "@/hooks/rbac/useCreateRole";
import { usePermissions } from "@/hooks/rbac/usePermissions";
import type { Permission } from "@/types/rbac";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESOURCE_FALLBACKS: Record<string, string> = {
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
  PDF_EXPORT: "Xuất Báo Cáo & Chứng Nhận (PDF)",
  REGULATION: "Nội quy & Quy định",
  STATS: "Thống kê & Báo cáo",
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
    if (trimmedName.length < 2) {
      setNameError("Tên vai trò tối thiểu 2 ký tự");
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

  const getResourceLabel = (res: string) => {
    try {
      if (t.has(`admin.roles.resources.${res}`)) {
        return t(`admin.roles.resources.${res}`);
      }
      return RESOURCE_FALLBACKS[res] || res;
    } catch {
      return RESOURCE_FALLBACKS[res] || res;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <div className="p-0 sm:p-1">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4 pr-12">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
            <Shield className="h-5 w-5 shrink-0" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              {t("admin.roles.createModal.title")}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.roles.createModal.description")}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Role Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
              {t("admin.roles.createModal.nameLabel")}{" "}
              <span className="text-danger font-bold">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value.toUpperCase());
                if (nameError) setNameError("");
              }}
              placeholder={t("admin.roles.createModal.namePlaceholder")}
              aria-invalid={Boolean(nameError)}
              className={`w-full rounded-xl bg-card border px-4 py-2.5 sm:py-3 text-sm text-foreground h-[42px] sm:h-[46px] outline-none transition-all duration-200 placeholder:text-muted/60 ${
                nameError
                  ? "border-danger focus-visible:border-danger focus-visible:ring-2 focus-visible:ring-danger/40"
                  : "border-border hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1"
              }`}
            />
            {nameError && (
              <p className="text-xs text-danger flex items-center gap-1.5 mt-0.5 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{nameError}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
              {t("admin.roles.createModal.descLabel")}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("admin.roles.createModal.descPlaceholder")}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-all hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 placeholder:text-muted/60 resize-none"
            />
          </div>

          {/* Initial Permissions Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
                {t("admin.roles.createModal.selectInitialPermissions")}{" "}
                <span className="text-xs text-muted font-normal">
                  ({selectedPermissionIds.length}/{permissions.length})
                </span>
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

            <div className="max-h-60 overflow-y-auto rounded-xl border border-border bg-background/50 p-3 space-y-3 custom-scrollbar">
              {Object.entries(groupedPermissions).map(([resource, perms]) => {
                const groupIds = perms.map((p) => p.id);
                const allSelected = groupIds.every((id) => selectedPermissionIds.includes(id));

                return (
                  <div key={resource} className="rounded-xl border border-border/60 bg-card/40 p-3">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
                      <span className="text-xs font-bold text-foreground">
                        {getResourceLabel(resource)}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleGroup(perms)}
                        className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition"
                      >
                        {allSelected ? (
                          <CheckSquare className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <Square className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>
                          {allSelected
                            ? t("admin.roles.permissionsModal.deselectAllGroup")
                            : t("admin.roles.permissionsModal.selectAllGroup")}
                        </span>
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
                              className="mt-0.5 rounded border-border text-cyan-500 focus:ring-cyan-400/30 cursor-pointer"
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
              className="rounded-xl border border-border bg-card/60 px-5 h-[42px] text-xs sm:text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-card hover:text-foreground hover:border-border-strong active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 cursor-pointer select-none disabled:opacity-50"
            >
              {t("admin.roles.createModal.cancelBtn")}
            </button>
            <button
              type="submit"
              disabled={isPending}
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
                  <Shield className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                )}
                <span>{t("admin.roles.createModal.submitBtn")}</span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
