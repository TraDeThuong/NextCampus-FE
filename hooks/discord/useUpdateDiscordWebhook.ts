import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discordService } from "@/services/discord.service";
import { DISCORD_WEBHOOKS_QUERY_KEY } from "./useDiscordWebhooks";
import type { DiscordWebhookItem, UpdateDiscordWebhookPayload } from "@/types/discord";

export function useUpdateDiscordWebhook() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; message: string; data: DiscordWebhookItem },
    Error,
    { id: string; payload: UpdateDiscordWebhookPayload }
  >({
    mutationFn: ({ id, payload }) => discordService.updateWebhook(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCORD_WEBHOOKS_QUERY_KEY });
    },
  });
}
