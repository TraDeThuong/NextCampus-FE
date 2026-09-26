"use client";

import { LayoutGrid, Network } from "lucide-react";
import { useTranslations } from "next-intl";

interface SquadViewModeToggleProps {
  mode: "kanban" | "graph";
  onChange: (mode: "kanban" | "graph") => void;
}

export default function SquadViewModeToggle({ mode, onChange }: SquadViewModeToggleProps) {
  const t = useTranslations("intern.tasks");

  return (
    <div className="flex items-center rounded-2xl border border-border/80 bg-slate-100/90 p-1 backdrop-blur-md shadow-sm dark:border-white/10 dark:bg-slate-900/60 dark:shadow-none self-start sm:self-auto">
      <button
        type="button"
        onClick={() => onChange("kanban")}
        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
          mode === "kanban"
            ? "border border-cyan-300 bg-cyan-100/90 text-cyan-800 shadow-sm dark:border-cyan-500/40 dark:bg-cyan-500/20 dark:text-cyan-300 dark:shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            : "text-muted hover:bg-slate-200/60 hover:text-foreground dark:hover:bg-white/5 dark:hover:text-foreground"
        }`}
      >
        <LayoutGrid className="h-4 w-4 shrink-0" />
        <span>{t("viewKanban")}</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("graph")}
        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
          mode === "graph"
            ? "border border-indigo-300 bg-indigo-100/90 text-indigo-800 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-500/20 dark:text-indigo-300 dark:shadow-[0_0_12px_rgba(99,102,241,0.25)]"
            : "text-muted hover:bg-slate-200/60 hover:text-foreground dark:hover:bg-white/5 dark:hover:text-foreground"
        }`}
      >
        <Network className="h-4 w-4 shrink-0" />
        <span>{t("viewGraph")}</span>
      </button>
    </div>
  );
}
