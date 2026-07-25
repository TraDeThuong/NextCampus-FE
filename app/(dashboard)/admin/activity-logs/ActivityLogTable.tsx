"use client";

import { useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText,
  User,
  PlusCircle,
  Shield,
  Key,
  Edit,
  Trash2,
} from "lucide-react";

import { useActivityLogs } from "@/hooks/activity-log/useActivityLogs";
import type { ActivityLogQuery } from "@/types/activity-log";

import Table from "@/components/ui/Table";
import MetalCard from "@/components/ui/MetalCard";
import Spinner from "@/components/ui/Spinner";

const COLUMNS = "170px minmax(180px, 1fr) 220px 130px 2.5fr";

function getActionBadgeStyle(action: string) {
  if (action.startsWith("CREATE")) {
    return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  }
  if (action.startsWith("UPDATE")) {
    return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
  }
  if (action.startsWith("DELETE")) {
    return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  }
  if (action === "LOGIN") {
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  }
  if (action === "LOGOUT") {
    return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
  }
  return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
}

function getTargetTypeIcon(type: string | null) {
  const iconClass = "h-4 w-4 shrink-0";
  switch (type) {
    case "SUBMISSION":
      return <CheckCircle2 className={`${iconClass} text-emerald-400`} />;
    case "DAILY_REPORT":
      return <Calendar className={`${iconClass} text-cyan-400`} />;
    case "USER":
      return <User className={`${iconClass} text-indigo-400`} />;
    case "TASK":
      return <FileText className={`${iconClass} text-amber-400`} />;
    case "APPLICATION":
      return <PlusCircle className={`${iconClass} text-blue-400`} />;
    case "REGULATION":
      return <Shield className={`${iconClass} text-rose-400`} />;
    default:
      return <FileText className={`${iconClass} text-slate-400`} />;
  }
}

export default function ActivityLogTable() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const params: ActivityLogQuery = useMemo(() => {
    const p: ActivityLogQuery = {};

    const action = searchParams.get("action");
    const targetType = searchParams.get("targetType");
    const order = searchParams.get("order");
    const page = searchParams.get("page");

    if (action) p.action = action;
    if (targetType) p.targetType = targetType;
    if (order) p.order = order as "asc" | "desc";
    p.page = page ? Number(page) : 1;
    p.limit = 20;

    return p;
  }, [searchParams]);

  const { data, isPending, isError } = useActivityLogs(params);

  const logs = data?.data ?? [];
  const meta = data?.meta;

  function goToPage(page: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(page));
    router.push(`${pathname}?${p.toString()}`);
  }

  if (isPending) {
    return (
      <MetalCard className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </MetalCard>
    );
  }

  if (isError) {
    return (
      <MetalCard className="flex items-center justify-center gap-2 py-20">
        <AlertTriangle className="h-5 w-5 text-red-400" />
        <p className="text-sm text-slate-400">Không thể tải nhật ký hoạt động.</p>
      </MetalCard>
    );
  }

  if (logs.length === 0) {
    return (
      <MetalCard className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-sm text-slate-500">Không tìm thấy hoạt động nào.</p>
      </MetalCard>
    );
  }

  return (
    <Table
      columns={COLUMNS}
      className="
        bg-[linear-gradient(145deg,#101827_0%,#1a2235_20%,#0f172a_55%,#050816_100%)]
        shadow-[0_12px_40px_rgba(0,0,0,.45)]
        hover:shadow-[0_20px_50px_rgba(21,174,245,.15)]
        transition-shadow duration-500
      "
    >
      <Table.Header>
        <div>Thời gian</div>
        <div>Người thực hiện</div>
        <div>Hành động</div>
        <div>Đối tượng</div>
        <div>Mô tả</div>
      </Table.Header>

      <Table.Body
        data={logs}
        render={(log) => (
          <Table.Row key={log.id}>
            {/* Time */}
            <div className="text-xs text-slate-400 font-medium">
              {new Date(log.createdAt).toLocaleString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>

            {/* Actor */}
            <div className="flex flex-col gap-0.5 justify-center min-w-0 pr-2">
              <span className="text-xs font-bold text-foreground truncate">
                {log.user?.fullName || "Hệ thống"}
              </span>
              <span className="text-[10px] text-muted truncate">
                {log.user?.email || ""}
              </span>
            </div>

            {/* Action */}
            <div className="flex items-center">
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getActionBadgeStyle(log.action)}`}>
                {log.action}
              </span>
            </div>

            {/* Target Type */}
            <div className="flex items-center gap-2">
              {getTargetTypeIcon(log.targetType)}
              <span className="text-xs font-medium text-slate-300">
                {log.targetType || "-"}
              </span>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-300 pr-2 break-words leading-relaxed font-medium">
              {log.description}
            </div>
          </Table.Row>
        )}
      />

      {meta && meta.totalPages > 1 && (
        <Table.Footer>
          <div className="flex w-full items-center justify-between gap-4 text-sm">
            <p className="text-muted">
              Trang {meta.page} / {meta.totalPages} &middot; Tổng số {meta.total} bản ghi
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => goToPage(meta.page - 1)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => goToPage(meta.page + 1)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-muted transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Table.Footer>
      )}
    </Table>
  );
}
