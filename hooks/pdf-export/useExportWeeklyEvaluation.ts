"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { pdfExportService } from "@/services/pdf-export.service";

async function triggerDownload(fileUrl: string) {
  const fileName = decodeURIComponent(
    fileUrl.split("/").pop()?.split("?")[0] ?? "bao-cao-tuan.pdf"
  );

  // Phải fetch về blob trước vì file ở domain ngoài (Supabase Storage).
  // Nếu dùng thẳng URL cross-origin, trình duyệt bỏ qua thuộc tính `download`
  // và mở trong tab mới thay vì lưu về máy.
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
