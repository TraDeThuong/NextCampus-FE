"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Users, UserPlus, Loader2, CheckCircle2, Search } from "lucide-react";

import Modal from "@/components/ui/Modal";
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
    <div className="flex max-h-[85vh] flex-col p-0 sm:p-1">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4 pr-12">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
          <Users className="h-5 w-5 shrink-0" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg sm:text-xl font-bold text-foreground">
              {t("admin.roles.usersModal.title", { name: role.name })}
            </h3>
            <span className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
              {role.name}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("admin.roles.usersModal.description")}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-6 overflow-y-auto pr-1 custom-scrollbar">
        {/* Assign new user section */}
        <div className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="h-4 w-4 shrink-0 text-cyan-400" />
            <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-foreground select-none">
              {t("admin.roles.usersModal.assignNewUser")}
            </h4>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder={t("admin.roles.usersModal.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-border bg-card pl-10 pr-10 py-2.5 sm:py-3 h-[42px] sm:h-[46px] text-xs sm:text-sm text-foreground outline-none transition-all hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 placeholder:text-muted/60"
              />
              {searchingCandidates && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <Spinner size="sm" />
                </div>
              )}
            </div>

            {searchTerm.trim().length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-border/80 bg-slate-900/95 divide-y divide-border/40 custom-scrollbar backdrop-blur-md">
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
                        className={`flex items-center justify-between p-3 text-xs transition-all duration-150 cursor-pointer select-none ${
                          isAlreadyInRole
                            ? "opacity-50 cursor-not-allowed bg-slate-950/40"
                            : isSelected
                              ? "bg-cyan-500/15 border-l-4 border-cyan-400 text-cyan-100"
                              : "hover:bg-card-hover"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-foreground truncate">
                            {cand.fullName ?? cand.email}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {cand.email} ·{" "}
                            <span className="text-cyan-400 font-medium">
                              {cand.role?.name || "Chưa có vai trò"}
                            </span>
                          </p>
                        </div>
                        {isAlreadyInRole ? (
                          <span className="flex items-center gap-1 shrink-0 text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                            Đang là thành viên
                          </span>
                        ) : (
                          <input
                            type="radio"
                            name="candidate-user"
                            checked={isSelected}
                            onChange={() => setSelectedUserId(cand.id)}
                            className="h-4 w-4 cursor-pointer text-cyan-500 focus:ring-cyan-400/40"
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                disabled={!selectedUserId || isAssigning}
                onClick={handleAssign}
                className="
                  group relative inline-flex items-center justify-center gap-2 overflow-hidden
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
                <span className="pointer-events-none absolute inset-y-0 -left-24 w-16 rotate-12 bg-white/30 blur-lg transition-all duration-700 group-hover:left-[130%]" />
                <span className="relative flex items-center gap-2">
                  {isAssigning ? (
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  ) : (
                    <UserPlus className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  )}
                  <span>{t("admin.roles.usersModal.assignBtn")}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Current members list */}
        <div>
          <h4 className="mb-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground select-none">
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
            <div className="max-h-60 overflow-y-auto rounded-2xl border border-border bg-card/40 divide-y divide-border/50 custom-scrollbar">
              {currentMembers.map((member: User) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 transition-colors hover:bg-card/70"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-800 border border-cyan-400/25 text-xs font-bold text-cyan-300 shadow-sm">
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
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                      member.isActive
                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                        : "border-rose-400/30 bg-rose-500/10 text-rose-300"
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
          className="rounded-xl border border-border bg-card/60 px-5 h-[42px] text-xs sm:text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-card hover:text-foreground hover:border-border-strong active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer select-none"
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
