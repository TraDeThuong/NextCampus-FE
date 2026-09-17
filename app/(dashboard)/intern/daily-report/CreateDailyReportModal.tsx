"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Link, Video, Loader2, Paperclip, AlertCircle, Clock, CalendarCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCreateDailyReport } from "@/hooks/daily-report/useCreateDailyReport";
import { useUploadVideoDemo } from "@/hooks/daily-report/useUploadVideoDemo";
import { useUploadReportAttachmentR2 } from "@/hooks/daily-report/useUploadReportAttachmentR2";
import { toast } from "react-hot-toast";
import { ATTACHMENT_MIME_TYPES, exceedsUploadLimit, UPLOAD_LIMITS_MB, UPLOAD_MAX_FILES, VIDEO_MIME_TYPES } from "@/lib/upload-policy";
import type { CreateReportAttachmentPayload } from "@/types/daily-report";

const MAX_REPORT_ATTACHMENTS = UPLOAD_MAX_FILES.reportAttachment;

type Props = { onClose: () => void };

export default function CreateDailyReportModal({ onClose }: Props) {
  const tm = useTranslations("intern.dailyReport.createModal");
  const createDailyReport = useCreateDailyReport();
  const uploadVideo = useUploadVideoDemo();
  const { uploadFile } = useUploadReportAttachmentR2();

  const [content, setContent] = useState("");
  const [blockers, setBlockers] = useState("");
  const [nextPlan, setNextPlan] = useState("");
  const [hoursWorked, setHoursWorked] = useState<number>(8);
  const [prLink, setPrLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);

  function handleVideoFileChange(file: File | undefined) {
    if (!file) {
      setVideoFile(null);
      return;
    }
    if (!VIDEO_MIME_TYPES.has(file.type)) {
      setVideoFile(null);
      toast.error(tm("videoTypeError"));
      return;
    }
    if (exceedsUploadLimit(file, UPLOAD_LIMITS_MB.reportVideo)) {
      setVideoFile(null);
      toast.error(tm("videoSizeError", { limit: UPLOAD_LIMITS_MB.reportVideo }));
      return;
    }
    setVideoFile(file);
  }

  function handleAttachmentFilesChange(files: File[]) {
    const remainingSlots = Math.max(0, MAX_REPORT_ATTACHMENTS - attachmentFiles.length);
    const accepted: File[] = [];
    for (const file of files.slice(0, remainingSlots)) {
      if (!ATTACHMENT_MIME_TYPES.has(file.type)) {
        toast.error(tm("unsupportedType", { name: file.name }));
        continue;
      }
      if (exceedsUploadLimit(file, UPLOAD_LIMITS_MB.reportAttachment)) {
        toast.error(tm("fileSizeError", { name: file.name, limit: UPLOAD_LIMITS_MB.reportAttachment }));
        continue;
      }
      accepted.push(file);
    }
    if (files.length > remainingSlots) {
      toast.error(tm("maxAttachments", { max: MAX_REPORT_ATTACHMENTS }));
    }
    if (accepted.length > 0) {
      setAttachmentFiles((current) => [...current, ...accepted]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung công việc đã hoàn thành");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload attachments directly to Cloudflare R2 if any
      const uploadedAttachments: CreateReportAttachmentPayload[] = [];
      if (attachmentFiles.length > 0) {
        setUploadStatusText(`Đang tải lên ${attachmentFiles.length} tệp đính kèm vào R2...`);
        for (let i = 0; i < attachmentFiles.length; i++) {
          const file = attachmentFiles[i];
          setUploadStatusText(`Đang tải tệp (${i + 1}/${attachmentFiles.length}): ${file.name}...`);
          const uploaded = await uploadFile(file);
          uploadedAttachments.push(uploaded);
        }
      }

      setUploadStatusText("Đang lưu báo cáo ngày...");

      // 2. Submit daily report
      const result = await createDailyReport.mutateAsync({
        content: content.trim(),
        blockers: blockers.trim() || null,
        nextPlan: nextPlan.trim() || null,
        hoursWorked: hoursWorked !== undefined && hoursWorked !== null ? Number(hoursWorked) : 8,
        prLink: prLink.trim() || null,
        videoDemo: videoLink.trim() || null,
        attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
      });

      const reportId = result.data.id;

      // 3. Upload video demo if selected as file
      if (videoFile && reportId) {
        setUploadStatusText("Đang tải video demo...");
        await uploadVideo.mutateAsync({ id: reportId, file: videoFile });
      }

      toast.success(tm("submitSuccess"));
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Có lỗi xảy ra khi nộp báo cáo ngày";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setUploadStatusText(null);
    }
  }

  const isPending = isSubmitting || createDailyReport.isPending || uploadVideo.isPending;

  return createPortal(
    <div onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
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
          {/* Work Content */}
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

          {/* Blockers & Challenges */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              Khó khăn / Vấn đề gặp phải (nếu có)
            </label>
            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="Mô tả các vướng mắc kỹ thuật, bug khó, cần hỗ trợ từ ai..."
              rows={2}
              disabled={isPending}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-amber-400/50 disabled:opacity-50 resize-y"
            />
          </div>

          {/* Next Day Plan */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <CalendarCheck className="h-4 w-4 text-emerald-400" />
              Kế hoạch công việc ngày mai
            </label>
            <textarea
              value={nextPlan}
              onChange={(e) => setNextPlan(e.target.value)}
              placeholder="Dự kiến hoàn thành task gì, tìm hiểu công nghệ nào, viết test case..."
              rows={2}
              disabled={isPending}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400/50 disabled:opacity-50 resize-y"
            />
          </div>

          {/* Hours Worked & PR Link Grid */}
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
                placeholder="Ví dụ: 8"
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
                <span>{tm("or")}</span>
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
                    {tm("remove")}
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
              <p className="text-[11px] text-slate-500">{tm("videoFileHint", { limit: UPLOAD_LIMITS_MB.reportVideo })}</p>
            </div>
          </div>

          {/* Attachments Upload directly to R2 */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Paperclip className="h-4 w-4 text-cyan-400" />
              {tm("attachments")} (Tải lên Cloudflare R2 thư mục reports/)
            </label>
            <div className="space-y-2">
              {attachmentFiles.length > 0 && (
                <div className="space-y-1.5">
                  {attachmentFiles.map((file, i) => (
                    <div
                      key={`${file.name}-${i}`}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2"
                    >
                      <span className="text-sm text-slate-300 truncate">{file.name}</span>
                      <span className="text-xs text-slate-500 font-mono mx-2">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttachmentFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        disabled={isPending}
                        className="text-xs text-slate-400 hover:text-red-400 ml-2 shrink-0"
                      >
                        {tm("remove")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                {tm("attachmentsHint", { max: MAX_REPORT_ATTACHMENTS, limit: UPLOAD_LIMITS_MB.reportAttachment })}
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
              <span className="text-xs text-slate-500">Báo cáo sẽ được gửi tới Leader phụ trách</span>
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
                {tm("submit")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
