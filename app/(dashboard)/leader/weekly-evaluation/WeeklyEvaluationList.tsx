"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import { Trash2, Sparkles, Plus, Eye, ChevronLeft, ChevronRight, Bot } from "lucide-react";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import WeeklyEvaluationCreateModal from "./WeeklyEvaluationCreateModal";
import { useWeeklyEvaluations } from "@/hooks/weekly-evaluation/useWeeklyEvaluations";
import { useDeleteWeeklyEvaluation } from "@/hooks/weekly-evaluation/useDeleteWeeklyEvaluation";
import WeeklyEvaluationExportButton from "./WeeklyEvaluationExportButton";
import { RATING_COLORS, RATING_LABELS, type RatingLevel, type WeeklyEvaluationQueryParams, type WeeklyEvaluation } from "@/types/weekly-evaluation";
import Link from "next/link";
import MetalCard from "@/components/ui/MetalCard";

export default function WeeklyEvaluationList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const deleteEvaluation = useDeleteWeeklyEvaluation();

  const params: WeeklyEvaluationQueryParams = useMemo(() => {
    const page = searchParams.get("page");
    return {
      page: page ? Number(page) : 1,
      limit: 10,
      sortBy: "createdAt",
      order: "desc",
    };
  }, [searchParams]);

  const { data: response, isLoading } = useWeeklyEvaluations(params);
  const evaluations = response?.data ?? [];
  const meta = response?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const currentPage = meta?.page ?? 1;

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) {
      try {
        await deleteEvaluation.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePageChange = (page: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", String(page));
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner />
      </div>
    );
  }

  const getRatingLevel = (score: number): RatingLevel => {
    if (score >= 8.0) return "TOT";
    if (score >= 6.5) return "KHA";
    if (score >= 5.0) return "TB";
    if (score >= 3.5) return "TBY";
    return "YEU";
  };

  return (
    <MetalCard className="p-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary-light shrink-0" />
            <span className="metal-text">Đánh Giá Tuần (Weekly Evaluation)</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Đánh giá thực tập sinh hàng tuần, nhận gợi ý thông minh từ AI và xuất báo cáo PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Modal>
            <Modal.Open opens="create-evaluation">
              <Button variant="primary" size="md">
                <Plus className="h-4 w-4 mr-1 inline" />
                Tạo Đánh Giá
              </Button>
            </Modal.Open>
            <Modal.Window name="create-evaluation" size="md">
              <WeeklyEvaluationCreateModal />
            </Modal.Window>
          </Modal>
        </div>
      </div>

      <Table columns="2.5fr 1fr 1.5fr 1fr 2fr">
        <Table.Header>
          <span>Thực Tập Sinh</span>
          <span>Tuần</span>
          <span>Điểm &amp; Xếp Loại</span>
          <span className="text-center">AI</span>
          <span className="text-center">Thao Tác</span>
        </Table.Header>

        <Table.Body
          data={evaluations}
          render={(item: WeeklyEvaluation) => {
            const level = getRatingLevel(item.totalScore);
            const createdDate = new Date(item.createdAt).toLocaleDateString("vi-VN", {
              day: "2-digit", month: "2-digit", year: "numeric",
            });

            return (
              <Table.Row key={item.id}>
                {/* Intern Info */}
                <div className="flex flex-col">
                  <p className="font-bold text-foreground text-sm">
                    {item.intern?.fullName || "Chưa xác định"}
                  </p>
                  <p className="text-xs text-muted">
                    {item.intern?.user?.email || ""}
                  </p>
                </div>

                {/* Week + Date */}
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground text-sm">Tuần {item.week}</span>
                  <span className="text-[11px] text-muted">{createdDate}</span>
                </div>

                {/* Score + Rating Badge */}
                <div className="flex flex-col gap-1.5 items-start">
                  <span className="text-sm font-extrabold text-foreground">
                    {item.totalScore.toFixed(1)} / 10
                  </span>
                  <span className={`inline-flex items-center justify-center text-[10px] font-semibold px-2.5 py-0.5 rounded-lg border leading-none ${RATING_COLORS[level]}`}>
                    {RATING_LABELS[level]}
                  </span>
                </div>

                {/* AI Status */}
                <div className="flex justify-center">
                  {item.aiComment ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                      <Bot className="h-3 w-3" />
                      AI
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border text-slate-500 border-white/10 bg-white/5">
                      <Bot className="h-3 w-3" />
                      Chưa
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-2">
                  <Link href={`/leader/weekly-evaluation/${item.id}`}>
                    <Button variant="glass" size="sm" className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span>Xem</span>
                    </Button>
                  </Link>

                  <WeeklyEvaluationExportButton id={item.id} />

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleteEvaluation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Table.Row>
            );
          }}
        />

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <Table.Footer>
            <div className="flex items-center gap-4">
              <Button
                variant="glass"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                variant="glass"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Table.Footer>
        )}
      </Table>
    </MetalCard>
  );
}
