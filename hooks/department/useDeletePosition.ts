"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { departmentService } from "@/services/department.service";

export function useDeletePosition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: { id: string; departmentId: string }) =>
            departmentService.deletePosition(id),

        onSuccess: (data, variables) => {
            toast.success(data.message || "Position deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            queryClient.invalidateQueries({
                queryKey: ["positions", variables.departmentId],
            });
        },

        onError: (err: any) => {
            const msg = err?.response?.data?.message || "Failed to delete position.";
            toast.error(msg);
        },
    });
}
