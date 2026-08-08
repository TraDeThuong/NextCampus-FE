"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Send, Link, Video, FileText, Loader2, Pencil, Paperclip, Download, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCreateTaskSubmission } from "@/hooks/task-submission/useCreateTaskSubmission";
import { useUpdateTaskSubmission } from "@/hooks/task-submission/useUpdateTaskSubmission";
import { useUploadSubmissionVideo } from "@/hooks/task-submission/useUploadSubmissionVideo";
import { useSystemSettings } from "@/hooks/system-setting/useSystemSettings";
import { useSubmissionAttachments } from "@/hooks/task-attachment/useSubmissionAttachments";
import { useUploadSubmissionAttachment } from "@/hooks/task-attachment/useUploadSubmissionAttachment";
import { useDeleteSubmissionAttachment } from "@/hooks/task-attachment/useDeleteSubmissionAttachment";
import type { TaskSubmission } from "@/types/task-submission";
import { toast } from "react-hot-toast";
import { ATTACHMENT_MIME_TYPES, exceedsUploadLimit, UPLOAD_LIMITS_MB, UPLOAD_MAX_FILES, VIDEO_MIME_TYPES } from "@/lib/upload-policy";

const MAX_SUBMISSION_ATTACHMENTS = UPLOAD_MAX_FILES.submissionAttachment;

type Props = { assignmentId: string; submission?: TaskSubmission; readOnly?: boolean; onClose: () => void };

export default function TaskSubmissionModal({ assignmentId, submission, readOnly, onClose }: Props) {
  const tm = useTranslations("intern.tasks.submissionModal");
  const createSubmission = useCreateTaskSubmission(); const updateSubmission = useUpdateTaskSubmission();
  const uploadVideo = useUploadSubmissionVideo(); const isView = !!submission && !!readOnly; const isEdit = !!submission && !readOnly;
  const uploadAttachment = useUploadSubmissionAttachment(); const deleteAttachment = useDeleteSubmissionAttachment();
  const { data: settingsResponse } = useSystemSettings(!readOnly);
  const submissionVideoLimitMb = settingsResponse?.data.SUBMISSION_MAX_FILE_SIZE_MB ?? UPLOAD_LIMITS_MB.submissionVideo;
  const submissionAttachmentLimitMb = settingsResponse?.data.SUBMISSION_ATTACHMENT_MAX_FILE_SIZE_MB ?? UPLOAD_LIMITS_MB.submissionAttachment;

  const [prLink, setPrLink] = useState(submission?.prLink ?? "");
  const [videoLink, setVideoLink] = useState(submission?.videoDemo ?? "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [note, setNote] = useState(submission?.note ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSubmissionId, setCreatedSubmissionId] = useState<string | null>(null);
  const activeSubmissionId = createdSubmissionId ?? submission?.id;
  const initialAttachments = activeSubmissionId === submission?.id ? submission?.attachments : undefined;
  const { data: attachmentsResponse } = useSubmissionAttachments(activeSubmissionId, initialAttachments);
  const existingAttachments = attachmentsResponse?.data ?? initialAttachments ?? [];

  function handleVideoFileChange(file: File | undefined) {
    if (!file) { setVideoFile(null); return; }
    if (!VIDEO_MIME_TYPES.has(file.type)) { setVideoFile(null); toast.error(tm("videoTypeError")); return; }
    if (exceedsUploadLimit(file, submissionVideoLimitMb)) { setVideoFile(null); toast.error(tm("videoSizeError", { limit: submissionVideoLimitMb })); return; }
    setVideoFile(file);
  }

  function handleAttachmentFilesChange(files: File[]) {
    const remainingSlots = Math.max(
      0,
      MAX_SUBMISSION_ATTACHMENTS - existingAttachments.length - attachmentFiles.length,
    );
    const accepted: File[] = [];

    for (const file of files.slice(0, remainingSlots)) {
      if (!ATTACHMENT_MIME_TYPES.has(file.type)) {
        toast.error(tm("unsupportedAttachmentType", { name: file.name }));
        continue;
      }
      if (exceedsUploadLimit(file, submissionAttachmentLimitMb)) {
        toast.error(tm("attachmentSizeError", { name: file.name, limit: submissionAttachmentLimitMb }));
        continue;
      }
      accepted.push(file);
    }

    if (files.length > remainingSlots) {
      toast.error(tm("maxAttachments", { max: MAX_SUBMISSION_ATTACHMENTS }));
    }
    if (accepted.length > 0) {
      setAttachmentFiles((current) => [...current, ...accepted]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (isSubmitting) return; setIsSubmitting(true);
    try {
      let subId = createdSubmissionId;
      if (!subId) {
        if (isEdit) {
          const result = await updateSubmission.mutateAsync({ id: submission!.id, payload: { prLink: prLink.trim() || null, videoDemo: videoLink.trim() || null, note: note.trim() || null }, suppressSuccessToast: true });
          subId = result.data.id;
          setCreatedSubmissionId(subId);
        } else {
          const result = await createSubmission.mutateAsync({ assignmentId, prLink: prLink.trim() || undefined, videoDemo: videoLink.trim() || undefined, note: note.trim() || undefined });
          subId = result.data.id;
          setCreatedSubmissionId(subId);
        }
      }
      if (videoFile) {
        await uploadVideo.mutateAsync({ id: subId, file: videoFile });
        setVideoFile(null);
      }
      const remainingAttachments = [...attachmentFiles];
      for (const file of remainingAttachments) {
        await uploadAttachment.mutateAsync({ submissionId: subId, file });
        setAttachmentFiles((current) => current.filter((item) => item !== file));
      }
      toast.success(tm(isEdit ? "updateSuccess" : "submitSuccess"));
      onClose();
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isPending = isSubmitting || createSubmission.isPending || updateSubmission.isPending || uploadVideo.isPending || uploadAttachment.isPending || deleteAttachment.isPending;

  return createPortal(
    <div onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0e1a] p-4">
      <div onClick={(e) => e.stopPropagation()} className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" /><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        <div className="relative p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">{isView ? <FileText className="h-5 w-5 shrink-0 text-cyan-400" /> : isEdit ? <Pencil className="h-5 w-5 text-amber-400 shrink-0" /> : <Send className="h-5 w-5 text-cyan-400 shrink-0" />}<span className="metal-text">{isView ? tm("viewTitle") : isEdit ? tm("editTitle") : tm("submitTitle")}</span></h2>
              <p className="mt-1 text-sm text-muted">{isView ? tm("viewDesc") : isEdit ? tm("editDesc") : tm("submitDesc")}</p>
            </div>
            <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all hover:rotate-90 hover:border-white/20 hover:bg-white/10"><X className="h-5 w-5 text-white" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {readOnly && submission ? (
              <div className="space-y-4">
                <div><p className="text-xs text-slate-500 mb-1">{tm("status")}</p><span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono uppercase font-bold ${submission.reviewStatus === "APPROVED" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : submission.reviewStatus === "REJECTED" ? "border-red-500/30 bg-red-500/10 text-red-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`}>{submission.reviewStatus}</span></div>
                {submission.prLink && <div><p className="text-xs text-slate-500 mb-1">{tm("prLink")}</p><a href={submission.prLink} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:text-cyan-300 break-all">{submission.prLink}</a></div>}
                {submission.videoDemo && <div><p className="text-xs text-slate-500 mb-1">{tm("videoDemo")}</p><a href={submission.videoDemo} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:text-cyan-300 break-all">{submission.videoDemo}</a></div>}
                {existingAttachments.length > 0 && <div><p className="text-xs text-slate-500 mb-1.5">{tm("attachments")}</p><div className="space-y-1.5">{existingAttachments.map((attachment) => <a key={attachment.id} href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/20 hover:text-cyan-300"><Download className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{attachment.fileName}</span></a>)}</div></div>}
                {submission.note && <div><p className="text-xs text-slate-500 mb-1">{tm("note")}</p><p className="text-sm text-slate-300">{submission.note}</p></div>}
                <div><p className="text-xs text-slate-500 mb-1">{tm("submitted")}</p><p className="text-sm text-slate-400">{new Date(submission.submittedAt).toLocaleString("en-GB")}</p></div>
                {submission.reviewComment && <div><p className="text-xs text-slate-500 mb-1">{tm("reviewComment")}</p><p className="text-sm text-amber-300 italic">{submission.reviewComment}</p></div>}
              </div>
            ) : (
            <>
            <div><label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-200"><Link className="h-4 w-4 text-cyan-400" />{tm("prLink")}</label><input type="url" value={prLink} onChange={(e) => setPrLink(e.target.value)} placeholder={tm("prPlaceholder")} disabled={isPending} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 disabled:opacity-50" /></div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-200"><Video className="h-4 w-4 text-cyan-400" />{tm("videoDemo")}</label>
              <div className="space-y-2">
                <input type="url" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} placeholder={tm("videoPlaceholder")} disabled={isPending || !!videoFile} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 disabled:opacity-50" />
                <div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-px flex-1 bg-white/5" /><span>{tm("or")}</span><span className="h-px flex-1 bg-white/5" /></div>
                  {videoFile ? <div className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-2.5"><span className="text-sm text-emerald-300 truncate">{videoFile.name}</span><button type="button" onClick={() => setVideoFile(null)} disabled={isPending} className="text-xs text-slate-400 hover:text-red-400">{tm("remove")}</button></div> :
                   <input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,.mp4,.webm,.mov,.mkv,.avi" disabled={isPending || !!videoLink.trim()} onChange={(e) => handleVideoFileChange(e.target.files?.[0])} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/10 file:px-3 file:py-1 file:text-xs file:text-cyan-300 file:cursor-pointer outline-none disabled:opacity-50" />}
                <p className="text-xs text-slate-500">{tm("videoFileHint", { limit: submissionVideoLimitMb })}</p>
              </div>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-200"><Paperclip className="h-4 w-4 text-cyan-400" />{tm("attachments")}</label>
              <div className="space-y-2">
                {existingAttachments.map((attachment) => <div key={attachment.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2"><a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2 text-sm text-slate-300 transition hover:text-cyan-300"><Download className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{attachment.fileName}</span></a><button type="button" onClick={() => activeSubmissionId && deleteAttachment.mutate({ submissionId: activeSubmissionId, attachmentId: attachment.id })} disabled={isPending || !activeSubmissionId} className="ml-2 shrink-0 text-slate-400 transition hover:text-red-400 disabled:opacity-50" aria-label={tm("deleteAttachment", { name: attachment.fileName })}><Trash2 className="h-3.5 w-3.5" /></button></div>)}
                {attachmentFiles.map((file, index) => <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-2"><span className="truncate text-sm text-emerald-300">{file.name}</span><button type="button" onClick={() => setAttachmentFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={isPending} className="ml-2 shrink-0 text-xs text-slate-400 transition hover:text-red-400 disabled:opacity-50">{tm("remove")}</button></div>)}
                {existingAttachments.length + attachmentFiles.length < MAX_SUBMISSION_ATTACHMENTS ? <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.zip,.rar,.7z" disabled={isPending} onChange={(e) => { handleAttachmentFilesChange(Array.from(e.target.files ?? [])); e.target.value = ""; }} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-cyan-500/10 file:px-3 file:py-1 file:text-xs file:text-cyan-300 outline-none disabled:opacity-50" /> : <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-300">{tm("attachmentLimitReached", { max: MAX_SUBMISSION_ATTACHMENTS })}</p>}
                <p className="text-xs text-slate-500">{tm("attachmentsHint", { max: MAX_SUBMISSION_ATTACHMENTS, limit: submissionAttachmentLimitMb })}</p>
              </div>
            </div>
            <div><label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-200"><FileText className="h-4 w-4 text-cyan-400" />{tm("note")}</label><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={tm("notePlaceholder")} rows={3} disabled={isPending} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 disabled:opacity-50 resize-none" /></div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} disabled={isPending} className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-300 transition hover:text-white disabled:opacity-50">{tm("cancel")}</button>
              {!readOnly && <button type="submit" disabled={isPending} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50">{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? <Pencil className="h-4 w-4" /> : <Send className="h-4 w-4" />}{isEdit ? tm("update") : tm("submit")}</button>}
            </div>
            </>
            )}
          </form>
        </div>
      </div>
    </div>, document.body,
  );
}
