"use client";

import { useQuery } from "@tanstack/react-query";
import { taskAttachmentService } from "@/services/task-attachment.service";

export function useTaskAttachments(taskId: string | undefined) {
  return useQuery({
    queryKey: ["task-attachments", taskId],
    queryFn: () => taskAttachmentService.getTaskAttachments(taskId!),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5,
  });
}
