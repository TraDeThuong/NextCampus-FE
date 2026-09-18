"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Users, UserPlus, Loader2, CheckCircle2 } from "lucide-react";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useUsers } from "@/hooks/user/useUsers";
import { useAssignUserRole } from "@/hooks/rbac/useAssignUserRole";
import type { Role } from "@/types/rbac";
import type { User } from "@/types/user";

interface RoleUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
}

function RoleUsersContent({
  role,
  onClose,
}: {
  role: Role;
  onClose: () => void;
}) {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // 1. Fetch current members of this role
  const {
    data: membersRes,
    isLoading: loadingMembers,
    refetch: refetchMembers,
  } = useUsers({
    roleName: role.name,
    limit: 100,
  });
  const currentMembers = membersRes?.data ?? [];

  // 2. Fetch candidates for assignment search
  const { data: candidatesRes, isLoading: searchingCandidates } = useUsers({
    fullName: searchTerm.trim() || undefined,
    limit: 8,
  });
  const candidates = candidatesRes?.data ?? [];

  // 3. Assign role mutation
  const { mutate: assignRole, isPending: isAssigning } = useAssignUserRole({
    onSuccess: () => {
      setSelectedUserId("");
      setSearchTerm("");
      refetchMembers();
    },
  });

  const handleAssign = () => {
    if (!selectedUserId) return;
    assignRole({ userId: selectedUserId, roleId: role.id });
  };

  return (
    <div className="flex max-h-[85vh] flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
          <Users className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-foreground">
            {t("admin.roles.usersModal.title", { name: role.name })}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("admin.roles.usersModal.description")}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-6 overflow-y-auto pr-1">
        {/* Assign new user section */}
        <div className="rounded-2xl border border-border bg-card/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="h-4 w-4 text-cyan-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {t("admin.roles.usersModal.assignNewUser")}
            </h4>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder={t("admin.roles.usersModal.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground outline-none transition hover:border-border-strong focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 placeholder:text-muted"
              />
              {searchingCandidates && (
                <div className="absolute right-3 top-2.5">
                  <Spinner size="sm" />
                </div>
              )}
            </div>

            {searchTerm.trim().length > 0 && (
              <div className="max-h-44 overflow-y-auto rounded-xl border border-border/80 bg-slate-900/90 divide-y divide-border/40">
                {candidates.length === 0 ? (
                  <p className="p-3 text-center text-xs text-muted-foreground">
                    {t("admin.roles.table.noRolesFound")}
                  </p>
                ) : (
                  candidates.map((cand: User) => {
                    const isAlreadyInRole = cand.roleId === role.id;
                    const isSelected = selectedUserId === cand.id;

                    return (
                      <div
                        key={cand.id}
                        onClick={() => {
                          if (!isAlreadyInRole) {
                            setSelectedUserId(cand.id);
                          }
                        }}
                        className={`flex items-center justify-between p-2.5 text-xs transition cursor-pointer ${
                          isAlreadyInRole
                            ? "opacity-50 cursor-not-allowed bg-slate-950/40"
                            : isSelected
                              ? "bg-cyan-500/15 border-l-2 border-cyan-400"
                              : "hover:bg-card-hover"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-foreground truncate">
                            {cand.fullName ?? cand.email}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {cand.email} · <span className="text-cyan-400">{cand.role?.name || "Chưa có vai trò"}</span>
                          </p>
                        </div>
                        {isAlreadyInRole ? (
                          <span className="flex items-center gap-1 shrink-0 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Đang là thành viên
                          </span>
                        ) : (
                          <input
                            type="radio"
                            name="candidate-user"
                            checked={isSelected}
                            onChange={() => setSelectedUserId(cand.id)}
                            className="cursor-pointer text-cyan-500 focus:ring-cyan-400"
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button
                type="button"
                disabled={!selectedUserId || isAssigning}
                onClick={handleAssign}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:opacity-50"
              >
                {isAssigning && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{t("admin.roles.usersModal.assignBtn")}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Current members list */}
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("admin.roles.usersModal.currentUsers", { count: currentMembers.length })}
          </h4>

          {loadingMembers ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : currentMembers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 py-8 text-center">
              <p className="text-xs text-muted-foreground">
                {t("admin.roles.usersModal.noUsers")}
              </p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto rounded-2xl border border-border bg-card/40 divide-y divide-border/50">
              {currentMembers.map((member: User) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 transition hover:bg-card/70"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-slate-200 border border-border">
                      {(member.fullName ?? member.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-foreground truncate">
                        {member.fullName ?? member.email}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                      member.isActive
                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-400"
                        : "border-red-400/20 bg-red-500/10 text-red-400"
                    }`}
                  >
                    {member.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-end border-t border-border pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-border px-5 py-2 text-xs font-medium text-muted-foreground transition hover:bg-card hover:text-foreground"
        >
          {t("admin.roles.usersModal.closeBtn")}
        </button>
      </div>
    </div>
  );
}

export default function RoleUsersModal({
  isOpen,
  onClose,
  role,
}: RoleUsersModalProps) {
  if (!role) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <RoleUsersContent key={role.id} role={role} onClose={onClose} />
    </Modal>
  );
}
