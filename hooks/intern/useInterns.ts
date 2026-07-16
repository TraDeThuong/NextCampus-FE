//GET /interns

"use client";

import { useQuery } from "@tanstack/react-query";
import { internService } from "@/services/intern.service";
import type { InternQueryParams } from "@/types/intern";

export function useInterns(params?: InternQueryParams) {
    return useQuery({
        queryKey: ["interns", params],
        queryFn: () => internService.getInterns(params),
        staleTime: 1000 * 60 * 2,
    });
}
