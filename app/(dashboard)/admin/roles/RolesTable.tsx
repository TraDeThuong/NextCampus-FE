"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Shield,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
} from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import { useRoles } from "@/hooks/rbac/useRoles";
import { useDeleteRole } from "@/hooks/rbac/useDeleteRole";
import type { Role } from "@/types/rbac";
import RoleRow from "./RoleRow";
import EditRoleModal from "./EditRoleModal";
import RolePermissionsModal from "./RolePermissionsModal";
import RoleUsersModal from "./RoleUsersModal";
import CreateRoleModal from "./CreateRoleModal";

const COLUMNS =
  "minmax(240px, 2.2fr) minmax(130px, 1fr) minmax(130px, 1fr) minmax(140px, 1fr) 48px";

export default function RolesTable() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const search = searchParams.get("search") || undefined;
  const typeFilter = searchParams.get("type") || "all";
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");

  const {
    data: rolesRes,
    isPending,
    isFetching,
    isError,
    refetch,
  } = useRoles({
    search,
    page,
    limit,
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

  const meta =
    rolesRes?.meta && typeFilter === "all"
      ? rolesRes.meta
      : {
          total: filteredRoles.length,
          page,
          limit,
          totalPages: Math.ceil(filteredRoles.length / limit) || 1,
        };

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [permissionsRole, setPermissionsRole] = useState<Role | null>(null);
  const [usersRole, setUsersRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole({
    onSuccess: () => {
      setDeletingRole(null);
    },
  });

  const goToPage = useCallback(
    (targetPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(targetPage));
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("type");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const hasFilters = Boolean(search || (typeFilter && typeFilter !== "all"));

  if (isPending) {
    return (
      <MetalCard className="flex flex-col items-center justify-center py-24">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-muted-foreground">
          {t("admin.roles.loadingRoles")}
        </p>
      </MetalCard>
    );
  }

  if (isError) {
    return (
      <MetalCard className="flex flex-col items-center justify-center gap-3 py-20 text-rose-400">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-sm text-rose-300">{t("admin.roles.loadError")}</p>
      </MetalCard>
    );
  }

  if (filteredRoles.length === 0) {
    return (
      <>
        <MetalCard className="flex flex-col items-center justify-center gap-3 py-20 text-center px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400">
            <Shield className="h-6 w-6" />
          </div>
          <p className="text-base font-semibold text-foreground">
            {t("admin.roles.table.noRolesFound")}
          </p>
          <p className="text-xs text-muted-foreground max-w-sm">
            {t("admin.roles.table.noRolesDesc")}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-2 inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-xs font-medium text-muted transition hover:bg-card hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer select-none"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span>{t("admin.roles.clearFilters")}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="
                group relative mt-2 inline-flex items-center justify-center gap-2 overflow-hidden
                rounded-xl
                h-[40px] px-5
                bg-gradient-to-r from-(--primary-main) to-(--primary-light)
                text-xs sm:text-sm font-semibold text-white
                shadow-[0_0_20px_rgba(21,174,245,0.25)]
                transition-all duration-300
                hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(21,174,245,0.4)] hover:brightness-110
                active:scale-[0.98]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background
                disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
                cursor-pointer select-none
              "
            >
              <span
                className="
                  pointer-events-none absolute inset-y-0 -left-24 w-16 rotate-12
                  bg-white/30 blur-lg
                  transition-all duration-700
                  group-hover:left-[130%]
                "
              />
              <span className="relative flex items-center gap-2">
                <Plus className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:rotate-90" />
                <span>{t("admin.roles.createRoleBtn")}</span>
              </span>
            </button>
          )}
        </MetalCard>

        <CreateRoleModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <Table
        columns={COLUMNS}
        className="
          bg-card dark:bg-[linear-gradient(145deg,#101827_0%,#1a2235_20%,#0f172a_55%,#050816_100%)]
          shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,.45)]
          hover:shadow-md dark:hover:shadow-[0_20px_50px_rgba(21,174,245,.15)]
          transition-shadow duration-500
        "
      >
        <Table.Header>
          <div>{t("admin.roles.table.colRole")}</div>
          <div>{t("admin.roles.table.colType")}</div>
          <div>{t("admin.roles.table.colUsers")}</div>
          <div>{t("admin.roles.table.colPermissions")}</div>
          <Table.ReloadButton onReload={refetch} isReloading={isFetching} />
        </Table.Header>

        <Table.Body
          data={filteredRoles}
          render={(role) => (
            <RoleRow
              key={role.id}
              role={role}
              onOpenEdit={(r) => setEditingRole(r)}
              onOpenPermissions={(r) => setPermissionsRole(r)}
              onOpenUsers={(r) => setUsersRole(r)}
              onOpenDelete={(r) => setDeletingRole(r)}
            />
          )}
        />

        {meta && meta.totalPages > 1 && (
          <Table.Footer>
            <div className="flex w-full items-center justify-between gap-4 text-sm">
              <p className="text-muted">
                {t("admin.roles.table.pagination", {
                  page: meta.page,
                  totalPages: meta.totalPages,
                  total: meta.total,
                })}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={meta.page <= 1}
                  onClick={() => goToPage(meta.page - 1)}
                  className="rounded-xl border border-border bg-slate-100 hover:bg-slate-200 text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-muted dark:hover:border-white/20 dark:hover:bg-white/[0.06] dark:hover:text-foreground px-3 py-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => goToPage(meta.page + 1)}
                  className="rounded-xl border border-border bg-slate-100 hover:bg-slate-200 text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-muted dark:hover:border-white/20 dark:hover:bg-white/[0.06] dark:hover:text-foreground px-3 py-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Table.Footer>
        )}
      </Table>

      {/* Create Role Modal */}
      <CreateRoleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Edit Role Modal */}
      <EditRoleModal
        isOpen={Boolean(editingRole)}
        onClose={() => setEditingRole(null)}
        role={editingRole}
      />

      {/* Permissions Matrix Modal */}
      <RolePermissionsModal
        isOpen={Boolean(permissionsRole)}
        onClose={() => setPermissionsRole(null)}
        role={permissionsRole}
      />

      {/* Role Users Modal */}
      <RoleUsersModal
        isOpen={Boolean(usersRole)}
        onClose={() => setUsersRole(null)}
        role={usersRole}
      />

      {/* Delete Confirmation Modal */}
      {deletingRole && (
        <Modal
          isOpen={Boolean(deletingRole)}
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
                className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition hover:bg-card hover:text-foreground disabled:opacity-50"
              >
                {t("admin.roles.table.cancelBtn")}
              </button>
              <Button
                type="button"
                disabled={isDeleting}
                onClick={() => deleteRole(deletingRole.id)}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-500 active:scale-95 disabled:opacity-50"
              >
                {isDeleting && <Spinner size="sm" />}
                <span>{t("admin.roles.table.confirmDeleteBtn")}</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
