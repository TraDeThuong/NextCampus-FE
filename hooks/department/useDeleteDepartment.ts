"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { departmentService } from "@/services/department.service";

export function useDeleteDepartment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) =>
            departmentService.deleteDepartment(id),

        onSuccess: (data) => {
            toast.success(data.message || "Department deleted successfully.");
            queryClient.invalidateQueries({ queryKey: ["departments"] });
        },

        onError: (err: unknown) => {
            const msg = axios.isAxiosError<{ message?: string }>(err)
                ? err.response?.data?.message
                : undefined;
            toast.error(msg || "Failed to delete department.");
        },
    });
}
