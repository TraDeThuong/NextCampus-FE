"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { cronService } from "@/services/cron.service";
import type { TriggerCronJobPayload, CronJobExecutionResult } from "@/types/cron";

interface UseTriggerCronJobOptions {
  onSuccess?: (result: CronJobExecutionResult) => void;
}

export function useTriggerCronJob(options?: UseTriggerCronJobOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobName,
      payload,
    }: {
      jobName: string;
      payload?: TriggerCronJobPayload;
    }) => cronService.triggerJob(jobName, payload),
    onSuccess: (res) => {
      toast.success(res.message || "Tác vụ nền đã thực thi thành công");
      queryClient.invalidateQueries({ queryKey: ["cron-jobs"] });
      options?.onSuccess?.(res.data);
    },
    onError: (error: unknown) => {
      const serverMsg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(serverMsg || "Kích hoạt tác vụ nền thất bại");
    },
  });
}
