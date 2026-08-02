"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { leaderService } from "@/services/leader.service";
import type { UpdateMeLeaderPayload } from "@/types/leader";

export function useUpdateLeader() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateMeLeaderPayload) =>
            leaderService.updateMyLeader(payload),

        onSuccess: () => {
            toast.success("Leader information updated.");
            queryClient.invalidateQueries({ queryKey: ["my-leader"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
        },

        onError: () => {
            toast.error("Failed to update leader information.");
        },
    });
}
