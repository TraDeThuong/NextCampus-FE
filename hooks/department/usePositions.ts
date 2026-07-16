"use client";

import { useQuery } from "@tanstack/react-query";
import { departmentService } from "@/services/department.service";

export function usePositions(departmentId: string | undefined) {
    return useQuery({
        queryKey: ["positions", departmentId],
        queryFn: () => departmentService.getPositions(departmentId!),
        enabled: !!departmentId,
        staleTime: 1000 * 60 * 10,
    });
}
