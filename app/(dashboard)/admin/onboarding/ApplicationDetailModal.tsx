"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "react-hot-toast";
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
  Loader2,
  User,
} from "lucide-react";

import { useInviteDetail } from "@/hooks/application/useInviteDetail";
import { useReviewApplication } from "@/hooks/application/useReviewApplication";
import { useRevokeInvite } from "@/hooks/application/useRevokeInvite";
import { useDeleteApplication } from "@/hooks/application/useDeleteApplication";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

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
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleString(locale === "vi" ? "vi-VN" : "en-US", {
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
      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border dark:border-white/10 bg-card/60 dark:bg-white/[0.03]">
        <Icon className="h-4 w-4 text-cyan-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

interface Props {
  id: string;
}

export default function ApplicationDetail({ id }: Props) {
  const t = useTranslations();
  const locale = useLocale();
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
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertTriangle className="h-8 w-8 text-rose-400" />
        <p className="text-sm text-rose-300">
          {t("admin.onboarding.loadDetailError")}
        </p>
      </div>
    );
  }

  const app = invite.application;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-400/20">
            <User className="h-6 w-6 shrink-0" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {app ? app.fullName : invite.email}
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-muted">{invite.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wider ${
              INVITE_COLORS[invite.status] ?? "border-zinc-700 text-zinc-400"
            }`}
          >
            {t(`admin.onboarding.inviteStatus_${invite.status}`)}
          </span>

          {app && (
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wider ${
                APP_COLORS[app.status] ?? "border-zinc-700 text-zinc-400"
              }`}
            >
              {t(`admin.onboarding.appStatus_${app.status}`)}
            </span>
          )}
        </div>
      </div>

      {/* Invite Info */}
      <MetalCard className="p-5 sm:p-6">
        <h2 className="mb-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-cyan-400">
          {t("admin.onboarding.invitationDetails")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailRow
            icon={Mail}
            label={t("admin.onboarding.detailEmail")}
            value={invite.email}
          />
          <DetailRow
            icon={Clock}
            label={t("admin.onboarding.detailCreated")}
            value={formatDateTime(invite.createdAt, locale)}
          />
          <DetailRow
            icon={Calendar}
            label={t("admin.onboarding.detailExpires")}
            value={formatDateTime(invite.expiresAt, locale)}
          />
          {invite.usedAt && (
            <DetailRow
              icon={Calendar}
              label={t("admin.onboarding.detailUsedAt")}
              value={formatDateTime(invite.usedAt, locale)}
            />
          )}
        </div>
      </MetalCard>

      {/* Application Info */}
      {app && (
        <MetalCard className="p-5 sm:p-6">
          <h2 className="mb-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-cyan-400">
            {t("admin.onboarding.applicationDetails")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailRow
              icon={User}
              label={t("admin.onboarding.detailFullName")}
              value={app.fullName}
            />
            <DetailRow
              icon={Mail}
              label={t("admin.onboarding.detailEmail")}
              value={app.email}
            />
            <DetailRow
              icon={Phone}
              label={t("admin.onboarding.detailPhone")}
              value={app.phone}
            />
            <DetailRow
              icon={Building2}
              label={t("admin.onboarding.detailPreferredDept")}
              value={app.preferredDepartment ?? "—"}
            />
            <DetailRow
              icon={Briefcase}
              label={t("admin.onboarding.detailPreferredPos")}
              value={app.preferredPosition ?? "—"}
            />
            <DetailRow
              icon={Building2}
              label={t("admin.onboarding.detailAssignedDept")}
              value={app.department?.name ?? "—"}
            />
            <DetailRow
              icon={Briefcase}
              label={t("admin.onboarding.detailAssignedPos")}
              value={app.position?.name ?? "—"}
            />
            <DetailRow
              icon={Calendar}
              label={t("admin.onboarding.detailStartDate")}
              value={formatDate(app.startDate, locale)}
            />
            <DetailRow
              icon={Clock}
              label={t("admin.onboarding.detailDuration")}
              value={t("admin.onboarding.durationMonths", { count: app.duration })}
            />
            <DetailRow
              icon={Calendar}
              label={t("admin.onboarding.detailSubmitted")}
              value={formatDateTime(app.createdAt, locale)}
            />
          </div>
        </MetalCard>
      )}

      {/* Attachments */}
      {app && app.attachments && app.attachments.length > 0 && (
        <MetalCard className="p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Paperclip className="h-4 w-4 shrink-0 text-cyan-400" />
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-cyan-400">
              {t("admin.onboarding.attachments", { count: app.attachments.length })}
            </h2>
          </div>

          <div className="space-y-2">
            {app.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-border dark:border-white/10 bg-card/60 dark:bg-white/5 px-4 py-3 transition hover:border-cyan-400/30 hover:bg-card active:scale-[0.99]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-400/20">
                  <Paperclip className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground transition group-hover:text-cyan-400">
                    {attachment.fileName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatFileSize(attachment.fileSize)} · {attachment.mimeType}
                  </p>
                </div>
                <Download className="h-4 w-4 shrink-0 text-muted transition group-hover:text-cyan-400" />
              </a>
            ))}
          </div>
        </MetalCard>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        {invite.status === "ACTIVE" && (
          <Button
            variant="danger"
            disabled={isBusy}
            onClick={() => {
              revokeInvite(invite.id, {
                onSuccess: () => {
                  toast.success(t("admin.onboarding.revokeSuccess"));
                  router.back();
                },
                onError: () => toast.error(t("admin.onboarding.revokeError")),
              });
            }}
          >
            {revoking ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("admin.onboarding.revoking")}
              </span>
            ) : (
              t("admin.onboarding.revoke")
            )}
          </Button>
        )}

        {invite.status === "USED" && app?.status === "PENDING" && (
          <>
            <Button
              variant="primary"
              disabled={isBusy || !app.department || !app.position}
              title={
                !app.department || !app.position
                  ? t("admin.onboarding.assignDeptPositionFirst")
                  : undefined
              }
              onClick={() => {
                reviewApp(
                  { id: app.id, payload: { status: "APPROVED" } },
                  {
                    onSuccess: () => {
                      toast.success(t("admin.onboarding.approveSuccess"));
                      router.back();
                    },
                    onError: () =>
                      toast.error(t("admin.onboarding.approveError")),
                  },
                );
              }}
            >
              {reviewing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("admin.onboarding.approving")}
                </span>
              ) : (
                t("admin.onboarding.approve")
              )}
            </Button>

            <Button
              variant="danger"
              disabled={isBusy}
              onClick={() => {
                reviewApp(
                  { id: app.id, payload: { status: "REJECTED" } },
                  {
                    onSuccess: () => {
                      toast.success(t("admin.onboarding.rejectSuccess"));
                      router.back();
                    },
                    onError: () =>
                      toast.error(t("admin.onboarding.rejectError")),
                  },
                );
              }}
            >
              {reviewing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("admin.onboarding.rejecting")}
                </span>
              ) : (
                t("admin.onboarding.reject")
              )}
            </Button>
          </>
        )}

        {invite.status === "USED" && app?.status === "REJECTED" && (
          <Button
            variant="danger"
            disabled={isBusy}
            onClick={() => {
              deleteApp(app.id, {
                onSuccess: () => {
                  toast.success(t("admin.onboarding.deleteSuccess"));
                  router.back();
                },
                onError: () => toast.error(t("admin.onboarding.deleteError")),
              });
            }}
          >
            {deleting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("admin.onboarding.deleting")}
              </span>
            ) : (
              t("admin.onboarding.delete")
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
