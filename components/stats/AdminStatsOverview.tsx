"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminStats } from "@/hooks/stats/useAdminStats";
import StatsCard from "./StatsCard";
import Spinner from "../ui/Spinner";
import MetalCard from "../ui/MetalCard";
import TaskAssignmentModal from "./TaskAssignmentModal";
import Table from "../ui/Table";
import { AssignmentDetail } from "@/types/stats";
import {
  Users,
  FileText,
  CheckCircle2,
  AlertOctagon,
  ExternalLink,
  Ban,
  UserCheck,
  ShieldAlert,
  Eye,
  Clock,
  AlertTriangle,
  PlusCircle,
  Activity,
  ChevronDown,
  ChevronUp,
  Award,
  Calendar,
  Building2,
  TrendingUp,
} from "lucide-react";

export default function AdminStatsOverview() {
  const { data: response, isLoading, isError, refetch } = useAdminStats();

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    assignments: AssignmentDetail[];
  }>({
    isOpen: false,
    title: "",
    assignments: [],
  });

  const [showAllLeaders, setShowAllLeaders] = useState(false);

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
        <p className="font-semibold">Lỗi khi tải dữ liệu thống kê Admin. Vui lòng kiểm tra lại kết nối mạng.</p>
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
  const assignmentTotal = stats.assignments.total || 1;
  const systemCompletionRate = stats.systemCompletionRate ?? 0;

  const allAssignments = stats.recentAssignments ?? [];
  const rawOverdue = stats.overdueAssignments ?? [];
  const overdueAssignments = rawOverdue.filter((a) => a.isOverdue);
  const leaderTeams = stats.leaderTeams ?? [];
  const recentActivities = stats.recentActivities ?? [];

  const displayedLeaderTeams = showAllLeaders
    ? leaderTeams
    : leaderTeams.slice(0, 5);

  const handleOpenStatusModal = (statusKey: string, statusTitle: string) => {
    const filtered = allAssignments.filter((a) => a.status === statusKey);
    setModalConfig({
      isOpen: true,
      title: `Chi Tiết Nhiệm Vụ Toàn Hệ Thống - Trạng Thái: ${statusTitle}`,
      assignments: filtered,
    });
  };

  const handleOpenOverdueModal = () => {
    setModalConfig({
      isOpen: true,
      title: `Danh Sách Tất Cả Task Quá Hạn Toàn Hệ Thống (${overdueAssignments.length})`,
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

      {/* Header Banner + SaaS Quick Action Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-foreground metal-text">
              Admin Executive Control Center
            </h1>
            <span className="rounded-full border border-primary-light/30 bg-primary-light/10 px-3 py-0.5 text-xs font-semibold text-primary-light">
              System Admin
            </span>
          </div>
          <p className="text-sm text-muted mt-1">
            Quản trị cấp cao toàn hệ thống • Giám sát sức khỏe tổng thể, nhóm Leader & xử lý tác vụ nhanh
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/leaders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-main/20 border border-primary-main/40 text-primary-light text-xs font-semibold hover:bg-primary-main/30 transition-all shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            + Tạo Leader
          </Link>

          <Link
            href="/admin/onboarding?inviteStatus=USED&applicationStatus=PENDING"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-all shadow-sm"
          >
            <FileText className="h-4 w-4" />
            + Duyệt Đơn Ứng Tuyển 
          </Link>

          <Link
            href="/admin/department"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/30 transition-all shadow-sm"
          >
            <Building2 className="h-4 w-4" />
            + Phòng Ban
          </Link>
        </div>
      </div>

      {/* Level 1: Health & Performance KPI Cards (KPIs "Sống") */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="TTS Đang Thực Tập"
          value={stats.interns.active}
          subtitle={`Tỷ lệ giữ chân: ${Math.round((stats.interns.active / (stats.interns.total || 1)) * 100)}%`}
          icon={<Users className="h-6 w-6 text-primary-light" />}
          href="/admin/interns?status=ACTIVE"
          trend={{
            text: `${stats.interns.completed} đã hoàn thành`,
            positive: true,
          }}
        />

        <StatsCard
          title="Tỷ Lệ Hoàn Thành Task"
          value={`${systemCompletionRate}%`}
          subtitle={`${stats.assignments.byStatus.done}/${stats.assignments.total} task đã hoàn tất`}
          icon={<TrendingUp className="h-6 w-6 text-emerald-400" />}
          href="/admin/leaders"
          trend={{
            text: "Hiệu suất toàn hệ thống",
            positive: systemCompletionRate >= 70,
          }}
        />

        <StatsCard
          title="Đội Ngũ Leader"
          value={stats.system.leaders}
          subtitle={`Quản lý ${stats.system.departments} phòng ban`}
          icon={<UserCheck className="h-6 w-6 text-indigo-400" />}
          href="/admin/leaders"
          trend={{
            text: "Cấp quản trị nhóm",
            positive: true,
          }}
        />

        <StatsCard
          title="Đơn Ứng Tuyển Chờ Duyệt"
          value={stats.applications.pending}
          subtitle={`Trên tổng ${stats.applications.total} đơn ứng tuyển`}
          icon={<FileText className="h-6 w-6 text-amber-400" />}
          href="/admin/onboarding?inviteStatus=USED&applicationStatus=PENDING"
          trend={{
            text: stats.applications.pending > 0 ? "Cần duyệt ngay" : "Đã xử lý xong",
            positive: stats.applications.pending === 0,
          }}
        />
      </div>

      {/* Level 2: Executive Leader Team Performance Table (Top 5 + View All Toggle) */}
      <MetalCard className="p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-indigo-400 shrink-0" />
              <span className="metal-text">Hiệu Suất Tiến Độ Theo Từng Nhóm Leader</span>
            </h3>
            <p className="text-xs text-muted mt-1">
              Hiển thị danh sách nhóm Leader quản lý ({displayedLeaderTeams.length}/{leaderTeams.length} nhóm)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {leaderTeams.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllLeaders(!showAllLeaders)}
                className="text-xs font-semibold text-primary-light hover:underline flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 cursor-pointer"
              >
                {showAllLeaders ? (
                  <>
                    Thu gọn Top 5 <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Xem tất cả ({leaderTeams.length}) <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}

            <Link
              href="/admin/leaders"
              className="text-xs font-semibold text-primary-light hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary-light/30 bg-primary-light/10"
            >
              Quản Lý Leader <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <Table columns="2fr 1.2fr 1fr 2.5fr 1fr">
            <Table.Header>
              <span>Leader / Đội Nhóm</span>
              <span>Phòng Ban</span>
              <span>Quy Mô TTS</span>
              <span>Tiến Độ & % Hoàn Thành</span>
              <span>Rủi Ro Task</span>
            </Table.Header>

            <Table.Body
              data={displayedLeaderTeams}
              render={(team) => {
                const total = team.totalAssignments || 1;
                const percentDone = Math.round((team.assignments.done / total) * 100);

                return (
                  <Table.Row key={team.leaderId}>
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        {team.leaderName}
                      </p>
                      <p className="text-xs text-muted">{team.leaderEmail}</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                        {team.departmentName}
                      </span>
                    </div>

                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {team.totalInterns} TTS
                      </span>
                    </div>

                    {/* Progress Bar & Completion % */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-400">
                          {percentDone}% Done ({team.assignments.done}/{team.totalAssignments} Task)
                        </span>
                        <span className="text-muted text-[11px]">
                          {team.assignments.inProgress} đang làm • {team.assignments.review} chờ duyệt
                        </span>
                      </div>

                      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden flex">
                        <div
                          className="h-full bg-emerald-400"
                          style={{
                            width: `${(team.assignments.done / total) * 100}%`,
                          }}
                          title={`Done: ${team.assignments.done}`}
                        />
                        <div
                          className="h-full bg-cyan-400"
                          style={{
                            width: `${(team.assignments.inProgress / total) * 100}%`,
                          }}
                          title={`In Progress: ${team.assignments.inProgress}`}
                        />
                        <div
                          className="h-full bg-amber-400"
                          style={{
                            width: `${(team.assignments.review / total) * 100}%`,
                          }}
                          title={`Review: ${team.assignments.review}`}
                        />
                        <div
                          className="h-full bg-rose-400"
                          style={{
                            width: `${(team.assignments.blocked / total) * 100}%`,
                          }}
                          title={`Blocked: ${team.assignments.blocked}`}
                        />
                      </div>
                    </div>

                    <div>
                      {team.overdueCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                          ⚠ {team.overdueCount} task trễ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                          ✓ Đúng tiến độ
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

      {/* Level 3: Recent Activity Log & System Alerts (Grid 2 cột) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity Log (Nhật ký hoạt động gần đây) */}
        <MetalCard className="p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              Nhật Ký Hoạt Động Gần Đây (Recent Activity)
            </h3>
            <span className="text-xs text-muted">Tự động cập nhật</span>
          </div>

          <div className="mt-5 space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5 shrink-0">
                    {act.type === "SUBMISSION" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : act.type === "DAILY_REPORT" ? (
                      <Calendar className="h-4 w-4 text-cyan-400" />
                    ) : (
                      <FileText className="h-4 w-4 text-amber-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {act.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      {act.description}
                    </p>
                  </div>

                  <span className="text-[10px] text-muted shrink-0">
                    {new Date(act.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted text-center py-6">
                Chưa có hoạt động mới ghi nhận.
              </p>
            )}
          </div>
        </MetalCard>

        {/* System Action Alerts & Status Breakdown */}
        <MetalCard className="p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Mục Cần Xử Lý Ngay (Action Alerts)
            </h3>
          </div>

          <div className="mt-5 space-y-3.5">
            {/* Action Item 1: Applications Pending */}
            <Link
              href="/admin/onboarding?inviteStatus=USED&applicationStatus=PENDING"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-amber-300 transition-colors">
                    {stats.applications.pending} Đơn ứng tuyển chờ xử lý
                  </p>
                  <p className="text-[11px] text-muted">Cần duyệt hoặc từ chối ứng viên mới</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                Xử lý <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </Link>

            {/* Action Item 2: Overdue Tasks Alert */}
            <button
              type="button"
              onClick={handleOpenOverdueModal}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-rose-300 transition-colors">
                    {stats.tasks.overdue} Task quá hạn toàn công ty
                  </p>
                  <p className="text-[11px] text-muted">Bấm để soi danh sách ai bị quá hạn</p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                Chi tiết <Eye className="h-3.5 w-3.5" />
              </span>
            </button>

            {/* Action Item 3: Dropped Interns */}
            <Link
              href="/admin/interns?status=DROPPED"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <AlertOctagon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {stats.interns.dropped} Thực tập sinh đã huỷ / thôi học
                  </p>
                  <p className="text-[11px] text-muted">Danh sách thực tập sinh dừng chương trình</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted group-hover:text-foreground flex items-center gap-1">
                Xem <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </MetalCard>
      </div>
    </div>
  );
}
