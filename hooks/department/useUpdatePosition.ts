"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { departmentService } from "@/services/department.service";
import type { UpdatePositionPayload } from "@/types/department";

export function useUpdatePosition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdatePositionPayload }) =>
            departmentService.updatePosition(id, payload),

        onSuccess: (data) => {
            toast.success(`Position updated to "${data.data.name}".`);
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            queryClient.invalidateQueries({
                queryKey: ["positions", data.data.departmentId],
            });
        },

        onError: () => {
            toast.error("Failed to update position.");
        },
    });
}
