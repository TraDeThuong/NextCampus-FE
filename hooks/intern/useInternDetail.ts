//GET /interns/:id

"use client";

import { useQuery } from "@tanstack/react-query";
import { internService } from "@/services/intern.service";

export function useInternDetail(id: string | undefined, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ["intern", id],
        queryFn: () => internService.getIntern(id!),
        enabled: (options?.enabled ?? true) && !!id,
        staleTime: 1000 * 60 * 5,
    });
}
