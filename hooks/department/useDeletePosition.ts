"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
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

        onError: (err: unknown) => {
            const msg = axios.isAxiosError<{ message?: string }>(err)
                ? err.response?.data?.message
                : undefined;
            toast.error(msg || "Failed to delete position.");
        },
    });
}
