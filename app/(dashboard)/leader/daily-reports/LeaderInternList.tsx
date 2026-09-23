"use client";

import { useMemo } from "react";
import { Users, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Intern } from "@/types/intern";

type Props = {
  interns: Intern[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  todaySubmittedSet?: Set<string>;
  searchQuery?: string;
};

function getInitials(name?: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function LeaderInternList({
  interns,
  selectedId,
  onSelect,
  todaySubmittedSet,
  searchQuery = "",
}: Props) {
  const t = useTranslations("leader.dailyReports");

  const filteredInterns = useMemo(() => {
    if (!searchQuery.trim()) return interns;
    const q = searchQuery.toLowerCase().trim();
    return interns.filter(
      (intern) =>
        intern.fullName?.toLowerCase().includes(q) ||
        intern.department?.name?.toLowerCase().includes(q),
    );
  }, [interns, searchQuery]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2 px-1 mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 shrink-0 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted truncate">
            {t("interns", { count: filteredInterns.length })}
          </h3>
        </div>
      </div>

      <div className="max-h-[480px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
        {filteredInterns.map((intern) => {
          const isSelected = intern.id === selectedId;
          const hasSubmittedToday = todaySubmittedSet?.has(intern.id);
          const initials = getInitials(intern.fullName);

          return (
            <button
              key={intern.id}
              type="button"
              onClick={() => onSelect(intern.id)}
              className={`group w-full text-left p-3 rounded-2xl text-sm transition-all duration-200 border cursor-pointer active:scale-[0.98] ${
                isSelected
                  ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-800 dark:text-cyan-200 shadow-sm ring-1 ring-cyan-500/30"
                  : "border-border bg-card/60 text-muted hover:text-foreground hover:bg-card hover:border-border-strong dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5 dark:hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Initials Avatar */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-transform group-hover:scale-105 ${
                    isSelected
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-sm dark:shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      : "border border-border bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  }`}
                >
                  {initials}
                </div>

                {/* Intern Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-semibold block truncate text-foreground text-xs sm:text-sm">
                      {intern.fullName}
                    </span>
                    {todaySubmittedSet && (
                      <span
                        title={
                          hasSubmittedToday
                            ? t("statusSubmitted")
                            : t("statusMissing")
                        }
                      >
                        {hasSubmittedToday ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400/80" />
                        )}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted truncate block mt-0.5">
                    {intern.department?.name ?? "—"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}

        {filteredInterns.length === 0 && (
          <div className="text-center py-10 px-2">
            <Users className="h-8 w-8 text-slate-600 mx-auto mb-2 opacity-40" />
            <p className="text-xs text-muted">
              {searchQuery ? t("noInterns") : t("noInterns")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
