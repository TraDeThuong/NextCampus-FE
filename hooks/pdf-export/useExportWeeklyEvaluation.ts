"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { pdfExportService } from "@/services/pdf-export.service";

function triggerDownload(fileUrl: string) {
  const fileName = decodeURIComponent(
    fileUrl.split("/").pop()?.split("?")[0] ?? "bao-cao-tuan.pdf"
  );

  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function useExportWeeklyEvaluation() {
  return useMutation({
    mutationFn: (id: string) => pdfExportService.exportWeeklyEvaluation(id),

    onSuccess: (response) => {
      const fileUrl = response.data.fileUrl;
      if (fileUrl) {
        triggerDownload(fileUrl);
        toast.success("Xuất báo cáo PDF thành công! File đang được tải xuống.");
      } else {
        toast.error("Không tìm thấy đường dẫn file PDF.");
      }
    },

    onError: () => {
      toast.error("Xuất báo cáo thất bại. Vui lòng thử lại.");
    },
  });
}
