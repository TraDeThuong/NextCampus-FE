"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Layers,
  GitBranch,
  Paperclip,
  FileText,
  Film,
  FileArchive,
  ImageIcon,
  User,
  Clock,
  ExternalLink,
  Send,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Video,
  Sparkles,
} from "lucide-react";
import { useTask } from "@/hooks/task/useTask";
import { useTaskSubmissions } from "@/hooks/task-submission/useTaskSubmissions";
import Spinner from "@/components/ui/Spinner";
import MetalCard from "@/components/ui/MetalCard";
import TaskAiRecommendationModal from "../TaskAiRecommendationModal";

const priorityBadge: Record<string, string> = {
  HIGH: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  LOW: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

const statusBadge: Record<string, string> = {
  DONE: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  IN_PROGRESS: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  REVIEW: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  TODO: "border-slate-700 bg-slate-800/60 text-slate-400",
  BLOCKED: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  PENDING_APPROVAL: "border-amber-500/20 bg-amber-500/10 text-amber-400",
};

function getFileIcon(mime: string) {
  const t = mime.split("/")[0];
  if (t === "image") return <ImageIcon className="h-4 w-4 shrink-0 text-emerald-400" />;
  if (t === "video") return <Film className="h-4 w-4 shrink-0 text-cyan-400" />;
  if (mime.includes("zip") || mime.includes("rar") || mime.includes("7z"))
    return <FileArchive className="h-4 w-4 shrink-0 text-indigo-400" />;
  if (mime.includes("pdf") || mime.includes("document") || mime.includes("sheet"))
    return <FileText className="h-4 w-4 shrink-0 text-amber-400" />;
  return <Paperclip className="h-4 w-4 shrink-0 text-slate-400" />;
}

function formatSize(bytes: number) {
  if (bytes === 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useTask(id);
  const task = data?.data;
  const [showAi, setShowAi] = useState(false);

  const { data: submissionsData } = useTaskSubmissions(
    task?.assignment?.id ? { assignmentId: task.assignment.id, sortBy: "attempt", order: "asc", limit: 50 } : undefined,
  );
  const submissions = submissionsData?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm text-slate-400">Task not found.</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium text-sky-400 hover:text-sky-300 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-auto space-y-6 pb-16 px-4">

      <button
        onClick={() => router.back()}
        className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to Tasks
      </button>

      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
            {task.code || "—"}
          </span>
          {task.priority && (
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${priorityBadge[task.priority] ?? ""}`}>
              {task.priority}
            </span>
          )}
          {task.assignment?.status && (
            <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold border ${statusBadge[task.assignment.status] ?? ""}`}>
              {task.assignment.status.replace("_", " ")}
            </span>
          )}

          {/* AI assignment button — only when not yet assigned */}
          {(!task.assignment || !task.assignment.internId) && (
            <button
              id={`ai-recommend-btn-${task.id}`}
              onClick={() => setShowAi(true)}
              className="ml-auto flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-400 hover:bg-sky-500/20 hover:border-sky-500/50 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Assignment
            </button>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white bg-clip-text">
          {task.title}
        </h1>
      </div>

      {/* AI Recommendation Modal */}
      {showAi && (
        <TaskAiRecommendationModal
          taskId={task.id}
          taskTitle={task.title}
          isAssigned={!!task.assignment?.internId}
          onClose={() => setShowAi(false)}
        />
      )}

      {/* PERFECT 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* LEFT COLUMN (2/3): MAIN TASK CONTENT */}
        <div className="lg:col-span-2 space-y-6">

          {/* Card: Content Details & Requirements */}
          <Card icon={<FileText className="h-4 w-4 text-emerald-400" />} title="Description & Requirements">
            <div className="space-y-6">
              {task.description && (
                <div className="space-y-2">
                  <Label>Detailed Description</Label>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/20 p-3.5 rounded-xl border border-slate-800/50">
                    {task.description}
                  </p>
                </div>
              )}

              {task.acceptanceCriteria && (
                <div className="space-y-2">
                  <Label>Acceptance Criteria</Label>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-emerald-400/90 leading-relaxed font-mono whitespace-pre-line shadow-inner">
                    {task.acceptanceCriteria}
                  </div>
                </div>
              )}

              {task.taskNotes && (
                <div className="space-y-2">
                  <Label>Important Notes</Label>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-300/90 italic whitespace-pre-wrap">
                    {task.taskNotes}
                  </div>
                </div>
              )}

              {!task.description && !task.acceptanceCriteria && !task.taskNotes && (
                <p className="text-sm italic text-slate-500 text-center py-4">No description, criteria, or notes provided.</p>
              )}
            </div>
          </Card>

          {/* Card: Các Mối Quan Hệ Phụ Thuộc (Chỉ hiện khi có dữ liệu) */}
          {(task.dependsOn.length > 0 || task.dependencies.length > 0 || task.recreatedTask) && (
            <Card icon={<GitBranch className="h-4 w-4 text-purple-400" />} title="Task Relations & Dependencies">
              <div className="space-y-4">
                {task.dependsOn.length > 0 && (
                  <div className="space-y-2">
                    <Label>Depends On (Prerequisites)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {task.dependsOn.map((d) => (
                        <div key={d.id} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-2.5 text-xs text-slate-300">
                          <span className="font-mono font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">{d.code}</span>
                          <span className="truncate font-medium">{d.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {task.dependencies.length > 0 && (
                  <div className="space-y-2">
                    <Label>Depended By (Consequences)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {task.dependencies.map((d) => (
                        <div key={d.id} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-2.5 text-xs text-slate-300">
                          <span className="font-mono font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">{d.code}</span>
                          <span className="truncate font-medium">{d.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {task.recreatedTask && (
                  <div className="space-y-2">
                    <Label>Recreated From</Label>
                    <div className="inline-flex items-center flex-wrap gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-xs">
                      <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">{task.recreatedTask.code}</span>
                      <span className="text-slate-200 font-medium">{task.recreatedTask.title}</span>
                      {task.recreatedTask.assignment?.intern?.fullName && (
                        <span className="text-slate-400 font-normal">
                          (Assigned to: {task.recreatedTask.assignment.intern.fullName})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Card: Attachments */}
          {task.attachments.length > 0 && (
            <Card icon={<Paperclip className="h-4 w-4 text-cyan-400" />} title={`Attachments (${task.attachments.length})`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {task.attachments.map((a) => (
                  <a
                    key={a.id}
                    href={a.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-900/30 p-3 hover:bg-slate-800/50 hover:border-slate-700 transition group"
                  >
                    <div className="p-2 rounded-lg bg-slate-950 shadow-inner">
                      {getFileIcon(a.mimeType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-200 group-hover:text-sky-400 transition">
                        {a.fileName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {formatSize(a.fileSize)}{formatSize(a.fileSize) ? " · " : ""}{a.mimeType.split("/")[1] || a.mimeType}
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-sky-400 transition-all duration-200" />
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN (1/3): ALL METADATA & SIDE-INFO */}
        <div className="space-y-5 lg:sticky lg:top-6">

          {/* Group 1: Timeline & Progress */}
          <Card icon={<Clock className="h-4 w-4 text-amber-400" />} title="Timeline & Plan">
            <div className="space-y-4">
              <Field label="Deadline" value={fmtDate(task.deadline)} accent />
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                <Field label="Start Date" value={fmtDate(task.startDate)} />
                <Field label="Est. Days" value={task.estDays != null ? `${task.estDays} days` : "—"} />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                <Field label="Phase" value={task.phase} />
                <Field label="Module" value={task.module} />
              </div>
            </div>
          </Card>

          {/* Group 2: Assignment Info */}
          {task.assignment && (
            <Card icon={<User className="h-4 w-4 text-indigo-400" />} title="Assignment Detail">
              <div className="space-y-4">
                <Field label="Assignee (Intern)" value={task.assignment.intern?.fullName} highlight />
                <Field label="Support" value={task.assignment.support?.fullName} />
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                  <Field label="Assigned At" value={fmtDate(task.assignment.assignedAt)} />
                  <Field label="Last Update" value={fmtDate(task.assignment.updatedAt)} />
                </div>
              </div>
            </Card>
          )}

          {/* Group 3: System Admin Info */}
          <Card icon={<Layers className="h-4 w-4 text-sky-400" />} title="System Properties">
            <div className="space-y-4">
              <Field label="Task Group" value={task.taskGroup?.name} />
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                <Field label="Created By" value={task.creator?.fullName} />
                <Field label="Task Code" value={task.code} mono />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                <Field label="System Created" value={fmtDate(task.createdAt)} />
                <Field label="System Updated" value={fmtDate(task.updatedAt)} />
              </div>
            </div>
          </Card>

        </div>

      </div>

      {/* Submission History — full width thread */}
      {submissions.length > 0 && (
        <Card icon={<MessageSquare className="h-4 w-4 text-purple-400" />} title={`Submission History (${submissions.length})`}>
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className={`rounded-xl border p-4 ${
                  sub.reviewStatus === "APPROVED"
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : sub.reviewStatus === "REJECTED"
                    ? "border-rose-500/20 bg-rose-500/5"
                    : "border-amber-500/20 bg-amber-500/5"
                }`}
              >
                {/* Submission header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-0.5 text-xs font-mono font-bold text-slate-300">
                      <Send className="h-3 w-3" />#{sub.attempt}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase ${
                      sub.reviewStatus === "APPROVED"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : sub.reviewStatus === "REJECTED"
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}>
                      {sub.reviewStatus === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                      {sub.reviewStatus === "REJECTED" && <XCircle className="h-3 w-3" />}
                      {sub.reviewStatus === "PENDING" && <Clock className="h-3 w-3" />}
                      {sub.reviewStatus}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {new Date(sub.submittedAt).toLocaleString("en-US")}
                  </span>
                </div>

                {/* Intern's submission content */}
                <div className="space-y-2">
                  {sub.note && (
                    <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Intern&apos;s Note</p>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{sub.note}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {sub.prLink && (
                      <a href={sub.prLink} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition">
                        <ExternalLink className="h-3 w-3" />Pull Request
                      </a>
                    )}
                    {sub.videoDemo && (
                      <a href={sub.videoDemo} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition">
                        <Video className="h-3 w-3" />Video Demo
                      </a>
                    )}
                  </div>
                  {sub.attachments && sub.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {sub.attachments.map((att) => (
                        <a key={att.id} href={att.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/40 px-2 py-1 text-xs text-slate-400 hover:text-sky-400 hover:border-slate-700 transition">
                          {getFileIcon(att.mimeType)}
                          <span className="truncate max-w-[120px]">{att.fileName}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Leader's review */}
                {sub.reviewStatus !== "PENDING" && (
                  <div className={`mt-3 rounded-lg border p-3 ${
                    sub.reviewStatus === "APPROVED"
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-rose-500/20 bg-rose-500/5"
                  }`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Leader&apos;s Review
                      </span>
                      {sub.reviewer && (
                        <span className="text-[10px] text-slate-400">by {sub.reviewer.fullName}</span>
                      )}
                      {sub.reviewedAt && (
                        <span className="text-[10px] text-slate-600 ml-auto">
                          {new Date(sub.reviewedAt).toLocaleString("en-US")}
                        </span>
                      )}
                    </div>
                    {sub.reviewComment ? (
                      <p className={`text-sm italic ${
                        sub.reviewStatus === "APPROVED" ? "text-emerald-300/90" : "text-rose-300/90"
                      }`}>
                        {sub.reviewComment}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        {sub.reviewStatus === "APPROVED" ? "Approved without comment." : "Rejected without comment."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {task.assignment && submissions.length === 0 && (
        <Card icon={<Send className="h-4 w-4 text-slate-500" />} title="Submission History">
          <p className="text-sm text-slate-500 italic text-center py-4">
            No submissions yet. The intern hasn&apos;t submitted work for this task.
          </p>
        </Card>
      )}
    </div>
  );
}

/* ─── STYLED UTILITY COMPONENTS ─────────────────────────────────────────────── */

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <MetalCard>
      <div className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-950/40 border border-slate-800/60 shadow-inner">
            {icon}
          </div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h3>
        </div>
        {children}
      </div>
    </MetalCard>
  );
}

function Field({ label, value, accent, highlight, mono }: { label: string; value?: string | null; accent?: boolean; highlight?: boolean; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-sm tracking-wide truncate ${mono ? "font-mono text-xs text-slate-400" : ""}
        ${accent ? "font-bold text-rose-400 bg-rose-500/5 px-2 py-1 rounded border border-rose-500/10 inline-block mt-1" : ""}
        ${highlight ? "font-semibold text-sky-400" : "text-slate-200"}`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{children}</p>;
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
