import { useQuery } from "@tanstack/react-query";
import { discordService } from "@/services/discord.service";
import type { DiscordBotStatus } from "@/types/discord";

export const DISCORD_BOT_STATUS_QUERY_KEY = ["discord-bot-status"] as const;

export function useDiscordBotStatus() {
  return useQuery<DiscordBotStatus>({
    queryKey: DISCORD_BOT_STATUS_QUERY_KEY,
    queryFn: () => discordService.getBotStatus(),
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });
}
