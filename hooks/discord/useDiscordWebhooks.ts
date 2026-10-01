import { useQuery } from "@tanstack/react-query";
import { discordService } from "@/services/discord.service";
import type { DiscordWebhookItem } from "@/types/discord";

export const DISCORD_WEBHOOKS_QUERY_KEY = ["discord-webhooks"] as const;

export function useDiscordWebhooks(params?: Record<string, unknown>) {
  return useQuery<DiscordWebhookItem[]>({
    queryKey: [...DISCORD_WEBHOOKS_QUERY_KEY, params],
    queryFn: () => discordService.listWebhooks(params),
    staleTime: 30 * 1000,
  });
}
