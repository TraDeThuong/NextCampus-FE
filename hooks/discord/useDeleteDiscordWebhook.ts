import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discordService } from "@/services/discord.service";
import { DISCORD_WEBHOOKS_QUERY_KEY } from "./useDiscordWebhooks";

export function useDeleteDiscordWebhook() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (id: string) => discordService.deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCORD_WEBHOOKS_QUERY_KEY });
    },
  });
}
