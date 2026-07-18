"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { regulationService } from "@/services/regulation.service";
import type { CreateRegulationPayload } from "@/types/regulation";

export function useCreateRegulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRegulationPayload) =>
      regulationService.createRegulation(payload),

    onSuccess: () => {
      toast.success("Policy created successfully.");
      queryClient.invalidateQueries({ queryKey: ["regulations"] });
    },

    onError: () => {
      toast.error("Failed to create policy.");
    },
  });
}
