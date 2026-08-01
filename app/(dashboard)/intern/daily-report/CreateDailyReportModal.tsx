"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Link, Video, Loader2, Paperclip } from "lucide-react";
import { useCreateDailyReport } from "@/hooks/daily-report/useCreateDailyReport";
import { useUploadVideoDemo } from "@/hooks/daily-report/useUploadVideoDemo";
import { useUploadReportAttachment } from "@/hooks/report-attachment/useUploadReportAttachment";
import { toast } from "react-hot-toast";
import {
  ATTACHMENT_MIME_TYPES,
  exceedsUploadLimit,
  UPLOAD_LIMITS_MB,
  VIDEO_MIME_TYPES,
} from "@/lib/upload-policy";

type Props = {
  onClose: () => void;
};

export default function CreateDailyReportModal({ onClose }: Props) {
  const createDailyReport = useCreateDailyReport();
  const uploadVideo = useUploadVideoDemo();
  const uploadAttachment = useUploadReportAttachment();

  const [content, setContent] = useState("");
  const [prLink, setPrLink] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleVideoFileChange(file: File | undefined) {
    if (!file) {
      setVideoFile(null);
      return;
    }
    if (!VIDEO_MIME_TYPES.has(file.type)) {
      setVideoFile(null);
      toast.error("Video must be an MP4 or WEBM file.");
      return;
    }
    if (exceedsUploadLimit(file, UPLOAD_LIMITS_MB.reportVideo)) {
      setVideoFile(null);
      toast.error(`Video must not exceed ${UPLOAD_LIMITS_MB.reportVideo} MB.`);
      return;
    }
    setVideoFile(file);
  }

  function handleAttachmentFilesChange(files: File[]) {
    const remainingSlots = Math.max(0, 5 - attachments.length);
    const accepted: File[] = [];

    for (const file of files.slice(0, remainingSlots)) {
      if (!ATTACHMENT_MIME_TYPES.has(file.type)) {
        toast.error(`"${file.name}" has an unsupported file type.`);
        continue;
      }
      if (exceedsUploadLimit(file, UPLOAD_LIMITS_MB.reportAttachment)) {
        toast.error(`"${file.name}" exceeds ${UPLOAD_LIMITS_MB.reportAttachment} MB.`);
        continue;
      }
      accepted.push(file);
    }

    if (files.length > remainingSlots) {
      toast.error("A daily report can contain at most 5 attachments.");
    }
    if (accepted.length > 0) {
      setAttachments((current) => [...current, ...accepted]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await createDailyReport.mutateAsync({
        content,
        prLink: prLink.trim() || undefined,
        videoDemo: videoLink.trim() || undefined,
      });

      if (videoFile) {
        await uploadVideo.mutateAsync({
          id: result.data.id,
          file: videoFile,
        });
      }

      for (const file of attachments) {
        await uploadAttachment.mutateAsync({
          reportId: result.data.id,
          file,
        });
      }

      onClose();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string } };
      };
      console.error(
        "[CreateDailyReportModal] Submit failed:",
        axiosErr?.response?.data?.message ?? err,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isPending =
    isSubmitting ||
    createDailyReport.isPending ||
    uploadVideo.isPending ||
    uploadAttachment.isPending;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0e1a] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] shadow-[0_25px_80px_rgba(0,0,0,0.55)]"
      >
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

        <div className="relative p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-400 shrink-0" />
                <span className="metal-text">Create Daily Report</span>
              </h2>
              <p className="mt-1 text-sm text-muted">
                Submit your work report for today with a PR link and a video
                demo.
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all hover:rotate-90 hover:border-white/20 hover:bg-white/10"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-200">
                <FileText className="h-4 w-4 text-cyan-400" />
                Report Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe what you worked on today..."
                rows={5}
                required
                disabled={isPending}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 disabled:opacity-50 resize-none"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-200">
                <Link className="h-4 w-4 text-cyan-400" />
                PR Link
              </label>
              <input
                type="url"
                value={prLink}
                onChange={(e) => setPrLink(e.target.value)}
                placeholder="https://github.com/user/repo/pull/1"
                disabled={isPending}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-200">
                <Video className="h-4 w-4 text-cyan-400" />
                Video Demo
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={videoLink}
                  onChange={(e) => setVideoLink(e.target.value)}
                  placeholder="Paste video URL..."
                  disabled={isPending || !!videoFile}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 disabled:opacity-50"
                />
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-px flex-1 bg-white/5" />
                  <span>OR</span>
                  <span className="h-px flex-1 bg-white/5" />
                </div>
                {videoFile ? (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-2.5">
                    <span className="text-sm text-emerald-300 truncate">
                      {videoFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setVideoFile(null)}
                      disabled={isPending}
                      className="text-xs text-slate-400 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    disabled={isPending || !!videoLink.trim()}
                    onChange={(e) => handleVideoFileChange(e.target.files?.[0])}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/10 file:px-3 file:py-1 file:text-xs file:text-cyan-300 file:cursor-pointer outline-none disabled:opacity-50"
                  />
                )}
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-200">
                <Paperclip className="h-4 w-4 text-cyan-400" />
                Attachments
              </label>
              <div className="space-y-2">
                {attachments.length > 0 && (
                  <div className="space-y-1.5">
                    {attachments.map((file, i) => (
                      <div
                        key={`${file.name}-${i}`}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2"
                      >
                        <span className="text-sm text-slate-300 truncate">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setAttachments((prev) => prev.filter((_, idx) => idx !== i))
                          }
                          disabled={isPending}
                          className="text-xs text-slate-400 hover:text-red-400 ml-2 shrink-0"
                        >
                          Remove
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
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/10 file:px-3 file:py-1 file:text-xs file:text-cyan-300 file:cursor-pointer outline-none disabled:opacity-50"
                />
                <p className="text-xs text-slate-500">
                  Up to 5 files, {UPLOAD_LIMITS_MB.reportAttachment} MB each.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-300 transition hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
