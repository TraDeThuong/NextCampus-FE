"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { departmentService } from "@/services/department.service";

export function useDeleteDepartment(options?: {
    onSuccess?: (data: any, variables: string) => void;
    onError?: (err: unknown, variables: string) => void;
}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            departmentService.deleteDepartment(id),

        onSuccess: (data, variables) => {
            toast.success(data.message || "Department deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            options?.onSuccess?.(data, variables);
        },

        onError: (err: unknown, variables) => {
            const msg = axios.isAxiosError<{ message?: string }>(err)
                ? err.response?.data?.message
                : undefined;
            toast.error(msg || "Failed to delete department.");
            options?.onError?.(err, variables);
        },
    });
}
