import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discordService } from "@/services/discord.service";
import { DISCORD_WEBHOOKS_QUERY_KEY } from "./useDiscordWebhooks";
import type { TestDiscordWebhookPayload, TestDiscordWebhookResponse } from "@/types/discord";

export function useTestDiscordWebhook() {
  const queryClient = useQueryClient();

  return useMutation<TestDiscordWebhookResponse, Error, TestDiscordWebhookPayload>({
    mutationFn: (payload: TestDiscordWebhookPayload) =>
      discordService.testPingWebhook(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCORD_WEBHOOKS_QUERY_KEY });
    },
  });
}
