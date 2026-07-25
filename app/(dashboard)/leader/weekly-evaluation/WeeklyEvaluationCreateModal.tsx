"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useCreateWeeklyEvaluation } from "@/hooks/weekly-evaluation/useCreateWeeklyEvaluation";
import { useAiSuggestion } from "@/hooks/weekly-evaluation/useAiSuggestion";
import { useInterns } from "@/hooks/intern/useInterns";
import type { CreateWeeklyEvaluationPayload } from "@/types/weekly-evaluation";

interface Props {
  onCloseModal?: () => void;
}

export default function WeeklyEvaluationCreateModal({ onCloseModal }: Props) {
  const createEvaluation = useCreateWeeklyEvaluation();
  const aiSuggestion = useAiSuggestion();
  const { data: internsData, isLoading: internsLoading } = useInterns({ status: "ACTIVE" });
  const interns = internsData?.data ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateWeeklyEvaluationPayload>({
    mode: "onBlur",
    defaultValues: {
      week: 1,
      communication: 5,
      attitude: 5,
      learning: 5,
      coding: 5,
    },
  });

  const selectedInternId = watch("internId");
  const selectedWeek = watch("week");

  const handleGetAiSuggestion = async () => {
    if (!selectedInternId) {
      toast.error("Vui lòng chọn thực tập sinh trước.");
      return;
    }
    if (!selectedWeek || selectedWeek <= 0) {
      toast.error("Vui lòng nhập tuần đánh giá hợp lệ.");
      return;
    }

    try {
      const response = await aiSuggestion.mutateAsync({
        internId: selectedInternId,
        week: Number(selectedWeek),
      });

      if (response && response.data) {
        const { communication, attitude, learning, coding, comment } = response.data;
        // Điền vào form cho Leader chỉnh sửa
        setValue("communication", communication);
        setValue("attitude", attitude);
        setValue("learning", learning);
        setValue("coding", coding);
        setValue("comment", comment);

        // Lưu bản gốc của AI
        setValue("aiCommunication", communication);
        setValue("aiAttitude", attitude);
        setValue("aiLearning", learning);
        setValue("aiCoding", coding);
        setValue("aiComment", comment);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const onSubmit = async (data: CreateWeeklyEvaluationPayload) => {
    try {
      await createEvaluation.mutateAsync({
        ...data,
        week: Number(data.week),
        communication: Number(data.communication),
        attitude: Number(data.attitude),
        learning: Number(data.learning),
        coding: Number(data.coding),
      });
      reset();
      onCloseModal?.();
    } catch (err) {
      console.error(err);
    }
  };

  const isPending = createEvaluation.isPending;

  const inputClass = (name: keyof CreateWeeklyEvaluationPayload, extra = "") =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-foreground bg-card placeholder:text-muted focus:outline-none ${
      errors[name]
        ? "border-red-400/60 focus:border-red-400"
        : "border-border focus:border-primary-light/40"
    } ${extra}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-main/10 text-primary-light">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold metal-text">Tạo Đánh Giá Tuần</h3>
          <p className="text-sm text-muted">
            Đánh giá năng lực của thực tập sinh và tham khảo gợi ý thông minh từ AI.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Thực Tập Sinh <span className="text-red-400">*</span>
            </label>
            {internsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted py-2.5">
                <Loader2 className="h-4 w-4 animate-spin" /> Đang tải danh sách...
              </div>
            ) : (
              <select
                {...register("internId", { required: "Vui lòng chọn thực tập sinh" })}
                className={inputClass("internId")}
              >
                <option value="">-- Chọn thực tập sinh --</option>
                {interns.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.fullName} ({i.user.email})
                  </option>
                ))}
              </select>
            )}
            {errors.internId && (
              <p className="mt-1 text-xs text-red-400">{errors.internId.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Tuần Đánh Giá <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min={1}
              {...register("week", {
                required: "Vui lòng nhập tuần",
                min: { value: 1, message: "Tuần phải lớn hơn 0" },
              })}
              className={inputClass("week")}
            />
            {errors.week && (
              <p className="mt-1 text-xs text-red-400">{errors.week.message}</p>
            )}
          </div>
        </div>

        {/* AI Action trigger */}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="glass"
            size="sm"
            onClick={handleGetAiSuggestion}
            isLoading={aiSuggestion.isPending}
            disabled={aiSuggestion.isPending || !selectedInternId}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Nhận gợi ý điểm & nhận xét từ AI
          </Button>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Giao tiếp (Communication) (0-10) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              {...register("communication", {
                required: "Bắt buộc",
                min: { value: 0, message: "Từ 0 - 10" },
                max: { value: 10, message: "Từ 0 - 10" },
              })}
              className={inputClass("communication")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Thái độ (Attitude) (0-10) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              {...register("attitude", {
                required: "Bắt buộc",
                min: { value: 0, message: "Từ 0 - 10" },
                max: { value: 10, message: "Từ 0 - 10" },
              })}
              className={inputClass("attitude")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Khả năng tự học (Learning) (0-10) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              {...register("learning", {
                required: "Bắt buộc",
                min: { value: 0, message: "Từ 0 - 10" },
                max: { value: 10, message: "Từ 0 - 10" },
              })}
              className={inputClass("learning")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Kỹ năng lập trình (Coding) (0-10) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              {...register("coding", {
                required: "Bắt buộc",
                min: { value: 0, message: "Từ 0 - 10" },
                max: { value: 10, message: "Từ 0 - 10" },
              })}
              className={inputClass("coding")}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">Nhận xét</label>
          <textarea
            rows={4}
            placeholder="Nhập nhận xét chi tiết về thực tập sinh trong tuần..."
            {...register("comment", {
              maxLength: { value: 2000, message: "Nhận xét tối đa 2000 ký tự" },
            })}
            className={inputClass("comment", "resize-none")}
          />
          {errors.comment && (
            <p className="mt-1 text-xs text-red-400">{errors.comment.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
          <Button type="button" variant="glass" size="md" onClick={onCloseModal}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isPending}>
            Lưu Đánh Giá
          </Button>
        </div>
      </form>
    </div>
  );
}
