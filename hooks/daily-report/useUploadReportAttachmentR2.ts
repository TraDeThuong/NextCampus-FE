"use client";

import { useState } from "react";
import { dailyReportService } from "@/services/daily-report.service";
import type { CreateReportAttachmentPayload } from "@/types/daily-report";

export function useUploadReportAttachmentR2() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File): Promise<CreateReportAttachmentPayload> => {
    setIsUploading(true);
    setProgress(10);
    try {
      // 1. Get presigned PUT URL from backend
      const res = await dailyReportService.getUploadUrl({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
      });

      const { uploadUrl, fileUrl, filePath } = res.data;
      setProgress(40);

      // 2. Direct PUT to Cloudflare R2
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!putRes.ok) {
        throw new Error(`Tải tệp lên R2 thất bại: HTTP ${putRes.status}`);
      }

      setProgress(100);

      return {
        fileName: file.name,
        fileUrl,
        filePath,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
      };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
  };
}
