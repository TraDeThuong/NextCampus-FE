"use client";

import { FileDown } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { useClientExportWeeklyEvaluation } from "@/hooks/pdf-export/useClientExportWeeklyEvaluation";

interface Props {
  id: string;
  className?: string;
}

export default function WeeklyEvaluationExportButton({ id, className }: Props) {
  const t = useTranslations("leader.weeklyEvaluation");
  const tPdf = useTranslations("pdfExport");
  const { mutate, isPending } = useClientExportWeeklyEvaluation();

  return (
    <Button
      variant="glass"
      size="sm"
      onClick={() => mutate(id)}
      isLoading={isPending}
      loadingText={tPdf("generating")}
      className={className ?? "flex items-center gap-1.5"}
    >
      <FileDown className="h-4 w-4 mr-1 shrink-0" />
      <span>{t("exportPdf")}</span>
    </Button>
  );
}

