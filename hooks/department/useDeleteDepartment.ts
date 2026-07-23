"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
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

        onError: (err: any) => {
            const msg = err?.response?.data?.message || "Failed to delete department.";
            toast.error(msg);
        },
    });
}
