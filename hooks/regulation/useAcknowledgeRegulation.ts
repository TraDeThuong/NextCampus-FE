"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { regulationService } from "@/services/regulation.service";

export function useAcknowledgeRegulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => regulationService.acknowledgeRegulation(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["regulations"] });
      toast.success(data.message || "Đã cam kết tuân thủ nội quy thành công!");
    },
    onError: () => {
      toast.error("Không thể xác nhận cam kết nội quy. Vui lòng thử lại!");
    },
  });
}
