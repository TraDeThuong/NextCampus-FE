"use client";

import { FileDown } from "lucide-react";
import Button from "@/components/ui/Button";
import { useExportWeeklyEvaluation } from "@/hooks/pdf-export/useExportWeeklyEvaluation";

interface Props {
  id: string;
}

export default function WeeklyEvaluationExportButton({ id }: Props) {
  const { mutate, isPending } = useExportWeeklyEvaluation();

  return (
    <Button
      variant="glass"
      size="sm"
      onClick={() => mutate(id)}
      isLoading={isPending}
      className="flex items-center gap-1.5"
    >
      <FileDown className="h-4 w-4 mr-1" />
      <span>Xuất PDF</span>
    </Button>
  );
}
