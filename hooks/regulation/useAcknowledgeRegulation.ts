"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { regulationService } from "@/services/regulation.service";

export function useAcknowledgeRegulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => regulationService.acknowledgeRegulation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regulations"] });
      queryClient.invalidateQueries({ queryKey: ["regulations", "active"] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      toast.success("Bạn đã xác nhận cam kết tuân thủ nội quy cơ quan thành công.");
    },
    onError: () => {
      toast.error("Không thể xác nhận cam kết nội quy. Vui lòng thử lại!");
    },
  });
}
