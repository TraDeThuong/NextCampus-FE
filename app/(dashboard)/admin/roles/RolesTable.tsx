"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Edit2,
  Trash2,
  Users,
  Lock,
  Sparkles,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useRoles } from "@/hooks/rbac/useRoles";
import { useDeleteRole } from "@/hooks/rbac/useDeleteRole";
import type { Role } from "@/types/rbac";
import EditRoleModal from "./EditRoleModal";
import RolePermissionsModal from "./RolePermissionsModal";

export default function RolesTable() {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? undefined;
  const typeFilter = searchParams.get("type") ?? "all";

  const { data: rolesRes, isLoading, isError } = useRoles({
    search: search || undefined,
    limit: 100,
  });

  // Filter by role type (system vs custom)
  const filteredRoles = useMemo(() => {
    const rawRoles = rolesRes?.data ?? [];
    if (typeFilter === "system") {
      return rawRoles.filter((r) => r.isSystem);
    }
    if (typeFilter === "custom") {
      return rawRoles.filter((r) => !r.isSystem);
    }
    return rawRoles;
  }, [rolesRes?.data, typeFilter]);

  // Modals state
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [permissionsRole, setPermissionsRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole({
    onSuccess: () => {
      setDeletingRole(null);
    },
  });

  if (isLoading) {
    return (
      <MetalCard className="flex flex-col items-center justify-center py-24">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-muted-foreground">Đang tải danh sách vai trò...</p>
      </MetalCard>
    );
  }

  if (isError) {
    return (
      <MetalCard className="flex flex-col items-center justify-center py-20 text-rose-400">
        <AlertTriangle className="h-8 w-8" />
        <p className="mt-2 text-sm">Không thể tải danh sách vai trò. Vui lòng thử lại sau.</p>
      </MetalCard>
    );
  }

  return (
    <>
      <MetalCard className="overflow-hidden">
        {/* Table Container */}
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[720px] text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-card/60 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <th className="py-4 px-6">{t("admin.roles.table.roleName")}</th>
                <th className="py-4 px-4">{t("admin.roles.table.roleType")}</th>
                <th className="py-4 px-4">{t("admin.roles.table.userCount")}</th>
                <th className="py-4 px-4">{t("admin.roles.table.permissionsCount")}</th>
                <th className="py-4 px-6 text-right">{t("admin.roles.table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-sm">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card/50 text-muted-foreground">
                      <Shield className="h-6 w-6" />
                    </div>
                    <p className="mt-3 font-semibold text-foreground">
                      {t("admin.roles.table.noRolesFound")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("admin.roles.table.noRolesDesc")}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => {
                  const isDeletable = !role.isSystem && role.userCount === 0;

                  return (
                    <tr
                      key={role.id}
                      className="group transition-colors duration-150 hover:bg-card/40"
                    >
                      {/* Name & Description */}
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                              role.isSystem
                                ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-400"
                                : "border-emerald-400/20 bg-emerald-500/10 text-emerald-400"
                            }`}
                          >
                            {role.isSystem ? (
                              <ShieldCheck className="h-5 w-5" />
                            ) : (
                              <Sparkles className="h-5 w-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                              {role.name}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 max-w-sm">
                              {role.description || "Chưa có mô tả cho vai trò này."}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type (System vs Custom) */}
                      <td className="py-4 px-4">
                        {role.isSystem ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                            <Lock className="h-3 w-3" />
                            <span>{t("admin.roles.table.systemBadge")}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                            <Sparkles className="h-3 w-3" />
                            <span>{t("admin.roles.table.customBadge")}</span>
                          </span>
                        )}
                      </td>

                      {/* Users Count */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Users className="h-4 w-4 shrink-0 text-muted" />
                          <span className="font-medium text-foreground">
                            {t("admin.roles.table.usersCountLabel", {
                              count: role.userCount,
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Permissions Count */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">
                          <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
                          <span>
                            {t("admin.roles.table.permissionsCountLabel", {
                              count: role.permissions?.length ?? 0,
                            })}
                          </span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Permissions Action Button */}
                          <button
                            type="button"
                            onClick={() => setPermissionsRole(role)}
                            title={t("admin.roles.table.permissionsBtn")}
                            className="flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20 hover:border-cyan-400/50"
                          >
                            <KeyRound className="h-3.5 w-3.5 shrink-0" />
                            <span className="hidden sm:inline">
                              {t("admin.roles.table.permissionsBtn")}
                            </span>
                          </button>

                          {/* Edit Action Button */}
                          <button
                            type="button"
                            onClick={() => setEditingRole(role)}
                            title={t("admin.roles.table.editBtn")}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-border-strong hover:text-foreground hover:bg-card-hover"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Action Button */}
                          <button
                            type="button"
                            disabled={!isDeletable}
                            onClick={() => setDeletingRole(role)}
                            title={
                              role.isSystem
                                ? t("admin.roles.table.deleteDisabledSystem")
                                : role.userCount > 0
                                ? t("admin.roles.table.deleteDisabledUsers", {
                                    count: role.userCount,
                                  })
                                : t("admin.roles.table.deleteBtn")
                            }
                            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                              isDeletable
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/20"
                                : "border-border/40 bg-card/20 text-muted/40 cursor-not-allowed"
                            }`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </MetalCard>

      {/* Edit Role Modal */}
      <EditRoleModal
        isOpen={!!editingRole}
        onClose={() => setEditingRole(null)}
        role={editingRole}
      />

      {/* Permissions Matrix Modal */}
      <RolePermissionsModal
        isOpen={!!permissionsRole}
        onClose={() => setPermissionsRole(null)}
        role={permissionsRole}
      />

      {/* Delete Confirmation Modal */}
      {deletingRole && (
        <Modal
          isOpen={!!deletingRole}
          onClose={() => setDeletingRole(null)}
          size="sm"
        >
          <div className="p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-foreground">
              {t("admin.roles.table.deleteConfirmTitle")}
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("admin.roles.table.deleteConfirmDesc", {
                name: deletingRole.name,
              })}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingRole(null)}
                disabled={isDeleting}
                className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-card hover:text-foreground"
              >
                {t("admin.roles.table.cancelBtn")}
              </button>
              <Button
                type="button"
                disabled={isDeleting}
                onClick={() => deleteRole(deletingRole.id)}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-500"
              >
                {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{t("admin.roles.table.confirmDeleteBtn")}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
