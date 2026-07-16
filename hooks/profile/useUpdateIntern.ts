"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { internService } from "@/services/intern.service";
import type { UpdateMeInternPayload } from "@/types/intern";

export function useUpdateIntern() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateMeInternPayload) =>
            internService.updateMyIntern(payload),

        onSuccess: () => {
            toast.success("Internship information updated.");
            queryClient.invalidateQueries({ queryKey: ["my-intern"] });
        },

        onError: () => {
            toast.error("Failed to update internship information.");
        },
    });
}
