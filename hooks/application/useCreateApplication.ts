"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";

import { createApplicationService } from "@/services/application.service";
import type { CreateApplicationPayload } from "@/types/application";
import type { ApiErrorResponse } from "@/types/auth";

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateApplicationPayload) =>
      createApplicationService(payload),

    onSuccess: () => {
      toast.success("Application submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["application-invites"] });
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(
        error.response?.data?.message ?? "Failed to submit application.",
      );
    },
  });
}
