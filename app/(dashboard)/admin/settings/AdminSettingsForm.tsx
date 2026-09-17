"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Settings,
  Clock,
  Layers,
  Calendar,
  Video,
  Paperclip,
  RotateCcw,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { useSystemSettings } from "@/hooks/system-setting/useSystemSettings";
import { useBatchUpdateSettings } from "@/hooks/system-setting/useBatchUpdateSettings";
import { UPLOAD_LIMITS_MB } from "@/lib/upload-policy";
import type { SystemSettings } from "@/types/system-setting";

const DEFAULT_SETTINGS = {
  DAILY_REPORT_DEADLINE_TIME: "17:30",
  MAX_ACTIVE_TASKS: "5",
  MAX_WORKLOAD_DAYS: "10",
  SUBMISSION_MAX_FILE_SIZE_MB: String(UPLOAD_LIMITS_MB.submissionVideo),
  REPORT_ATTACHMENT_MAX_SIZE_MB: String(UPLOAD_LIMITS_MB.reportAttachment),
};

export default function AdminSettingsForm() {
  const t = useTranslations("admin.settings");
  const { data: response, isLoading, isError, refetch } = useSystemSettings();

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !response?.success || !response?.data) {
    return (
      <MetalCard className="p-8 text-center space-y-4">
        <p className="text-sm text-red-400 font-medium">{t("loadError")}</p>
        <Button variant="glass" onClick={() => refetch()}>
          {t("resetDefaults")}
        </Button>
      </MetalCard>
    );
  }

  return <AdminSettingsFields initialData={response.data} />;
}

function AdminSettingsFields({ initialData }: { initialData: SystemSettings }) {
  const t = useTranslations("admin.settings");
  const batchUpdate = useBatchUpdateSettings();

  const [formValues, setFormValues] = useState({
    DAILY_REPORT_DEADLINE_TIME:
      typeof initialData.DAILY_REPORT_DEADLINE_TIME === "string"
        ? initialData.DAILY_REPORT_DEADLINE_TIME
        : DEFAULT_SETTINGS.DAILY_REPORT_DEADLINE_TIME,
    MAX_ACTIVE_TASKS:
      initialData.MAX_ACTIVE_TASKS != null
        ? String(initialData.MAX_ACTIVE_TASKS)
        : DEFAULT_SETTINGS.MAX_ACTIVE_TASKS,
    MAX_WORKLOAD_DAYS:
      initialData.MAX_WORKLOAD_DAYS != null
        ? String(initialData.MAX_WORKLOAD_DAYS)
        : DEFAULT_SETTINGS.MAX_WORKLOAD_DAYS,
    SUBMISSION_MAX_FILE_SIZE_MB:
      initialData.SUBMISSION_MAX_FILE_SIZE_MB != null
        ? String(initialData.SUBMISSION_MAX_FILE_SIZE_MB)
        : DEFAULT_SETTINGS.SUBMISSION_MAX_FILE_SIZE_MB,
    REPORT_ATTACHMENT_MAX_SIZE_MB:
      initialData.REPORT_ATTACHMENT_MAX_SIZE_MB != null
        ? String(initialData.REPORT_ATTACHMENT_MAX_SIZE_MB)
        : DEFAULT_SETTINGS.REPORT_ATTACHMENT_MAX_SIZE_MB,
  });

  const handleChange = (key: keyof typeof formValues, val: string) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetDefaults = () => {
    setFormValues({ ...DEFAULT_SETTINGS });
  };

  // Validation rules
  const errors: Partial<Record<keyof typeof formValues, string>> = {};
  if (!formValues.DAILY_REPORT_DEADLINE_TIME || !/^([01]\d|2[0-3]):[0-5]\d$/.test(formValues.DAILY_REPORT_DEADLINE_TIME)) {
    errors.DAILY_REPORT_DEADLINE_TIME = "Giờ chốt phải theo định dạng HH:mm (VD: 17:30)";
  }
  const tasksNum = Number(formValues.MAX_ACTIVE_TASKS);
  if (isNaN(tasksNum) || tasksNum < 1 || tasksNum > 30) {
    errors.MAX_ACTIVE_TASKS = "Số task tối đa phải từ 1 đến 30";
  }
  const workloadNum = Number(formValues.MAX_WORKLOAD_DAYS);
  if (isNaN(workloadNum) || workloadNum < 1 || workloadNum > 90) {
    errors.MAX_WORKLOAD_DAYS = "Hạn mức ngày công phải từ 1 đến 90 ngày";
  }
  const submitFileNum = Number(formValues.SUBMISSION_MAX_FILE_SIZE_MB);
  if (isNaN(submitFileNum) || submitFileNum < 1 || submitFileNum > 500) {
    errors.SUBMISSION_MAX_FILE_SIZE_MB = "Dung lượng nộp bài phải từ 1 đến 500 MB";
  }
  const reportFileNum = Number(formValues.REPORT_ATTACHMENT_MAX_SIZE_MB);
  if (isNaN(reportFileNum) || reportFileNum < 1 || reportFileNum > 100) {
    errors.REPORT_ATTACHMENT_MAX_SIZE_MB = "Dung lượng đính kèm phải từ 1 đến 100 MB";
  }
  const hasErrors = Object.keys(errors).length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) return;
    batchUpdate.mutate(formValues);
  };

  const isPending = batchUpdate.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-primary-light shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              <span className="metal-text">{t("title")}</span>
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="glass"
            size="md"
            onClick={handleResetDefaults}
            disabled={isPending}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            <span>{t("resetDefaults")}</span>
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isPending || hasErrors}
            className="flex items-center gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              <Save className="h-4 w-4 shrink-0" />
            )}
            <span>{isPending ? t("saving") : t("saveSettings")}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Param 1: DAILY_REPORT_DEADLINE_TIME */}
        <MetalCard className="p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {t("dailyReportDeadlineTitle")}
              </h2>
              <p className="text-xs text-muted">
                {t("dailyReportDeadlineDesc")}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <input
              type="time"
              value={formValues.DAILY_REPORT_DEADLINE_TIME}
              onChange={(e) => handleChange("DAILY_REPORT_DEADLINE_TIME", e.target.value)}
              disabled={isPending}
              required
              className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-base font-mono font-bold text-white outline-none transition disabled:opacity-50 ${
                errors.DAILY_REPORT_DEADLINE_TIME
                  ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 text-rose-300"
                  : "border-white/10 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30"
              }`}
            />
            {errors.DAILY_REPORT_DEADLINE_TIME && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{errors.DAILY_REPORT_DEADLINE_TIME}</p>
            )}
          </div>
        </MetalCard>

        {/* Param 2: MAX_ACTIVE_TASKS */}
        <MetalCard className="p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {t("maxActiveTasksTitle")}
              </h2>
              <p className="text-xs text-muted">
                {t("maxActiveTasksDesc")}
              </p>
            </div>
          </div>

          <div className="relative pt-2">
            <input
              type="number"
              min={1}
              max={30}
              value={formValues.MAX_ACTIVE_TASKS}
              onChange={(e) => handleChange("MAX_ACTIVE_TASKS", e.target.value)}
              disabled={isPending}
              required
              className={`w-full rounded-xl border bg-white/5 px-4 py-3 pr-16 text-base font-mono font-bold text-white outline-none transition disabled:opacity-50 ${
                errors.MAX_ACTIVE_TASKS
                  ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 text-rose-300"
                  : "border-white/10 focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/30"
              }`}
            />
            <span className="pointer-events-none absolute right-4 top-5 text-xs font-mono font-semibold uppercase text-slate-400">
              {t("tasksUnit")}
            </span>
            {errors.MAX_ACTIVE_TASKS && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{errors.MAX_ACTIVE_TASKS}</p>
            )}
          </div>
        </MetalCard>

        {/* Param 3: MAX_WORKLOAD_DAYS */}
        <MetalCard className="p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {t("maxWorkloadDaysTitle")}
              </h2>
              <p className="text-xs text-muted">
                {t("maxWorkloadDaysDesc")}
              </p>
            </div>
          </div>

          <div className="relative pt-2">
            <input
              type="number"
              min={1}
              max={90}
              value={formValues.MAX_WORKLOAD_DAYS}
              onChange={(e) => handleChange("MAX_WORKLOAD_DAYS", e.target.value)}
              disabled={isPending}
              required
              className={`w-full rounded-xl border bg-white/5 px-4 py-3 pr-16 text-base font-mono font-bold text-white outline-none transition disabled:opacity-50 ${
                errors.MAX_WORKLOAD_DAYS
                  ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 text-rose-300"
                  : "border-white/10 focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/30"
              }`}
            />
            <span className="pointer-events-none absolute right-4 top-5 text-xs font-mono font-semibold uppercase text-slate-400">
              {t("daysUnit")}
            </span>
            {errors.MAX_WORKLOAD_DAYS && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{errors.MAX_WORKLOAD_DAYS}</p>
            )}
          </div>
        </MetalCard>

        {/* Param 4: SUBMISSION_MAX_FILE_SIZE_MB */}
        <MetalCard className="p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Video className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {t("submissionMaxFileSizeTitle")}
              </h2>
              <p className="text-xs text-muted">
                {t("submissionMaxFileSizeDesc")}
              </p>
            </div>
          </div>

          <div className="relative pt-2">
            <input
              type="number"
              min={1}
              max={500}
              value={formValues.SUBMISSION_MAX_FILE_SIZE_MB}
              onChange={(e) => handleChange("SUBMISSION_MAX_FILE_SIZE_MB", e.target.value)}
              disabled={isPending}
              required
              className={`w-full rounded-xl border bg-white/5 px-4 py-3 pr-16 text-base font-mono font-bold text-white outline-none transition disabled:opacity-50 ${
                errors.SUBMISSION_MAX_FILE_SIZE_MB
                  ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 text-rose-300"
                  : "border-white/10 focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/30"
              }`}
            />
            <span className="pointer-events-none absolute right-4 top-5 text-xs font-mono font-semibold uppercase text-slate-400">
              {t("mbUnit")}
            </span>
            {errors.SUBMISSION_MAX_FILE_SIZE_MB && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{errors.SUBMISSION_MAX_FILE_SIZE_MB}</p>
            )}
          </div>
        </MetalCard>

        {/* Param 5: REPORT_ATTACHMENT_MAX_SIZE_MB */}
        <MetalCard className="p-6 space-y-3 md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Paperclip className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {t("reportAttachmentMaxSizeTitle")}
              </h2>
              <p className="text-xs text-muted">
                {t("reportAttachmentMaxSizeDesc")}
              </p>
            </div>
          </div>

          <div className="relative pt-2 max-w-md">
            <input
              type="number"
              min={1}
              max={100}
              value={formValues.REPORT_ATTACHMENT_MAX_SIZE_MB}
              onChange={(e) => handleChange("REPORT_ATTACHMENT_MAX_SIZE_MB", e.target.value)}
              disabled={isPending}
              required
              className={`w-full rounded-xl border bg-white/5 px-4 py-3 pr-16 text-base font-mono font-bold text-white outline-none transition disabled:opacity-50 ${
                errors.REPORT_ATTACHMENT_MAX_SIZE_MB
                  ? "border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 text-rose-300"
                  : "border-white/10 focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/30"
              }`}
            />
            <span className="pointer-events-none absolute right-4 top-5 text-xs font-mono font-semibold uppercase text-slate-400">
              {t("mbUnit")}
            </span>
            {errors.REPORT_ATTACHMENT_MAX_SIZE_MB && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{errors.REPORT_ATTACHMENT_MAX_SIZE_MB}</p>
            )}
          </div>
        </MetalCard>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending || hasErrors}
          className="flex items-center gap-2 px-8"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          <span>{isPending ? t("saving") : t("saveSettings")}</span>
        </Button>
      </div>
    </form>
  );
}
