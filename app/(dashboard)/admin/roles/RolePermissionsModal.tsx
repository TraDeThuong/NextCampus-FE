"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  KeyRound,
  Loader2,
  CheckSquare,
  Square,
  Search,
  Users,
  Briefcase,
  FileCheck,
  Calendar,
  Layers,
  Settings,
  ShieldCheck,
  Mail,
  Bell,
  Clock,
  BookOpen,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { usePermissions } from "@/hooks/rbac/usePermissions";
import { useSyncRolePermissions } from "@/hooks/rbac/useSyncRolePermissions";
import type { Role, Permission } from "@/types/rbac";

const RESOURCE_ICONS: Record<string, React.ElementType> = {
  USER: Users,
  ROLE: ShieldCheck,
  ROLE_PERMISSION: KeyRound,
  DEPARTMENT: Layers,
  POSITION: Briefcase,
  LEADER: Users,
  INTERN: Users,
  APPLICATION: BookOpen,
  TASK: FileCheck,
  TASK_GROUP: Layers,
  TASK_ASSIGNMENT: FileCheck,
  TASK_SUBMISSION: FileCheck,
  MEETING: Calendar,
  DAILY_REPORT: Clock,
  WEEKLY_EVALUATION: FileCheck,
  NOTIFICATION: Bell,
  NOTIFICATION_TEMPLATE: Mail,
  SETTINGS: Settings,
};

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

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

function RolePermissionsForm({
  role,
  onClose,
}: {
  role: Role;
  onClose: () => void;
}) {
  const t = useTranslations();
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    role.permissions ? role.permissions.map((p) => p.id) : [],
  );
  const [searchQuery, setSearchQuery] = useState("");

  const { data: permissionsRes, isLoading: loadingPermissions } = usePermissions();
  const allPermissions = useMemo(() => permissionsRes?.data ?? [], [permissionsRes]);

  const { mutate: syncPermissions, isPending } = useSyncRolePermissions({
    onSuccess: () => {
      onClose();
    },
  });

  // Filter permissions by search query
  const filteredPermissions = useMemo(() => {
    if (!searchQuery.trim()) return allPermissions;
    const q = searchQuery.toLowerCase();
    return allPermissions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.resource.toLowerCase().includes(q) ||
        p.action.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)),
    );
  }, [allPermissions, searchQuery]);

  // Group filtered permissions by resource
  const groupedPermissions = useMemo(() => {
    return filteredPermissions.reduce<Record<string, Permission[]>>((acc, perm) => {
      const res = perm.resource || "OTHER";
      if (!acc[res]) acc[res] = [];
      acc[res].push(perm);
      return acc;
    }, {});
  }, [filteredPermissions]);

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleToggleGroup = (groupPerms: Permission[]) => {
    const groupIds = groupPerms.map((p) => p.id);
    const allSelected = groupIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...groupIds])));
    }
  };

  const handleSelectAll = () => {
    setSelectedIds(allPermissions.map((p) => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleSave = () => {
    syncPermissions({
      roleId: role.id,
      payload: { permissionIds: selectedIds },
    });
  };

  return (
    <div className="p-6">
      {/* Modal Header */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-400">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">
                {t("admin.roles.permissionsModal.title")}
              </h3>
              <span className="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-300">
                {role.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("admin.roles.permissionsModal.description", { name: role.name })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-emerald-400">
            {t("admin.roles.permissionsModal.grantedCount", {
              granted: selectedIds.length,
              total: allPermissions.length,
            })}
          </span>
        </div>
      </div>

      {/* Toolbar: Search and Bulk Action */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("admin.roles.permissionsModal.searchPlaceholder")}
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-xs text-foreground outline-none transition hover:border-border-strong focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 placeholder:text-muted"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-cyan-400/40 hover:text-foreground"
          >
            {t("admin.roles.permissionsModal.selectAll")}
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-rose-400/40 hover:text-foreground"
          >
            {t("admin.roles.permissionsModal.deselectAll")}
          </button>
        </div>
      </div>

      {/* Permissions Grid Grouped by Resource */}
      <div className="mt-4 max-h-[55vh] overflow-y-auto pr-1 space-y-4">
        {loadingPermissions ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            <p className="mt-2 text-xs">Đang tải danh mục quyền hệ thống...</p>
          </div>
        ) : Object.keys(groupedPermissions).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-xs text-muted-foreground">
            Không có quyền nào phù hợp với từ khóa tìm kiếm.
          </div>
        ) : (
          Object.entries(groupedPermissions).map(([resource, perms]) => {
            const groupIds = perms.map((p) => p.id);
            const allSelected = groupIds.every((id) => selectedIds.includes(id));
            const selectedInGroup = groupIds.filter((id) => selectedIds.includes(id)).length;
            const IconComp = RESOURCE_ICONS[resource] || ShieldCheck;

            return (
              <div
                key={resource}
                className="rounded-2xl border border-border bg-card/60 p-4 transition hover:border-border-strong shadow-sm"
              >
                {/* Group Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                      <IconComp className="h-4 w-4 shrink-0" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground">
                        {RESOURCE_LABELS[resource] || resource}
                      </span>
                      <span className="ml-2 text-[10px] text-muted-foreground">
                        ({selectedInGroup}/{perms.length} đã chọn)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleGroup(perms)}
                    className="flex items-center gap-1.5 rounded-lg border border-border/80 px-2.5 py-1 text-[11px] font-medium text-cyan-400 transition hover:bg-cyan-500/10 hover:border-cyan-400/40"
                  >
                    {allSelected ? (
                      <CheckSquare className="h-3.5 w-3.5" />
                    ) : (
                      <Square className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {allSelected
                        ? t("admin.roles.permissionsModal.deselectAllGroup")
                        : t("admin.roles.permissionsModal.selectAllGroup")}
                    </span>
                  </button>
                </div>

                {/* Group Permissions Cards */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {perms.map((perm) => {
                    const isChecked = selectedIds.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleToggle(perm.id)}
                        className={`flex items-start gap-3 rounded-xl p-2.5 border transition cursor-pointer select-none ${
                          isChecked
                            ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-200"
                            : "bg-background/40 border-border/50 text-muted-foreground hover:border-border-strong hover:bg-card"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggle(perm.id)}
                          className="mt-0.5 rounded border-border text-cyan-500 focus:ring-cyan-400/30 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p
                              className={`text-xs font-semibold ${
                                isChecked ? "text-cyan-300" : "text-foreground"
                              }`}
                            >
                              {perm.name}
                            </p>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-muted/30 text-muted-foreground">
                              {perm.action}
                            </span>
                          </div>
                          {perm.description && (
                            <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                              {perm.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">
          {selectedIds.length} quyền được gán
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-card hover:text-foreground disabled:opacity-50"
          >
            {t("admin.roles.permissionsModal.cancelBtn")}
          </button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{t("admin.roles.permissionsModal.saveBtn")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RolePermissionsModal({
  isOpen,
  onClose,
  role,
}: RolePermissionsModalProps) {
  if (!role) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <RolePermissionsForm key={role.id} role={role} onClose={onClose} />
    </Modal>
  );
}
