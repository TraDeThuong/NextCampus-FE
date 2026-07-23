"use client";

import { X } from "lucide-react";

interface TaskImportInstructionsProps {
  onClose: () => void;
}

const COLUMNS_TASK_PHAN_CONG = [
  { name: "Task ID", required: true, desc: "Unique identifier, e.g.:", code: "BE1-01", extra: "Used to identify tasks and set up dependencies." },
  { name: "Task", required: true, desc: "Task title / name." },
  { name: "Due", required: true, desc: "Due date. Supports: Excel date format, DD/MM/YYYY, or ISO (YYYY-MM-DD)." },
  { name: "Priority", required: true, desc: "Priority level:", codes: ["P0 (HIGH)", "P1 (MEDIUM)", "P2 (LOW)"] },
  { name: "Start", required: false, desc: "Start date (same format as Due)." },
  { name: "Owner", required: false, desc: 'Full name of the assigned intern. Must match the name in the system. If different, use the "Lists" sheet to map.' },
  { name: "Support", required: false, desc: "Full name of the supporting intern. Cannot be assigned without an Owner." },
  { name: "Status", required: false, desc: "Status:", codes: ["To Do", "In Progress", "Review", "Done", "Blocked"], extra: "Default: To Do." },
  { name: "Description", required: false, desc: "Task description." },
  { name: "Phase", required: false, desc: "Phase name, e.g.:", code: "Phase 1 - Foundation" },
  { name: "Module", required: false, desc: "Module name, e.g.:", code: "Setup" },
  { name: "Est Days", required: false, desc: "Estimated number of days (number)." },
  { name: "Acceptance Criteria", required: false, desc: "Acceptance criteria (text)." },
  { name: "Notes", required: false, desc: "Additional notes." },
  { name: "Dependency", required: false, desc: "Comma-separated list of dependency Task IDs. E.g.:", code: "BE1-01, BE1-02" },
  { name: "Attachments", required: false, desc: "Comma-separated file URLs. E.g.:", code: "https://example.com/doc.pdf, https://example.com/image.png" },
];

const COLUMNS_LISTS = [
  { name: "Owners", required: false, desc: "Display name in Excel (in the Owner/Support column of the Task_Phan_Cong sheet)." },
  { name: "Name", required: false, desc: "Intern name in the system. Used to map when the Excel name differs from the system name." },
];

function RequiredBadge({ required }: { required: boolean }) {
  return required ? (
    <span className="inline-flex rounded-md bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
      Required
    </span>
  ) : (
    <span className="inline-flex rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted">
      Optional
    </span>
  );
}

function Code({ children }: { children: string }) {
  return (
    <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-primary-light">
      {children}
    </code>
  );
}

function ColumnRow({
  name,
  required,
  desc,
  code,
  codes,
  extra,
}: {
  name: string;
  required: boolean;
  desc: string;
  code?: string;
  codes?: string[];
  extra?: string;
}) {
  return (
    <div className="grid grid-cols-[160px_80px_1fr] gap-4 border-b border-white/5 py-3">
      <div className="text-sm font-medium text-foreground">{name}</div>
      <div>
        <RequiredBadge required={required} />
      </div>
      <div className="text-sm text-muted">
        {desc}{" "}
        {code && <Code>{code}</Code>}
        {codes && (
          <span className="inline-flex flex-wrap gap-1">
            {codes.map((c) => (
              <Code key={c}>{c}</Code>
            ))}
          </span>
        )}
        {extra && <> {extra}</>}
      </div>
    </div>
  );
}

export default function TaskImportInstructions({ onClose }: TaskImportInstructionsProps) {
  return (
    <div className="max-h-[40vh] overflow-y-auto rounded-2xl border border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_100%)] p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold metal-text">
          Excel File Format Guide
        </h3>
        <button
          onClick={onClose}
          aria-label="Close instructions"
          className="rounded-xl border border-border bg-card p-1.5 text-muted transition-colors hover:bg-card-hover hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Sheet 1: Task_Phan_Cong */}
      <div className="mb-6">
        <h4 className="mb-2 text-sm font-semibold text-foreground">
          Sheet: Task_Phan_Cong (required)
        </h4>
        {/* Header row */}
        <div className="grid grid-cols-[160px_80px_1fr] gap-4 border-b border-white/10 pb-2 text-xs font-medium text-muted">
          <div>Column Name</div>
          <div>Required</div>
          <div>Description</div>
        </div>
        {COLUMNS_TASK_PHAN_CONG.map((col) => (
          <ColumnRow key={col.name} {...col} />
        ))}
      </div>

      {/* Sheet 2: Lists */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-foreground">
          Sheet: Lists (optional)
        </h4>
        <p className="mb-3 text-sm text-muted">
          This sheet is only needed when intern names in Excel differ from system names.
        </p>
        <div className="grid grid-cols-[160px_80px_1fr] gap-4 border-b border-white/10 pb-2 text-xs font-medium text-muted">
          <div>Column Name</div>
          <div>Required</div>
          <div>Description</div>
        </div>
        {COLUMNS_LISTS.map((col) => (
          <ColumnRow key={col.name} {...col} />
        ))}
      </div>
    </div>
  );
}
