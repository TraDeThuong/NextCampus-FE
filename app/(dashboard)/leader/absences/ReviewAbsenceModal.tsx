"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Calendar,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  Loader2,
  CalendarDays,
  Sun,
  Sunset,
  CalendarRange,
  GraduationCap,
  Stethoscope,
  Building,
  User,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import { useReviewAbsence } from "@/hooks/absence/useReviewAbsence";
import { useAbsenceConflicts } from "@/hooks/absence/useAbsenceConflicts";
import { useRBAC } from "@/hooks/rbac/useRBAC";
import type { Absence, AbsenceStatus, AbsenceDuration, AbsenceReasonType } from "@/types/absence";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  absence: Absence | null;
  onSuccess?: () => void;
}

interface FormContentProps {
  absence: Absence;
  onClose: () => void;
  onSuccess?: () => void;
}

function ReviewAbsenceFormContent({ absence, onClose, onSuccess }: FormContentProps) {
  const t = useTranslations("absences");
  const locale = useLocale();
  const reviewMutation = useReviewAbsence();
  const { can } = useRBAC();
  const canReview = can("ABSENCE_REVIEW");
  const isPendingReview = absence.status === "PENDING";

  const [reviewNote, setReviewNote] = useState(absence.reviewNote || "");
  const [autoExtendConflictTasks, setAutoExtendConflictTasks] = useState(true);
  const [rejectError, setRejectError] = useState("");

  const defaultExtendDays = useMemo(() => {
    try {
      const start = new Date(absence.startDate).getTime();
      const end = new Date(absence.endDate).getTime();
      return Math.max(1, Math.ceil((end - start) / (1000 * 3600 * 24)) + 1);
    } catch {
      return 2;
    }
  }, [absence.startDate, absence.endDate]);

  const [extendDays, setExtendDays] = useState(defaultExtendDays);

  // Lấy danh sách xung đột deadline task
  const { data: conflicts = [], isLoading: isLoadingConflicts } = useAbsenceConflicts(
    absence.id,
    true
  );

  const handleReview = async (status: AbsenceStatus) => {
    if (status === "REJECTED" && !reviewNote.trim()) {
      setRejectError(t("modal.rejectNoteRequired"));
      return;
    }
    setRejectError("");

    try {
      await reviewMutation.mutateAsync({
        id: absence.id,
        data: {
          status: status as "APPROVED" | "REJECTED",
          reviewNote: reviewNote.trim() || undefined,
          autoExtendConflictTasks:
            status === "APPROVED" && conflicts.length > 0 ? autoExtendConflictTasks : undefined,
          extendDays:
            status === "APPROVED" && conflicts.length > 0 && autoExtendConflictTasks
              ? extendDays
              : undefined,
        },
      });

      toast.success(t("toast.reviewSuccess"));
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t("toast.reviewError");
      toast.error(errorMsg);
    }
  };

  const renderDurationBadge = (duration: AbsenceDuration) => {
    switch (duration) {
      case "MORNING":
        return (
          <Badge variant="warning" size="sm" className="font-medium">
            <Sun className="h-3 w-3 shrink-0" />
            {t("duration.morningShort")}
          </Badge>
        );
      case "AFTERNOON":
        return (
          <Badge variant="purple" size="sm" className="font-medium">
            <Sunset className="h-3 w-3 shrink-0" />
            {t("duration.afternoonShort")}
          </Badge>
        );
      case "FULL_DAY":
        return (
          <Badge variant="primary" size="sm" className="font-medium">
            <CalendarDays className="h-3 w-3 shrink-0" />
            {t("duration.fullDayShort")}
          </Badge>
        );
      case "MULTI_DAY":
        return (
          <Badge variant="info" size="sm" className="font-medium">
            <CalendarRange className="h-3 w-3 shrink-0" />
            {t("duration.multiDayShort")}
          </Badge>
        );
    }
  };

  const renderReasonBadge = (type: AbsenceReasonType) => {
    switch (type) {
      case "EXAM":
        return (
          <Badge variant="purple" size="sm" className="font-medium">
            <GraduationCap className="h-3 w-3 shrink-0" />
            {t("reasonType.exam")}
          </Badge>
        );
      case "SICKNESS":
        return (
          <Badge variant="danger" size="sm" className="font-medium">
            <Stethoscope className="h-3 w-3 shrink-0" />
            {t("reasonType.sickness")}
          </Badge>
        );
      case "UNIVERSITY_EVENT":
        return (
          <Badge variant="info" size="sm" className="font-medium">
            <Building className="h-3 w-3 shrink-0" />
            {t("reasonType.universityEvent")}
          </Badge>
        );
      case "PERSONAL":
        return (
          <Badge variant="warning" size="sm" className="font-medium">
            <User className="h-3 w-3 shrink-0" />
            {t("reasonType.personal")}
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="sm" className="font-medium">
            <HelpCircle className="h-3 w-3 shrink-0" />
            {t("reasonType.other")}
          </Badge>
        );
    }
  };

  const isImageFile = (url: string | null) => {
    if (!url) return false;
    const cleanUrl = url.split("?")[0].toLowerCase();
    return (
      cleanUrl.endsWith(".png") ||
      cleanUrl.endsWith(".jpg") ||
      cleanUrl.endsWith(".jpeg") ||
      cleanUrl.endsWith(".webp")
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isPending = reviewMutation.isPending;

  return (
    <div className="flex flex-col">
      {/* 1. Sticky Header (Rule 44 & Rule 214-230 Compliant) */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-xl pb-3 sm:pb-4 pt-1 -mt-1 border-b border-border dark:border-white/10 pr-10 sm:pr-12">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <FileCheck className="h-5 w-5 shrink-0" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">
              {canReview && isPendingReview
                ? t("modal.reviewTitle")
                : t("table.detailBtn")}
            </h2>
            <p className="text-xs text-muted mt-0.5 truncate">{t("modal.reviewDesc")}</p>
          </div>
        </div>
      </div>

      {/* 2. Content Body (Seamless layout without dual scrollbars) */}
      <div className="space-y-4 sm:space-y-5 py-3 sm:py-4">
        {/* Thông tin Intern */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border shadow-xs flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-primary-main/15 border border-primary-main/30 flex items-center justify-center text-primary-main dark:text-cyan-400 font-bold text-sm shrink-0">
              {absence.user?.fullName
                ? absence.user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "TS"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-sm">
                  {absence.user?.fullName || t("table.defaultInternName")}
                </span>
                {absence.user?.intern?.internCode && (
                  <Badge variant="outline" size="sm">
                    {absence.user.intern.internCode}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted">{absence.user?.email || t("modal.noEmail")}</p>
            </div>
          </div>
          {absence.user?.intern?.department && (
            <div className="text-right">
              <span className="text-[11px] text-muted block">{t("modal.department")}</span>
              <span className="text-xs font-medium text-foreground">
                {absence.user.intern.department.name}
              </span>
            </div>
          )}
        </div>

        {/* Thông tin thời gian và lý do xin nghỉ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Thời gian */}
          <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-primary-main dark:text-cyan-400" />
              <span>{t("table.dateRange")}</span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {absence.durationUnit === "MULTI_DAY"
                ? `${formatDate(absence.startDate)} → ${formatDate(absence.endDate)}`
                : formatDate(absence.startDate)}
            </div>
            <div className="pt-1">{renderDurationBadge(absence.durationUnit)}</div>
          </div>

          {/* Phân loại lý do */}
          <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
              <Tag className="h-3.5 w-3.5 shrink-0 text-primary-main dark:text-cyan-400" />
              <span>{t("table.reasonType")}</span>
            </div>
            <div className="pt-1">{renderReasonBadge(absence.reasonType)}</div>
            <div className="text-[11px] text-muted flex items-center gap-1 pt-1">
              <Clock className="h-3 w-3 shrink-0" />
              <span>{t("table.submittedAt", { date: formatDate(absence.createdAt) })}</span>
            </div>
          </div>
        </div>

        {/* Chi tiết lý do */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
            <span>{t("modal.form.reasonLabel")}</span>
          </label>
          <div className="p-3.5 rounded-xl bg-card border border-border text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {absence.reason}
          </div>
        </div>

        {/* Minh chứng đính kèm */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1.5">
            <FileCheck className="h-3.5 w-3.5 text-primary-main dark:text-cyan-400 shrink-0" />
            <span>{t("modal.form.evidenceLabel")}</span>
          </label>
          {absence.evidenceUrl ? (
            <div className="p-3 rounded-xl border border-border bg-card space-y-3">
              {isImageFile(absence.evidenceUrl) ? (
                <div className="relative group max-w-sm rounded-lg overflow-hidden border border-border bg-black/10 dark:bg-black/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={absence.evidenceUrl}
                    alt="Minh chứng xin nghỉ"
                    className="w-full max-h-56 object-contain"
                  />
                  <a
                    href={absence.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold backdrop-blur-xs"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>{t("modal.viewLargeImage")}</span>
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2 text-xs text-foreground">
                    <FileCheck className="h-4 w-4 text-primary-main dark:text-cyan-400 shrink-0" />
                    <span className="truncate max-w-xs font-medium">{t("modal.attachedDoc")}</span>
                  </div>
                  <a
                    href={absence.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary-main dark:text-cyan-400 hover:underline font-semibold shrink-0"
                  >
                    <span>{t("modal.openFile")}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-dashed border-border text-center text-xs text-muted">
              {t("table.noEvidence")}
            </div>
          )}
        </div>

        {/* CẢNH BÁO XUNG ĐỘT TASK DEADLINE */}
        {isLoadingConflicts ? (
          <div className="p-4 rounded-xl border border-border flex items-center justify-center gap-2 text-xs text-muted">
            <Spinner size="sm" />
            <span>{t("modal.conflictChecking")}</span>
          </div>
        ) : conflicts.length > 0 ? (
          <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-500/10 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  {t("modal.conflictAlert.title")}
                </h4>
                <p className="text-[11px] text-amber-800 dark:text-amber-200/90 mt-0.5">
                  {t("modal.conflictAlert.desc", { count: conflicts.length })}
                </p>
              </div>
            </div>

            {/* Danh sách task bị ảnh hưởng */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-dropdown pr-1">
              {conflicts.map((task) => (
                <div
                  key={task.taskId}
                  className="flex items-center justify-between p-2 rounded-lg bg-card border border-amber-300/40 dark:border-amber-500/20 text-xs gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {task.code && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 shrink-0">
                        {task.code}
                      </span>
                    )}
                    <span className="font-medium text-foreground truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted">
                      {t("modal.conflictDueDate", { date: formatDate(task.deadline) })}
                    </span>
                    <Badge variant="warning" size="sm">
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkbox tự động gia hạn deadline */}
            <div className="pt-2 border-t border-amber-300/40 dark:border-amber-500/20 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-amber-900 dark:text-amber-200">
                <input
                  type="checkbox"
                  checked={autoExtendConflictTasks}
                  onChange={(e) => setAutoExtendConflictTasks(e.target.checked)}
                  className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span>{t("modal.conflictAlert.autoExtendLabel")}</span>
              </label>

              {autoExtendConflictTasks && (
                <div className="flex items-center gap-2 pl-6">
                  <span className="text-xs text-muted">{t("modal.conflictAlert.extendDaysLabel")}:</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={extendDays}
                    onChange={(e) => setExtendDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-8 px-2 text-xs rounded-lg border border-border bg-card text-foreground text-center focus:outline-hidden focus:ring-1 focus:ring-primary-main"
                  />
                  <span className="text-xs text-muted">{t("modal.workdays")}</span>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Ô nhập ghi chú của Leader / Phản hồi đã duyệt */}
        {canReview && isPendingReview ? (
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center justify-between">
              <span>{t("modal.form.reviewNoteLabel")}</span>
              <span className="text-[11px] text-muted font-normal">{t("modal.requiredIfReject")}</span>
            </label>
            <textarea
              rows={3}
              value={reviewNote}
              onChange={(e) => {
                setReviewNote(e.target.value);
                if (rejectError) setRejectError("");
              }}
              placeholder={t("modal.form.reviewNotePlaceholder")}
              className={`w-full rounded-xl border p-3 text-xs sm:text-sm bg-card text-foreground placeholder:text-muted transition resize-none focus:outline-hidden focus:ring-2 ${
                rejectError
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border focus:ring-primary-main/30 dark:focus:ring-cyan-500/30"
              }`}
            />
            {rejectError && (
              <p className="text-xs text-danger flex items-center gap-1.5 mt-0.5 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{rejectError}</span>
              </p>
            )}
          </div>
        ) : absence.reviewNote ? (
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
              <span>{t("modal.form.reviewNoteLabel")}</span>
            </label>
            <div className="p-3.5 rounded-xl bg-card border border-border text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
              &quot;{absence.reviewNote}&quot;
            </div>
          </div>
        ) : null}
      </div>

      {/* 3. Footer Action Buttons */}
      <div className="flex items-center justify-between gap-3 border-t border-border dark:border-white/10 pt-4 mt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={isPending}
        >
          {t("modal.actions.cancel")}
        </Button>

        {canReview && isPendingReview && (
          <div className="flex items-center gap-2">
            {/* Nút Từ chối */}
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => handleReview("REJECTED")}
              disabled={isPending}
              className="flex items-center gap-1.5"
            >
              {isPending && reviewMutation.variables?.data.status === "REJECTED" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("modal.actions.rejecting")}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <span>{t("modal.actions.reject")}</span>
                </>
              )}
            </Button>

            {/* Nút Phê duyệt */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleReview("APPROVED")}
              disabled={isPending}
              className="flex items-center gap-1.5 shadow-md shadow-primary-main/20"
            >
              {isPending && reviewMutation.variables?.data.status === "APPROVED" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("modal.actions.approving")}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t("modal.actions.approve")}</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewAbsenceModal({
  isOpen,
  onClose,
  absence,
  onSuccess,
}: ModalProps) {
  if (!isOpen || !absence) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ReviewAbsenceFormContent
        key={absence.id}
        absence={absence}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}
