"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { MoreVertical, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import type { User } from "@/types/user";
import { updateUserService } from "@/services/user.service";
import { deleteUserService } from "@/services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import { useAuth } from "@/hooks/auth/useAuth";
import { useRoles } from "@/hooks/rbac/useRoles";
import { useAssignUserRole } from "@/hooks/rbac/useAssignUserRole";

type AdminTeamRowProps = {
    admin: User;
};

export default function AdminTeamRow({ admin }: AdminTeamRowProps) {
    const t = useTranslations();
    const { state } = useAuth();
    const currentUser = state.user;
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const queryClient = useQueryClient();

    const { mutate: toggleActive } = useMutation({
        mutationFn: (isActive: boolean) =>
            updateUserService(admin.id, { isActive }),
        onSuccess: () => {
            toast.success(t("admin.adminTeam.statusUpdated"));
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: () => toast.error(t("admin.adminTeam.statusUpdateError")),
    });

    const { mutate: deleteAdmin, isPending: deleting } = useMutation({
        mutationFn: () => deleteUserService(admin.id),
        onSuccess: () => {
            toast.success(t("admin.adminTeam.deleted"));
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: () => toast.error(t("admin.adminTeam.deleteError")),
    });

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const joinedDate = new Date(admin.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <Modal>
            <Table.Row>
                {/* Admin info */}
                <div className="flex items-center gap-3 min-w-0">
                    {admin.avatarUrl ? (
                        <Image
                            src={admin.avatarUrl}
                            alt={admin.fullName ?? ""}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-800 text-sm font-bold text-slate-200">
                            {(admin.fullName ?? admin.email)
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                            {admin.fullName ?? admin.email}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                            {admin.email}
                        </p>
                    </div>
                </div>

                {/* Role */}
                <div className="text-sm">
                    <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/20 bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-300">
                        {admin.role?.name || "Admin"}
                    </span>
                </div>

                {/* Status */}
                <div>
                    <select
                        value={admin.isActive ? "true" : "false"}
                        onChange={(e) =>
                            toggleActive(e.target.value === "true")
                        }
                        className={`rounded-lg border px-2 py-1 text-xs font-medium outline-none cursor-pointer ${
                            admin.isActive
                                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                                : "border-red-400/20 bg-red-500/10 text-red-300"
                        }`}
                    >
                        <option value="true">{t("admin.adminTeam.active")}</option>
                        <option value="false">{t("admin.adminTeam.inactive")}</option>
                    </select>
                </div>

                {/* Joined */}
                <div className="text-sm text-slate-400">{joinedDate}</div>

                {/* Actions */}
                <div className="relative" ref={menuRef}>
                    {currentUser?.id !== admin.id && (
                        <>
                            <button
                                type="button"
                                onClick={() => setMenuOpen((prev) => !prev)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 bottom-full z-50 mb-2 w-44 rounded-2xl border border-white/10 bg-[#0f172a] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,.55)] backdrop-blur-2xl">
                                    <Modal.Open
                                        opens={`change-role-${admin.id}`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-cyan-300 transition hover:bg-cyan-500/10"
                                        >
                                            <ShieldCheck className="h-4 w-4" />
                                            Đổi vai trò
                                        </button>
                                    </Modal.Open>

                                    <Modal.Open
                                        opens={`delete-admin-${admin.id}`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            {t("admin.adminTeam.delete")}
                                        </button>
                                    </Modal.Open>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Table.Row>

            {/* Change Role Modal */}
            <Modal.Window
                name={`change-role-${admin.id}`}
                size="sm"
            >
                <ChangeRoleModal
                    user={admin}
                />
            </Modal.Window>

            <Modal.Window
                name={`delete-admin-${admin.id}`}
                size="sm"
            >
                <DeleteConfirm
                    name={admin.fullName ?? admin.email}
                    deleting={deleting}
                    onConfirm={(onCloseModal) => {
                        deleteAdmin();
                        onCloseModal?.();
                    }}
                />
            </Modal.Window>
        </Modal>
    );
}

function ChangeRoleModal({
    user,
    onCloseModal,
}: {
    user: User;
    onCloseModal?: () => void;
}) {
    const { data: rolesRes } = useRoles();
    const roles = rolesRes?.data ?? [];
    const [selectedRoleId, setSelectedRoleId] = useState(user.roleId || "");

    const { mutate: assignRole, isPending } = useAssignUserRole({
        onSuccess: () => {
            onCloseModal?.();
        },
    });

    const handleSave = () => {
        if (!selectedRoleId) return;
        assignRole({ userId: user.id, roleId: selectedRoleId });
    };

    return (
        <div className="px-2 py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">
                Thay đổi vai trò cho {user.fullName ?? user.email}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
                Chọn vai trò mới để phân công trách nhiệm và quyền hạn tương ứng.
            </p>

            <div className="mt-5 text-left">
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Vai trò hệ thống & tùy chỉnh
                </label>
                <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400 cursor-pointer"
                >
                    {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.name} {r.isSystem ? "(Hệ thống)" : "(Tùy chỉnh)"}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mt-6 flex justify-center gap-3">
                <button
                    type="button"
                    onClick={onCloseModal}
                    disabled={isPending}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 hover:text-white disabled:opacity-50"
                >
                    Hủy
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending || !selectedRoleId}
                    className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
                >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>Lưu vai trò</span>
                </button>
            </div>
        </div>
    );
}

function DeleteConfirm({
    name,
    deleting,
    onConfirm,
    onCloseModal,
}: {
    name: string;
    deleting: boolean;
    onConfirm: (close?: () => void) => void;
    onCloseModal?: () => void;
}) {
    const t = useTranslations();
    return (
        <div className="px-2 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">
                {t("admin.adminTeam.deleteTitle")}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
                {t("admin.adminTeam.deleteConfirm", { name })}
            </p>
            <div className="mt-6 flex justify-center gap-3">
                <button
                    onClick={onCloseModal}
                    disabled={deleting}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 hover:text-white disabled:opacity-50"
                >
                    {t("admin.adminTeam.cancel")}
                </button>
                <button
                    onClick={() => onConfirm(onCloseModal)}
                    disabled={deleting}
                    className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                >
                    {t("admin.adminTeam.delete")}
                </button>
            </div>
        </div>
    );
}
