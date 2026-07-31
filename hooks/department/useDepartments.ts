"use client";

import { useQuery } from "@tanstack/react-query";
import { departmentService } from "@/services/department.service";
import type { GetDepartmentsParams } from "@/types/department";

export function useDepartments(params?: GetDepartmentsParams) {
    return useQuery({
        queryKey: ["departments", params],
        queryFn: () => departmentService.getDepartments(params),
        staleTime: 1000 * 60 * 10,
    });
}
