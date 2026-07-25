"use client";

import { useParams, useRouter, notFound } from "next/navigation";
import { ArrowLeft, Sparkles, User, Calendar, BookOpen, Star, MessageSquare } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";
import { useWeeklyEvaluationDetail } from "@/hooks/weekly-evaluation/useWeeklyEvaluationDetail";
import WeeklyEvaluationExportButton from "../WeeklyEvaluationExportButton";

export default function WeeklyEvaluationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: response, isLoading, isError } = useWeeklyEvaluationDetail(params.id);
  const evaluation = response?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !evaluation) {
    notFound();
  }

  // Calculate averages
  const finalAvg = (evaluation.communication + evaluation.attitude + evaluation.learning + evaluation.coding) / 4;
  
  const hasAi = evaluation.aiCommunication !== null && 
                evaluation.aiAttitude !== null && 
                evaluation.aiLearning !== null && 
                evaluation.aiCoding !== null;

  const aiAvg = hasAi 
    ? ((evaluation.aiCommunication ?? 0) + (evaluation.aiAttitude ?? 0) + (evaluation.aiLearning ?? 0) + (evaluation.aiCoding ?? 0)) / 4 
    : 0;

  const scoreItems = [
    { label: "Giao tiếp (Communication)", final: evaluation.communication, ai: evaluation.aiCommunication },
    { label: "Thái độ (Attitude)", final: evaluation.attitude, ai: evaluation.aiAttitude },
    { label: "Tự học (Learning)", final: evaluation.learning, ai: evaluation.aiLearning },
    { label: "Lập trình (Coding)", final: evaluation.coding, ai: evaluation.aiCoding },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/leader/weekly-evaluation")}
        className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </button>

      {/* Header card */}
      <MetalCard>
        <div className="rounded-3xl p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-main to-primary-light text-2xl font-bold text-white shadow-lg">
                {evaluation.intern?.fullName.charAt(0).toUpperCase() || "I"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  {evaluation.intern?.fullName || "Thực tập sinh"}
                  <span className="text-sm font-normal px-2.5 py-0.5 rounded-full border border-primary-light/30 bg-primary-light/10 text-primary-light">
                    Tuần {evaluation.week}
                  </span>
                </h1>
                <p className="mt-1 text-sm text-slate-400 flex items-center gap-1">
                  <User className="h-4 w-4 text-slate-500" />
                  <span>{evaluation.intern?.user?.email}</span>
                  <span className="text-slate-600 mx-2">|</span>
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>Đánh giá ngày {new Date(evaluation.createdAt).toLocaleDateString("vi-VN")}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <WeeklyEvaluationExportButton id={evaluation.id} />
            </div>
          </div>
        </div>
      </MetalCard>

      {/* Main content layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Scores & Comparison */}
        <div className="lg:col-span-2 space-y-6">
          <MetalCard>
            <div className="rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary-light shrink-0" />
                  <span className="metal-text">Chi Tiết Điểm Năng Lực</span>
                </h2>
                {evaluation.leaderEdited && (
                  <span className="text-xs px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Đã điều chỉnh sau gợi ý AI
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {scoreItems.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-300">{item.label}</span>
                      <div className="flex items-center gap-3">
                        {hasAi && item.ai !== null && (
                          <span className="text-xs text-muted">
                            AI gợi ý: <strong className="text-slate-400">{item.ai.toFixed(1)}</strong>
                          </span>
                        )}
                        <span className="text-sm font-bold text-primary-light">
                          {item.final.toFixed(1)} <span className="text-slate-500 font-normal">/ 10</span>
                        </span>
                      </div>
                    </div>
                    {/* Progress bars */}
                    <div className="space-y-1">
                      {/* Final Score Bar */}
                      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-primary-main to-primary-light rounded-full"
                          style={{ width: `${item.final * 10}%` }}
                        />
                      </div>
                      {/* Optional AI suggested Bar */}
                      {hasAi && item.ai !== null && (
                        <div className="h-1 w-full bg-transparent rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-500/40 rounded-full"
                            style={{ width: `${item.ai * 10}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MetalCard>

          {/* Comment Section */}
          <MetalCard>
            <div className="rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-border/40 pb-4">
                <MessageSquare className="h-5 w-5 text-primary-light shrink-0" />
                <span className="metal-text">Nhận Xét & Đánh Giá</span>
              </h2>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {evaluation.comment || "Không có nhận xét."}
                </p>
              </div>

              {/* AI original comment comparison */}
              {evaluation.aiComment && evaluation.leaderEdited && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-xs font-semibold text-muted flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary-light" />
                    Nhận xét gốc từ AI
                  </h3>
                  <div className="bg-primary-main/5 border border-primary-light/10 rounded-2xl p-4">
                    <p className="text-slate-400 text-xs whitespace-pre-wrap leading-relaxed italic">
                      {evaluation.aiComment}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </MetalCard>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <MetalCard>
            <div className="rounded-3xl p-6 text-center space-y-6">
              <h2 className="text-lg font-semibold border-b border-border/40 pb-4 flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 shrink-0" />
                <span className="metal-text">Điểm Đánh Giá Chung</span>
              </h2>

              <div className="space-y-2">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary-light">
                  {finalAvg.toFixed(2)}
                </div>
                <div className="text-sm text-muted">trên thang điểm 10.00</div>
              </div>

              {hasAi && (
                <div className="pt-4 border-t border-border/40 flex items-center justify-around text-xs">
                  <div className="text-center">
                    <div className="text-slate-400 font-bold">{finalAvg.toFixed(2)}</div>
                    <div className="text-muted mt-0.5">Điểm thực tế</div>
                  </div>
                  <div className="h-8 w-px bg-border/40" />
                  <div className="text-center">
                    <div className="text-slate-400 font-bold">{aiAvg.toFixed(2)}</div>
                    <div className="text-muted mt-0.5">AI đề xuất</div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-border/40 text-left space-y-2 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Người đánh giá:</span>
                  <span className="font-semibold text-foreground">
                    {evaluation.leader?.fullName || evaluation.leader?.email || "Leader"}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Ngày tạo:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(evaluation.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Cập nhật cuối:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(evaluation.updatedAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          </MetalCard>
        </div>
      </div>
    </div>
  );
}
