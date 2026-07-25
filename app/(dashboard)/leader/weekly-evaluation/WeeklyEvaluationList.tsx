"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";
import { Trash2, Sparkles, AlertTriangle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useWeeklyEvaluations } from "@/hooks/weekly-evaluation/useWeeklyEvaluations";
import { useDeleteWeeklyEvaluation } from "@/hooks/weekly-evaluation/useDeleteWeeklyEvaluation";
import WeeklyEvaluationExportButton from "./WeeklyEvaluationExportButton";
import type { WeeklyEvaluationQueryParams, WeeklyEvaluation } from "@/types/weekly-evaluation";
import Link from "next/link";

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

  return (
    <div className="space-y-4">
      <Table columns="2.2fr 1fr 3fr 1.2fr 2fr">
        <Table.Header>
          <div>Thực Tập Sinh</div>
          <div>Tuần</div>
          <div>Chi Tiết Điểm (G / T / H / C)</div>
          <div>Tổng Điểm</div>
          <div className="text-center">Thao tác</div>
        </Table.Header>

        <Table.Body
          data={evaluations}
          render={(item: WeeklyEvaluation) => (
            <Table.Row key={item.id}>
              {/* Intern Info */}
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">
                  {item.intern?.fullName || "Chưa xác định"}
                </span>
                <span className="text-xs text-muted">
                  {item.intern?.user?.email || ""}
                </span>
              </div>

              {/* Week */}
              <div className="font-medium text-foreground">Tuần {item.week}</div>

              {/* Breakdown Scores */}
              <div className="text-sm">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                    Giao tiếp: <strong className="text-primary-light">{item.communication}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                    Thái độ: <strong className="text-primary-light">{item.attitude}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                    Tự học: <strong className="text-primary-light">{item.learning}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                    Coding: <strong className="text-primary-light">{item.coding}</strong>
                  </span>
                </div>
              </div>

              {/* Total Score */}
              <div className="font-bold text-base text-emerald-400">
                {item.totalScore.toFixed(1)} / 10
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
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Table.Row>
          )}
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
    </div>
  );
}
