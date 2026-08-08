"use client";

import { useQuery } from "@tanstack/react-query";
import { taskAttachmentService } from "@/services/task-attachment.service";
import type { SubmissionAttachment } from "@/types/task-attachment";

export function useSubmissionAttachments(
  submissionId: string | undefined,
  initialAttachments?: SubmissionAttachment[],
) {
  return useQuery({
    queryKey: ["submission-attachments", submissionId],
    queryFn: () => taskAttachmentService.getSubmissionAttachments(submissionId!),
    enabled: !!submissionId,
    initialData: initialAttachments
      ? { success: true, data: initialAttachments }
      : undefined,
    initialDataUpdatedAt: 0,
    staleTime: 1000 * 60 * 5,
  });
}
