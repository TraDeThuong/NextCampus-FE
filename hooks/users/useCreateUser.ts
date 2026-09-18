import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserService } from "@/services/user.service";
import type { CreateUserPayload } from "@/types/user";

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUserService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};