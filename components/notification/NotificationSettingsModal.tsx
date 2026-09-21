"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Bell, Mail, AppWindow, Calendar, FileText, CheckCircle2, ClipboardCheck, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRBAC } from "@/hooks/rbac/useRBAC";
import { useNotificationSettings, useUpdateNotificationSettings } from "@/hooks/notification-setting";
import Spinner from "@/components/ui/Spinner";
import type { NotificationSetting, UpdateNotificationSettingPayload } from "@/types/notification-setting";

interface NotificationSettingsModalProps {
  onClose: () => void;
}

function NotificationSettingsForm({
  initialSettings,
  canUpdate,
  onClose,
}: {
  initialSettings: NotificationSetting;
  canUpdate: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("header.notification");
  const updateMutation = useUpdateNotificationSettings();

  const [form, setForm] = useState<UpdateNotificationSettingPayload>(() => ({
    emailEnabled: initialSettings.emailEnabled,
    inAppEnabled: initialSettings.inAppEnabled,
    taskAssignedEmail: initialSettings.taskAssignedEmail,
    taskAssignedInApp: initialSettings.taskAssignedInApp,
    submissionReviewedEmail: initialSettings.submissionReviewedEmail,
    submissionReviewedInApp: initialSettings.submissionReviewedInApp,
    dailyReportReminderEmail: initialSettings.dailyReportReminderEmail,
    dailyReportReminderInApp: initialSettings.dailyReportReminderInApp,
    meetingScheduleEmail: initialSettings.meetingScheduleEmail,
    meetingScheduleInApp: initialSettings.meetingScheduleInApp,
  }));

  const handleToggle = (key: keyof UpdateNotificationSettingPayload) => {
    if (!canUpdate) return;
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    if (!canUpdate) return;
    updateMutation.mutate(form, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <>
      <div className="overflow-y-auto custom-scrollbar flex-1 py-4 space-y-6">
        {/* Main Channels */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90">
            {t("channels")}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!canUpdate}
              onClick={() => handleToggle("emailEnabled")}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer disabled:cursor-not-allowed ${
                form.emailEnabled
                  ? "border-cyan-400/40 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(21,174,245,0.15)]"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Mail size={16} className={form.emailEnabled ? "text-cyan-400" : "text-slate-500"} />
                <span className="text-xs font-medium">{t("emailChannel")}</span>
              </div>
              <span
                className={`h-4 w-8 rounded-full transition-colors relative flex items-center px-0.5 ${
                  form.emailEnabled ? "bg-cyan-400" : "bg-white/10"
                }`}
              >
                <span
                  className={`h-3 w-3 rounded-full bg-[#0B1020] transition-transform ${
                    form.emailEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </span>
            </button>

            <button
              type="button"
              disabled={!canUpdate}
              onClick={() => handleToggle("inAppEnabled")}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer disabled:cursor-not-allowed ${
                form.inAppEnabled
                  ? "border-cyan-400/40 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(21,174,245,0.15)]"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AppWindow size={16} className={form.inAppEnabled ? "text-cyan-400" : "text-slate-500"} />
                <span className="text-xs font-medium">{t("inAppChannel")}</span>
              </div>
              <span
                className={`h-4 w-8 rounded-full transition-colors relative flex items-center px-0.5 ${
                  form.inAppEnabled ? "bg-cyan-400" : "bg-white/10"
                }`}
              >
                <span
                  className={`h-3 w-3 rounded-full bg-[#0B1020] transition-transform ${
                    form.inAppEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Event Specific Preferences */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90">
            {t("events")}
          </h4>
          <div className="space-y-2">
            {/* Task Assigned */}
            <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ClipboardCheck size={16} className="text-emerald-400" />
                <span className="text-xs font-medium">{t("taskAssigned")}</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canUpdate}
                    checked={form.taskAssignedEmail}
                    onChange={() => handleToggle("taskAssignedEmail")}
                    className="rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-0"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canUpdate}
                    checked={form.taskAssignedInApp}
                    onChange={() => handleToggle("taskAssignedInApp")}
                    className="rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-0"
                  />
                  <span>In-App</span>
                </label>
              </div>
            </div>

            {/* Submission Reviewed */}
            <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-purple-400" />
                <span className="text-xs font-medium">{t("submissionReviewed")}</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canUpdate}
                    checked={form.submissionReviewedEmail}
                    onChange={() => handleToggle("submissionReviewedEmail")}
                    className="rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-0"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canUpdate}
                    checked={form.submissionReviewedInApp}
                    onChange={() => handleToggle("submissionReviewedInApp")}
                    className="rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-0"
                  />
                  <span>In-App</span>
                </label>
              </div>
            </div>

            {/* Daily Report Reminder */}
            <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText size={16} className="text-amber-400" />
                <span className="text-xs font-medium">{t("dailyReportReminder")}</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canUpdate}
                    checked={form.dailyReportReminderEmail}
                    onChange={() => handleToggle("dailyReportReminderEmail")}
                    className="rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-0"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canUpdate}
                    checked={form.dailyReportReminderInApp}
                    onChange={() => handleToggle("dailyReportReminderInApp")}
                    className="rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-0"
                  />
                  <span>In-App</span>
                </label>
              </div>
            </div>

            {/* Meeting Schedule */}
            <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar size={16} className="text-blue-400" />
                <span className="text-xs font-medium">{t("meetingSchedule")}</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canUpdate}
                    checked={form.meetingScheduleEmail}
                    onChange={() => handleToggle("meetingScheduleEmail")}
                    className="rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-0"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canUpdate}
                    checked={form.meetingScheduleInApp}
                    onChange={() => handleToggle("meetingScheduleInApp")}
                    className="rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-0"
                  />
                  <span>In-App</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {canUpdate && (
        <div className="border-t border-white/10 pt-4 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={updateMutation.isPending}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-primary-main to-primary-light text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
            <span>{t("saveSettings")}</span>
          </button>
        </div>
      )}
    </>
  );
}

export default function NotificationSettingsModal({ onClose }: NotificationSettingsModalProps) {
  const t = useTranslations("header.notification");
  const { can } = useRBAC();
  const canUpdate = can("NOTIFICATION_SETTING_UPDATE");
  const { data, isLoading } = useNotificationSettings();

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0B1020]/95 p-6 text-white shadow-[0_24px_64px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-semibold metal-text tracking-wide text-base uppercase">
                {t("settings")}
              </h3>
              <p className="text-xs text-muted">
                {canUpdate ? t("channels") : t("readOnlyNotice")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {isLoading || !data?.data ? (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : (
          <NotificationSettingsForm
            initialSettings={data.data}
            canUpdate={canUpdate}
            onClose={onClose}
          />
        )}
      </div>
    </div>,
    document.body
  );
}
