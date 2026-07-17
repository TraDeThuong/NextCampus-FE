"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { regulationService } from "@/services/regulation.service";

export function useDeleteRegulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => regulationService.deleteRegulation(id),

    onSuccess: () => {
      toast.success("Policy deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["regulations"] });
    },

    onError: () => {
      toast.error("Failed to delete policy.");
    },
  });
}
