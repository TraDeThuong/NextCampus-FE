"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { taskService } from "@/services/task.service";

export function useExecuteImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      taskGroupId,
      taskGroupName,
    }: {
      file: File;
      taskGroupId?: string;
      taskGroupName?: string;
    }) => taskService.executeImport(file, taskGroupId, taskGroupName),

    onSuccess: () => {
      toast.success("Tasks imported successfully.");
      queryClient.invalidateQueries({ queryKey: ["tasks"] }, { exact: false });
      queryClient.invalidateQueries({ queryKey: ["task-groups"] }, { exact: false });
    },

    onError: () => {
      toast.error("Failed to import tasks.");
    },
  });
}
