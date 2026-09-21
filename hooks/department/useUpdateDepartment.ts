"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { departmentService } from "@/services/department.service";
import type { UpdateDepartmentPayload } from "@/types/department";

export function useUpdateDepartment(options?: {
    onSuccess?: (data: any, variables: { id: string; payload: UpdateDepartmentPayload }) => void;
    onError?: (err: unknown, variables: { id: string; payload: UpdateDepartmentPayload }) => void;
}) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateDepartmentPayload }) =>
            departmentService.updateDepartment(id, payload),

        onSuccess: (data, variables) => {
            toast.success(`Department updated to "${data.data.name}".`);
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            options?.onSuccess?.(data, variables);
        },

        onError: (err, variables) => {
            toast.error("Failed to update department.");
            options?.onError?.(err, variables);
        },
    });
}
