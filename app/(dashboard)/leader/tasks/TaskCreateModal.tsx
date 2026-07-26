"use client";

import { useState, useContext, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Loader2,
  Paperclip,
  X,
  Link,
  ImageIcon,
  Film,
  FileArchive,
  FileText,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Button from "@/components/ui/Button";
import { useCreateTask } from "@/hooks/task/useCreateTask";
import { useTaskGroups } from "@/hooks/task-group/useTaskGroups";
import { useInterns } from "@/hooks/intern/useInterns";
import { useCreateTaskAssignment } from "@/hooks/task-assignment/useCreateTaskAssignment";
import { taskAttachmentService } from "@/services/task-attachment.service";
import { AuthContext } from "@/contexts/AuthContext";
import type { CreateTaskPayload } from "@/types/task";

const TODAY = new Date().toISOString().split("T")[0];
const MAX_FILES = 10;
const MAX_LINKS = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const BATCH_SIZE = 5;

const ALLOWED_TYPES = new Set([
  "image/jpeg","image/png","image/webp","image/gif",
  "application/pdf","application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip","application/x-zip-compressed","application/x-rar-compressed","application/x-7z-compressed",
  "video/mp4","video/webm",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-excel",
]);

type FileCategory = "image" | "video" | "archive" | "doc" | "other";
type ItemStatus = "pending" | "uploading" | "success" | "error";

function getFileCategory(mimeType: string): FileCategory {
  const t = mimeType.split("/")[0];
  if (t === "image") return "image";
  if (t === "video") return "video";
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z")) return "archive";
  if (mimeType.includes("pdf") || mimeType.includes("msword") || mimeType.includes("officedocument") || mimeType.includes("excel")) return "doc";
  return "other";
}

function getFileIcon(cat: FileCategory) {
  return { image: ImageIcon, video: Film, archive: FileArchive, doc: FileText, other: Paperclip }[cat];
}

function getFileColor(cat: FileCategory) {
  return { image: "text-emerald-400", video: "text-cyan-400", archive: "text-indigo-400", doc: "text-amber-400", other: "text-muted" }[cat];
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  onCloseModal?: () => void;
}

interface FileItem {
  id: number;
  file: File;
  name: string;
  size: number;
  mimeType: string;
}

interface LinkItem {
  id: number;
  fileName: string;
  fileUrl: string;
}

let nextId = 0;

export default function TaskCreateModal({ onCloseModal }: Props) {
  const createTask = useCreateTask();
  const createAssignment = useCreateTaskAssignment();
  const queryClient = useQueryClient();
  const auth = useContext(AuthContext);
  const currentUserId = auth?.state.user?.id;

  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkErr, setLinkErr] = useState("");
  const [linkItems, setLinkItems] = useState<LinkItem[]>([]);
  const [fileStatuses, setFileStatuses] = useState<Record<number, ItemStatus>>({});
  const [linkStatuses, setLinkStatuses] = useState<Record<number, ItemStatus>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [assignMode, setAssignMode] = useState<"none" | "my" | "other">("none");
  const [selectedInternId, setSelectedInternId] = useState<string>("");
  const [step, setStep] = useState(1);
  const submittingRef = useRef(false);

  // fetch interns: my team + all (for other teams filter)
  const { data: myInternsData } = useInterns({ leaderId: currentUserId });
  const { data: allInternsData } = useInterns();
  const myInterns = myInternsData?.data ?? [];
  const otherInterns = (allInternsData?.data ?? []).filter(
    (i) => i.leaderId !== currentUserId
  );

  const addLink = () => {
    const trimmed = linkUrl.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      setLinkErr("Invalid URL format");
      return;
    }
    if (linkItems.length >= MAX_LINKS) {
      toast.error(`Maximum ${MAX_LINKS} links allowed`);
      return;
    }
    if (linkItems.some((l) => l.fileUrl === trimmed)) {
      toast.error("This URL has already been added");
      return;
    }
    setLinkErr("");
    const fileName = trimmed.split("/").pop()?.split("?")[0] || "link";
    setLinkItems((prev) => [...prev, { id: nextId++, fileName, fileUrl: trimmed }]);
    setLinkUrl("");
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const valid: FileItem[] = [];

    for (const file of selected) {
      if (fileItems.length + valid.length >= MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed`);
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds 50MB limit`);
        continue;
      }
      if (!ALLOWED_TYPES.has(file.type)) {
        toast.error(`"${file.name}" has unsupported file type`);
        continue;
      }
      if (fileItems.some((f) => f.name === file.name) || valid.some((f) => f.name === file.name)) {
        toast.error(`"${file.name}" is a duplicate`, { icon: "⚠️" });
        continue;
      }
      valid.push({ id: nextId++, file, name: file.name, size: file.size, mimeType: file.type });
    }

    if (valid.length > 0) setFileItems((prev) => [...prev, ...valid]);
    // reset input so user can re-select the same file
    e.target.value = "";
  };

  const removeFile = (id: number) => {
    setFileItems((prev) => prev.filter((f) => f.id !== id));
    setFileStatuses((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const removeLink = (id: number) => {
    setLinkItems((prev) => prev.filter((l) => l.id !== id));
    setLinkStatuses((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const { data: taskGroupsData } = useTaskGroups();
  const taskGroups = taskGroupsData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateTaskPayload>({
    mode: "onBlur",
  });

  const deadlineVal = watch("deadline");

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    let valid = false;
    if (step === 1) valid = await trigger(["title", "deadline", "code", "priority", "taskGroupId"]);
    if (step === 2) valid = await trigger(["startDate", "estDays", "phase", "module", "description", "acceptanceCriteria", "taskNotes"]);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = async (data: CreateTaskPayload) => {
    if (step !== 3 || submittingRef.current) return;
    submittingRef.current = true;
    // strip empty optional fields so Zod doesn't reject ""
    const payload: CreateTaskPayload = {
      ...data,
      estDays: data.estDays || undefined,
      startDate: data.startDate || undefined,
      taskGroupId: data.taskGroupId || undefined,
      priority: data.priority || undefined,
      code: data.code || undefined,
    };

    try {
      console.log("[TaskCreateModal] Submit — assignMode:", assignMode, "selectedInternId:", selectedInternId);
      setIsUploading(true);
      const result = await createTask.mutateAsync(payload);
      const taskId = result.data.id;

      if (linkItems.length === 0 && fileItems.length === 0) {
        // assign task to intern if selected (even without attachments)
        if (selectedInternId) {
          try {
            await createAssignment.mutateAsync({ taskId, internId: selectedInternId });
          } catch {
            // error toast handled by useCreateTaskAssignment
          }
        }
        reset();
        setStep(1);
        onCloseModal?.();
        return;
      }

      // set all to uploading
      const fStatus: Record<number, ItemStatus> = {};
      fileItems.forEach((f) => (fStatus[f.id] = "uploading"));
      const lStatus: Record<number, ItemStatus> = {};
      linkItems.forEach((l) => (lStatus[l.id] = "uploading"));
      setFileStatuses(fStatus);
      setLinkStatuses(lStatus);

      let successCount = 0;
      let failCount = 0;

      // upload files in batches of BATCH_SIZE
      for (let i = 0; i < fileItems.length; i += BATCH_SIZE) {
        const batch = fileItems.slice(i, i + BATCH_SIZE);
        try {
          await taskAttachmentService.uploadMultiple(
            taskId,
            batch.map((f) => f.file),
          );
          batch.forEach((f) => {
            setFileStatuses((prev) => ({ ...prev, [f.id]: "success" }));
          });
          successCount += batch.length;
        } catch (err) {
          console.error("File batch upload failed:", err);
          batch.forEach((f) => {
            setFileStatuses((prev) => ({ ...prev, [f.id]: "error" }));
          });
          failCount += batch.length;
        }
      }

      // upload links
      for (const link of linkItems) {
        try {
          await taskAttachmentService.createTaskAttachmentLink(taskId, link.fileName, link.fileUrl);
          setLinkStatuses((prev) => ({ ...prev, [link.id]: "success" }));
          successCount++;
        } catch (err) {
          console.error("Link upload failed:", err);
          setLinkStatuses((prev) => ({ ...prev, [link.id]: "error" }));
          failCount++;
          const msg =
            axios.isAxiosError(err) && err.response?.data?.message
              ? err.response.data.message
              : "Link upload failed";
          toast.error(`"${link.fileName}": ${msg}`);
        }
      }

      if (failCount > 0) {
        toast.error(`${failCount} attachment(s) failed. ${successCount} uploaded successfully.`);
      } else {
        toast.success("Task created with all attachments.");
      }

      // refetch tasks so attachments appear without page reload
      queryClient.invalidateQueries({ queryKey: ["tasks"] }, { exact: false });

      // assign task to intern if selected
      console.log("[TaskCreateModal] Assign:", { assignMode, selectedInternId });
      if (selectedInternId) {
        try {
          await createAssignment.mutateAsync({ taskId, internId: selectedInternId });
        } catch {
          // error toast handled by useCreateTaskAssignment
        }
      }

      // brief delay so user sees final status before reset
      setTimeout(() => {
        reset();
        setStep(1);
        setFileItems([]);
        setLinkItems([]);
        setFileStatuses({});
        setLinkStatuses({});
        setIsUploading(false);
        onCloseModal?.();
      }, 800);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
      setIsUploading(false);
      submittingRef.current = false;
    }
  };

  const isPending = createTask.isPending || isUploading;

  const inputClass = (name: keyof CreateTaskPayload, extra = "") =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none ${
      errors[name]
        ? "border-red-400/60 focus:border-red-400"
        : "border-border bg-card focus:border-primary-light/40"
    } ${extra}`;

  const ErrorMsg = ({ name }: { name: keyof CreateTaskPayload }) =>
    errors[name] ? (
      <p className="mt-1 text-xs text-red-400">{errors[name]?.message}</p>
    ) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-main/10 text-primary-light">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold metal-text">Create Task</h3>
          <p className="text-sm text-muted">
            Step {step} of 3 — {step === 1 ? "Basic Info" : step === 2 ? "Details" : "Finish"}
          </p>
        </div>
      </div>

      {/* Stepper indicator */}
      <div className="flex items-center justify-center gap-0">
        {[
          { num: 1, label: "Basic Info", desc: "Task name, deadline & category" },
          { num: 2, label: "Details", desc: "Planning details & description" },
          { num: 3, label: "Finish", desc: "Upload files & assign intern" },
        ].map((s, i, arr) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  step > s.num
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : step === s.num
                    ? "bg-primary-main/20 text-primary-light border border-primary-light/40 shadow-[0_0_16px_rgba(21,174,245,0.25)]"
                    : "bg-white/5 text-muted border border-white/10"
                }`}
              >
                {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
              </div>
              <span
                className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                  step === s.num ? "metal-text metal-glow" : step > s.num ? "text-emerald-400" : "text-muted"
                }`}
              >
                {s.label}
              </span>
              <span className={`text-[10px] leading-tight text-center max-w-[100px] transition-colors duration-300 ${step === s.num ? "text-muted" : "text-muted/50"}`}>
                {s.desc}
              </span>
            </div>
            {i < arr.length - 1 && (
              <div className={`mx-2 mb-8 h-px w-10 transition-colors duration-300 ${step > s.num ? "bg-emerald-500/40" : "bg-white/10"}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ─── Step 1: Basic Info ─── */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Task title"
                  {...register("title", {
                    required: "Title is required",
                    maxLength: { value: 255, message: "Title must be under 255 characters" },
                  })}
                  className={inputClass("title")}
                />
                <ErrorMsg name="title" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Deadline <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  {...register("deadline", {
                    required: "Deadline is required",
                    validate: (v) => !v || v >= TODAY || "Deadline cannot be in the past",
                  })}
                  className={inputClass("deadline")}
                />
                <ErrorMsg name="deadline" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Code</label>
                <input
                  type="text"
                  placeholder="e.g. BE1-01"
                  {...register("code", {
                    pattern: { value: /^[A-Za-z0-9._-]*$/, message: "Only letters, numbers, . _ - allowed" },
                    maxLength: { value: 50, message: "Code must be under 50 characters" },
                  })}
                  className={inputClass("code")}
                />
                <ErrorMsg name="code" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Priority</label>
                <select
                  {...register("priority", {
                    validate: (v) => !v || ["HIGH", "MEDIUM", "LOW"].includes(v) || "Invalid priority",
                  })}
                  className={inputClass("priority", "bg-card")}
                >
                  <option value="">Select priority...</option>
                  <option value="HIGH">P0 — High</option>
                  <option value="MEDIUM">P1 — Medium</option>
                  <option value="LOW">P2 — Low</option>
                </select>
                <ErrorMsg name="priority" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Task Group</label>
              <select
                {...register("taskGroupId")}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary-light/40 focus:outline-none"
              >
                <option value="">No group...</option>
                {taskGroups.map((tg) => (
                  <option key={tg.id} value={tg.id}>
                    {tg.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* ─── Step 2: Details ─── */}
        {step === 2 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Start Date</label>
                <input
                  type="date"
                  {...register("startDate", {
                    validate: (v) => {
                      if (!v) return true;
                      if (deadlineVal && v > deadlineVal) return "Start date must be before deadline";
                      return true;
                    },
                  })}
                  className={inputClass("startDate")}
                />
                <ErrorMsg name="startDate" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Est. Days</label>
                <input
                  type="number"
                  min={1}
                  placeholder="Number of days"
                  {...register("estDays", {
                    valueAsNumber: true,
                    min: { value: 1, message: "Must be at least 1 day" },
                    max: { value: 365, message: "Must be under 365 days" },
                  })}
                  className={inputClass("estDays")}
                />
                <ErrorMsg name="estDays" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Phase</label>
                <input
                  type="text"
                  placeholder="e.g. Phase 1 - Foundation"
                  {...register("phase", { maxLength: { value: 100, message: "Phase must be under 100 characters" } })}
                  className={inputClass("phase")}
                />
                <ErrorMsg name="phase" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Module</label>
                <input
                  type="text"
                  placeholder="e.g. Setup"
                  {...register("module", { maxLength: { value: 100, message: "Module must be under 100 characters" } })}
                  className={inputClass("module")}
                />
                <ErrorMsg name="module" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
              <textarea
                rows={2}
                placeholder="Task description..."
                {...register("description", { maxLength: { value: 2000, message: "Description must be under 2000 characters" } })}
                className={inputClass("description", "resize-none")}
              />
              <ErrorMsg name="description" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Acceptance Criteria</label>
                <textarea
                  rows={2}
                  placeholder="Acceptance criteria..."
                  {...register("acceptanceCriteria", { maxLength: { value: 2000, message: "Must be under 2000 characters" } })}
                  className={inputClass("acceptanceCriteria", "resize-none")}
                />
                <ErrorMsg name="acceptanceCriteria" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional notes..."
                  {...register("taskNotes", { maxLength: { value: 2000, message: "Must be under 2000 characters" } })}
                  className={inputClass("taskNotes", "resize-none")}
                />
                <ErrorMsg name="taskNotes" />
              </div>
            </div>
          </>
        )}

        {/* ─── Step 3: Attachments & Assign ─── */}
        {step === 3 && (
          <>
            {/* Attachments */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Attachments</label>
                {(fileItems.length > 0 || linkItems.length > 0) && (
                  <span className="text-xs text-muted">
                    {fileItems.length > 0 && `${fileItems.length} file${fileItems.length > 1 ? "s" : ""}`}
                    {fileItems.length > 0 && linkItems.length > 0 && ", "}
                    {linkItems.length > 0 && `${linkItems.length} link${linkItems.length > 1 ? "s" : ""}`}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {fileItems.length < MAX_FILES && (
                  <input
                    type="file"
                    multiple
                    disabled={isUploading}
                    onChange={handleFilesChange}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary-main/10 file:px-3 file:py-1 file:text-xs file:text-primary-light file:cursor-pointer focus:border-primary-light/40 focus:outline-none disabled:opacity-50"
                  />
                )}
                {fileItems.length >= MAX_FILES && (
                  <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-300">
                    File limit reached ({MAX_FILES} max). Remove some files to add more.
                  </p>
                )}

                {linkItems.length < MAX_LINKS && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={linkUrl}
                      disabled={isUploading}
                      onChange={(e) => { setLinkUrl(e.target.value); if (linkErr) setLinkErr(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink(); } }}
                      placeholder="Or paste a URL..."
                      className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none disabled:opacity-50"
                    />
                    <Button type="button" variant="glass" size="sm" onClick={addLink} disabled={!linkUrl.trim() || isUploading}>
                      <Link className="h-3 w-3" />
                      Add
                    </Button>
                  </div>
                )}
                {linkErr && <p className="text-xs text-red-400">{linkErr}</p>}

                {(fileItems.length > 0 || linkItems.length > 0) && (
                  <div className="mt-3 space-y-1.5">
                    {(fileItems.length + linkItems.length > 3 && !isUploading) && (
                      <button
                        type="button"
                        onClick={() => { setFileItems([]); setLinkItems([]); setFileStatuses({}); setLinkStatuses({}); }}
                        className="mb-1 text-xs text-muted hover:text-red-400 transition-colors"
                      >
                        Clear all
                      </button>
                    )}

                    {fileItems.map((f) => {
                      const cat = getFileCategory(f.mimeType);
                      const Icon = getFileIcon(cat);
                      const color = getFileColor(cat);
                      const status = fileStatuses[f.id] ?? "pending";
                      return (
                        <div key={f.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5 group">
                          <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-foreground">{f.name}</p>
                            <p className="text-xs text-muted">{formatFileSize(f.size)}</p>
                          </div>
                          <div className="shrink-0">
                            {status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-info" />}
                            {status === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                            {status === "error" && <AlertCircle className="h-4 w-4 text-red-400" />}
                          </div>
                          {!isUploading && (
                            <button type="button" onClick={() => removeFile(f.id)} className="shrink-0 rounded p-0.5 text-muted hover:bg-white/10 hover:text-red-400">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {linkItems.map((l) => {
                      const status = linkStatuses[l.id] ?? "pending";
                      const domain = (() => { try { return new URL(l.fileUrl).hostname; } catch { return ""; } })();
                      return (
                        <div key={l.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5 group">
                          <Link className="h-5 w-5 shrink-0 text-blue-400" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-foreground">{l.fileName}</p>
                            <p className="truncate text-xs text-muted">{domain}</p>
                          </div>
                          <div className="shrink-0">
                            {status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-info" />}
                            {status === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                            {status === "error" && <AlertCircle className="h-4 w-4 text-red-400" />}
                          </div>
                          {!isUploading && (
                            <button type="button" onClick={() => removeLink(l.id)} className="shrink-0 rounded p-0.5 text-muted hover:bg-white/10 hover:text-red-400">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {fileItems.length === 0 && linkItems.length === 0 && (
                  <p className="mt-2 text-xs text-muted italic">No attachments added. You can upload files or paste URLs above.</p>
                )}
              </div>
            </div>

            {/* Assign to Intern */}
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Assign to Intern</label>
              <div className="flex gap-1.5 mb-2">
                {(["none", "my", "other"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setAssignMode(mode); setSelectedInternId(""); }}
                    disabled={isUploading}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      assignMode === mode
                        ? "bg-primary-main/20 text-primary-light border border-primary-light/30"
                        : "bg-white/5 text-muted border border-white/5 hover:bg-white/10"
                    }`}
                  >
                    {mode === "none" && "None"}
                    {mode === "my" && (
                      <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" />My Team</span>
                    )}
                    {mode === "other" && (
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />Other Teams</span>
                    )}
                  </button>
                ))}
              </div>

              {assignMode === "my" && (
                <select
                  value={selectedInternId}
                  onChange={(e) => setSelectedInternId(e.target.value)}
                  disabled={isUploading}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary-light/40 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Select your intern...</option>
                  {myInterns.map((intern) => (
                    <option key={intern.id} value={intern.id}>
                      {intern.fullName}
                    </option>
                  ))}
                </select>
              )}

              {assignMode === "other" && (
                <select
                  value={selectedInternId}
                  onChange={(e) => setSelectedInternId(e.target.value)}
                  disabled={isUploading}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary-light/40 focus:outline-none disabled:opacity-50"
                >
                  <option value="">Select intern from other team...</option>
                  {otherInterns.map((intern) => (
                    <option key={intern.id} value={intern.id}>
                      {intern.fullName}{intern.leader?.fullName ? ` (${intern.leader.fullName})` : ""}
                    </option>
                  ))}
                </select>
              )}

              {assignMode !== "none" && (assignMode === "my" ? myInterns.length : otherInterns.length) === 0 && (
                <p className="text-xs text-muted italic">No interns available.</p>
              )}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <Button type="button" variant="glass" size="md" disabled={isPending} onClick={() => setStep((s) => s - 1)}>
              ← Back
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <Button type="button" variant="glass" size="md" disabled={isPending} onClick={onCloseModal}>
              Cancel
            </Button>
            {step < 3 ? (
              <Button type="button" variant="primary" size="md" onClick={handleNext}>
                Next →
              </Button>
            ) : (
              <Button type="submit" variant="primary" size="md" isLoading={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Task
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
