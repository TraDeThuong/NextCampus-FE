//PUT /interns/:id

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { internService } from "@/services/intern.service";
import type { UpdateInternPayload } from "@/types/intern";

export function useUpdateIntern() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdateInternPayload;
        }) => internService.updateIntern(id, payload),

        onSuccess: () => {
            toast.success("Intern updated.");
            queryClient.invalidateQueries({ queryKey: ["interns"] });
            queryClient.invalidateQueries({ queryKey: ["intern"] });
        },

        onError: () => {
            toast.error("Failed to update intern.");
        },
    });
}
