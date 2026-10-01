"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { internService } from "@/services/intern.service";

export function useRemindInternDiscord() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (internId: string) => internService.remindDiscord(internId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interns"] });
    },
  });
}
