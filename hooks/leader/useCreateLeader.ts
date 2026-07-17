"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { leaderService } from "@/services/leader.service";
import type { CreateLeaderPayload } from "@/types/leader";

export function useCreateLeader() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateLeaderPayload) =>
            leaderService.createLeader(payload),

        onSuccess: (data) => {
            toast.success(
                `Leader created for ${data.data.user.fullName ?? data.data.user.email}.`,
            );
            queryClient.invalidateQueries({ queryKey: ["leaders"] });
        },

        onError: () => {
            toast.error("Failed to create leader.");
        },
    });
}
