"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { createInviteService } from "@/services/application.service";
import type { CreateInvitePayload } from "@/types/application";

export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInvitePayload) => createInviteService(payload),

    onSuccess: (data) => {
      toast.success(`Invitation sent to ${data.data.invite.email}`);
      queryClient.invalidateQueries({ queryKey: ["application-invites"] });
    },

    onError: () => {
      toast.error("Failed to send invitation.");
    },
  });
}
