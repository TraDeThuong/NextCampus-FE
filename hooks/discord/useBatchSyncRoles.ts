"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discordService } from "@/services/discord.service";
import type { BatchSyncRolesResponse } from "@/types/discord";

export function useBatchSyncRoles() {
  const queryClient = useQueryClient();

  return useMutation<
    BatchSyncRolesResponse,
    Error,
    { force?: boolean } | undefined
  >({
    mutationFn: (options) => discordService.batchSyncRoles(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interns"] });
      queryClient.invalidateQueries({ queryKey: ["discord", "webhooks"] });
      queryClient.invalidateQueries({ queryKey: ["discord", "status"] });
    },
  });
}
