"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cronService } from "@/services/cron.service";
import toast from "react-hot-toast";

export function useToggleCronJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobName: string) => cronService.toggleJob(jobName),
    onSuccess: (res) => {
      // Optimistically update cache: flip isEnabled for the toggled job
      queryClient.invalidateQueries({ queryKey: ["cron-jobs"] });
      toast.success(res.message);
    },
    onError: () => {
      toast.error("Không thể thay đổi trạng thái lịch chạy. Thử lại sau.");
    },
  });
}
