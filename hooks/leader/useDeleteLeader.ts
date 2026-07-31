"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { leaderService } from "@/services/leader.service";

export function useDeleteLeader() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => leaderService.deleteLeader(id),

        onSuccess: () => {
            toast.success("Leader deleted.");
            queryClient.invalidateQueries({ queryKey: ["leaders"] });
            queryClient.invalidateQueries({ queryKey: ["departments"] });
        },

        onError: () => {
            toast.error("Failed to delete leader.");
        },
    });
}
