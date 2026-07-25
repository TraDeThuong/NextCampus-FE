"use client";

import Image from "next/image";
import { MoreVertical, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import type { User } from "@/types/user";
import { updateUserService } from "@/services/user.service";
import { deleteUserService } from "@/services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";

type AdminTeamRowProps = {
    admin: User;
};

export default function AdminTeamRow({ admin }: AdminTeamRowProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const queryClient = useQueryClient();

    const { mutate: toggleActive } = useMutation({
        mutationFn: (isActive: boolean) =>
            updateUserService(admin.id, { isActive }),
        onSuccess: () => {
            toast.success("Admin status updated.");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: () => toast.error("Failed to update status."),
    });

    const { mutate: deleteAdmin, isPending: deleting } = useMutation({
        mutationFn: () => deleteUserService(admin.id),
        onSuccess: () => {
            toast.success("Admin deleted.");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: () => toast.error("Failed to delete admin."),
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
                        Admin
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
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                {/* Joined */}
                <div className="text-sm text-slate-400">{joinedDate}</div>

                {/* Actions */}
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-2xl border border-white/10 bg-[#0f172a] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,.55)] backdrop-blur-2xl">
                            <Modal.Open
                                opens={`delete-admin-${admin.id}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setMenuOpen(false)}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            </Modal.Open>
                        </div>
                    )}
                </div>
            </Table.Row>

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
    return (
        <div className="px-2 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">
                Delete Admin
            </h3>
            <p className="mt-2 text-sm text-slate-400">
                Delete admin account for{" "}
                <span className="font-medium text-white">{name}</span>?
                This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-center gap-3">
                <button
                    onClick={onCloseModal}
                    disabled={deleting}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 hover:text-white disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onConfirm(onCloseModal)}
                    disabled={deleting}
                    className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
