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
  FileDown,
  BarChart3,
  FileText,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
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
  PDF_EXPORT: FileDown,
  NOTIFICATION: Bell,
  NOTIFICATION_TEMPLATE: Mail,
  SETTINGS: Settings,
  REGULATION: FileText,
  STATS: BarChart3,
};

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
  CRON_JOB: "Tác vụ Tự động",
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
    <div className="p-0 sm:p-1">
      {/* Modal Header */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 pr-12 sm:pr-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-400">
            <KeyRound className="h-5 w-5 shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                {t("admin.roles.permissionsModal.title")}
              </h3>
              <span className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                {role.name}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.roles.permissionsModal.description", { name: role.name })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            {t("admin.roles.permissionsModal.grantedCount", {
              granted: selectedIds.length,
              total: allPermissions.length,
            })}
          </span>
        </div>
      </div>

      {/* Toolbar: Search and Bulk Action (Uniform height h-[42px] sm:h-[46px]) */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("admin.roles.permissionsModal.searchPlaceholder")}
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 h-[42px] sm:h-[46px] text-xs sm:text-sm text-foreground outline-none transition-all hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 placeholder:text-muted/60"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSelectAll}
            className="h-[42px] sm:h-[46px] px-4 rounded-xl border border-border bg-card/60 text-xs sm:text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-card hover:text-cyan-300 hover:border-cyan-400/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 cursor-pointer select-none"
          >
            {t("admin.roles.permissionsModal.selectAll")}
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="h-[42px] sm:h-[46px] px-4 rounded-xl border border-border bg-card/60 text-xs sm:text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-card hover:text-rose-400 hover:border-rose-400/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 cursor-pointer select-none"
          >
            {t("admin.roles.permissionsModal.deselectAll")}
          </button>
        </div>
      </div>

      {/* Permissions Grid Grouped by Resource */}
      <div className="mt-4 max-h-[55vh] overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        {loadingPermissions ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            <p className="mt-2 text-xs">{t("admin.roles.loadingRoles")}</p>
          </div>
        ) : Object.keys(groupedPermissions).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-xs text-muted-foreground">
            {t("admin.roles.table.noRolesFound")}
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
                className="rounded-2xl border border-border bg-card/60 p-4 transition-all hover:border-border-strong shadow-sm"
              >
                {/* Group Header */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-400">
                      <IconComp className="h-4 w-4 shrink-0" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-foreground select-none">
                        {getResourceLabel(resource)}
                      </span>
                      <span className="ml-2 text-[11px] text-muted-foreground font-medium">
                        ({selectedInGroup}/{perms.length} đã chọn)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleGroup(perms)}
                    className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/80 px-3 py-1.5 text-[11px] font-semibold text-cyan-400 transition-all duration-200 hover:bg-cyan-500/15 hover:border-cyan-400/50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer select-none"
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

                {/* Group Permissions Cards */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {perms.map((perm) => {
                    const isChecked = selectedIds.includes(perm.id);
                    const actionUpper = perm.action?.toUpperCase() || "";

                    const getActionBadgeClass = () => {
                      if (actionUpper.includes("CREATE")) {
                        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                      }
                      if (actionUpper.includes("READ")) {
                        return "bg-sky-500/10 border-sky-500/30 text-sky-400";
                      }
                      if (actionUpper.includes("UPDATE")) {
                        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
                      }
                      if (actionUpper.includes("DELETE")) {
                        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
                      }
                      return "bg-purple-500/10 border-purple-500/30 text-purple-400";
                    };

                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleToggle(perm.id)}
                        className={`flex items-start gap-3 rounded-xl p-3 border transition-all duration-200 cursor-pointer select-none active:scale-[0.99] ${
                          isChecked
                            ? "bg-gradient-to-br from-cyan-500/15 to-blue-500/10 border-cyan-400/40 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.12)]"
                            : "bg-background/40 border-border/50 text-muted-foreground hover:border-border-strong hover:bg-card/70"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggle(perm.id)}
                          className="mt-0.5 h-4 w-4 rounded border-border text-cyan-500 focus:ring-cyan-400/40 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <p
                              className={`text-xs font-semibold ${
                                isChecked ? "text-cyan-300" : "text-foreground"
                              }`}
                            >
                              {perm.name}
                            </p>
                            <span
                              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md border font-semibold shrink-0 ${getActionBadgeClass()}`}
                            >
                              {perm.action}
                            </span>
                          </div>
                          {perm.description && (
                            <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
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
        <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
          {selectedIds.length} quyền được gán
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-border bg-card/60 px-5 h-[42px] text-xs sm:text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-card hover:text-foreground hover:border-border-strong active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 cursor-pointer select-none disabled:opacity-50"
          >
            {t("admin.roles.permissionsModal.cancelBtn")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="
              group relative inline-flex items-center justify-center gap-2 overflow-hidden
              rounded-xl
              h-[42px] px-6
              bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600
              text-xs sm:text-sm font-semibold text-white
              shadow-[0_0_25px_rgba(16,185,129,0.25)]
              transition-all duration-300
              hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(16,185,129,0.4)] hover:brightness-110
              active:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background
              disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
              cursor-pointer select-none
            "
          >
            <span className="pointer-events-none absolute inset-y-0 -left-24 w-16 rotate-12 bg-white/30 blur-lg transition-all duration-700 group-hover:left-[130%]" />
            <span className="relative flex items-center gap-2">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <ShieldCheck className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              )}
              <span>{t("admin.roles.permissionsModal.saveBtn")}</span>
            </span>
          </button>
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
