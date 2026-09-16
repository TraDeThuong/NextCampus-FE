"use client";

import { FileDown } from "lucide-react";
import Button from "@/components/ui/Button";
import { useExportInternshipSummary } from "@/hooks/pdf-export/useExportInternshipSummary";

interface Props {
  internId: string;
  label?: string;
  className?: string;
}

export default function InternshipSummaryExportButton({
  internId,
  label = "Xuất tổng kết thực tập",
  className,
}: Props) {
  const { mutate, isPending } = useExportInternshipSummary();

  return (
    <Button
      variant="glass"
      size="sm"
      onClick={() => mutate(internId)}
      isLoading={isPending}
      className={className ?? "flex items-center gap-1.5"}
    >
      <FileDown className="h-4 w-4 mr-1" />
      <span>{label}</span>
    </Button>
  );
}
