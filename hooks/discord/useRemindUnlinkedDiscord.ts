"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discordService } from "@/services/discord.service";
import type { RemindDiscordResponse } from "@/types/discord";

export function useRemindUnlinkedDiscord() {
  const queryClient = useQueryClient();

  return useMutation<RemindDiscordResponse, Error, void>({
    mutationFn: () => discordService.remindUnlinkedDiscord(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interns"] });
    },
  });
}
