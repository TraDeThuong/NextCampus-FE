"use client";

import { useQuery } from "@tanstack/react-query";
import { reportAttachmentService } from "@/services/report-attachment.service";

export function useReportAttachments(reportId: string | undefined) {
  return useQuery({
    queryKey: ["reportAttachments", reportId],
    queryFn: () => reportAttachmentService.getReportAttachments(reportId!),
    enabled: !!reportId,
    staleTime: 1000 * 60 * 5,
  });
}
