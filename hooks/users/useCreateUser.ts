import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserService } from "./../../services/user.service";
import { CreateUserPayload } from "@/types/user";

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUserService(payload),
    onSuccess: (data) => {
      alert("Account created successfully! An email has been sent.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "An error occurred";
      alert(`Failed: ${errorMsg}`);
    },
  });
};