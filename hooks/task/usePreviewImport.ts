"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskService } from "@/services/task.service";

export function usePreviewImport() {
  return useMutation({
    mutationFn: ({
      file,
      taskGroupId,
      taskGroupName,
    }: {
      file: File;
      taskGroupId?: string;
      taskGroupName?: string;
    }) => taskService.previewImport(file, taskGroupId, taskGroupName),

    onSuccess: () => {
      toast.success("Import preview generated successfully.");
    },

    onError: () => {
      toast.error("Failed to preview import.");
    },
  });
}
