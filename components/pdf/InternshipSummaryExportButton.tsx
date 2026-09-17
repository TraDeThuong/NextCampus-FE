"use client";

import { FileDown } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { useExportInternshipSummary } from "@/hooks/pdf-export/useExportInternshipSummary";

interface Props {
  internId: string;
  label?: string;
  className?: string;
}

export default function InternshipSummaryExportButton({
  internId,
  label,
  className,
}: Props) {
  const t = useTranslations("pdfExport");
  const { mutate, isPending } = useExportInternshipSummary();
  const displayLabel = label ?? t("downloadInternshipSummary");

  return (
    <Button
      variant="glass"
      size="sm"
      onClick={() => mutate(internId)}
      isLoading={isPending}
      loadingText={t("generating")}
      className={className ?? "flex items-center gap-1.5"}
    >
      <FileDown className="h-4 w-4 mr-1 shrink-0" />
      <span>{displayLabel}</span>
    </Button>
  );
}
