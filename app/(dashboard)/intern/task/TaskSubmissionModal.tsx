"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Send, Link, Video, FileText, Loader2, Pencil } from "lucide-react";
import { useCreateTaskSubmission } from "@/hooks/task-submission/useCreateTaskSubmission";
import { useUpdateTaskSubmission } from "@/hooks/task-submission/useUpdateTaskSubmission";
import { useUploadSubmissionVideo } from "@/hooks/task-submission/useUploadSubmissionVideo";
import type { TaskSubmission } from "@/types/task-submission";
import { toast } from "react-hot-toast";
import { exceedsUploadLimit, UPLOAD_LIMITS_MB, VIDEO_MIME_TYPES } from "@/lib/upload-policy";

type Props = {
  assignmentId: string;
  submission?: TaskSubmission;
  readOnly?: boolean;
  onClose: () => void;
};

export default function TaskSubmissionModal({ assignmentId, submission, readOnly, onClose }: Props) {
  const createSubmission = useCreateTaskSubmission();
  const updateSubmission = useUpdateTaskSubmission();
  const uploadVideo = useUploadSubmissionVideo();

  const isEdit = !!submission;

  const [prLink, setPrLink] = useState(submission?.prLink ?? "");
  const [videoLink, setVideoLink] = useState(submission?.videoDemo ?? "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [note, setNote] = useState(submission?.note ?? "");
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
    if (exceedsUploadLimit(file, UPLOAD_LIMITS_MB.submissionVideo)) {
      setVideoFile(null);
      toast.error(`Video must not exceed ${UPLOAD_LIMITS_MB.submissionVideo} MB.`);
      return;
    }
    setVideoFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isEdit) {
        await updateSubmission.mutateAsync({
          id: submission!.id,
          payload: {
            prLink: prLink.trim() || null,
            videoDemo: videoLink.trim() || null,
            note: note.trim() || null,
          },
        });
      } else {
        const result = await createSubmission.mutateAsync({
          assignmentId,
          prLink: prLink.trim() || undefined,
          videoDemo: videoLink.trim() || undefined,
          note: note.trim() || undefined,
        });

        if (videoFile) {
          await uploadVideo.mutateAsync({ id: result.data.id, file: videoFile });
        }
      }

      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      console.error("[TaskSubmissionModal] Submit failed:", axiosErr?.response?.data?.message ?? err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isPending = isSubmitting || createSubmission.isPending || updateSubmission.isPending || uploadVideo.isPending;

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
                {isEdit ? (
                  <Pencil className="h-5 w-5 text-amber-400 shrink-0" />
                ) : (
                  <Send className="h-5 w-5 text-cyan-400 shrink-0" />
                )}
                <span className="metal-text">{isEdit ? "Edit Submission" : "Submit Work"}</span>
              </h2>
              <p className="mt-1 text-sm text-muted">
                {isEdit
                  ? "Update your PR link, video demo, and notes."
                  : "Submit your PR link, demo video, and notes."}
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
            {readOnly && submission ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono uppercase font-bold ${
                    submission.reviewStatus === "APPROVED" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" :
                    submission.reviewStatus === "REJECTED" ? "border-red-500/30 bg-red-500/10 text-red-300" :
                    "border-amber-500/30 bg-amber-500/10 text-amber-300"
                  }`}>{submission.reviewStatus}</span>
                </div>
                {submission.prLink && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">PR Link</p>
                    <a href={submission.prLink} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:text-cyan-300 break-all">{submission.prLink}</a>
                  </div>
                )}
                {submission.videoDemo && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Video Demo</p>
                    <a href={submission.videoDemo} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:text-cyan-300 break-all">{submission.videoDemo}</a>
                  </div>
                )}
                {submission.note && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Note</p>
                    <p className="text-sm text-slate-300">{submission.note}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500 mb-1">Submitted</p>
                  <p className="text-sm text-slate-400">{new Date(submission.submittedAt).toLocaleString("en-GB")}</p>
                </div>
                {submission.reviewComment && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Review Comment</p>
                    <p className="text-sm text-amber-300 italic">{submission.reviewComment}</p>
                  </div>
                )}
              </div>
            ) : (
            <>
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
                {!isEdit && (
                  <>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="h-px flex-1 bg-white/5" />
                      <span>OR</span>
                      <span className="h-px flex-1 bg-white/5" />
                    </div>
                    {videoFile ? (
                      <div className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-2.5">
                        <span className="text-sm text-emerald-300 truncate">{videoFile.name}</span>
                        <button type="button" onClick={() => setVideoFile(null)} disabled={isPending} className="text-xs text-slate-400 hover:text-red-400">Remove</button>
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
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-200">
                <FileText className="h-4 w-4 text-cyan-400" />
                Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Additional notes for the reviewer..."
                rows={3}
                disabled={isPending}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 disabled:opacity-50 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} disabled={isPending} className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-300 transition hover:text-white disabled:opacity-50">
                Cancel
              </button>
              {!readOnly && (
                <button type="submit" disabled={isPending} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? <Pencil className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  {isEdit ? "Update" : "Submit"}
                </button>
              )}
            </div>
            </>
            )}
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
