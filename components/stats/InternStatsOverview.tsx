"use client";

import Link from "next/link";
import { useInternStats } from "@/hooks/stats/useInternStats";
import StatsCard from "./StatsCard";
import Spinner from "../ui/Spinner";
import MetalCard from "../ui/MetalCard";
import Table from "../ui/Table";
import {
  ClipboardList,
  CheckCircle2,
  Calendar,
  Award,
  ExternalLink,
  Clock,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export default function InternStatsOverview() {
  const { data: response, isLoading, isError, refetch } = useInternStats();

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !response?.success) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/10 p-6 text-center text-danger space-y-3">
        <p className="font-semibold">Lỗi khi tải dữ liệu thống kê cá nhân. Vui lòng kiểm tra lại kết nối mạng.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-danger text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const stats = response.data;
  const todaysTasks = stats.todaysTasks ?? [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Greeting Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground metal-text">
            Xin chào, {stats.internName}! 👋
          </h1>
          <p className="text-sm text-muted">
            Chào mừng bạn quay trở lại • Theo dõi tiến độ nhiệm vụ và nộp báo cáo hàng ngày
          </p>
        </div>

        <Link
          href="/intern/daily-report"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-main to-primary-light text-white font-semibold shadow-soft hover:opacity-90 transition-all text-sm"
        >
          <Calendar className="h-4 w-4" />
          Nộp Báo Cáo Daily Hôm Nay
        </Link>
      </div>

      {/* Action-Oriented Personal KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Task Đang Làm"
          value={stats.tasksInProgress}
          subtitle={`Tổng số task: ${stats.totalTasks}`}
          icon={<ClipboardList className="h-6 w-6 text-cyan-400" />}
          href="/intern/task"
          trend={{
            text: `${stats.completionRate}% Hoàn thành`,
            positive: true,
          }}
        />

        <StatsCard
          title="Task Đã Hoàn Thành"
          value={stats.tasksCompleted}
          subtitle={`Đã hoàn thành ${stats.tasksCompleted}/${stats.totalTasks}`}
          icon={<CheckCircle2 className="h-6 w-6 text-emerald-400" />}
          href="/intern/task?status=DONE"
          trend={{
            text: "Cập nhật công việc",
            positive: true,
          }}
        />

        <StatsCard
          title="Báo Cáo Hôm Nay"
          value={stats.dailyReportTodaySubmitted ? "Đã Nộp" : "Chưa Nộp"}
          subtitle={stats.dailyReportTodaySubmitted ? "Đúng hạn" : "Cần nộp trước 18:00"}
          icon={<FileCheck className="h-6 w-6 text-amber-400" />}
          href="/intern/daily-report"
          trend={{
            text: stats.dailyReportTodaySubmitted ? "Hoàn thành" : "Nộp ngay",
            positive: stats.dailyReportTodaySubmitted,
          }}
        />

        <StatsCard
          title="Điểm Đánh Giá Tuần"
          value={stats.lastWeekScore ? `${stats.lastWeekScore}/10` : `${stats.avgScore}/10`}
          subtitle={`Trung bình: ${stats.avgScore}/10`}
          icon={<Award className="h-6 w-6 text-indigo-400" />}
          href="/intern/weekly-evaluation"
          trend={{
            text: "Kết quả chấm điểm",
            positive: stats.avgScore >= 7,
          }}
        />
      </div>

      {/* Action Items List & Overall Task Completion Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today's Required Actions */}
        <MetalCard className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              Nhiệm Vụ & Việc Cần Làm
            </h3>
            <Link
              href="/intern/task"
              className="text-xs font-medium text-primary-light hover:underline flex items-center gap-1"
            >
              Xem tất cả Task <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {/* Action Item 1: Daily Report */}
            <div
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                stats.dailyReportTodaySubmitted
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-amber-500/30 bg-amber-500/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    stats.dailyReportTodaySubmitted
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Báo Cáo Hàng Ngày (Daily Report)
                  </p>
                  <p className="text-xs text-muted">
                    {stats.dailyReportTodaySubmitted
                      ? "Bạn đã hoàn thành nộp báo cáo daily cho ngày hôm nay."
                      : "Vui lòng cập nhật các công việc đã làm trong ngày hôm nay."}
                  </p>
                </div>
              </div>

              {!stats.dailyReportTodaySubmitted && (
                <Link
                  href="/intern/daily-report"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shrink-0"
                >
                  Nộp ngay
                </Link>
              )}
            </div>

            {/* Task List Table */}
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Danh sách Task phân công gần đây
              </p>
              <Table columns="2.5fr 1fr 1.5fr">
                <Table.Header>
                  <span>Tên Nhiệm Vụ</span>
                  <span>Ưu Tiên</span>
                  <span>Trạng Thái / Hạn Chót</span>
                </Table.Header>

                <Table.Body
                  data={todaysTasks.slice(0, 5)}
                  render={(task) => (
                    <Table.Row key={task.id}>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {task.taskTitle}
                        </p>
                        <p className="text-xs text-muted">Leader: {task.leaderName}</p>
                      </div>

                      <div>
                        <span
                          className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                            task.taskPriority === "HIGH"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : task.taskPriority === "MEDIUM"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {task.taskPriority}
                        </span>
                      </div>

                      <div>
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${
                            task.status === "DONE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : task.status === "IN_PROGRESS"
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              : "bg-slate-500/10 text-slate-300 border border-slate-500/20"
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </Table.Row>
                  )}
                />
              </Table>
            </div>
          </div>
        </MetalCard>

        {/* Task Completion Progress Side Card */}
        <MetalCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Tiến Độ Thực Tập
              </h3>
            </div>

            <div className="mt-6 text-center space-y-4">
              <div className="inline-flex h-32 w-32 items-center justify-center rounded-full border-4 border-primary-light/30 bg-primary-light/5 p-4 shadow-glass">
                <div>
                  <span className="text-3xl font-extrabold text-foreground metal-text">
                    {stats.completionRate}%
                  </span>
                  <span className="block text-[10px] text-muted uppercase font-semibold">
                    Hoàn thành
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted">
                Bạn đã hoàn thành <strong className="text-foreground">{stats.tasksCompleted}</strong> trên tổng số <strong className="text-foreground">{stats.totalTasks}</strong> nhiệm vụ được giao.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6">
            <Link
              href="/intern/task"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 text-foreground font-semibold text-sm hover:bg-white/10 transition-all"
            >
              Xem Chi Tiết Task <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </MetalCard>
      </div>
    </div>
  );
}
