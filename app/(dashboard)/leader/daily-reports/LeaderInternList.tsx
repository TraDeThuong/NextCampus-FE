"use client";

import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Intern } from "@/types/intern";

type Props = {
  interns: Intern[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function LeaderInternList({ interns, selectedId, onSelect }: Props) {
  const t = useTranslations("leader.dailyReports");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-1 mb-3">
        <Users className="h-4 w-4 text-slate-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("interns", { count: interns.length })}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {interns.map((intern) => {
          const isSelected = intern.id === selectedId;
          return (
            <button
              key={intern.id}
              onClick={() => onSelect(intern.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition border hover:cursor-pointer ${
                isSelected
                  ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-200"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <span className="font-medium block truncate">{intern.fullName}</span>
              <span className="text-xs text-slate-500 truncate block mt-0.5">{intern.department?.name ?? "—"}</span>
            </button>
          );
        })}

        {interns.length === 0 && (
          <p className="text-xs text-slate-600 text-center py-8">{t("noInterns")}</p>
        )}
      </div>
    </div>
  );
}
