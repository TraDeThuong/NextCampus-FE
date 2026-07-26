"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Eye, Circle } from "lucide-react";

import type { Intern } from "@/types/intern";
import type { InternTeamProgress } from "@/types/stats";
import Table from "@/components/ui/Table";
import InternTasksModal from "./InternTasksModal";
import InternOverdueModal from "./InternOverdueModal";

type LeaderInternRowProps = {
  intern: Intern;
  taskProgress?: InternTeamProgress;
};

export default function LeaderInternRow({ intern, taskProgress }: LeaderInternRowProps) {
  const router = useRouter();
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [overdueModalOpen, setOverdueModalOpen] = useState(false);

  const endDate = new Date(intern.startDate);
  endDate.setMonth(endDate.getMonth() + intern.duration);

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });

  const statusBadge: Record<string, string> = {
    ACTIVE: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    COMPLETED: "border-blue-400/20 bg-blue-500/10 text-blue-300",
    DROPPED: "border-red-400/20 bg-red-500/10 text-red-300",
  };

  const completed = taskProgress?.completedTasks ?? 0;
  const total = taskProgress?.totalTasks ?? 0;
  const overdue = taskProgress?.overdueCount ?? 0;

  return (
    <>
      <Table.Row>
        {/* Intern info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 text-sm font-bold text-slate-200">
            {intern.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p
              className="truncate text-sm font-medium text-white cursor-pointer hover:text-cyan-400 transition"
              onClick={() => router.push(`/leader/interns/${intern.id}`)}
            >
              {intern.fullName}
            </p>
            <p className="truncate text-xs text-slate-500">
              {intern.user.email}
            </p>
          </div>
        </div>

        {/* Department */}
        <div className="text-sm text-slate-400">
          {intern.department?.name ?? (
            <span className="italic text-slate-600">Not set</span>
          )}
        </div>

        {/* Position */}
        <div className="text-sm text-slate-400">
          {intern.position?.name ?? (
            <span className="italic text-slate-600">Not set</span>
          )}
        </div>

        {/* Duration */}
        <div className="text-sm text-slate-400">
          <p>{fmtDate(new Date(intern.startDate))}</p>
          <p className="text-xs text-slate-600">→ {fmtDate(endDate)}</p>
        </div>

        {/* Tasks — clickable */}
        <div className="text-center">
          {total > 0 ? (
            <button
              onClick={() => setTasksModalOpen(true)}
              className={`text-sm font-medium transition hover:text-cyan-400 ${
                completed === total ? "text-emerald-400" : "text-slate-300"
              }`}
            >
              {completed}/{total}
            </button>
          ) : (
            <span className="text-sm text-slate-600">0/0</span>
          )}
        </div>

        {/* Overdue — clickable */}
        <div className="text-sm text-center">
          {overdue > 0 ? (
            <button
              onClick={() => setOverdueModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
            >
              {overdue}
            </button>
          ) : (
            <span className="text-slate-600">—</span>
          )}
        </div>

        {/* Status */}
        <div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
              statusBadge[intern.status] ?? ""
            }`}
          >
            <Circle className="h-2 w-2 fill-current" />
            {intern.status}
          </span>
        </div>

        {/* Actions */}
        <div>
          <button
            type="button"
            onClick={() => router.push(`/leader/interns/${intern.id}`)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-white/10 hover:bg-white/5 hover:text-white"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </Table.Row>

      {tasksModalOpen &&
        createPortal(
          <InternTasksModal
            intern={intern}
            onClose={() => setTasksModalOpen(false)}
          />,
          document.body,
        )}

      {overdueModalOpen &&
        createPortal(
          <InternOverdueModal
            intern={intern}
            onClose={() => setOverdueModalOpen(false)}
          />,
          document.body,
        )}
    </>
  );
}
