"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { pdfExportService } from "@/services/pdf-export.service";
import { triggerDownload } from "./useExportWeeklyEvaluation";

export function useExportInternshipSummary() {
  return useMutation({
    mutationFn: (internId: string) => pdfExportService.exportInternshipSummary(internId),

    onSuccess: (response) => {
      const fileUrl = response.data?.fileUrl;
      if (fileUrl) {
        triggerDownload(fileUrl, "tong-ket-thuc-tap.pdf");
        toast.success("Báo cáo PDF đã được khởi tạo thành công! Đang tiến hành tải xuống...");
      } else {
        toast.error("Không tìm thấy đường dẫn file PDF.");
      }
    },

    onError: () => {
      toast.error("Xuất báo cáo tổng kết thất bại. Vui lòng thử lại.");
    },
  });
}
