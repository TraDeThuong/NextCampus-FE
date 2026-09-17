"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import axios from "axios";
import { taskSubmissionService } from "@/services/task-submission.service";

export function useReviewTaskSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        reviewStatus: "APPROVED" | "REJECTED";
        reviewComment?: string;
      };
    }) => taskSubmissionService.reviewSubmission(id, payload),

    onSuccess: (res, variables) => {
      if (variables.payload.reviewStatus === "APPROVED") {
        toast.success("Đã chấp thuận bài nộp. Công việc chuyển sang Hoàn thành.");
      } else {
        toast.success("Đã yêu cầu làm lại bài nộp. Công việc chuyển về TODO.");
      }
      queryClient.invalidateQueries({ queryKey: ["task-submissions"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["task-assignments"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["task"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["stats"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["task-submission", variables.id] });
    },

    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Đánh giá bài nộp thất bại.";
      toast.error(message);
    },
  });
}
