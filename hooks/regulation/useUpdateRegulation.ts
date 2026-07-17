"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { regulationService } from "@/services/regulation.service";
import type { UpdateRegulationPayload } from "@/types/regulation";

export function useUpdateRegulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateRegulationPayload;
    }) => regulationService.updateRegulation(id, payload),

    onSuccess: () => {
      toast.success("Policy updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["regulations"] });
    },

    onError: () => {
      toast.error("Failed to update policy.");
    },
  });
}
