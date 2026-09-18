"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { departmentService } from "@/services/department.service";
import type { CreateDepartmentPayload } from "@/types/department";

export function useCreateDepartment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateDepartmentPayload) =>
            departmentService.createDepartment(payload),

        onSuccess: (data) => {
            toast.success(`Department "${data.data.name}" and its positions created successfully.`);
            queryClient.invalidateQueries({ queryKey: ["departments"] });
        },

        onError: (err: unknown) => {
            const msg = axios.isAxiosError<{ message?: string }>(err)
                ? err.response?.data?.message
                : undefined;
            toast.error(msg || "Failed to create department.");
        },
    });
}
