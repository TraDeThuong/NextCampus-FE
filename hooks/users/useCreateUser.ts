import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserService } from "./../../services/user.service";
import { CreateUserPayload } from "@/types/user";

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => createUserService(payload),
    onSuccess: (data) => {
      alert("Tạo tài khoản thành công! Hệ thống đã gửi email.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Đã có lỗi xảy ra";
      alert(`Thất bại: ${errorMsg}`);
    },
  });
};