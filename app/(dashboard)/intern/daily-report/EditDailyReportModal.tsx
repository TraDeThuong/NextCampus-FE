"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Link, Video, Loader2, Trash2, AlertTriangle, Paperclip, Download, AlertCircle, Clock, CalendarCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUpdateDailyReport } from "@/hooks/daily-report/useUpdateDailyReport";
import { useDeleteDailyReport } from "@/hooks/daily-report/useDeleteDailyReport";
import { useUploadVideoDemo } from "@/hooks/daily-report/useUploadVideoDemo";
import { useUploadReportAttachmentR2 } from "@/hooks/daily-report/useUploadReportAttachmentR2";
import { useDeleteReportAttachment } from "@/hooks/report-attachment/useDeleteReportAttachment";
import { useReportAttachments } from "@/hooks/report-attachment/useReportAttachments";
import type { DailyReport, CreateReportAttachmentPayload } from "@/types/daily-report";
import { toast } from "react-hot-toast";
import { ATTACHMENT_MIME_TYPES, exceedsUploadLimit, UPLOAD_LIMITS_MB, UPLOAD_MAX_FILES, VIDEO_MIME_TYPES } from "@/lib/upload-policy";

const MAX_REPORT_ATTACHMENTS = UPLOAD_MAX_FILES.reportAttachment;

type Props = { report: DailyReport; onClose: () => void };

export default function EditDailyReportModal({ report, onClose }: Props) {
  const tm = useTranslations("intern.dailyReport.editModal");
  const tc = useTranslations("intern.dailyReport.createModal");
  const updateDailyReport = useUpdateDailyReport();
  const deleteDailyReport = useDeleteDailyReport();
  const uploadVideo = useUploadVideoDemo();
  const { uploadFile } = useUploadReportAttachmentR2();
  const deleteAttachment = useDeleteReportAttachment();
  const { data: attachmentsData } = useReportAttachments(report.id);
  const existingAttachments = attachmentsData?.data ?? [];

  const [content, setContent] = useState(report.content);
  const [blockers, setBlockers] = useState(report.blockers ?? "");
  const [nextPlan, setNextPlan] = useState(report.nextPlan ?? "");
  const [hoursWorked, setHoursWorked] = useState<number>(report.hoursWorked ?? 8);
  const [prLink, setPrLink] = useState(report.prLink ?? "");
  const [videoLink, setVideoLink] = useState(report.videoDemo ?? "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [newAttachmentFiles, setNewAttachmentFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);

  function handleVideoFileChange(file: File | undefined) {
    if (!file) {
      setVideoFile(null);
      return;
    }
    if (!VIDEO_MIME_TYPES.has(file.type)) {
      setVideoFile(null);
      toast.error(tc("videoTypeError"));
      return;
    }
    if (exceedsUploadLimit(file, UPLOAD_LIMITS_MB.reportVideo)) {
      setVideoFile(null);
      toast.error(tc("videoSizeError", { limit: UPLOAD_LIMITS_MB.reportVideo }));
      return;
    }
    setVideoFile(file);
  }

  function handleAttachmentFilesChange(files: File[]) {
    const totalCurrentCount = existingAttachments.length + newAttachmentFiles.length;
    const remainingSlots = Math.max(0, MAX_REPORT_ATTACHMENTS - totalCurrentCount);
    const accepted: File[] = [];
    for (const file of files.slice(0, remainingSlots)) {
      if (!ATTACHMENT_MIME_TYPES.has(file.type)) {
        toast.error(tc("unsupportedType", { name: file.name }));
        continue;
      }
      if (exceedsUploadLimit(file, UPLOAD_LIMITS_MB.reportAttachment)) {
        toast.error(tc("fileSizeError", { name: file.name, limit: UPLOAD_LIMITS_MB.reportAttachment }));
        continue;
      }
      accepted.push(file);
    }
    if (files.length > remainingSlots) {
      toast.error(tc("maxAttachments", { max: MAX_REPORT_ATTACHMENTS }));
    }
    if (accepted.length > 0) {
      setNewAttachmentFiles((current) => [...current, ...accepted]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung công việc đã làm");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload new attachments to R2 if any
      const uploadedAttachments: CreateReportAttachmentPayload[] = [];
      if (newAttachmentFiles.length > 0) {
        setUploadStatusText(`Đang tải lên ${newAttachmentFiles.length} tệp đính kèm mới vào R2...`);
        for (let i = 0; i < newAttachmentFiles.length; i++) {
          const file = newAttachmentFiles[i];
          setUploadStatusText(`Đang tải (${i + 1}/${newAttachmentFiles.length}): ${file.name}...`);
          const uploaded = await uploadFile(file);
          uploadedAttachments.push(uploaded);
        }
      }

      setUploadStatusText("Đang cập nhật báo cáo ngày...");

      // 2. Update report data
      await updateDailyReport.mutateAsync({
        id: report.id,
        payload: {
          content: content.trim(),
          blockers: blockers.trim() || null,
          nextPlan: nextPlan.trim() || null,
          hoursWorked: hoursWorked !== undefined && hoursWorked !== null ? Number(hoursWorked) : 8,
          prLink: prLink.trim() || null,
          videoDemo: videoLink.trim() || null,
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
        },
      });

      // 3. Upload new video file if provided
      if (videoFile) {
        setUploadStatusText("Đang tải video demo...");
        await uploadVideo.mutateAsync({ id: report.id, file: videoFile });
        setVideoFile(null);
      }

      toast.success(tm("updateSuccess"));
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật báo cáo ngày";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setUploadStatusText(null);
    }
  }

  async function handleDelete() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await deleteDailyReport.mutateAsync(report.id);
      toast.success("Báo cáo ngày đã được xóa");
      onClose();
    } catch (err: unknown) {
      console.error(err);
      toast.error("Không thể xóa báo cáo ngày");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isPending =
    isSubmitting ||
    updateDailyReport.isPending ||
    deleteDailyReport.isPending ||
    uploadVideo.isPending ||
    deleteAttachment.isPending;

  return createPortal(
    <div
      onClick={() => {
        if (showDeleteConfirm) setShowDeleteConfirm(false);
        else onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[#0d1322] shadow-[0_25px_80px_rgba(0,0,0,0.7)] text-slate-100"
      >
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

        <div className="flex items-start justify-between border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                <span className="metal-text">{tm("title")}</span>
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">{tm("description")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
          >
            <X className="h-4 w-4 text-slate-400 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* Content */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <FileText className="h-4 w-4 text-cyan-400" />
              {tm("reportContent")} <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={tm("contentPlaceholder")}
              rows={4}
              required
              disabled={isPending}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 disabled:opacity-50 resize-y"
            />
          </div>

          {/* Blockers */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              Khó khăn / Vấn đề gặp phải
            </label>
            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="Vấn đề phát sinh, vướng mắc cần giải quyết..."
              rows={2}
              disabled={isPending}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-amber-400/50 disabled:opacity-50 resize-y"
            />
          </div>

          {/* Next Plan */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <CalendarCheck className="h-4 w-4 text-emerald-400" />
              Kế hoạch công việc ngày mai
            </label>
            <textarea
              value={nextPlan}
              onChange={(e) => setNextPlan(e.target.value)}
              placeholder="Kế hoạch tiếp theo..."
              rows={2}
              disabled={isPending}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400/50 disabled:opacity-50 resize-y"
            />
          </div>

          {/* Hours Worked & PR Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Clock className="h-4 w-4 text-cyan-400" />
                Số giờ làm việc (giờ)
              </label>
              <input
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={hoursWorked}
                onChange={(e) => setHoursWorked(Number(e.target.value))}
                disabled={isPending}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 disabled:opacity-50 font-mono"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Link className="h-4 w-4 text-cyan-400" />
                {tm("prLink")}
              </label>
              <input
                type="url"
                value={prLink}
                onChange={(e) => setPrLink(e.target.value)}
                placeholder={tm("prPlaceholder")}
                disabled={isPending}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Video Demo */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Video className="h-4 w-4 text-cyan-400" />
              {tm("videoDemo")}
            </label>
            <div className="space-y-2">
              <input
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder={tm("videoPlaceholder")}
                disabled={isPending || !!videoFile}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 disabled:opacity-50"
              />
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-px flex-1 bg-white/5" />
                <span>{tc("or")}</span>
                <span className="h-px flex-1 bg-white/5" />
              </div>
              {videoFile ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-2.5">
                  <span className="text-sm text-emerald-300 truncate">{videoFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setVideoFile(null)}
                    disabled={isPending}
                    className="text-xs text-slate-400 hover:text-red-400"
                  >
                    {tc("remove")}
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,.mp4,.webm,.mov,.mkv,.avi"
                  disabled={isPending || !!videoLink.trim()}
                  onChange={(e) => handleVideoFileChange(e.target.files?.[0])}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/10 file:px-3 file:py-1 file:text-xs file:text-cyan-300 file:cursor-pointer outline-none disabled:opacity-50"
                />
              )}
              <p className="text-[11px] text-slate-500">{tc("videoFileHint", { limit: UPLOAD_LIMITS_MB.reportVideo })}</p>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Paperclip className="h-4 w-4 text-cyan-400" />
              {tm("attachments")}
            </label>
            <div className="space-y-2">
              {/* Existing attachments */}
              {existingAttachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2"
                >
                  <a
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-300 hover:text-cyan-400 truncate flex items-center gap-2"
                  >
                    <Download className="h-3.5 w-3.5 shrink-0" />
                    {att.fileName}
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteAttachment.mutate({ reportId: report.id, attachmentId: att.id })}
                    disabled={isPending}
                    className="text-xs text-slate-400 hover:text-red-400 ml-2 shrink-0 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {/* New attachment files */}
              {newAttachmentFiles.map((file, i) => (
                <div
                  key={`new-${file.name}-${i}`}
                  className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-2"
                >
                  <span className="text-sm text-emerald-300 truncate">{file.name} {tm("newLabel")}</span>
                  <span className="text-xs text-slate-500 font-mono mx-2">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => setNewAttachmentFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    disabled={isPending}
                    className="text-xs text-slate-400 hover:text-red-400 ml-2 shrink-0"
                  >
                    {tm("remove")}
                  </button>
                </div>
              ))}

              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.zip,.rar,.7z"
                disabled={isPending}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  handleAttachmentFilesChange(files);
                  e.target.value = "";
                }}
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/10 file:px-3 file:py-1 file:text-xs file:text-cyan-300 file:cursor-pointer outline-none disabled:opacity-50"
              />
              <p className="text-[11px] text-slate-500">
                {tc("attachmentsHint", { max: MAX_REPORT_ATTACHMENTS, limit: UPLOAD_LIMITS_MB.reportAttachment })}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
            {uploadStatusText ? (
              <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{uploadStatusText}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-50 mr-auto"
              >
                {deleteDailyReport.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                {tm("delete")}
              </button>
            )}

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-300 transition hover:text-white disabled:opacity-50"
              >
                {tm("cancel")}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-600/20"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {tm("update")}
              </button>
            </div>
          </div>
        </form>

        {showDeleteConfirm && (
          <div
            onClick={() => setShowDeleteConfirm(false)}
            className="absolute inset-0 z-10 flex items-center justify-center rounded-[32px] bg-black/90 backdrop-blur-sm p-6"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-rose-500/20 bg-[#0f1520] p-6 shadow-[0_25px_50px_rgba(0,0,0,0.8)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{tm("deleteConfirmTitle")}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{tm("deleteConfirmDesc")}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isPending}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 transition hover:text-white disabled:opacity-50"
                >
                  {tm("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-rose-500 disabled:opacity-50"
                >
                  {deleteDailyReport.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  {tm("delete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
