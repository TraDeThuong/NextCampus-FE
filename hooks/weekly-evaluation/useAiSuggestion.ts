"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";
import type { AiSuggestionPayload } from "@/types/weekly-evaluation";

export function useAiSuggestion() {
  return useMutation({
    mutationFn: (payload: AiSuggestionPayload) => weeklyEvaluationService.getAiSuggestion(payload),

    onSuccess: () => {
      toast.success("Đã lấy gợi ý từ AI thành công!");
    },

    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Lỗi khi lấy gợi ý từ AI. Hãy kiểm tra bài nộp / báo cáo của thực tập sinh trong tuần.";
      toast.error(msg);
    },
  });
}
