"use client";

import { useQuery } from "@tanstack/react-query";
import { departmentService } from "@/services/department.service";

export function useDepartments() {
    return useQuery({
        queryKey: ["departments"],
        queryFn: departmentService.getDepartments,
        staleTime: 1000 * 60 * 10,
    });
}
