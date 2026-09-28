"use client";

import { useState, useRef, useId } from "react";
import { useTranslations } from "next-intl";
import {
  Calendar,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Sun,
  Sunset,
  CalendarDays,
  CalendarRange,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { DatePicker, DateRangePicker } from "@/components/ui/DatePicker";
import { useCreateAbsence } from "@/hooks/absence/useCreateAbsence";
import { absenceService } from "@/services/absence.service";
import type { AbsenceDuration, AbsenceReasonType } from "@/types/absence";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateAbsenceModal({ isOpen, onClose, onSuccess }: Props) {
  const t = useTranslations("absences");
  const createMutation = useCreateAbsence();

  const [durationUnit, setDurationUnit] = useState<AbsenceDuration>("FULL_DAY");
  const [singleDate, setSingleDate] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reasonType, setReasonType] = useState<AbsenceReasonType>("EXAM");
  const [reason, setReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState<string>("");
  const [evidenceFileName, setEvidenceFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  // Reset form khi đóng mở
  const resetForm = () => {
    setDurationUnit("FULL_DAY");
    setSingleDate("");
    setStartDate("");
    setEndDate("");
    setReasonType("EXAM");
    setReason("");
    setEvidenceUrl("");
    setEvidenceFileName("");
    setIsUploading(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Upload file minh chứng trực tiếp lên R2
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Giới hạn 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("toast.uploadError"));
      return;
    }

    try {
      setIsUploading(true);
      setEvidenceFileName(file.name);
      const url = await absenceService.uploadEvidenceFile(file);
      setEvidenceUrl(url);
      setErrors((prev) => {
        const next = { ...prev };
        delete next.evidenceUrl;
        return next;
      });
      toast.success(t("modal.form.uploadSuccess"));
    } catch {
      toast.error(t("toast.uploadError"));
      setEvidenceUrl("");
      setEvidenceFileName("");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveEvidence = () => {
    setEvidenceUrl("");
    setEvidenceFileName("");
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (durationUnit === "MULTI_DAY") {
      if (!startDate) {
        newErrors.startDate = t("modal.form.fieldRequired", {
          field: t("modal.form.startDateLabel"),
        });
      }
      if (!endDate) {
        newErrors.endDate = t("modal.form.fieldRequired", {
          field: t("modal.form.endDateLabel"),
        });
      }
      if (startDate && endDate && startDate > endDate) {
        newErrors.endDate = t("modal.form.endDateAfterStart");
      }
    } else {
      if (!singleDate) {
        newErrors.singleDate = t("modal.form.fieldRequired", {
          field: t("modal.form.singleDateLabel"),
        });
      }
    }

    if (!reason.trim() || reason.trim().length < 5) {
      newErrors.reason = t("modal.form.reasonMinLength");
    }

    if (reasonType === "EXAM" && (!evidenceUrl || evidenceUrl.trim().length === 0)) {
      newErrors.evidenceUrl = t("modal.form.evidenceRequiredAlert");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const start = durationUnit === "MULTI_DAY" ? startDate : singleDate;
    const end = durationUnit === "MULTI_DAY" ? endDate : singleDate;

    try {
      await createMutation.mutateAsync({
        startDate: start,
        endDate: end,
        durationUnit,
        reasonType,
        reason: reason.trim(),
        evidenceUrl: evidenceUrl || null,
      });

      toast.success(t("toast.createSuccess"));
      handleClose();
      onSuccess?.();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t("toast.createError");
      toast.error(errorMsg);
    }
  };

  const durationOptions: { key: AbsenceDuration; label: string; icon: typeof Sun }[] = [
    { key: "MORNING", label: t("duration.morningShort"), icon: Sun },
    { key: "AFTERNOON", label: t("duration.afternoonShort"), icon: Sunset },
    { key: "FULL_DAY", label: t("duration.fullDayShort"), icon: CalendarDays },
    { key: "MULTI_DAY", label: t("duration.multiDayShort"), icon: CalendarRange },
  ];

  const reasonOptions: { key: AbsenceReasonType; label: string }[] = [
    { key: "EXAM", label: t("reasonType.exam") },
    { key: "SICKNESS", label: t("reasonType.sickness") },
    { key: "UNIVERSITY_EVENT", label: t("reasonType.universityEvent") },
    { key: "PERSONAL", label: t("reasonType.personal") },
    { key: "OTHER", label: t("reasonType.other") },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Sticky Header (Rule 44 & Rule 214-230 Compliant) */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-xl pb-3 sm:pb-4 pt-1 -mt-1 border-b border-border dark:border-white/10 pr-10 sm:pr-12">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <Calendar className="h-5 w-5 shrink-0" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">
                {t("modal.createTitle")}
              </h2>
              <p className="text-xs text-muted mt-0.5 truncate">{t("modal.createDesc")}</p>
            </div>
          </div>
        </div>

        {/* Form Body (Rule 140-146: Uniform Field Height Across Rows) */}
        <div className="space-y-4 sm:space-y-5 py-3 sm:py-4">
          {/* 1. Chọn loại thời gian nghỉ (Segmented selector) */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
              <span>{t("modal.form.durationLabel")}</span>
              <span className="text-danger font-bold">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {durationOptions.map(({ key, label, icon: Icon }) => {
                const active = durationUnit === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDurationUnit(key)}
                    className={`flex items-center justify-center gap-2 px-3 h-[42px] sm:h-[46px] rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none ${
                      active
                        ? "border-primary-main bg-primary-main/15 text-primary-main dark:border-cyan-400 dark:bg-cyan-500/20 dark:text-cyan-300 shadow-sm"
                        : "border-border bg-card hover:bg-card-hover text-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Chọn ngày nghỉ (DatePicker / DateRangePicker) */}
          {durationUnit === "MULTI_DAY" ? (
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
                <span>{t("table.dateRange")}</span>
                <span className="text-danger font-bold">*</span>
              </label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.startDate;
                    delete next.endDate;
                    return next;
                  });
                }}
                placeholder={t("modal.form.selectDateRange")}
              />
              {(errors.startDate || errors.endDate) && (
                <p className="text-xs text-danger flex items-center gap-1.5 mt-0.5 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.startDate || errors.endDate}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
                <span>{t("modal.form.singleDateLabel")}</span>
                <span className="text-danger font-bold">*</span>
              </label>
              <DatePicker
                value={singleDate}
                onChange={(val) => {
                  setSingleDate(val);
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.singleDate;
                    return next;
                  });
                }}
                placeholder={t("modal.form.selectSingleDate")}
                error={errors.singleDate}
              />
            </div>
          )}

          {/* 3. Phân loại lý do (Uniform Height Radio Buttons) */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
              <span>{t("modal.form.reasonTypeLabel")}</span>
              <span className="text-danger font-bold">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {reasonOptions.map(({ key, label }) => {
                const active = reasonType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setReasonType(key)}
                    className={`flex items-center px-4 h-[42px] sm:h-[46px] rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer select-none ${
                      active
                        ? "border-primary-main bg-primary-main/10 text-foreground font-semibold dark:border-cyan-400 dark:bg-cyan-500/15"
                        : "border-border bg-card hover:bg-card-hover text-muted hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Giải trình chi tiết */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1">
              <span>{t("modal.form.reasonLabel")}</span>
              <span className="text-danger font-bold">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.reason;
                  return next;
                });
              }}
              rows={3}
              placeholder={t("modal.form.reasonPlaceholder")}
              className={`w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border bg-card text-foreground placeholder:text-muted transition resize-none focus:outline-hidden focus:ring-2 ${
                errors.reason
                  ? "border-destructive focus:ring-destructive/30"
                  : "border-border focus:ring-primary-main/30 dark:focus:ring-cyan-500/30"
              }`}
            />
            {errors.reason && (
              <p className="text-xs text-danger flex items-center gap-1.5 mt-0.5 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.reason}</span>
              </p>
            )}
          </div>

          {/* 5. Tải lên minh chứng (R2 Upload) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor={fileInputId}
                className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1 cursor-pointer"
              >
                <span>{t("modal.form.evidenceLabel")}</span>
                {reasonType === "EXAM" && <span className="text-danger font-bold">*</span>}
              </label>
              <span className="text-[11px] text-muted">
                {reasonType === "EXAM" ? (
                  <span className="text-amber-500 font-medium">{t("modal.form.examMandatory")}</span>
                ) : (
                  t("modal.form.optionalDoc")
                )}
              </span>
            </div>

            <input
              id={fileInputId}
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              aria-label={t("modal.form.evidenceLabel")}
              className="hidden"
            />

            {evidenceUrl ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-primary-main/40 bg-primary-main/5 dark:border-cyan-400/30 dark:bg-cyan-500/10">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileCheck className="h-5 w-5 text-primary-main dark:text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {evidenceFileName || "minh_chung"}
                    </p>
                    <a
                      href={evidenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-primary-main dark:text-cyan-400 hover:underline inline-block font-medium"
                    >
                      {t("modal.form.viewUploaded")}
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveEvidence}
                  aria-label="Remove evidence file"
                  className="text-muted hover:text-danger p-1.5 rounded-lg transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                  errors.evidenceUrl
                    ? "border-destructive/80 bg-destructive/5 hover:bg-destructive/10"
                    : "border-border hover:border-primary-main/60 bg-card hover:bg-card-hover dark:hover:border-cyan-400/50"
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-6 w-6 text-primary-main dark:text-cyan-400 animate-spin" />
                    <p className="text-xs text-muted">{t("modal.form.uploading")}</p>
                  </>
                ) : (
                  <>
                    <div className="h-10 w-10 rounded-full bg-primary-main/10 flex items-center justify-center text-primary-main dark:text-cyan-400">
                      <UploadCloud className="h-5 w-5 shrink-0" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        {t("modal.form.uploadDrop")}
                      </p>
                      <p className="text-[11px] text-muted mt-0.5">
                        {t("modal.form.evidenceHelp")}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {errors.evidenceUrl && (
              <p className="text-xs text-danger flex items-center gap-1.5 mt-0.5 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.evidenceUrl}</span>
              </p>
            )}
          </div>
        </div>

        {/* Nút hành động (Rule 140-146) */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-border dark:border-white/10">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={createMutation.isPending || isUploading}
          >
            {t("modal.actions.cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={createMutation.isPending || isUploading}
            className="min-w-[130px]"
          >
            {createMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("modal.actions.submitting")}</span>
              </div>
            ) : (
              t("modal.actions.submit")
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
