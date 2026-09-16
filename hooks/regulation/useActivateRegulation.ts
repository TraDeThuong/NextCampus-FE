"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { regulationService } from "@/services/regulation.service";

export function useActivateRegulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => regulationService.activateRegulation(id),

    onSuccess: () => {
      toast.success("Policy activated successfully.");
      queryClient.invalidateQueries({ queryKey: ["regulations"] });
      queryClient.invalidateQueries({ queryKey: ["regulations", "active"] });
    },

    onError: () => {
      toast.error("Failed to activate policy.");
    },
  });
}
