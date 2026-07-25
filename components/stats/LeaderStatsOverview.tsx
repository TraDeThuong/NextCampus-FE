"use client";

import { useState } from "react";
import Link from "next/link";
import { useLeaderStats } from "@/hooks/stats/useLeaderStats";
import StatsCard from "./StatsCard";
import Spinner from "../ui/Spinner";
import MetalCard from "../ui/MetalCard";
import TaskAssignmentModal from "./TaskAssignmentModal";
import Table from "../ui/Table";
import { AssignmentDetail } from "@/types/stats";
import {
  Users,
  CheckCircle2,
  FileCheck,
  Award,
  ExternalLink,
  Eye,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

export default function LeaderStatsOverview() {
  const { data: response, isLoading, isError, refetch } = useLeaderStats();

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    assignments: AssignmentDetail[];
  }>({
    isOpen: false,
    title: "",
    assignments: [],
  });

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
        <p className="font-semibold">Lỗi khi tải dữ liệu thống kê Leader. Vui lòng kiểm tra lại kết nối mạng.</p>
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
  const allAssignments = stats.recentAssignments ?? [];
  const rawOverdue = stats.overdueAssignments ?? [];
  const overdueAssignments = rawOverdue.filter((a) => a.isOverdue);
  const internProgress = stats.internProgress ?? [];

  const handleOpenStatusModal = (statusKey: string, statusTitle: string) => {
    const filtered = allAssignments.filter((a) => a.status === statusKey);
    setModalConfig({
      isOpen: true,
      title: `Chi Tiết Công Việc Nhóm - Trạng Thái: ${statusTitle}`,
      assignments: filtered,
    });
  };

  const handleOpenOverdueModal = () => {
    setModalConfig({
      isOpen: true,
      title: `Danh Sách Task Quá Hạn Của Nhóm (${overdueAssignments.length})`,
      assignments: overdueAssignments,
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Modal View Details */}
      <TaskAssignmentModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
        assignments={modalConfig.assignments}
      />

      {/* Header Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground metal-text">
            Leader Team Operations Center
          </h1>
          <p className="text-sm text-muted">
            Quản lý trực tiếp thực tập sinh, duyệt bài nộp & theo dõi tiến độ công việc nhóm
          </p>
        </div>
      </div>

      {/* Action-Oriented KPI Cards (Chỉ 4 chỉ số có giá trị hành động) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="TTS Đang Quản Lý"
          value={stats.interns.active}
          subtitle={`Tổng số: ${stats.interns.total} TTS`}
          icon={<Users className="h-6 w-6 text-primary-light" />}
          href="/leader/interns?status=ACTIVE"
          trend={{
            text: `${stats.interns.completed} hoàn thành`,
            positive: true,
          }}
        />

        <StatsCard
          title="Bài Nộp Chờ Duyệt"
          value={stats.submissions.pending}
          subtitle={`${stats.submissions.approved} bài đã duyệt`}
          icon={<FileCheck className="h-6 w-6 text-amber-400" />}
          href="/leader/review?status=PENDING"
          trend={{
            text: stats.submissions.pending > 0 ? "Cần duyệt ngay" : "Hoàn thành duyệt",
            positive: stats.submissions.pending === 0,
          }}
        />

        <StatsCard
          title="Task Quá Hạn Trong Team"
          value={overdueAssignments.length}
          subtitle="Các task trễ deadline"
          icon={<ShieldAlert className="h-6 w-6 text-rose-400" />}
          onCardClick={handleOpenOverdueModal}
          trend={{
            text: overdueAssignments.length > 0 ? "Cần nhắc nhở TTS" : "Đúng tiến độ",
            positive: overdueAssignments.length === 0,
          }}
        />

        <StatsCard
          title="Điểm Đánh Giá TB Nhóm"
          value={`${stats.weeklyEvaluations.avgScore}/10`}
          subtitle={`${stats.weeklyEvaluations.total} lượt chấm điểm`}
          icon={<Award className="h-6 w-6 text-emerald-400" />}
          href="/leader/weekly-evaluation"
          trend={{
            text: "Điểm trung bình nhóm",
            positive: stats.weeklyEvaluations.avgScore >= 7,
          }}
        />
      </div>

      {/* Action Items Required List */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Action Item 1: Pending Submissions */}
        <Link
          href="/leader/review?status=PENDING"
          className="group relative overflow-hidden rounded-[24px] border border-amber-500/30 bg-amber-500/10 p-5 hover:border-amber-500/60 hover:bg-amber-500/15 transition-all shadow-glass"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center justify-center text-[11px] font-bold uppercase tracking-wider leading-none text-amber-400 bg-amber-500/20 px-2.5 py-1.5 rounded-full border border-amber-500/30">
                Cần xử lý ngay
              </span>
              <h3 className="text-2xl font-black text-amber-300 mt-2">
                {stats.submissions.pending} Bài Nộp Chờ Duyệt
              </h3>
              <p className="text-xs text-muted mt-1">
                Bài nộp từ thực tập sinh đang chờ Leader chấm điểm & đưa nhận xét
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 group-hover:scale-110 transition-transform">
              <FileCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:underline">
            Đến trang chấm bài <ExternalLink className="h-3.5 w-3.5" />
          </div>
        </Link>

        {/* Action Item 2: Overdue Tasks Alert */}
        <button
          type="button"
          onClick={handleOpenOverdueModal}
          className="group text-left relative overflow-hidden rounded-[24px] border border-rose-500/30 bg-rose-500/10 p-5 hover:border-rose-500/60 hover:bg-rose-500/15 transition-all shadow-glass cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center justify-center text-[11px] font-bold uppercase tracking-wider leading-none text-rose-400 bg-rose-500/20 px-2.5 py-1.5 rounded-full border border-rose-500/30">
                Cảnh báo tiến độ
              </span>
              <h3 className="text-2xl font-black text-rose-300 mt-2">
                {overdueAssignments.length} Task Quá Hạn
              </h3>
              <p className="text-xs text-muted mt-1">
                Các nhiệm vụ giao cho TTS đã vượt hạn chót chưa hoàn thành
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-300 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-rose-400 group-hover:underline">
            Xem danh sách task trễ ↗
          </div>
        </button>

        {/* Action Item 3: Weekly Evaluation Action */}
        <Link
          href="/leader/weekly-evaluation"
          className="group relative overflow-hidden rounded-[24px] border border-indigo-500/30 bg-indigo-500/10 p-5 hover:border-indigo-500/60 hover:bg-indigo-500/15 transition-all shadow-glass"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center justify-center text-[11px] font-bold uppercase tracking-wider leading-none text-indigo-400 bg-indigo-500/20 px-2.5 py-1.5 rounded-full border border-indigo-500/30">
                Đánh giá định kỳ
              </span>
              <h3 className="text-2xl font-black text-indigo-300 mt-2">
                Chấm Điểm Đánh Giá Tuần
              </h3>
              <p className="text-xs text-muted mt-1">
                Điểm trung bình hiện tại của nhóm: <strong className="text-foreground">{stats.weeklyEvaluations.avgScore}/10</strong>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 group-hover:scale-110 transition-transform">
              <Award className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:underline">
            Đến trang đánh giá <ExternalLink className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

      {/* Intern Progress Table in Team */}
      <MetalCard className="p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary-light shrink-0" />
              <span className="metal-text">Tiến Độ Chi Tiết Thực Tập Sinh Trong Nhóm</span>
            </h3>
            <p className="text-xs text-muted mt-1">
              Giám sát tiến độ hoàn thành công việc và điểm số trung bình của từng cá nhân
            </p>
          </div>
          <Link
            href="/leader/interns"
            className="text-xs font-semibold text-primary-light hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary-light/30 bg-primary-light/10"
          >
            Quản Lý TTS <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-6">
          <Table columns="2.5fr 1.5fr 1.2fr 1.5fr">
            <Table.Header>
              <span>Thực Tập Sinh</span>
              <span>Tiến Độ Task</span>
              <span>Điểm TB</span>
              <span>Trạng Thái Tiến Độ</span>
            </Table.Header>

            <Table.Body
              data={internProgress}
              render={(intern) => {
                const total = intern.totalTasks || 1;
                const percent = Math.round((intern.completedTasks / total) * 100);

                return (
                  <Table.Row key={intern.internId}>
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        {intern.internName}
                      </p>
                      <p className="text-xs text-muted">{intern.internEmail}</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-foreground font-semibold">
                          {intern.completedTasks}/{intern.totalTasks} Task
                        </span>
                        <span className="text-muted">{percent}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-primary-light rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-extrabold text-foreground">
                        {intern.avgScore > 0 ? `${intern.avgScore}/10` : "Chưa chấm"}
                      </span>
                    </div>

                    <div>
                      {intern.healthStatus === "HEALTHY" && (
                        <span className="inline-flex items-center justify-center text-xs font-semibold leading-none text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
                          Đúng tiến độ
                        </span>
                      )}

                      {intern.healthStatus === "WARNING" && (
                        <span className="inline-flex items-center justify-center text-xs font-semibold leading-none text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                          Cần chú ý ({intern.overdueCount} task trễ)
                        </span>
                      )}

                      {intern.healthStatus === "DANGER" && (
                        <span className="inline-flex items-center justify-center text-xs font-semibold leading-none text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1.5 rounded-lg">
                          Nguy cơ chậm ({intern.overdueCount} task trễ)
                        </span>
                      )}
                    </div>
                  </Table.Row>
                );
              }}
            />
          </Table>
        </div>
      </MetalCard>

      {/* Task Status Clickable Breakdown */}
      <MetalCard className="p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary-light" />
            Phân Bổ Trạng Thái Nhiệm Vụ Nhóm
          </h3>
          <span className="text-xs text-muted">Bấm vào từng dòng để xem danh sách Task</span>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <button
            type="button"
            onClick={() => handleOpenStatusModal("PENDING_APPROVAL", "Chờ Phê Duyệt")}
            className="p-3 rounded-xl border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 transition-all cursor-pointer"
          >
            <p className="text-xs text-purple-400 font-medium">Chờ duyệt</p>
            <p className="text-xl font-bold text-purple-300 mt-1">
              {stats.assignments.byStatus.pendingApproval}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenStatusModal("TODO", "Cần Làm")}
            className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
          >
            <p className="text-xs text-muted font-medium">Cần làm</p>
            <p className="text-xl font-bold text-foreground mt-1">
              {stats.assignments.byStatus.todo}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenStatusModal("IN_PROGRESS", "Đang Làm")}
            className="p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all cursor-pointer"
          >
            <p className="text-xs text-cyan-400 font-medium">Đang làm</p>
            <p className="text-xl font-bold text-cyan-300 mt-1">
              {stats.assignments.byStatus.inProgress}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenStatusModal("REVIEW", "Chờ Duyệt Bài")}
            className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <p className="text-xs text-amber-400 font-medium">Chờ duyệt</p>
            <p className="text-xl font-bold text-amber-300 mt-1">
              {stats.assignments.byStatus.review}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenStatusModal("DONE", "Hoàn Thành")}
            className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            <p className="text-xs text-emerald-400 font-medium">Hoàn thành</p>
            <p className="text-xl font-bold text-emerald-300 mt-1">
              {stats.assignments.byStatus.done}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenStatusModal("BLOCKED", "Bị Hoãn")}
            className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            <p className="text-xs text-rose-400 font-medium">Bị hoãn</p>
            <p className="text-xl font-bold text-rose-300 mt-1">
              {stats.assignments.byStatus.blocked}
            </p>
          </button>
        </div>
      </MetalCard>
    </div>
  );
}
