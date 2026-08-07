"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Link, Video, Loader2, Trash2, AlertTriangle, Paperclip, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUpdateDailyReport } from "@/hooks/daily-report/useUpdateDailyReport";
import { useDeleteDailyReport } from "@/hooks/daily-report/useDeleteDailyReport";
import { useUploadVideoDemo } from "@/hooks/daily-report/useUploadVideoDemo";
import { useUploadReportAttachment } from "@/hooks/report-attachment/useUploadReportAttachment";
import { useDeleteReportAttachment } from "@/hooks/report-attachment/useDeleteReportAttachment";
import { useReportAttachments } from "@/hooks/report-attachment/useReportAttachments";
import type { DailyReport } from "@/types/daily-report";
import { toast } from "react-hot-toast";
import { ATTACHMENT_MIME_TYPES, exceedsUploadLimit, UPLOAD_LIMITS_MB, VIDEO_MIME_TYPES } from "@/lib/upload-policy";

type Props = { report: DailyReport; onClose: () => void };

export default function EditDailyReportModal({ report, onClose }: Props) {
  const tm = useTranslations("intern.dailyReport.editModal");
  const tc = useTranslations("intern.dailyReport.createModal");
  const updateDailyReport = useUpdateDailyReport(); const deleteDailyReport = useDeleteDailyReport();
  const uploadVideo = useUploadVideoDemo();
  const uploadAttachment = useUploadReportAttachment(); const deleteAttachment = useDeleteReportAttachment();
  const { data: attachmentsData } = useReportAttachments(report.id);
  const existingAttachments = attachmentsData?.data ?? [];

  const [content, setContent] = useState(report.content); const [prLink, setPrLink] = useState(report.prLink ?? "");
  const [videoLink, setVideoLink] = useState(report.videoDemo ?? "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleVideoFileChange(file: File | undefined) {
    if (!file) { setVideoFile(null); return; }
    if (!VIDEO_MIME_TYPES.has(file.type)) { setVideoFile(null); toast.error(tc("videoTypeError")); return; }
    if (exceedsUploadLimit(file, UPLOAD_LIMITS_MB.reportVideo)) { setVideoFile(null); toast.error(tc("videoSizeError", { limit: UPLOAD_LIMITS_MB.reportVideo })); return; }
    setVideoFile(file);
  }

  function handleAttachmentFilesChange(files: File[]) {
    const totalCurrentCount = existingAttachments.length + newAttachments.length;
    const remainingSlots = Math.max(0, 5 - totalCurrentCount);
    const accepted: File[] = [];
    for (const file of files.slice(0, remainingSlots)) {
      if (!ATTACHMENT_MIME_TYPES.has(file.type)) { toast.error(tc("unsupportedType", { name: file.name })); continue; }
      if (exceedsUploadLimit(file, UPLOAD_LIMITS_MB.reportAttachment)) { toast.error(tc("fileSizeError", { name: file.name, limit: UPLOAD_LIMITS_MB.reportAttachment })); continue; }
      accepted.push(file);
    }
    if (files.length > remainingSlots) toast.error(tc("maxAttachments"));
    if (accepted.length > 0) setNewAttachments((current) => [...current, ...accepted]);
  }

  async function handleSubmit(e: React.FormEvent) { e.preventDefault(); if (isSubmitting) return; setIsSubmitting(true);
    try {
      await updateDailyReport.mutateAsync({ id: report.id, payload: { content, prLink: prLink.trim() || null, videoDemo: videoLink.trim() || null } });
      if (videoFile) {
        await uploadVideo.mutateAsync({ id: report.id, file: videoFile });
        setVideoFile(null);
      }
      const remainingAttachments = [...newAttachments];
      for (const file of remainingAttachments) {
        await uploadAttachment.mutateAsync({ reportId: report.id, file });
        setNewAttachments((current) => current.filter((f) => f !== file));
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() { if (isSubmitting) return; setIsSubmitting(true); try { await deleteDailyReport.mutateAsync(report.id); onClose(); } catch (err) { console.error(err); } finally { setIsSubmitting(false); } }

  const isPending = isSubmitting || updateDailyReport.isPending || deleteDailyReport.isPending || uploadVideo.isPending || uploadAttachment.isPending || deleteAttachment.isPending;

  return createPortal(
    <div onClick={() => { if (showDeleteConfirm) setShowDeleteConfirm(false); else onClose(); }} className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0e1a] p-4">
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" /><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        <div className="relative p-6">
          <div className="mb-6 flex items-start justify-between">
            <div><h2 className="text-xl font-bold flex items-center gap-2"><FileText className="h-5 w-5 text-cyan-400 shrink-0" /><span className="metal-text">{tm("title")}</span></h2><p className="mt-1 text-sm text-muted">{tm("description")}</p></div>
            <button onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all hover:rotate-90 hover:border-white/20 hover:bg-white/10"><X className="h-5 w-5 text-white" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-200"><FileText className="h-4 w-4 text-cyan-400" />{tm("reportContent")}</label><textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={tm("contentPlaceholder")} rows={5} required disabled={isPending} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 disabled:opacity-50 resize-none" /></div>
            <div><label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-200"><Link className="h-4 w-4 text-cyan-400" />{tm("prLink")}</label><input type="url" value={prLink} onChange={(e) => setPrLink(e.target.value)} placeholder={tm("prPlaceholder")} disabled={isPending} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 disabled:opacity-50" /></div>
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-200"><Video className="h-4 w-4 text-cyan-400" />{tm("videoDemo")}</label>
              <div className="space-y-2">
                <input type="url" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} placeholder={tm("videoPlaceholder")} disabled={isPending || !!videoFile} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-400/50 disabled:opacity-50" />
                <div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-px flex-1 bg-white/5" /><span>{tc("or")}</span><span className="h-px flex-1 bg-white/5" /></div>
                {videoFile ? <div className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-2.5"><span className="text-sm text-emerald-300 truncate">{videoFile.name}</span><button type="button" onClick={() => setVideoFile(null)} disabled={isPending} className="text-xs text-slate-400 hover:text-red-400">{tc("remove")}</button></div> :
                 <input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo,.mp4,.webm,.mov,.mkv,.avi" disabled={isPending || !!videoLink.trim()} onChange={(e) => handleVideoFileChange(e.target.files?.[0])} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/10 file:px-3 file:py-1 file:text-xs file:text-cyan-300 file:cursor-pointer outline-none disabled:opacity-50" />}
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-200"><Paperclip className="h-4 w-4 text-cyan-400" />{tm("attachments")}</label>
              <div className="space-y-2">
                {existingAttachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                    <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 hover:text-cyan-400 truncate flex items-center gap-2"><Download className="h-3.5 w-3.5 shrink-0" />{att.fileName}</a>
                    <button type="button" onClick={() => deleteAttachment.mutate({ reportId: report.id, attachmentId: att.id })} disabled={isPending} className="text-xs text-slate-400 hover:text-red-400 ml-2 shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                {newAttachments.map((file, i) => (
                  <div key={`new-${file.name}-${i}`} className="flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-2">
                    <span className="text-sm text-emerald-300 truncate">{file.name} {tm("newLabel")}</span>
                    <button type="button" onClick={() => setNewAttachments((prev) => prev.filter((_, idx) => idx !== i))} disabled={isPending} className="text-xs text-slate-400 hover:text-red-400 ml-2 shrink-0">{tm("remove")}</button>
                  </div>
                ))}
                <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,.pdf,.doc,.docx,.zip,.rar,.7z" disabled={isPending} onChange={(e) => { const files = Array.from(e.target.files ?? []); handleAttachmentFilesChange(files); e.target.value = ""; }} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/10 file:px-3 file:py-1 file:text-xs file:text-cyan-300 file:cursor-pointer outline-none disabled:opacity-50" />
                <p className="text-xs text-slate-500">{tc("attachmentsHint", { limit: UPLOAD_LIMITS_MB.reportAttachment })}</p>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button type="button" onClick={() => setShowDeleteConfirm(true)} disabled={isPending} className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm text-red-400 transition hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50">
                {deleteDailyReport.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}{tm("delete")}
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} disabled={isPending} className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-300 transition hover:text-white disabled:opacity-50">{tm("cancel")}</button>
                <button type="submit" disabled={isPending} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-500 disabled:opacity-50">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}{tm("update")}
                </button>
              </div>
            </div>
          </form>

          {showDeleteConfirm && (
            <div onClick={() => setShowDeleteConfirm(false)} className="absolute inset-0 z-10 flex items-center justify-center rounded-[32px] bg-[#0a0e1a]/90 backdrop-blur-sm">
              <div onClick={(e) => e.stopPropagation()} className="mx-6 w-full max-w-sm rounded-2xl border border-red-500/20 bg-[#0f1520] p-6 shadow-[0_25px_50px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10"><AlertTriangle className="h-5 w-5 text-red-400" /></div>
                  <div><h3 className="text-base font-semibold text-white">{tm("deleteConfirmTitle")}</h3><p className="text-sm text-slate-400">{tm("deleteConfirmDesc")}</p></div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowDeleteConfirm(false)} disabled={isPending} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:text-white disabled:opacity-50">{tm("cancel")}</button>
                  <button type="button" onClick={handleDelete} disabled={isPending} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50">{deleteDailyReport.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}{tm("delete")}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>, document.body,
  );
}
