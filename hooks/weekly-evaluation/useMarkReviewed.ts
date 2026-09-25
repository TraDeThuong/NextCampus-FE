"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";

export function useConfirmView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => weeklyEvaluationService.confirmView(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["weekly-evaluations"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-evaluation", id] });
      queryClient.invalidateQueries({ queryKey: ["stats", "intern"] });
      queryClient.invalidateQueries({ queryKey: ["action-counts"] });
      toast.success("Đã xác nhận xem đánh giá tuần thành công.");
    },
    onError: () => {
      toast.error("Không thể xác nhận xem đánh giá. Vui lòng thử lại!");
    },
  });
}

export const useMarkReviewed = useConfirmView;

