//DELETE /interns/:id

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { internService } from "@/services/intern.service";

export function useDeleteIntern() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => internService.deleteIntern(id),

        onSuccess: () => {
            toast.success("Intern deleted.");
            queryClient.invalidateQueries({ queryKey: ["interns"] });
        },

        onError: () => {
            toast.error("Failed to delete intern.");
        },
    });
}
