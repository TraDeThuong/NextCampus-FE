"use client";

import { useQuery } from "@tanstack/react-query";
import { taskAttachmentService } from "@/services/task-attachment.service";

export function useSubmissionAttachments(submissionId: string | undefined) {
  return useQuery({
    queryKey: ["submission-attachments", submissionId],
    queryFn: () => taskAttachmentService.getSubmissionAttachments(submissionId!),
    enabled: !!submissionId,
    staleTime: 1000 * 60 * 5,
  });
}
