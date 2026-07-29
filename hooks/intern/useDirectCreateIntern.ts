"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { internService } from "@/services/intern.service";
import type { DirectCreateInternPayload } from "@/types/intern";

export function useDirectCreateIntern() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: DirectCreateInternPayload) =>
            internService.directCreateIntern(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["interns"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["stats"] });
        },
    });
}
