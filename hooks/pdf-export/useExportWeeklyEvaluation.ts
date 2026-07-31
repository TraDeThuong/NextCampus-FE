"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { pdfExportService } from "@/services/pdf-export.service";

async function triggerDownload(fileUrl: string) {
  const fileName = decodeURIComponent(
    fileUrl.split("/").pop()?.split("?")[0] ?? "weekly-report.pdf"
  );

  // Must fetch as blob because file is on external domain (Supabase Storage).
  // Using the cross-origin URL directly causes the browser to ignore the
  // `download` attribute and open in a new tab instead of saving locally.
  const res = await fetch(fileUrl);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

export function useExportWeeklyEvaluation() {
  return useMutation({
    mutationFn: (id: string) => pdfExportService.exportWeeklyEvaluation(id),

    onSuccess: (response) => {
      const fileUrl = response.data.fileUrl;
      if (fileUrl) {
        triggerDownload(fileUrl);
        toast.success("PDF report exported successfully! Downloading...");
      } else {
        toast.error("PDF file URL not found.");
      }
    },

    onError: () => {
      toast.error("Failed to export report. Please try again.");
    },
  });
}
