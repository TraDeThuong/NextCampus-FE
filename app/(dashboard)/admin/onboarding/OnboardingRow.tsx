"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    MoreHorizontal,
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

function statusBadge(status: string, colors: Record<string, string>) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${colors[status] ?? "border-zinc-700 text-zinc-400"}`}
        >
            {status}
        </span>
    );
}

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

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

interface Props {
    invite: ApplicationInviteRow;
}

export default function OnboardingRow({ invite }: Props) {
    const t = useTranslations();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
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

    function handleRevoke() {
        revokeInvite(invite.id);
        setMenuOpen(false);
    }

    function handleReview(status: "APPROVED" | "REJECTED") {
        if (!invite.application) return;
        if (
            status === "APPROVED" &&
            (!assignedDepartmentId || !assignedPositionId)
        ) {
            toast.error(t("admin.onboarding.assignDeptPositionFirst"));
            return;
        }
        reviewApp({ id: invite.application.id, payload: { status } });
        setMenuOpen(false);
    }

    function handleDelete() {
        if (!invite.application) return;
        deleteApp(invite.application.id);
        setMenuOpen(false);
    }

    function handleView() {
        setMenuOpen(false);
        const params = new URLSearchParams(window.location.search);
        params.set("Id", invite.id);
        params.set("view", "modal");
        router.push(`/admin/onboarding?${params.toString()}`);
    }

    return (
        <Table.Row>
            {/* Candidate */}
            <div className="min-w-0">
                <p
                    className="truncate text-sm font-medium text-foreground cursor-pointer hover:text-cyan-400 transition"
                    onClick={handleView}
                >
                    {candidate}
                </p>
                {!invite.application && (
                    <p className="truncate text-xs text-muted">
                        {invite.email}
                    </p>
                )}
                {application?.preferredDepartment && (
                    <p className="truncate text-xs text-slate-500">
                        {t("admin.onboarding.prefers")} {application.preferredDepartment}
                        {application.preferredPosition
                            ? ` · ${application.preferredPosition}`
                            : ""}
                    </p>
                )}
            </div>

            {/* Department */}
            <div className="min-w-0 text-sm text-muted">
                {canAssign ? (
                    <InlineSelect
                        ariaLabel="Assigned department"
                        value={assignedDepartmentId}
                        placeholder={
                            application?.preferredDepartment
                                ? `Assign (${application.preferredDepartment})`
                                : t("admin.onboarding.assignDepartment")
                        }
                        loading={assigning}
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
            <div className="min-w-0 text-sm text-muted">
                {canAssign ? (
                    <InlineSelect
                        ariaLabel="Assigned position"
                        value={assignedPositionId}
                        placeholder={
                            assignedDepartmentId
                                ? application?.preferredPosition
                                    ? `Assign (${application.preferredPosition})`
                                    : t("admin.onboarding.assignPosition")
                                : t("admin.onboarding.departmentFirst")
                        }
                        loading={assigning}
                        disabled={!assignedDepartmentId}
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
            <div>{statusBadge(invite.status, INVITE_COLORS)}</div>

            {/* Application Status */}
            <div>
                {appStatus ? (
                    statusBadge(appStatus, APP_COLORS)
                ) : (
                    <span className="text-xs text-muted">—</span>
                )}
            </div>

            {/* Sent At */}
            <div className="text-sm text-muted">
                {formatDate(invite.createdAt)}
            </div>

            {/* Actions */}
            <div
                className="relative flex justify-end"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(!menuOpen);
                    }}
                    disabled={isBusy}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-muted transition-all hover:border-border-strong hover:text-foreground disabled:opacity-50"
                >
                    {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <MoreHorizontal className="h-4 w-4" />
                    )}
                </button>

                {menuOpen && !isBusy && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(false);
                            }}
                        />
                        <div
                            className="absolute right-0 top-full z-20 mt-2 w-48 rounded-2xl border border-border bg-card py-2 shadow-glass backdrop-blur-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* ACTIVE: Copy link + View + {t("admin.onboarding.revoke")} */}
                            {invite.status === "ACTIVE" && (
                                <>
                                    <button
                                        onClick={handleView}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-card-hover"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        {t("admin.onboarding.viewDetails")}
                                    </button>

                                    <button
                                        onClick={() => {
                                            handleCopyLink();
                                            setMenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-card-hover"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                        {copied ? t("admin.onboarding.copied") : t("admin.onboarding.copyLink")}
                                    </button>

                                    <div onClick={() => setMenuOpen(false)}>
                                        <Modal.Open
                                            opens={`revoke-${invite.id}`}
                                        >
                                            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-card-hover">
                                                <Ban className="h-3.5 w-3.5" />
                                                {t("admin.onboarding.revoke")}
                                            </button>
                                        </Modal.Open>
                                    </div>
                                </>
                            )}

                            {/* USED + PENDING: View + {t("admin.onboarding.approve")} + {t("admin.onboarding.reject")} */}
                            {invite.status === "USED" &&
                                appStatus === "PENDING" && (
                                    <>
                                        <button
                                            onClick={handleView}
                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-card-hover"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            {t("admin.onboarding.viewApplication")}
                                        </button>

                                        <div
                                            onClick={() =>
                                                setMenuOpen(false)
                                            }
                                        >
                                            <Modal.Open
                                                opens={`approve-${invite.id}`}
                                            >
                                                <button
                                                    disabled={!assignedDepartmentId || !assignedPositionId}
                                                    title={
                                                        !assignedDepartmentId || !assignedPositionId
                                                            ? t("admin.onboarding.assignFirstTooltip")
                                                            : undefined
                                                    }
                                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-emerald-400 transition-colors hover:bg-card-hover disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    {t("admin.onboarding.approve")}
                                                </button>
                                            </Modal.Open>
                                        </div>

                                        <div
                                            onClick={() =>
                                                setMenuOpen(false)
                                            }
                                        >
                                            <Modal.Open
                                                opens={`reject-${invite.id}`}
                                            >
                                                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-card-hover">
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    {t("admin.onboarding.reject")}
                                                </button>
                                            </Modal.Open>
                                        </div>
                                    </>
                                )}

                            {/* USED + APPROVED: View */}
                            {invite.status === "USED" &&
                                appStatus === "APPROVED" && (
                                    <button
                                        onClick={handleView}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-card-hover"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        {t("admin.onboarding.viewApplication")}
                                    </button>
                                )}

                            {/* USED + REJECTED: View + {t("admin.onboarding.delete")} */}
                            {invite.status === "USED" &&
                                appStatus === "REJECTED" && (
                                    <>
                                        <button
                                            onClick={handleView}
                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-card-hover"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            {t("admin.onboarding.viewApplication")}
                                        </button>

                                        <div
                                            onClick={() =>
                                                setMenuOpen(false)
                                            }
                                        >
                                            <Modal.Open
                                                opens={`delete-${invite.id}`}
                                            >
                                                <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-card-hover">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    {t("admin.onboarding.delete")}
                                                </button>
                                            </Modal.Open>
                                        </div>
                                    </>
                                )}

                            {/* EXPIRED / REVOKED: View + Resend */}
                            {(invite.status === "EXPIRED" ||
                                invite.status === "REVOKED") && (
                                <>
                                    <button
                                        onClick={handleView}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-card-hover"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        {t("admin.onboarding.viewDetails")}
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            createInvite({
                                                email: invite.email,
                                            });
                                            setMenuOpen(false);
                                        }}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-card-hover"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                        {t("admin.onboarding.resendInvite")}
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ─── Confirm Modals ─────────────────────────────── */}

            <Modal.Window name={`revoke-${invite.id}`} size="sm">
                <ConfirmContent
                    title={t("admin.onboarding.revokeTitle")}
                    message={t("admin.onboarding.revokeMessage", { email: invite.email })}
                    actionLabel={t("admin.onboarding.revoke")}
                    actionVariant="danger"
                    onAction={handleRevoke}
                />
            </Modal.Window>

            <Modal.Window name={`approve-${invite.id}`} size="sm">
                <ConfirmContent
                    title={t("admin.onboarding.approveTitle")}
                    message={t("admin.onboarding.approveMessage", { name: candidate })}
                    actionLabel={t("admin.onboarding.approve")}
                    actionVariant="success"
                    onAction={() => handleReview("APPROVED")}
                />
            </Modal.Window>

            <Modal.Window name={`reject-${invite.id}`} size="sm">
                <ConfirmContent
                    title={t("admin.onboarding.rejectTitle")}
                    message={t("admin.onboarding.rejectMessage", { name: candidate })}
                    actionLabel={t("admin.onboarding.reject")}
                    actionVariant="danger"
                    onAction={() => handleReview("REJECTED")}
                />
            </Modal.Window>

            <Modal.Window name={`delete-${invite.id}`} size="sm">
                <ConfirmContent
                    title={t("admin.onboarding.deleteTitle")}
                    message={t("admin.onboarding.deleteMessage", { name: candidate })}
                    actionLabel={t("admin.onboarding.delete")}
                    actionVariant="danger"
                    onAction={handleDelete}
                />
            </Modal.Window>
        </Table.Row>
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
    onAction: () => void;
    onCloseModal?: () => void;
}) {
    const t = useTranslations();
    const [loading, setLoading] = useState(false);

    const colorClasses =
        actionVariant === "danger"
            ? "bg-red-500 hover:bg-red-600"
            : "bg-emerald-500 hover:bg-emerald-600";

    function handleClick() {
        setLoading(true);
        onAction();
        onCloseModal?.();
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
                <Modal.Open opens="">
                    <button className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted transition-all hover:border-border-strong hover:text-foreground">
                        {t("admin.onboarding.cancel")}
                    </button>
                </Modal.Open>

                <button
                    onClick={handleClick}
                    disabled={loading}
                    className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 ${colorClasses}`}
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
