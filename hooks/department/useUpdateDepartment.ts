"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { departmentService } from "@/services/department.service";
import type { UpdateDepartmentPayload } from "@/types/department";

export function useUpdateDepartment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateDepartmentPayload }) =>
            departmentService.updateDepartment(id, payload),

        onSuccess: (data) => {
            toast.success(`Department updated to "${data.data.name}".`);
            queryClient.invalidateQueries({ queryKey: ["departments"] });
        },

        onError: () => {
            toast.error("Failed to update department.");
        },
    });
}
