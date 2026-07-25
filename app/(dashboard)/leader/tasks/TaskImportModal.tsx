"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Upload, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet, BookOpen } from "lucide-react";
import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import { useDownloadTemplate } from "@/hooks/task/useDownloadTemplate";
import { usePreviewImport } from "@/hooks/task/usePreviewImport";
import { useExecuteImport } from "@/hooks/task/useExecuteImport";
import { taskGroupService } from "@/services/task-group.service";
import type { ImportPreviewData, ImportResultData } from "@/types/task";
import TaskImportInstructions from "./TaskImportInstructions";

interface Props {
  onCloseModal?: () => void;
}

type Step = "template" | "preview" | "result";

const STEPS = [
  { key: "template" as const, label: "Upload & Preview" },
  { key: "preview" as const, label: "Review" },
  { key: "result" as const, label: "Result" },
];

export default function TaskImportModal({ onCloseModal }: Props) {
  const [step, setStep] = useState<Step>("template");
  const [showInstructions, setShowInstructions] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [taskGroupId, setTaskGroupId] = useState("");
  const [taskGroupName, setTaskGroupName] = useState("");
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null);
  const [importResult, setImportResult] = useState<ImportResultData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadMutation = useDownloadTemplate();
  const previewMutation = usePreviewImport();
  const executeMutation = useExecuteImport();

  const { data: taskGroupsData } = useQuery({
    queryKey: ["task-groups"],
    queryFn: taskGroupService.getAll,
    staleTime: 60_000,
  });

  const taskGroups = taskGroupsData?.data ?? [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    previewMutation.mutate(
      { file: f, taskGroupId: taskGroupId || undefined, taskGroupName: taskGroupName || undefined },
      {
        onSuccess: (data) => {
          setPreviewData(data.data);
          setStep("preview");
        },
      },
    );
  };

  const handleExecute = () => {
    if (!file) return;
    executeMutation.mutate(
      { file, taskGroupId: taskGroupId || undefined, taskGroupName: taskGroupName || undefined },
      {
        onSuccess: (data) => {
          setImportResult(data.data);
          setStep("result");
        },
      },
    );
  };

  const reset = () => {
    setStep("template");
    setFile(null);
    setPreviewData(null);
    setImportResult(null);
    previewMutation.reset();
    executeMutation.reset();
  };

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="flex w-full flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
      <div className="shrink-0 space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold metal-text">Import Tasks</h2>
          <p className="mt-1 text-sm text-slate-500">
            Import multiple tasks from an Excel spreadsheet.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  i <= currentStepIndex
                    ? "bg-primary-main/20 text-primary-light"
                    : "bg-white/5 text-muted"
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-main text-xs font-bold text-white">
                  {i + 1}
                </span>
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px w-8 transition-colors ${
                    i < currentStepIndex ? "bg-primary-light" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">

      {/* ── Step: template ─────────────────────────────────────────────── */}

      {step === "template" && (
        <div className="space-y-6 mt-3">
          {/* Download template section */}
          <div className="rounded-2xl border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_100%)] p-6">
            <h3 className="text-lg font-semibold metal-text">
              Step 1: Download the Template
            </h3>
            <p className="mt-2 text-sm text-muted">
              Download the Excel template, fill in your task data, then upload it
              below. Required columns are marked with *.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                isLoading={downloadMutation.isPending}
                onClick={() => downloadMutation.mutate()}
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
              <Button
                variant="glass"
                size="md"
                onClick={() => setShowInstructions((prev) => !prev)}
              >
                <BookOpen className="h-4 w-4" />
                {showInstructions ? "Hide Instructions" : "View Instructions"}
              </Button>
            </div>
          </div>

          {showInstructions && (
            <TaskImportInstructions onClose={() => setShowInstructions(false)} />
          )}

          {/* Upload section */}
          <div className="rounded-2xl border border-border p-6">
            <h3 className="text-lg font-semibold metal-text">
              Step 2: Upload Your File
            </h3>
            <p className="mt-2 text-sm text-muted">
              After filling in the template, upload your Excel file to preview
              before importing.
            </p>

            {/* Task Group selection */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Task Group (optional)
                </label>
                <select
                  value={taskGroupId}
                  onChange={(e) => {
                    setTaskGroupId(e.target.value);
                    setTaskGroupName("");
                  }}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary-light/40 focus:outline-none"
                >
                  <option value="">Select existing group...</option>
                  {taskGroups.map((tg) => (
                    <option key={tg.id} value={tg.id}>
                      {tg.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Or enter a new group name
                </label>
                <input
                  type="text"
                  value={taskGroupName}
                  onChange={(e) => {
                    setTaskGroupName(e.target.value);
                    setTaskGroupId("");
                  }}
                  placeholder="New group name..."
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-light/40 focus:outline-none"
                  disabled={!!taskGroupId}
                />
              </div>
            </div>

            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="glass"
                size="md"
                isLoading={previewMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Choose Excel File
              </Button>
              {file && (
                <span className="ml-3 text-sm text-muted">{file.name}</span>
              )}
              {previewMutation.isError && (
                <p className="mt-2 text-sm text-red-400">
                  Failed to preview file. Make sure it&apos;s a valid Excel file
                  with the correct format.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step: preview ──────────────────────────────────────────────── */}

      {step === "preview" && previewData && (
        <div className="space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              value={previewData.totalRows}
              label="Total Rows"
              className="border-border bg-card"
              valueClassName="metal-text"
              labelClassName="text-muted"
            />
            <StatCard
              value={previewData.validRows.length}
              label="Valid"
              className="border-emerald-500/30 bg-emerald-500/5"
              valueClassName="text-emerald-400"
              labelClassName="text-emerald-400/70"
            />
            <StatCard
              value={previewData.errorRows.length}
              label="Errors"
              className="border-red-500/30 bg-red-500/5"
              valueClassName="text-red-400"
              labelClassName="text-red-400/70"
            />
          </div>

          {/* Task Group info */}
          {previewData.taskGroupName && (
            <p className="text-sm text-muted">
              Task Group:{" "}
              <span className="font-medium text-foreground">
                {previewData.taskGroupName}
              </span>
            </p>
          )}

          {/* Intern mappings */}
          {previewData.internMappings.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Intern Mappings
              </h3>
              <Table columns="1fr 1fr 120px">
                <Table.Header>
                  <div>Excel Name</div>
                  <div>System Name</div>
                  <div>Status</div>
                </Table.Header>
                <Table.Body
                  data={previewData.internMappings}
                  render={(m) => (
                    <Table.Row key={m.ownerName}>
                      <div className="text-sm">{m.ownerName}</div>
                      <div className="text-sm text-muted">
                        {m.internFullName ?? "—"}
                      </div>
                      <div>
                        {m.internId ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                            <CheckCircle className="h-3 w-3" /> Found
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-red-400">
                            <AlertTriangle className="h-3 w-3" /> Not found
                          </span>
                        )}
                      </div>
                    </Table.Row>
                  )}
                />
              </Table>
            </div>
          )}

          {/* Valid rows */}
          {previewData.validRows.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Valid Rows ({previewData.validRows.length})
              </h3>
              <Table columns="100px 1fr 120px 100px 140px 100px">
                <Table.Header>
                  <div>Task ID</div>
                  <div>Title</div>
                  <div>Owner</div>
                  <div>Priority</div>
                  <div>Deadline</div>
                  <div>Status</div>
                </Table.Header>
                <Table.Body
                  data={previewData.validRows}
                  render={(row) => (
                    <Table.Row key={row.excelCode}>
                      <div className="font-mono text-sm">{row.excelCode}</div>
                      <div className="truncate text-sm">{row.title}</div>
                      <div className="text-sm text-muted">
                        {row.ownerName ?? "—"}
                      </div>
                      <div>
                        <PriorityBadge priority={row.priority} />
                      </div>
                      <div className="text-sm text-muted">
                        {new Date(row.deadline).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="text-sm text-muted">
                        {(row as unknown as Record<string, unknown>)._status as string ?? "To Do"}
                      </div>
                    </Table.Row>
                  )}
                />
              </Table>
            </div>
          )}

          {/* Error rows */}
          {previewData.errorRows.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-red-400">
                Error Rows ({previewData.errorRows.length})
              </h3>
              <div className="overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/5">
                <Table columns="80px 120px 1fr">
                  <Table.Header>
                    <div>Row</div>
                    <div>Task ID</div>
                    <div>Errors</div>
                  </Table.Header>
                  <Table.Body
                    data={previewData.errorRows}
                    render={(row) => (
                      <Table.Row key={row.rowIndex}>
                        <div className="text-sm text-red-400">
                          {row.rowIndex}
                        </div>
                        <div className="text-sm text-muted">
                          {row.excelCode ?? "—"}
                        </div>
                        <div className="space-y-0.5">
                          {row.errors.map((err, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-1 text-sm text-red-400"
                            >
                              <XCircle className="mt-0.5 h-3 w-3 shrink-0" />
                              {err}
                            </div>
                          ))}
                        </div>
                      </Table.Row>
                    )}
                  />
                </Table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="glass" size="md" onClick={reset}>
              Back
            </Button>
            <Button
              variant="primary"
              size="md"
              isLoading={executeMutation.isPending}
              onClick={handleExecute}
              disabled={previewData.validRows.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Import {previewData.validRows.length} Tasks
            </Button>
          </div>
        </div>
      )}

      {/* ── Step: result ───────────────────────────────────────────────── */}

      {step === "result" && importResult && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
            <div>
              <h3 className="text-xl font-bold metal-text">Import Complete</h3>
              {importResult.taskGroupName && (
                <p className="text-sm text-muted">
                  Group: {importResult.taskGroupName}
                </p>
              )}
            </div>
          </div>

          {/* Result stats */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              value={importResult.importedTasks}
              label="New Tasks"
              className="border-emerald-500/30 bg-emerald-500/5"
              valueClassName="text-emerald-400"
              labelClassName="text-emerald-400/70"
            />
            <StatCard
              value={importResult.importedAssignments}
              label="Assignments"
              className="border-blue-500/30 bg-blue-500/5"
              valueClassName="text-blue-400"
              labelClassName="text-blue-400/70"
            />
            <StatCard
              value={importResult.importedDependencies}
              label="Dependencies"
              className="border-purple-500/30 bg-purple-500/5"
              valueClassName="text-purple-400"
              labelClassName="text-purple-400/70"
            />
            <StatCard
              value={importResult.skippedCodes.length}
              label="Updated"
              className="border-amber-500/30 bg-amber-500/5"
              valueClassName="text-amber-400"
              labelClassName="text-amber-400/70"
            />
          </div>

          {/* Skipped (updated) codes */}
          {importResult.skippedCodes.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <h4 className="text-sm font-medium text-amber-400">
                Updated Tasks (already existed)
              </h4>
              <p className="mt-1 text-xs text-muted">
                {importResult.skippedCodes.join(", ")}
              </p>
            </div>
          )}

          {/* Import errors */}
          {importResult.errorRows.length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <h4 className="text-sm font-medium text-red-400">Errors</h4>
              <ul className="mt-2 space-y-1">
                {importResult.errorRows.map((err, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-1 text-sm text-red-400"
                  >
                    <XCircle className="mt-0.5 h-3 w-3 shrink-0" />
                    {err.excelCode ? `[${err.excelCode}] ` : ""}
                    {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="glass" size="md" onClick={reset}>
              Import Another File
            </Button>
            {onCloseModal && (
              <Button variant="primary" size="md" onClick={onCloseModal}>
                Close
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function StatCard({
  value,
  label,
  className,
  valueClassName,
  labelClassName,
}: {
  value: number;
  label: string;
  className: string;
  valueClassName: string;
  labelClassName: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 text-center ${className}`}>
      <p className={`text-2xl font-bold ${valueClassName}`}>{value}</p>
      <p className={`mt-1 text-xs ${labelClassName}`}>{label}</p>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    HIGH: "bg-red-500/10 text-red-400",
    MEDIUM: "bg-amber-500/10 text-amber-400",
    LOW: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <span
      className={`inline-flex rounded-lg px-2 py-0.5 text-xs ${colors[priority] ?? "bg-white/5 text-muted"}`}
    >
      {priority}
    </span>
  );
}
