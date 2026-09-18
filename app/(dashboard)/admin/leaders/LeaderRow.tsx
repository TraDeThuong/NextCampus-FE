"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { MoreVertical, Eye, Trash2, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

import type { Leader } from "@/types/leader";
import { useDeleteLeader } from "@/hooks/leader/useDeleteLeader";
import { useUpdateLeader } from "@/hooks/leader/useUpdateLeader";
import { useDepartments } from "@/hooks/department/useDepartments";
import { updateUserService } from "@/services/user.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import InlineSelect from "@/components/ui/InlineSelect";
import LeaderDepartmentSelect from "./LeaderDepartmentSelect";

type LeaderRowProps = {
    leader: Leader;
};

export default function LeaderRow({ leader }: LeaderRowProps) {
    const t = useTranslations();
    const router = useRouter();
    const { mutate: deleteLeader, isPending: isDeleting } = useDeleteLeader();
    const { mutate: updateLeader } = useUpdateLeader();
    const { data: deptData } = useDepartments();
    const departments = deptData?.data ?? [];

    const managedDepartmentIds = new Set(
        leader.departments.map((department) => department.id),
    );
    const availablePositions = departments
        .filter((department) => managedDepartmentIds.has(department.id))
        .flatMap((department) => department.positions)
        .filter(
            (position, index, positions) =>
                positions.findIndex((item) => item.name === position.name) === index,
        );

    const [updatingField, setUpdatingField] = useState<"position" | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuId = useId();

    const updateMenuPosition = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const openUpward = spaceBelow < 180 && rect.top > 180;

            const MENU_WIDTH = 150;
            setMenuStyle({
                position: "fixed",
                top: openUpward ? undefined : rect.bottom + 6,
                bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
                left: Math.max(8, rect.right - MENU_WIDTH),
                width: MENU_WIDTH,
                zIndex: 9999,
            });
        }
    }, []);

    useEffect(() => {
        if (menuOpen) {
            updateMenuPosition();
            window.addEventListener("scroll", updateMenuPosition, true);
            window.addEventListener("resize", updateMenuPosition);
        }
        return () => {
            window.removeEventListener("scroll", updateMenuPosition, true);
            window.removeEventListener("resize", updateMenuPosition);
        };
    }, [menuOpen, updateMenuPosition]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            const target = e.target as Node;
            if (
                menuRef.current &&
                !menuRef.current.contains(target) &&
                triggerRef.current &&
                !triggerRef.current.contains(target)
            ) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [menuOpen]);

    const handlePositionChange = useCallback(
        (newPos: string | null) => {
            setUpdatingField("position");
            updateLeader(
                {
                    id: leader.id,
                    payload: { position: newPos || null },
                },
                { onSettled: () => setUpdatingField(null) },
            );
        },
        [leader.id, updateLeader],
    );

    const queryClient = useQueryClient();
    const { mutate: toggleActive, isPending: togglingActive } = useMutation({
        mutationFn: (isActive: boolean) =>
            updateUserService(leader.userId, { isActive }),
        onSuccess: () => {
            toast.success(t("admin.leaders.statusUpdated"));
            queryClient.invalidateQueries({ queryKey: ["leaders"] });
        },
        onError: () => toast.error(t("admin.leaders.statusUpdateError")),
    });

    return (
        <Modal>
            <Table.Row>
                {/* Leader info */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                    {leader.user.avatarUrl ? (
                        <Image
                            src={leader.user.avatarUrl}
                            alt={leader.user.fullName ?? ""}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-xl object-cover shrink-0"
                        />
                    ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-800 text-sm font-bold text-white shadow-sm">
                            {(leader.user.fullName ?? leader.user.email)
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p
                            className="truncate text-sm font-semibold text-foreground cursor-pointer hover:text-cyan-400 transition"
                            onClick={() =>
                                router.push(`/admin/leaders/${leader.id}`)
                            }
                            title={leader.user.fullName ?? leader.user.email}
                        >
                            {leader.user.fullName ?? leader.user.email}
                        </p>
                        <p className="truncate text-xs text-muted" title={leader.user.email}>
                            {leader.user.email}
                        </p>
                    </div>
                </div>

                {/* Department */}
                <div className="text-sm min-w-0 pr-2">
                    <LeaderDepartmentSelect
                        leader={leader}
                        departments={departments}
                    />
                </div>

                {/* Position */}
                <div className="text-sm min-w-0 pr-2">
                    <InlineSelect
                        ariaLabel={t("admin.leaders.colPosition")}
                        value={leader.position}
                        placeholder={t("admin.leaders.notSet")}
                        loading={updatingField === "position"}
                        disabled={leader.departments.length === 0}
                        onDisabledClick={() => toast.error(t("admin.leaders.selectDepartmentFirst"))}
                        onChange={handlePositionChange}
                        options={[
                            { value: null, label: t("admin.leaders.notSet") },
                            ...availablePositions.map((pos) => ({
                                value: pos.name,
                                label: pos.name,
                            })),
                        ]}
                    />
                </div>

                {/* Intern Count */}
                <div className="flex items-center justify-center">
                    <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-400 font-semibold text-xs border border-cyan-500/20">
                        {leader.internCount ?? 0}
                    </span>
                </div>

                {/* Status */}
                <div>
                    <InlineSelect
                        ariaLabel={t("admin.leaders.colStatus")}
                        value={leader.user.isActive ? "true" : "false"}
                        placeholder={t("admin.leaders.colStatus")}
                        loading={togglingActive}
                        disabled={togglingActive}
                        onChange={(val) => {
                            if (val !== null) toggleActive(val === "true");
                        }}
                        options={[
                            { value: "true", label: t("admin.leaders.active") },
                            { value: "false", label: t("admin.leaders.inactive") },
                        ]}
                        renderTrigger={(label) => (
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                                    leader.user.isActive
                                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400/50"
                                        : "border-red-400/30 bg-red-500/10 text-red-300 hover:border-red-400/50"
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        leader.user.isActive
                                            ? "bg-emerald-400"
                                            : "bg-red-400"
                                    }`}
                                />
                                {label}
                            </span>
                        )}
                    />
                </div>

                {/* Actions */}
                <div className="relative flex items-center justify-end">
                    <button
                        ref={triggerRef}
                        type="button"
                        aria-label="Actions menu"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted transition hover:border-border dark:hover:border-white/10 hover:bg-card hover:text-foreground active:scale-95"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </button>

                    {menuOpen &&
                        typeof document !== "undefined" &&
                        createPortal(
                            <div
                                id={menuId}
                                ref={menuRef}
                                role="menu"
                                aria-label="Leader actions"
                                style={menuStyle}
                                className="rounded-2xl border border-border dark:border-white/10 bg-card/95 p-1.5 shadow-[0_16px_48px_rgba(0,0,0,.55)] backdrop-blur-2xl"
                            >
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        router.push(`/admin/leaders/${leader.id}`);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted transition hover:bg-white/5 hover:text-foreground"
                                >
                                    <Eye className="h-4 w-4 shrink-0 text-cyan-400" />
                                    {t("admin.leaders.view")}
                                </button>

                                <Modal.Open opens={`delete-leader-${leader.id}`}>
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => setMenuOpen(false)}
                                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"
                                    >
                                        <Trash2 className="h-4 w-4 shrink-0" />
                                        {t("admin.leaders.delete")}
                                    </button>
                                </Modal.Open>
                            </div>,
                            document.body,
                        )}
                </div>
            </Table.Row>

            <Modal.Window name={`delete-leader-${leader.id}`} size="sm">
                <DeleteConfirm
                    name={leader.user.fullName ?? leader.user.email}
                    isDeleting={isDeleting}
                    onConfirm={(onCloseModal) => {
                        deleteLeader(leader.id, {
                            onSuccess: () => onCloseModal?.(),
                        });
                    }}
                />
            </Modal.Window>
        </Modal>
    );
}

function DeleteConfirm({
    name,
    isDeleting,
    onConfirm,
    onCloseModal,
}: {
    name: string;
    isDeleting?: boolean;
    onConfirm: (close?: () => void) => void;
    onCloseModal?: () => void;
}) {
    const t = useTranslations();
    return (
        <div className="px-2 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
                <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">
                {t("admin.leaders.deleteTitle")}
            </h3>
            <p className="mt-2 text-sm text-muted">
                {t("admin.leaders.deleteConfirm", { name })}
            </p>
            <div className="mt-6 flex justify-center gap-3">
                <button
                    type="button"
                    onClick={onCloseModal}
                    disabled={isDeleting}
                    className="rounded-xl border border-border dark:border-white/10 bg-card/40 px-5 py-2 text-sm text-muted hover:text-foreground hover:bg-card active:scale-[0.98] disabled:opacity-50"
                >
                    {t("admin.leaders.cancel")}
                </button>
                <button
                    type="button"
                    onClick={() => onConfirm(onCloseModal)}
                    disabled={isDeleting}
                    className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-sm font-medium text-white hover:bg-rose-500 active:scale-[0.98] disabled:opacity-50 shadow-sm"
                >
                    {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {t("admin.leaders.delete")}
                </button>
            </div>
        </div>
    );
}

