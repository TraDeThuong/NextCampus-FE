"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { pdfExportService } from "@/services/pdf-export.service";

export function triggerDownload(fileUrl: string, defaultName = "bao-cao-danh-gia-tuan.pdf") {
  try {
    const fileName = decodeURIComponent(
      fileUrl.split("/").pop()?.split("?")[0] ?? defaultName
    );

    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    window.open(fileUrl, "_blank");
  }
}

export function useExportWeeklyEvaluation() {
  return useMutation({
    mutationFn: (id: string) => pdfExportService.exportWeeklyEvaluation(id),

    onSuccess: (response) => {
      const fileUrl = response.data?.fileUrl;
      if (fileUrl) {
        triggerDownload(fileUrl, "bao-cao-danh-gia-tuan.pdf");
        toast.success("Báo cáo PDF đã được khởi tạo thành công! Đang tiến hành tải xuống...");
      } else {
        toast.error("Không tìm thấy đường dẫn file PDF.");
      }
    },

    onError: () => {
      toast.error("Xuất báo cáo thất bại. Vui lòng thử lại.");
    },
  });
}
