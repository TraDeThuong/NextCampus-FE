"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { weeklyEvaluationService } from "@/services/weekly-evaluation.service";
import type { AiSuggestionPayload } from "@/types/weekly-evaluation";

export function useAiSuggestion() {
  return useMutation({
    mutationFn: (payload: AiSuggestionPayload) => weeklyEvaluationService.getAiSuggestion(payload),
    retry: false,

    onSuccess: () => {
      toast.success("Đã lấy gợi ý từ AI thành công!");
    },

    onError: (error: unknown) => {
      const msg = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(
        msg ??
          "Lỗi khi lấy gợi ý từ AI. Hãy kiểm tra bài nộp / báo cáo của thực tập sinh trong tuần.",
      );
    },
  });
}
