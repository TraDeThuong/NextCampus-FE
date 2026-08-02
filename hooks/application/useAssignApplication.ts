"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";

import { assignApplicationService } from "@/services/application.service";
import type { AssignApplicationPayload } from "@/types/application";
import type { ApiErrorResponse } from "@/types/auth";

export function useAssignApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AssignApplicationPayload;
    }) => assignApplicationService(id, payload),
    onSuccess: (_data, { id }) => {
      toast.success("Application assignment updated.");
      queryClient.invalidateQueries({ queryKey: ["application-invites"] });
      queryClient.invalidateQueries({ queryKey: ["invite-detail"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application", id] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(
        error.response?.data?.message ?? "Failed to update assignment.",
      );
    },
  });
}
