"use client";

import { useState } from "react";
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
  ExternalLink,
  Loader2,
  User,
  UserCheck,
  Copy,
  Check,
  Ban,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Sparkles,
  FileText,
} from "lucide-react";

import { useInviteDetail } from "@/hooks/application/useInviteDetail";
import { useReviewApplication } from "@/hooks/application/useReviewApplication";
import { useRevokeInvite } from "@/hooks/application/useRevokeInvite";
import { useDeleteApplication } from "@/hooks/application/useDeleteApplication";
import { useCreateInvite } from "@/hooks/application/useCreateInvite";
import { useAssignApplication } from "@/hooks/application/useAssignApplication";
import { useDepartments } from "@/hooks/department/useDepartments";
import { usePositions } from "@/hooks/department/usePositions";

import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import InlineSelect from "@/components/ui/InlineSelect";
import Modal from "@/components/ui/Modal";

const INVITE_COLORS: Record<string, string> = {
  UNUSED: "border-sky-500/30 text-sky-400 bg-sky-500/10",
  ACTIVE: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
  USED: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  EXPIRED: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  REVOKED: "border-rose-500/30 text-rose-400 bg-rose-500/10",
};

const APP_COLORS: Record<string, string> = {
  PENDING: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  APPROVED: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  REJECTED: "border-rose-500/30 text-rose-400 bg-rose-500/10",
};

function formatDate(dateStr: string | null | undefined, locale: string = "vi") {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString(
      locale === "vi" ? "vi-VN" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string | null | undefined, locale: string = "vi") {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString(
      locale === "vi" ? "vi-VN" : "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  } catch {
    return dateStr;
  }
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
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border/50 dark:border-white/5 bg-card/40 dark:bg-white/[0.02] p-3.5 sm:p-4 transition hover:border-cyan-400/20">
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border dark:border-white/10 bg-card/80 dark:bg-white/[0.04]">
          <Icon className="h-4 w-4 text-cyan-400 shrink-0" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {label}
          </p>
          <div className="mt-1 text-sm font-medium text-foreground break-words">
            {value}
          </div>
        </div>
      </div>
      {action && <div className="shrink-0 pt-1">{action}</div>}
    </div>
  );
}

interface Props {
  id: string;
  isModal?: boolean;
  onClose?: () => void;
}

export default function ApplicationDetail({ id, isModal, onClose }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [copied, setCopied] = useState(false);

  const { data, isPending, isError, refetch } = useInviteDetail(id);
  const { mutate: reviewApp, isPending: reviewing } = useReviewApplication();
  const { mutate: revokeInvite, isPending: revoking } = useRevokeInvite();
  const { mutate: deleteApp, isPending: deleting } = useDeleteApplication();
  const { mutate: createInvite, isPending: resending } = useCreateInvite();
  const { mutate: assignApplication, isPending: assigning } =
    useAssignApplication();

  const invite = data?.data;
  const app = invite?.application;
  const appStatus = app?.status ?? null;
  const canAssign = invite?.status === "USED" && appStatus === "PENDING";
  const assignedDepartmentId = app?.department?.id ?? null;
  const assignedPositionId = app?.position?.id ?? null;

  const { data: departmentData } = useDepartments();
  const departments = departmentData?.data ?? [];
  const { data: positionData } = usePositions(
    assignedDepartmentId ?? undefined,
  );
  const positions = positionData?.data ?? [];

  const isBusy =
    reviewing || revoking || deleting || resending || assigning;

  function handleCopyLink() {
    if (!invite?.token) return;
    const link = `${window.location.origin}/onboarding/${invite.token}/policies`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success(t("admin.onboarding.copied"));
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDepartmentChange(departmentId: string | null) {
    if (!app || !canAssign) return;
    assignApplication({
      id: app.id,
      payload: { departmentId, positionId: null },
    });
  }

  function handlePositionChange(positionId: string | null) {
    if (!app || !canAssign || !assignedDepartmentId) return;
    assignApplication({
      id: app.id,
      payload: { departmentId: assignedDepartmentId, positionId },
    });
  }

  function handleRevoke(onCloseModal?: () => void) {
    if (!invite) return;
    revokeInvite(invite.id, {
      onSuccess: () => {
        toast.success(t("admin.onboarding.revokeSuccess"));
        onCloseModal?.();
        onClose?.();
        if (!isModal) router.push("/admin/onboarding");
      },
      onError: () => toast.error(t("admin.onboarding.revokeError")),
    });
  }

  function handleReview(
    status: "APPROVED" | "REJECTED",
    onCloseModal?: () => void,
  ) {
    if (!app) return;
    if (
      status === "APPROVED" &&
      (!assignedDepartmentId || !assignedPositionId)
    ) {
      toast.error(t("admin.onboarding.assignDeptPositionFirst"));
      return;
    }
    reviewApp(
      { id: app.id, payload: { status } },
      {
        onSuccess: () => {
          if (status === "APPROVED") {
            toast.success(t("admin.onboarding.approveSuccess"));
          } else {
            toast.success(t("admin.onboarding.rejectSuccess"));
          }
          onCloseModal?.();
          onClose?.();
          if (!isModal) router.push("/admin/onboarding");
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

  function handleDelete(onCloseModal?: () => void) {
    if (!app) return;
    deleteApp(app.id, {
      onSuccess: () => {
        toast.success(t("admin.onboarding.deleteSuccess"));
        onCloseModal?.();
        onClose?.();
        if (!isModal) router.push("/admin/onboarding");
      },
      onError: () => toast.error(t("admin.onboarding.deleteError")),
    });
  }

  function handleResend() {
    if (!invite?.email) return;
    createInvite(
      { email: invite.email },
      {
        onSuccess: () => toast.success(t("admin.onboarding.createSuccess")),
        onError: () => toast.error(t("admin.onboarding.createError")),
      },
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-xs uppercase tracking-widest text-muted">
          {t("admin.onboarding.processing")}
        </p>
      </div>
    );
  }

  if (isError || !invite) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
          <AlertTriangle className="h-7 w-7 shrink-0" />
        </div>
        <div>
          <p className="text-base font-semibold text-rose-400">
            {t("admin.onboarding.loadDetailError")}
          </p>
          <p className="mt-1 text-xs text-muted">
            ID: {id}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-xl border border-border/80 dark:border-white/10 bg-card px-4 py-2 text-xs font-medium text-foreground transition hover:border-cyan-400/40 hover:text-cyan-400 active:scale-95"
        >
          <RefreshCw className="h-3.5 w-3.5 shrink-0" />
          {t("admin.onboarding.resendInvite")}
        </button>
      </div>
    );
  }

  const candidateName = app ? app.fullName : invite.email;
  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/onboarding/${invite.token}/policies`;

  return (
    <Modal>
      <div className="space-y-6">
        {/* ─── Profile Header Banner ─────────────────────────────────── */}
        <MetalCard className="relative overflow-hidden p-5 sm:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start sm:items-center gap-4 min-w-0">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 text-cyan-300 font-bold text-xl shadow-[0_0_25px_rgba(21,174,245,0.2)]">
                {app?.fullName ? (
                  app.fullName.charAt(0).toUpperCase()
                ) : (
                  <User className="h-7 w-7 shrink-0" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate" title={candidateName}>
                    {candidateName}
                  </h1>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted">
                  <span className="flex items-center gap-1.5 truncate" title={invite.email}>
                    <Mail className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                    {invite.email}
                  </span>
                  {app?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                      {app.phone}
                    </span>
                  )}
                  {invite.creator && (
                    <span className="text-muted/70 text-xs">
                      · {t("admin.onboarding.colSent")}: {invite.creator.fullName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Badges & Quick Action */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider whitespace-nowrap shadow-sm ${
                  INVITE_COLORS[invite.status] ?? "border-zinc-700 text-zinc-400"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {t(`admin.onboarding.inviteStatus_${invite.status}`)}
              </span>

              {app && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider whitespace-nowrap shadow-sm ${
                    APP_COLORS[app.status] ?? "border-zinc-700 text-zinc-400"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {t(`admin.onboarding.appStatus_${app.status}`)}
                </span>
              )}
            </div>
          </div>
        </MetalCard>

        {/* ─── Two-Column Info Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Card: Chi tiết Lời mời */}
          <MetalCard className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-cyan-400">
                {t("admin.onboarding.invitationDetails")}
              </h2>
            </div>

            <div className="space-y-3">
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
              <DetailRow
                icon={CheckCircle2}
                label={t("admin.onboarding.detailUsedAt")}
                value={invite.usedAt ? formatDateTime(invite.usedAt, locale) : "—"}
              />

              {/* Invitation URL Box */}
              <div className="mt-4 rounded-xl border border-border/60 dark:border-white/5 bg-card/60 dark:bg-white/[0.02] p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">
                  {t("admin.onboarding.inviteUrl")}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg bg-black/40 border border-white/5 px-2.5 py-1.5 text-xs text-cyan-300/90 font-mono select-all">
                    {inviteUrl}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    title={t("admin.onboarding.copyLink")}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/80 dark:border-white/10 bg-card text-muted hover:text-cyan-400 hover:border-cyan-400/40 active:scale-95 transition"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-sky-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </MetalCard>

          {/* Card: Hồ sơ Ứng tuyển */}
          <MetalCard className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <UserCheck className="h-4 w-4 text-cyan-400 shrink-0" />
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-cyan-400">
                {t("admin.onboarding.applicationDetails")}
              </h2>
            </div>

            {app ? (
              <div className="space-y-3">
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
                  value={
                    app.phone ? (
                      <a
                        href={`tel:${app.phone}`}
                        className="text-cyan-400 hover:underline"
                      >
                        {app.phone}
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
                <DetailRow
                  icon={Calendar}
                  label={t("admin.onboarding.detailStartDate")}
                  value={formatDate(app.startDate, locale)}
                />
                <DetailRow
                  icon={Clock}
                  label={t("admin.onboarding.detailDuration")}
                  value={t("admin.onboarding.durationMonths", {
                    count: app.duration,
                  })}
                />
                <DetailRow
                  icon={Calendar}
                  label={t("admin.onboarding.detailSubmitted")}
                  value={formatDateTime(app.createdAt, locale)}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-white/10 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10 text-muted">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {t("admin.onboarding.noApplicationYet")}
                </h3>
                <p className="mt-1 text-xs text-muted max-w-sm leading-relaxed">
                  {t("admin.onboarding.noApplicationDescription")}
                </p>
              </div>
            )}
          </MetalCard>
        </div>

        {/* ─── Phân công Phòng ban & Vị trí ─────────────────────────── */}
        {app && (
          <MetalCard className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <Building2 className="h-4 w-4 text-cyan-400 shrink-0" />
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-cyan-400">
                {t("admin.onboarding.assignmentTitle")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nguyện vọng của ứng viên */}
              <div className="space-y-3 rounded-2xl border border-border/50 dark:border-white/5 bg-card/40 dark:bg-white/[0.02] p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    {t("admin.onboarding.applicantPreferences")}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-medium text-muted uppercase tracking-wider">
                      {t("admin.onboarding.detailPreferredDept")}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {app.preferredDepartment || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium text-muted uppercase tracking-wider">
                      {t("admin.onboarding.detailPreferredPos")}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {app.preferredPosition || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phân công chính thức */}
              <div className="space-y-4 rounded-2xl border border-border/50 dark:border-white/5 bg-card/40 dark:bg-white/[0.02] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                      {t("admin.onboarding.officialAssignment")}
                    </p>
                  </div>
                  {assigning && (
                    <span className="flex items-center gap-1.5 text-xs text-cyan-400 animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {t("admin.onboarding.processing")}
                    </span>
                  )}
                </div>

                {canAssign ? (
                  <div className="space-y-3">
                    {/* Gán phòng ban */}
                    <div>
                      <label className="block text-[11px] font-medium text-muted uppercase tracking-wider mb-1.5">
                        {t("admin.onboarding.assignedDepartment")}
                      </label>
                      <InlineSelect
                        ariaLabel={t("admin.onboarding.assignedDepartment")}
                        value={assignedDepartmentId}
                        placeholder={
                          app.preferredDepartment
                            ? t("admin.onboarding.assignWith", {
                                name: app.preferredDepartment,
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
                    </div>

                    {/* Gán vị trí */}
                    <div>
                      <label className="block text-[11px] font-medium text-muted uppercase tracking-wider mb-1.5">
                        {t("admin.onboarding.assignedPosition")}
                      </label>
                      <InlineSelect
                        ariaLabel={t("admin.onboarding.assignedPosition")}
                        value={assignedPositionId}
                        placeholder={
                          assignedDepartmentId
                            ? app.preferredPosition
                              ? t("admin.onboarding.assignWith", {
                                  name: app.preferredPosition,
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
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] font-medium text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        {t("admin.onboarding.assignedDepartment")}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {app.department?.name ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-muted uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        {t("admin.onboarding.assignedPosition")}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {app.position?.name ?? "—"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </MetalCard>
        )}

        {/* ─── Tài liệu đính kèm & CV ─────────────────────────────────── */}
        {app && app.attachments && app.attachments.length > 0 && (
          <MetalCard className="p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <Paperclip className="h-4 w-4 text-cyan-400 shrink-0" />
              <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] text-cyan-400">
                {t("admin.onboarding.attachments", {
                  count: app.attachments.length,
                })}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {app.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border dark:border-white/10 bg-card/60 dark:bg-white/5 p-3.5 transition hover:border-cyan-400/40 hover:bg-card"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-400">
                      <Paperclip className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground transition group-hover:text-cyan-400" title={attachment.fileName}>
                        {attachment.fileName}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatFileSize(attachment.fileSize)} · {attachment.mimeType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={t("admin.onboarding.viewFile")}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 dark:border-white/10 bg-card text-muted hover:text-cyan-400 hover:border-cyan-400/40 active:scale-95 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={attachment.fileUrl}
                      download={attachment.fileName}
                      title={t("admin.onboarding.downloadFile")}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 dark:border-white/10 bg-card text-muted hover:text-cyan-400 hover:border-cyan-400/40 active:scale-95 transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </MetalCard>
        )}

        {/* ─── Thanh Thao tác (Action Bar) ────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          {/* Lời mời chưa sử dụng hoặc đang hoạt động */}
          {(invite.status === "ACTIVE" || invite.status === "UNUSED") && (
            <Modal.Open opens="revoke">
              <Button
                variant="danger"
                disabled={isBusy}
                className="rounded-xl px-5 py-2.5 text-sm font-medium"
              >
                <Ban className="h-4 w-4 shrink-0 mr-1.5" />
                {t("admin.onboarding.revoke")}
              </Button>
            </Modal.Open>
          )}

          {/* Đơn đang chờ duyệt */}
          {invite.status === "USED" && app?.status === "PENDING" && (
            <>
              <Modal.Open opens="reject">
                <Button
                  variant="danger"
                  disabled={isBusy}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium"
                >
                  <XCircle className="h-4 w-4 shrink-0 mr-1.5" />
                  {t("admin.onboarding.reject")}
                </Button>
              </Modal.Open>

              <Modal.Open opens="approve">
                <Button
                  variant="primary"
                  disabled={isBusy || !assignedDepartmentId || !assignedPositionId}
                  title={
                    !assignedDepartmentId || !assignedPositionId
                      ? t("admin.onboarding.assignDeptPositionFirst")
                      : undefined
                  }
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 mr-1.5" />
                  {t("admin.onboarding.approve")}
                </Button>
              </Modal.Open>
            </>
          )}

          {/* Đơn đã từ chối */}
          {invite.status === "USED" && app?.status === "REJECTED" && (
            <Modal.Open opens="delete">
              <Button
                variant="danger"
                disabled={isBusy}
                className="rounded-xl px-5 py-2.5 text-sm font-medium"
              >
                <Trash2 className="h-4 w-4 shrink-0 mr-1.5" />
                {t("admin.onboarding.delete")}
              </Button>
            </Modal.Open>
          )}

          {/* Lời mời đã hết hạn hoặc thu hồi */}
          {(invite.status === "EXPIRED" || invite.status === "REVOKED") && (
            <Button
              variant="primary"
              disabled={isBusy}
              onClick={handleResend}
              className="rounded-xl px-5 py-2.5 text-sm font-medium"
            >
              {resending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("admin.onboarding.processing")}
                </span>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 shrink-0 mr-1.5" />
                  {t("admin.onboarding.resendInvite")}
                </>
              )}
            </Button>
          )}
        </div>

        {/* ─── Confirm Modals ─────────────────────────────────────────── */}
        <Modal.Window name="revoke" size="sm">
          <ConfirmContent
            title={t("admin.onboarding.revokeTitle")}
            message={t("admin.onboarding.revokeMessage", {
              email: invite.email,
            })}
            actionLabel={t("admin.onboarding.revoke")}
            actionVariant="danger"
            onAction={(onCloseModal) => handleRevoke(onCloseModal)}
          />
        </Modal.Window>

        <Modal.Window name="approve" size="sm">
          <ConfirmContent
            title={t("admin.onboarding.approveTitle")}
            message={t("admin.onboarding.approveMessage", {
              name: candidateName,
            })}
            actionLabel={t("admin.onboarding.approve")}
            actionVariant="success"
            onAction={(onCloseModal) => handleReview("APPROVED", onCloseModal)}
          />
        </Modal.Window>

        <Modal.Window name="reject" size="sm">
          <ConfirmContent
            title={t("admin.onboarding.rejectTitle")}
            message={t("admin.onboarding.rejectMessage", {
              name: candidateName,
            })}
            actionLabel={t("admin.onboarding.reject")}
            actionVariant="danger"
            onAction={(onCloseModal) => handleReview("REJECTED", onCloseModal)}
          />
        </Modal.Window>

        <Modal.Window name="delete" size="sm">
          <ConfirmContent
            title={t("admin.onboarding.deleteTitle")}
            message={t("admin.onboarding.deleteMessage", {
              name: candidateName,
            })}
            actionLabel={t("admin.onboarding.delete")}
            actionVariant="danger"
            onAction={(onCloseModal) => handleDelete(onCloseModal)}
          />
        </Modal.Window>
      </div>
    </Modal>
  );
}

/* ─── Confirm modal body ─────────────────────────────────────────────── */

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
        <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
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
