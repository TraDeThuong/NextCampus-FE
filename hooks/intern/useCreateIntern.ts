//POST /interns

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { internService } from "@/services/intern.service";
import type { CreateInternPayload } from "@/types/intern";

export function useCreateIntern() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateInternPayload) =>
            internService.createIntern(payload),

        onSuccess: (data) => {
            toast.success(`Intern ${data.data.fullName} created.`);
            queryClient.invalidateQueries({ queryKey: ["interns"] });
        },

        onError: () => {
            toast.error("Failed to create intern.");
        },
    });
}
