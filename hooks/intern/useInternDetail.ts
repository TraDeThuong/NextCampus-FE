//GET /interns/:id

"use client";

import { useQuery } from "@tanstack/react-query";
import { internService } from "@/services/intern.service";

export function useInternDetail(id: string | undefined) {
    return useQuery({
        queryKey: ["intern", id],
        queryFn: () => internService.getIntern(id!),
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });
}
