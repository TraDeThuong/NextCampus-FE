"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useTranslations } from "next-intl";
import { pdfExportService } from "@/services/pdf-export.service";
import { triggerDownload } from "./useExportWeeklyEvaluation";

export function useExportInternshipSummary() {
  const t = useTranslations("pdfExport");

  return useMutation({
    mutationFn: (internId: string) => pdfExportService.exportInternshipSummary(internId),

    onSuccess: (response) => {
      const fileUrl = response.data?.fileUrl;
      if (fileUrl) {
        triggerDownload(fileUrl, "tong-ket-thuc-tap.pdf");
        toast.success(t("exportSuccess"));
      } else {
        toast.error(t("exportFailed"));
      }
    },

    onError: () => {
      toast.error(t("exportFailed"));
    },
  });
}
