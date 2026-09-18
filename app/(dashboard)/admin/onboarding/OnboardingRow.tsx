"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
    MoreVertical,
    Eye,
    XCircle,
    CheckCircle2,
    Trash2,
    Ban,
    RefreshCw,
    Copy,
    Loader2,
} from "lucide-react";

import { useRevokeInvite } from "@/hooks/application/useRevokeInvite";
import { useReviewApplication } from "@/hooks/application/useReviewApplication";
import { useDeleteApplication } from "@/hooks/application/useDeleteApplication";
import { useCreateInvite } from "@/hooks/application/useCreateInvite";
import { useAssignApplication } from "@/hooks/application/useAssignApplication";
import { useDepartments } from "@/hooks/department/useDepartments";
import { usePositions } from "@/hooks/department/usePositions";
import type { ApplicationInviteRow } from "@/types/application";
import Modal from "@/components/ui/Modal";
import Table from "@/components/ui/Table";
import InlineSelect from "@/components/ui/InlineSelect";
import { toast } from "react-hot-toast";

const INVITE_COLORS: Record<string, string> = {
    ACTIVE: "border-sky-500/30 text-sky-400 bg-sky-500/10",
    USED: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    EXPIRED: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    REVOKED: "border-red-500/30 text-red-400 bg-red-500/10",
};

const APP_COLORS: Record<string, string> = {
    PENDING: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    APPROVED: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    REJECTED: "border-red-500/30 text-red-400 bg-red-500/10",
};

function formatDate(dateStr: string, locale: string) {
    return new Date(dateStr).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        month: "short",
        day: "numeric",
    });
}

interface Props {
    invite: ApplicationInviteRow;
}

export default function OnboardingRow({ invite }: Props) {
    const t = useTranslations();
    const locale = useLocale();
    const router = useRouter();

    const [menuOpen, setMenuOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuId = useId();

    const [copied, setCopied] = useState(false);

    const { mutate: revokeInvite, isPending: revoking } = useRevokeInvite();
    const { mutate: reviewApp, isPending: reviewing } = useReviewApplication();
    const { mutate: deleteApp, isPending: deleting } = useDeleteApplication();
    const { mutate: createInvite, isPending: resending } = useCreateInvite();
    const { mutate: assignApplication, isPending: assigning } =
        useAssignApplication();

    const application = invite.application;
    const appStatus = application?.status ?? null;
    const canAssign = invite.status === "USED" && appStatus === "PENDING";
    const assignedDepartmentId = application?.department?.id ?? null;
    const assignedPositionId = application?.position?.id ?? null;

    const { data: departmentData } = useDepartments();
    const departments = departmentData?.data ?? [];
    const { data: positionData } = usePositions(
        assignedDepartmentId ?? undefined,
    );
    const positions = positionData?.data ?? [];

    const isBusy = revoking || reviewing || deleting || resending || assigning;

    const candidate = invite.application
        ? invite.application.fullName
        : invite.email;
    const department = application?.department?.name ?? "—";
    const position = application?.position?.name ?? "—";

    const updateMenuPosition = useCallback(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const openUpward = spaceBelow < 220 && rect.top > 220;

            const MENU_WIDTH = 190;
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

    function handleDepartmentChange(departmentId: string | null) {
        if (!application || !canAssign) return;
        assignApplication({
            id: application.id,
            payload: { departmentId, positionId: null },
        });
    }

    function handlePositionChange(positionId: string | null) {
        if (!application || !canAssign || !assignedDepartmentId) return;
        assignApplication({
            id: application.id,
            payload: { departmentId: assignedDepartmentId, positionId },
        });
    }

    function handleCopyLink() {
        const link = `${window.location.origin}/onboarding/${invite.token ?? ""}/policies`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function handleRevoke(onClose?: () => void) {
        revokeInvite(invite.id, {
            onSuccess: () => {
                toast.success(t("admin.onboarding.revokeSuccess"));
                onClose?.();
            },
            onError: () => toast.error(t("admin.onboarding.revokeError")),
        });
    }

    function handleReview(status: "APPROVED" | "REJECTED", onClose?: () => void) {
        if (!invite.application) return;
        if (
            status === "APPROVED" &&
            (!assignedDepartmentId || !assignedPositionId)
        ) {
            toast.error(t("admin.onboarding.assignDeptPositionFirst"));
            return;
        }
        reviewApp(
            { id: invite.application.id, payload: { status } },
            {
                onSuccess: () => {
                    if (status === "APPROVED") {
                        toast.success(t("admin.onboarding.approveSuccess"));
                    } else {
                        toast.success(t("admin.onboarding.rejectSuccess"));
                    }
                    onClose?.();
                },
                onError: () => {
                    if (status === "APPROVED") {
                        toast.error(t("admin.onboarding.approveError"));
                    } else {
                        toast.error(t("admin.onboarding.rejectError"));
                    }
                },
            },
        );
    }

    function handleDelete(onClose?: () => void) {
        if (!invite.application) return;
        deleteApp(invite.application.id, {
            onSuccess: () => {
                toast.success(t("admin.onboarding.deleteSuccess"));
                onClose?.();
            },
            onError: () => toast.error(t("admin.onboarding.deleteError")),
        });
    }

    function handleView() {
        setMenuOpen(false);
        const params = new URLSearchParams(window.location.search);
        params.set("Id", invite.id);
        params.set("view", "modal");
        router.push(`/admin/onboarding?${params.toString()}`);
    }

    return (
        <Modal>
            <Table.Row>
                {/* Candidate */}
                <div className="min-w-0 pr-2">
                    <p
                        className="truncate text-sm font-semibold text-foreground cursor-pointer hover:text-cyan-400 transition"
                        onClick={handleView}
                        title={candidate}
                    >
                        {candidate}
                    </p>
                    {!invite.application && (
                        <p className="truncate text-xs text-muted" title={invite.email}>
                            {invite.email}
                        </p>
                    )}
                    {application?.preferredDepartment && (
                        <p className="truncate text-xs text-muted/80">
                            {t("admin.onboarding.prefers")}: {application.preferredDepartment}
                            {application.preferredPosition
                                ? ` · ${application.preferredPosition}`
                                : ""}
                        </p>
                    )}
                </div>

                {/* Department */}
                <div className="min-w-0 text-sm text-muted pr-2">
                    {canAssign ? (
                        <InlineSelect
                            ariaLabel={t("admin.onboarding.assignedDepartment")}
                            value={assignedDepartmentId}
                            placeholder={
                                application?.preferredDepartment
                                    ? t("admin.onboarding.assignWith", {
                                          name: application.preferredDepartment,
                                      })
                                    : t("admin.onboarding.assignDepartment")
                            }
                            loading={assigning}
                            disabled={assigning}
                            onChange={handleDepartmentChange}
                            options={[
                                { value: null, label: t("admin.onboarding.notSet") },
                                ...departments.map((item) => ({
                                    value: item.id,
                                    label: item.name,
                                })),
                            ]}
                        />
                    ) : (
                        department
                    )}
                </div>

                {/* Position */}
                <div className="min-w-0 text-sm text-muted pr-2">
                    {canAssign ? (
                        <InlineSelect
                            ariaLabel={t("admin.onboarding.assignedPosition")}
                            value={assignedPositionId}
                            placeholder={
                                assignedDepartmentId
                                    ? application?.preferredPosition
                                        ? t("admin.onboarding.assignWith", {
                                              name: application.preferredPosition,
                                          })
                                        : t("admin.onboarding.assignPosition")
                                    : t("admin.onboarding.departmentFirst")
                            }
                            loading={assigning}
                            disabled={!assignedDepartmentId || assigning}
                            onDisabledClick={() =>
                                toast.error(t("admin.onboarding.selectDeptFirst"))
                            }
                            onChange={handlePositionChange}
                            options={[
                                { value: null, label: t("admin.onboarding.notSet") },
                                ...positions.map((item) => ({
                                    value: item.id,
                                    label: item.name,
                                })),
                            ]}
                        />
                    ) : (
                        position
                    )}
                </div>

                {/* Invite Status */}
                <div>
                    <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider ${
                            INVITE_COLORS[invite.status] ?? "border-zinc-700 text-zinc-400"
                        }`}
                    >
                        {t(`admin.onboarding.inviteStatus_${invite.status}`)}
                    </span>
                </div>

                {/* Application Status */}
                <div>
                    {appStatus ? (
                        <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider ${
                                APP_COLORS[appStatus] ?? "border-zinc-700 text-zinc-400"
                            }`}
                        >
                            {t(`admin.onboarding.appStatus_${appStatus}`)}
                        </span>
                    ) : (
                        <span className="text-xs text-muted">—</span>
                    )}
                </div>

                {/* Sent At */}
                <div className="text-xs sm:text-sm text-muted">
                    {formatDate(invite.createdAt, locale)}
                </div>

                {/* Actions (with createPortal to avoid clipping inside table) */}
                <div className="relative flex items-center justify-end">
                    <button
                        ref={triggerRef}
                        type="button"
                        aria-label="Actions menu"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((prev) => !prev)}
                        disabled={isBusy}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted transition hover:border-border dark:hover:border-white/10 hover:bg-card hover:text-foreground active:scale-95 disabled:opacity-50"
                    >
                        {isBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <MoreVertical className="h-4 w-4" />
                        )}
                    </button>

                    {menuOpen &&
                        !isBusy &&
                        typeof document !== "undefined" &&
                        createPortal(
                            <div
                                id={menuId}
                                ref={menuRef}
                                role="menu"
                                aria-label="Onboarding actions"
                                style={menuStyle}
                                className="rounded-2xl border border-border dark:border-white/10 bg-card/95 p-1.5 shadow-[0_16px_48px_rgba(0,0,0,.55)] backdrop-blur-2xl"
                            >
                                {/* ACTIVE: View + Copy link + Revoke */}
                                {invite.status === "ACTIVE" && (
                                    <>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={handleView}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted transition hover:bg-white/5 hover:text-foreground"
                                        >
                                            <Eye className="h-4 w-4 shrink-0 text-cyan-400" />
                                            {t("admin.onboarding.viewDetails")}
                                        </button>

                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                handleCopyLink();
                                                setMenuOpen(false);
                                            }}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted transition hover:bg-white/5 hover:text-foreground"
                                        >
                                            <Copy className="h-4 w-4 shrink-0 text-sky-400" />
                                            {copied
                                                ? t("admin.onboarding.copied")
                                                : t("admin.onboarding.copyLink")}
                                        </button>

                                        <Modal.Open opens={`revoke-${invite.id}`}>
                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"
                                            >
                                                <Ban className="h-4 w-4 shrink-0" />
                                                {t("admin.onboarding.revoke")}
                                            </button>
                                        </Modal.Open>
                                    </>
                                )}

                                {/* USED + PENDING: View + Approve + Reject */}
                                {invite.status === "USED" &&
                                    appStatus === "PENDING" && (
                                        <>
                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={handleView}
                                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted transition hover:bg-white/5 hover:text-foreground"
                                            >
                                                <Eye className="h-4 w-4 shrink-0 text-cyan-400" />
                                                {t("admin.onboarding.viewApplication")}
                                            </button>

                                            <Modal.Open opens={`approve-${invite.id}`}>
                                                <button
                                                    type="button"
                                                    role="menuitem"
                                                    disabled={
                                                        !assignedDepartmentId ||
                                                        !assignedPositionId
                                                    }
                                                    title={
                                                        !assignedDepartmentId ||
                                                        !assignedPositionId
                                                            ? t(
                                                                  "admin.onboarding.assignFirstTooltip",
                                                              )
                                                            : undefined
                                                    }
                                                    onClick={() => setMenuOpen(false)}
                                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                                    {t("admin.onboarding.approve")}
                                                </button>
                                            </Modal.Open>

                                            <Modal.Open opens={`reject-${invite.id}`}>
                                                <button
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() => setMenuOpen(false)}
                                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"
                                                >
                                                    <XCircle className="h-4 w-4 shrink-0" />
                                                    {t("admin.onboarding.reject")}
                                                </button>
                                            </Modal.Open>
                                        </>
                                    )}

                                {/* USED + APPROVED: View */}
                                {invite.status === "USED" &&
                                    appStatus === "APPROVED" && (
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={handleView}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted transition hover:bg-white/5 hover:text-foreground"
                                        >
                                            <Eye className="h-4 w-4 shrink-0 text-cyan-400" />
                                            {t("admin.onboarding.viewApplication")}
                                        </button>
                                    )}

                                {/* USED + REJECTED: View + Delete */}
                                {invite.status === "USED" &&
                                    appStatus === "REJECTED" && (
                                        <>
                                            <button
                                                type="button"
                                                role="menuitem"
                                                onClick={handleView}
                                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted transition hover:bg-white/5 hover:text-foreground"
                                            >
                                                <Eye className="h-4 w-4 shrink-0 text-cyan-400" />
                                                {t("admin.onboarding.viewApplication")}
                                            </button>

                                            <Modal.Open opens={`delete-${invite.id}`}>
                                                <button
                                                    type="button"
                                                    role="menuitem"
                                                    onClick={() => setMenuOpen(false)}
                                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"
                                                >
                                                    <Trash2 className="h-4 w-4 shrink-0" />
                                                    {t("admin.onboarding.delete")}
                                                </button>
                                            </Modal.Open>
                                        </>
                                    )}

                                {/* EXPIRED / REVOKED: View + Resend */}
                                {(invite.status === "EXPIRED" ||
                                    invite.status === "REVOKED") && (
                                    <>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={handleView}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted transition hover:bg-white/5 hover:text-foreground"
                                        >
                                            <Eye className="h-4 w-4 shrink-0 text-cyan-400" />
                                            {t("admin.onboarding.viewDetails")}
                                        </button>

                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                createInvite(
                                                    { email: invite.email },
                                                    {
                                                        onSuccess: () =>
                                                            toast.success(
                                                                t(
                                                                    "admin.onboarding.createSuccess",
                                                                ),
                                                            ),
                                                        onError: () =>
                                                            toast.error(
                                                                t(
                                                                    "admin.onboarding.createError",
                                                                ),
                                                            ),
                                                    },
                                                );
                                            }}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-muted transition hover:bg-white/5 hover:text-foreground"
                                        >
                                            <RefreshCw className="h-4 w-4 shrink-0 text-cyan-400" />
                                            {t("admin.onboarding.resendInvite")}
                                        </button>
                                    </>
                                )}
                            </div>,
                            document.body,
                        )}
                </div>
            </Table.Row>

            {/* ─── Confirm Modals ─────────────────────────────── */}
            <Modal.Window name={`revoke-${invite.id}`} size="sm">
                <ConfirmContent
                    title={t("admin.onboarding.revokeTitle")}
                    message={t("admin.onboarding.revokeMessage", { email: invite.email })}
                    actionLabel={t("admin.onboarding.revoke")}
                    actionVariant="danger"
                    onAction={(onClose) => handleRevoke(onClose)}
                />
            </Modal.Window>

            <Modal.Window name={`approve-${invite.id}`} size="sm">
                <ConfirmContent
                    title={t("admin.onboarding.approveTitle")}
                    message={t("admin.onboarding.approveMessage", { name: candidate })}
                    actionLabel={t("admin.onboarding.approve")}
                    actionVariant="success"
                    onAction={(onClose) => handleReview("APPROVED", onClose)}
                />
            </Modal.Window>

            <Modal.Window name={`reject-${invite.id}`} size="sm">
                <ConfirmContent
                    title={t("admin.onboarding.rejectTitle")}
                    message={t("admin.onboarding.rejectMessage", { name: candidate })}
                    actionLabel={t("admin.onboarding.reject")}
                    actionVariant="danger"
                    onAction={(onClose) => handleReview("REJECTED", onClose)}
                />
            </Modal.Window>

            <Modal.Window name={`delete-${invite.id}`} size="sm">
                <ConfirmContent
                    title={t("admin.onboarding.deleteTitle")}
                    message={t("admin.onboarding.deleteMessage", { name: candidate })}
                    actionLabel={t("admin.onboarding.delete")}
                    actionVariant="danger"
                    onAction={(onClose) => handleDelete(onClose)}
                />
            </Modal.Window>
        </Modal>
    );
}

/* ─── Confirm modal body ─────────────────────────────────────── */

function ConfirmContent({
    title,
    message,
    actionLabel,
    actionVariant,
    onAction,
    onCloseModal,
}: {
    title: string;
    message: string;
    actionLabel: string;
    actionVariant: "danger" | "success";
    onAction: (onClose?: () => void) => void;
    onCloseModal?: () => void;
}) {
    const t = useTranslations();
    const [loading, setLoading] = useState(false);

    const colorClasses =
        actionVariant === "danger"
            ? "bg-rose-600 hover:bg-rose-500 shadow-rose-900/20"
            : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20";

    function handleClick() {
        setLoading(true);
        onAction(() => {
            setLoading(false);
            onCloseModal?.();
        });
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                    {message}
                </p>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCloseModal}
                    disabled={loading}
                    className="rounded-xl border border-border dark:border-white/10 bg-card px-5 py-2.5 text-sm font-medium text-muted transition-all hover:border-border-strong hover:text-foreground active:scale-95 disabled:opacity-50"
                >
                    {t("admin.onboarding.cancel")}
                </button>

                <button
                    type="button"
                    onClick={handleClick}
                    disabled={loading}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 ${colorClasses}`}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t("admin.onboarding.processing")}
                        </span>
                    ) : (
                        actionLabel
                    )}
                </button>
            </div>
        </div>
    );
}
