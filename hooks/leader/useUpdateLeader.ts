"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { leaderService } from "@/services/leader.service";
import type { UpdateLeaderPayload } from "@/types/leader";

export function useUpdateLeader() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdateLeaderPayload;
        }) => leaderService.updateLeader(id, payload),

        onSuccess: () => {
            toast.success("Leader updated.");
            queryClient.invalidateQueries({ queryKey: ["leaders"] });
            queryClient.invalidateQueries({ queryKey: ["leader"] });
            queryClient.invalidateQueries({ queryKey: ["departments"] });
        },

        onError: () => {
            toast.error("Failed to update leader.");
        },
    });
}
