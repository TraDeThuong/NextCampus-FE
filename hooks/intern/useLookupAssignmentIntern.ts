"use client";

import { useMutation } from "@tanstack/react-query";
import { internService } from "@/services/intern.service";

export function useLookupAssignmentIntern() {
  return useMutation({
    mutationFn: (email: string) =>
      internService.lookupAssignmentIntern(email),
  });
}
