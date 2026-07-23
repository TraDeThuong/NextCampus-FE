"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { departmentService } from "@/services/department.service";
import { useCreatePosition } from "./useCreatePosition";

export function useCreateDepartment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { name: string; positions: string[] }) =>
            departmentService.createDepartment(payload),

        onSuccess: (data) => {
            toast.success(`Department "${data.data.name}" and its positions created successfully.`);
            queryClient.invalidateQueries({ queryKey: ["departments"] });
        },

        onError: (err: any) => {
            const msg = err?.response?.data?.message || "Failed to create department.";
            toast.error(msg);
        },
    });
}
