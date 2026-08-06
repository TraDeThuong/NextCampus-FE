"use client";

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";
import Button from "@/components/ui/Button";
import { useDailyReports } from "@/hooks/daily-report/useDailyReports";
import type { DailyReport } from "@/types/daily-report";

type Props = { onOpenCreate: () => void; onOpenEdit: (report: DailyReport) => void };

export default function DailyReportHeader({ onOpenCreate, onOpenEdit }: Props) {
  const t = useTranslations("intern.dailyReport");
  const today = new Date().toISOString().split("T")[0];
  const { data, isPending } = useDailyReports({ createdAtFrom: today, createdAtTo: today, limit: 1 });
  const existingReport = data?.data?.[0];
  const hasReportedToday = !!existingReport;

  return (
    <MetalCard>
      <div className="rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/20 to-cyan-400/10"><FileText className="h-6 w-6 text-cyan-300" /></div>
            <div>
              <h2 className="text-2xl font-bold metal-text">{t("title")}</h2>
              <p className="mt-1 text-sm text-slate-500">{t("description")}</p>
            </div>
          </div>
          <div>
            {isPending ? <Button variant="metal-silver" size="md" isLoading disabled></Button> :
             hasReportedToday ? <Button variant="metal-blue" size="md" onClick={() => onOpenEdit(existingReport!)}>{t("editReport")}</Button> :
             <Button variant="metal-blue" size="md" onClick={onOpenCreate}>{t("createReport")}</Button>}
          </div>
        </div>
      </div>
    </MetalCard>
  );
}
