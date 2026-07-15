"use client";

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
import type { ApplicationInviteRow } from "@/types/application";
import Modal from "@/components/ui/Modal";
import Table from "@/components/ui/Table";

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
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { mutate: revokeInvite, isPending: revoking } = useRevokeInvite();
  const { mutate: reviewApp, isPending: reviewing } = useReviewApplication();
  const { mutate: deleteApp, isPending: deleting } = useDeleteApplication();
  const { mutate: createInvite, isPending: resending } = useCreateInvite();

  const isBusy = revoking || reviewing || deleting || resending;

  const candidate = invite.application
    ? invite.application.fullName
    : invite.email;
  const department = invite.application?.department ?? "—";
  const position = invite.application?.position ?? "—";
  const appStatus = invite.application?.status ?? null;

  function handleCopyLink() {
    const link = `${window.location.origin}/apply?token=${invite.token ?? ""}`;
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
    reviewApp({ id: invite.application.id, payload: { status } });
    setMenuOpen(false);
  }

  function handleDelete() {
    if (!invite.application) return;
    deleteApp(invite.application.id);
    setMenuOpen(false);
  }

  return (
    <Table.Row>
      <div
        className="contents cursor-pointer"
        onClick={() => router.push(`/admin/onboarding/${invite.id}`)}
      >
      {/* Candidate */}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {candidate}
        </p>
        {!invite.application && (
          <p className="truncate text-xs text-muted">{invite.email}</p>
        )}
      </div>

      {/* Department */}
      <div className="truncate text-sm text-muted">{department}</div>

      {/* Position */}
      <div className="truncate text-sm text-muted">{position}</div>

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
              {/* ACTIVE: Copy link + Revoke */}
              {invite.status === "ACTIVE" && (
                <>
                  <button
                    onClick={() => {
                      handleCopyLink();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-card-hover"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? "Copied!" : "Copy link"}
                  </button>

                  <div onClick={() => setMenuOpen(false)}>
                    <Modal.Open opens={`revoke-${invite.id}`}>
                      <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-card-hover">
                        <Ban className="h-3.5 w-3.5" />
                        Revoke
                      </button>
                    </Modal.Open>
                  </div>
                </>
              )}

              {/* USED + PENDING: View detail + Approve + Reject */}
              {invite.status === "USED" && appStatus === "PENDING" && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      router.push(`/admin/onboarding/${invite.id}`);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-card-hover"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View application
                  </button>

                  <div onClick={() => setMenuOpen(false)}>
                    <Modal.Open opens={`approve-${invite.id}`}>
                      <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-emerald-400 transition-colors hover:bg-card-hover">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </button>
                    </Modal.Open>
                  </div>

                  <div onClick={() => setMenuOpen(false)}>
                    <Modal.Open opens={`reject-${invite.id}`}>
                      <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-card-hover">
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </Modal.Open>
                  </div>
                </>
              )}

              {/* USED + APPROVED: View detail */}
              {invite.status === "USED" && appStatus === "APPROVED" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    router.push(`/admin/onboarding/${invite.id}`);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-card-hover"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View application
                </button>
              )}

              {/* USED + REJECTED: View detail + Delete */}
              {invite.status === "USED" && appStatus === "REJECTED" && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      router.push(`/admin/onboarding/${invite.id}`);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-card-hover"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View application
                  </button>

                  <div onClick={() => setMenuOpen(false)}>
                    <Modal.Open opens={`delete-${invite.id}`}>
                      <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-card-hover">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </Modal.Open>
                  </div>
                </>
              )}

              {/* EXPIRED / REVOKED: Resend */}
              {(invite.status === "EXPIRED" ||
                invite.status === "REVOKED") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createInvite({ email: invite.email });
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors hover:bg-card-hover"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Resend invite
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── Confirm Modals ─────────────────────────────────────── */}

      <Modal.Window name={`revoke-${invite.id}`} size="sm">
        <ConfirmContent
          title="Revoke Invite"
          message={`Revoke the invitation for ${invite.email}? This cannot be undone.`}
          actionLabel="Revoke"
          actionVariant="danger"
          onAction={handleRevoke}
        />
      </Modal.Window>

      <Modal.Window name={`approve-${invite.id}`} size="sm">
        <ConfirmContent
          title="Approve Application"
          message={`Approve ${candidate}'s application? An intern account will be created automatically.`}
          actionLabel="Approve"
          actionVariant="success"
          onAction={() => handleReview("APPROVED")}
        />
      </Modal.Window>

      <Modal.Window name={`reject-${invite.id}`} size="sm">
        <ConfirmContent
          title="Reject Application"
          message={`Reject ${candidate}'s application? This action cannot be undone.`}
          actionLabel="Reject"
          actionVariant="danger"
          onAction={() => handleReview("REJECTED")}
        />
      </Modal.Window>

      <Modal.Window name={`delete-${invite.id}`} size="sm">
        <ConfirmContent
          title="Delete Application"
          message={`Delete ${candidate}'s rejected application? This is a soft delete.`}
          actionLabel="Delete"
          actionVariant="danger"
          onAction={handleDelete}
        />
      </Modal.Window>
      </div>
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
        <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
      </div>

      <div className="flex justify-end gap-3">
        <Modal.Open opens="">
          <button className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-muted transition-all hover:border-border-strong hover:text-foreground">
            Cancel
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
              Processing...
            </span>
          ) : (
            actionLabel
          )}
        </button>
      </div>
    </div>
  );
}
