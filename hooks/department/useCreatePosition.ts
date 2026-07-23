"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { departmentService } from "@/services/department.service";
import type { CreatePositionPayload } from "@/types/department";

export function useCreatePosition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreatePositionPayload) =>
            departmentService.createPosition(payload),

        onSuccess: (data) => {
            toast.success(`Position "${data.data.name}" created successfully.`);
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            queryClient.invalidateQueries({
                queryKey: ["positions", data.data.departmentId],
            });
        },

        onError: () => {
            toast.error("Failed to create position.");
        },
    });
}
