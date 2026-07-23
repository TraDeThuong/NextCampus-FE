"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskService } from "@/services/task.service";

export function useDownloadTemplate() {
  return useMutation({
    mutationFn: async () => {
      const blob = await taskService.downloadTemplate();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "task-import-template.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
    },

    onSuccess: () => {
      toast.success("Template downloaded successfully.");
    },

    onError: () => {
      toast.error("Failed to download template.");
    },
  });
}
