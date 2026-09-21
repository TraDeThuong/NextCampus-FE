//GET /interns

"use client";

import { useQuery } from "@tanstack/react-query";
import { internService } from "@/services/intern.service";
import type { InternQueryParams } from "@/types/intern";

export function useInterns(params?: InternQueryParams, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ["interns", params],
        queryFn: () => internService.getInterns(params),
        staleTime: 1000 * 60 * 2,
        enabled: options?.enabled ?? true,
    });
}

