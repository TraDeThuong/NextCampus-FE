"use client";

import { FileDown } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { useExportWeeklyEvaluation } from "@/hooks/pdf-export/useExportWeeklyEvaluation";

interface Props {
  id: string;
  label?: string;
  className?: string;
}

export default function WeeklyEvaluationExportButton({
  id,
  label,
  className,
}: Props) {
  const t = useTranslations("pdfExport");
  const { mutate, isPending } = useExportWeeklyEvaluation();
  const displayLabel = label ?? t("downloadWeeklyEvaluation");

  return (
    <Button
      variant="glass"
      size="sm"
      onClick={() => mutate(id)}
      isLoading={isPending}
      loadingText={t("generating")}
      className={className ?? "flex items-center gap-1.5"}
    >
      <FileDown className="h-4 w-4 mr-1 shrink-0" />
      <span>{displayLabel}</span>
    </Button>
  );
}
