"use client";

import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Building2,
  Briefcase,
  AlertTriangle,
  Paperclip,
  Download,
} from "lucide-react";

import { useInviteDetail } from "@/hooks/application/useInviteDetail";
import { useReviewApplication } from "@/hooks/application/useReviewApplication";
import { useRevokeInvite } from "@/hooks/application/useRevokeInvite";
import { useDeleteApplication } from "@/hooks/application/useDeleteApplication";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

function statusBadge(status: string, colors: Record<string, string>) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${colors[status] ?? "border-zinc-700 text-zinc-400"}`}
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
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
        <Icon className="h-4 w-4 text-[var(--primary-light)]" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

interface Props {
  id: string;
}

export default function ApplicationDetail({ id }: Props) {
  const router = useRouter();
  const { data, isPending, isError } = useInviteDetail(id);
  const { mutate: reviewApp, isPending: reviewing } = useReviewApplication();
  const { mutate: revokeInvite, isPending: revoking } = useRevokeInvite();
  const { mutate: deleteApp, isPending: deleting } = useDeleteApplication();

  const invite = data?.data;
  const isBusy = reviewing || revoking || deleting;

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !invite) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <AlertTriangle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-red-300">Failed to load invite details.</p>
      </div>
    );
  }

  const app = invite.application;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {app ? app.fullName : invite.email}
          </h1>
          <p className="mt-1 text-sm text-muted">{invite.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge(invite.status, INVITE_COLORS)}
          {app && statusBadge(app.status, APP_COLORS)}
        </div>
      </div>

      {/* Invite Info */}
      <MetalCard className="p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--primary-light)]">
          Invitation Details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailRow
            icon={Mail}
            label="Email"
            value={invite.email}
          />
          <DetailRow
            icon={Clock}
            label="Created"
            value={formatDateTime(invite.createdAt)}
          />
          <DetailRow
            icon={Calendar}
            label="Expires"
            value={formatDateTime(invite.expiresAt)}
          />
          {invite.usedAt && (
            <DetailRow
              icon={Calendar}
              label="Used At"
              value={formatDateTime(invite.usedAt)}
            />
          )}
        </div>
      </MetalCard>

      {/* Application Info */}
      {app && (
        <MetalCard className="p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[var(--primary-light)]">
            Application Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailRow icon={Mail} label="Full Name" value={app.fullName} />
            <DetailRow icon={Mail} label="Email" value={app.email} />
            <DetailRow icon={Phone} label="Phone" value={app.phone} />
            <DetailRow
              icon={Building2}
              label="Preferred Department"
              value={app.preferredDepartment ?? "—"}
            />
            <DetailRow
              icon={Briefcase}
              label="Preferred Position"
              value={app.preferredPosition ?? "—"}
            />
            <DetailRow
              icon={Building2}
              label="Assigned Department"
              value={app.department?.name ?? "—"}
            />
            <DetailRow
              icon={Briefcase}
              label="Assigned Position"
              value={app.position?.name ?? "—"}
            />
            <DetailRow
              icon={Calendar}
              label="Start Date"
              value={formatDate(app.startDate)}
            />
            <DetailRow
              icon={Clock}
              label="Duration"
              value={`${app.duration} months`}
            />
            <DetailRow
              icon={Calendar}
              label="Submitted"
              value={formatDateTime(app.createdAt)}
            />
          </div>
        </MetalCard>
      )}

      {app && app.attachments && app.attachments.length > 0 && (
        <MetalCard className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Paperclip className="h-4 w-4 shrink-0 text-cyan-400" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--primary-light)]">
              Attachments ({app.attachments.length})
            </h2>
          </div>

          <div className="space-y-2">
            {app.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-cyan-400/20 hover:bg-white/10"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                  <Paperclip className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground transition group-hover:text-cyan-300">
                    {attachment.fileName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatFileSize(attachment.fileSize)} · {attachment.mimeType}
                  </p>
                </div>
                <Download className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-cyan-400" />
              </a>
            ))}
          </div>
        </MetalCard>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {invite.status === "ACTIVE" && (
          <Button
            variant="danger"
            disabled={isBusy}
            onClick={() => {
              revokeInvite(invite.id, {
                onSuccess: () => router.back(),
              });
            }}
          >
            {revoking ? "Revoking..." : "Revoke Invite"}
          </Button>
        )}

        {invite.status === "USED" && app?.status === "PENDING" && (
          <>
            <Button
              variant="primary"
              disabled={isBusy || !app.department || !app.position}
              title={
                !app.department || !app.position
                  ? "Assign a department and position in the onboarding table first"
                  : undefined
              }
              onClick={() => {
                reviewApp(
                  { id: app.id, payload: { status: "APPROVED" } },
                  { onSuccess: () => router.back() },
                );
              }}
            >
              {reviewing ? "Approving..." : "Approve"}
            </Button>
            <Button
              variant="danger"
              disabled={isBusy}
              onClick={() => {
                reviewApp(
                  { id: app.id, payload: { status: "REJECTED" } },
                  { onSuccess: () => router.back() },
                );
              }}
            >
              {reviewing ? "Rejecting..." : "Reject"}
            </Button>
          </>
        )}

        {invite.status === "USED" && app?.status === "REJECTED" && (
          <Button
            variant="danger"
            disabled={isBusy}
            onClick={() => {
              deleteApp(app.id, {
                onSuccess: () => router.back(),
              });
            }}
          >
            {deleting ? "Deleting..." : "Delete Application"}
          </Button>
        )}
      </div>
    </div>
  );
}
