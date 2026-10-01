import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discordService } from "@/services/discord.service";
import { DISCORD_WEBHOOKS_QUERY_KEY } from "./useDiscordWebhooks";
import type { CreateDiscordWebhookPayload, DiscordWebhookItem } from "@/types/discord";

export function useCreateDiscordWebhook() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string; data: DiscordWebhookItem }, Error, CreateDiscordWebhookPayload>({
    mutationFn: (payload: CreateDiscordWebhookPayload) =>
      discordService.createWebhook(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCORD_WEBHOOKS_QUERY_KEY });
    },
  });
}
