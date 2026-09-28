"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  CalendarRange,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarDays,
  Sun,
  Sunset,
  GraduationCap,
  Stethoscope,
  Building,
  User,
  HelpCircle,
  FileCheck,
  ExternalLink,
  RotateCcw,
  RotateCw,
  Ban,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import MetalCard from "@/components/ui/MetalCard";
import Modal from "@/components/ui/Modal";
import FilterSelect from "@/components/ui/FilterSelect";
import { useAbsences } from "@/hooks/absence/useAbsences";
import { useCancelAbsence } from "@/hooks/absence/useCancelAbsence";
import CreateAbsenceModal from "./CreateAbsenceModal";
import type { Absence, AbsenceStatus, AbsenceDuration, AbsenceReasonType } from "@/types/absence";

const COLUMNS =
  "minmax(170px, 1.6fr) minmax(110px, 1fr) minmax(130px, 1.2fr) minmax(200px, 2fr) minmax(120px, 1fr) minmax(110px, 1fr) minmax(140px, 1.3fr) minmax(90px, 0.9fr)";

export default function InternAbsencesContent() {
  const t = useTranslations("absences");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // URL-first filters
  const searchQuery = searchParams.get("search") ?? "";
  const statusParam = searchParams.get("status");
  const statusFilter = statusParam && statusParam !== "ALL" ? (statusParam as AbsenceStatus) : undefined;
  const page = Number(searchParams.get("page") || 1);
  const limit = 10;

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Absence | null>(null);

  // Queries & Mutations
  const { data: response, isLoading, isFetching, refetch } = useAbsences({
    status: statusFilter,
    search: searchQuery.trim() || undefined,
    page,
    limit,
    sortBy: "createdAt",
    order: "desc",
  });

  const cancelMutation = useCancelAbsence();

  const absences = useMemo(() => response?.data || [], [response?.data]);
  const meta = response?.meta;

  const hasFilters = Boolean(searchParams.get("search") || searchParams.get("status"));

  const handleSearchChange = (val: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (val.trim()) {
      nextParams.set("search", val);
    } else {
      nextParams.delete("search");
    }
    nextParams.set("page", "1");
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleResetFilters = () => {
    router.push(pathname);
  };

  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("page", String(newPage));
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  // Thống kê KPI
  const stats = useMemo(() => {
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let approvedDays = 0;

    absences.forEach((a) => {
      if (a.status === "PENDING") pendingCount++;
      if (a.status === "APPROVED") {
        approvedCount++;
        try {
          const s = new Date(a.startDate).getTime();
          const e = new Date(a.endDate).getTime();
          const d = Math.max(1, Math.ceil((e - s) / (1000 * 3600 * 24)) + 1);
          if (a.durationUnit === "MORNING" || a.durationUnit === "AFTERNOON") {
            approvedDays += 0.5;
          } else {
            approvedDays += d;
          }
        } catch {
          approvedDays += 1;
        }
      }
      if (a.status === "REJECTED") rejectedCount++;
    });

    return {
      total: meta?.total ?? absences.length,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      approvedDays,
    };
  }, [absences, meta]);

  // Xử lý hủy đơn
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;

    try {
      await cancelMutation.mutateAsync(cancelTarget.id);
      toast.success(t("toast.cancelSuccess"));
      setCancelTarget(null);
      refetch();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t("toast.cancelError");
      toast.error(errorMsg);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const renderDurationBadge = (duration: AbsenceDuration) => {
    switch (duration) {
      case "MORNING":
        return (
          <Badge variant="warning" size="sm">
            <Sun className="h-3 w-3 shrink-0" />
            {t("duration.morningShort")}
          </Badge>
        );
      case "AFTERNOON":
        return (
          <Badge variant="purple" size="sm">
            <Sunset className="h-3 w-3 shrink-0" />
            {t("duration.afternoonShort")}
          </Badge>
        );
      case "FULL_DAY":
        return (
          <Badge variant="primary" size="sm">
            <CalendarDays className="h-3 w-3 shrink-0" />
            {t("duration.fullDayShort")}
          </Badge>
        );
      case "MULTI_DAY":
        return (
          <Badge variant="info" size="sm">
            <CalendarRange className="h-3 w-3 shrink-0" />
            {t("duration.multiDayShort")}
          </Badge>
        );
    }
  };

  const renderReasonBadge = (type: AbsenceReasonType) => {
    switch (type) {
      case "EXAM":
        return (
          <Badge variant="purple" size="sm">
            <GraduationCap className="h-3 w-3 shrink-0" />
            {t("reasonType.exam")}
          </Badge>
        );
      case "SICKNESS":
        return (
          <Badge variant="danger" size="sm">
            <Stethoscope className="h-3 w-3 shrink-0" />
            {t("reasonType.sickness")}
          </Badge>
        );
      case "UNIVERSITY_EVENT":
        return (
          <Badge variant="info" size="sm">
            <Building className="h-3 w-3 shrink-0" />
            {t("reasonType.universityEvent")}
          </Badge>
        );
      case "PERSONAL":
        return (
          <Badge variant="warning" size="sm">
            <User className="h-3 w-3 shrink-0" />
            {t("reasonType.personal")}
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="sm">
            <HelpCircle className="h-3 w-3 shrink-0" />
            {t("reasonType.other")}
          </Badge>
        );
    }
  };

  const renderStatusBadge = (status: AbsenceStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="warning" size="sm" pulse>
            <Clock className="h-3 w-3 shrink-0" />
            {t("status.pending")}
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="success" size="sm">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            {t("status.approved")}
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="danger" size="sm">
            <XCircle className="h-3 w-3 shrink-0" />
            {t("status.rejected")}
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="default" size="sm">
            <Ban className="h-3 w-3 shrink-0" />
            {t("status.cancelled")}
          </Badge>
        );
    }
  };

  const statusOptions = [
    { value: "PENDING", label: t("status.pending") },
    { value: "APPROVED", label: t("status.approved") },
    { value: "REJECTED", label: t("status.rejected") },
    { value: "CANCELLED", label: t("status.cancelled") },
  ];

  const statCards = [
    {
      title: t("stats.total"),
      value: stats.total,
      subtitle: undefined,
      icon: CalendarRange,
      containerClass:
        "border-sky-300 bg-sky-100/80 text-sky-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-sky-500/25 dark:to-cyan-400/10 dark:text-cyan-300",
      accent: "from-sky-400/70",
    },
    {
      title: t("stats.pending"),
      value: stats.pending,
      subtitle: stats.pending > 0 ? t("stats.newRequest") : undefined,
      icon: Clock,
      containerClass:
        "border-amber-300 bg-amber-100/80 text-amber-800 dark:border-white/10 dark:bg-gradient-to-br dark:from-amber-500/25 dark:to-orange-400/10 dark:text-amber-300",
      accent: "from-amber-400/70",
    },
    {
      title: t("stats.approved"),
      value: stats.approved,
      subtitle: undefined,
      icon: CheckCircle2,
      containerClass:
        "border-emerald-300 bg-emerald-100/80 text-emerald-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-emerald-500/25 dark:to-teal-400/10 dark:text-emerald-300",
      accent: "from-emerald-400/70",
    },
    {
      title: t("stats.approvedDays"),
      value: stats.approvedDays,
      subtitle: t("stats.daysUnit"),
      icon: CalendarDays,
      containerClass:
        "border-purple-300 bg-purple-100/80 text-purple-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-purple-500/25 dark:to-indigo-400/10 dark:text-purple-300",
      accent: "from-purple-400/70",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Title & CTA (Rule 44 Compliant) */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-sm shadow-purple-500/10">
            <CalendarRange className="h-6 w-6 shrink-0" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {t("internTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5 max-w-xl">
              {t("internSubtitle")}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 shadow-md shadow-primary-main/20"
        >
          <Plus className="h-4 w-4" />
          <span>{t("createBtn")}</span>
        </Button>
      </div>

      {/* 2. KPI Stat Cards (Rule 50-51 & Micro-interactions) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <MetalCard key={card.title} className="group p-4 sm:p-5 lg:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.1em] sm:tracking-[0.2em] text-muted truncate">
                    {card.title}
                  </p>
                  <h3 className="chrome-text mt-2 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl font-bold leading-none">
                    {card.value}
                  </h3>
                  <div
                    className={`mt-3 sm:mt-4 h-[2px] w-10 sm:w-16 rounded-full bg-gradient-to-r ${card.accent} to-transparent`}
                  />
                  {card.subtitle && (
                    <p className="mt-2 text-xs text-muted truncate hidden sm:block">
                      {card.subtitle}
                    </p>
                  )}
                </div>
                <div
                  className={`
                    flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center
                    rounded-xl sm:rounded-2xl border ${card.containerClass}
                    shadow-sm dark:shadow-lg transition-all duration-500
                    group-hover:rotate-6 group-hover:scale-110
                  `}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                </div>
              </div>
            </MetalCard>
          );
        })}
      </div>

      {/* 3. Minimalist Filter Card (Rule 45 & Rule 60-63) */}
      <MetalCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
          {/* Search Input (No inner icon, px-5 py-3 uniform height) */}
          <div className="lg:col-span-8">
            <label className="text-xs sm:text-sm font-medium text-foreground/90 select-none flex items-center gap-1 mb-1.5">
              {t("filter.search")}
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("filter.searchPlaceholder")}
              className="h-[42px] sm:h-[46px] w-full rounded-xl border border-border bg-card dark:border-white/10 dark:bg-white/5 px-5 py-3 text-xs sm:text-sm text-foreground placeholder:text-muted transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          {/* Status Select */}
          <div className="lg:col-span-4">
            <FilterSelect
              label={t("filter.status")}
              filterField="status"
              options={statusOptions}
            />
          </div>
        </div>

        {/* Reset button: Only appears when filters are active */}
        {hasFilters && (
          <div className="flex justify-end border-t border-border/40 pt-3 mt-4">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 shrink-0" />
              <span>{t("filter.reset")}</span>
            </button>
          </div>
        )}
      </MetalCard>

      {/* 4. Table Bảng danh sách đơn (Rule 47, Rule 231-244: KHÔNG bọc MetalCard) */}
      <Table
        columns={COLUMNS}
        className="bg-card dark:bg-[linear-gradient(145deg,#101827_0%,#1a2235_20%,#0f172a_55%,#050816_100%)] shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,.45)] hover:shadow-md dark:hover:shadow-[0_20px_50px_rgba(21,174,245,.15)] transition-shadow duration-500"
      >
        <Table.Header>
          <div>{t("table.dateRange")}</div>
          <div>{t("table.duration")}</div>
          <div>{t("table.reasonType")}</div>
          <div>{t("table.reason")}</div>
          <div>{t("table.evidence")}</div>
          <div>{t("table.status")}</div>
          <div>{t("table.reviewedBy")}</div>
          <Table.ReloadButton
            onReload={refetch}
            isReloading={isFetching}
            title={t("reloadBtn")}
          />
        </Table.Header>

        <Table.Body
          data={absences}
          isLoading={isLoading}
          emptyMessage={t("table.empty")}
          emptyDescription={t("table.emptyDescription")}
          emptyAction={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {t("createBtn")}
            </Button>
          }
          render={(item) => (
            <Table.Row key={item.id}>
              {/* 1. Thời gian nghỉ */}
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground block">
                  {item.durationUnit === "MULTI_DAY"
                    ? `${formatDate(item.startDate)} → ${formatDate(item.endDate)}`
                    : formatDate(item.startDate)}
                </span>
                <span className="text-[10px] text-muted block">
                  {t("table.createdAtRow", { date: formatDate(item.createdAt) })}
                </span>
              </div>

              {/* 2. Loại thời gian */}
              <div>{renderDurationBadge(item.durationUnit)}</div>

              {/* 3. Phân loại lý do */}
              <div>{renderReasonBadge(item.reasonType)}</div>

              {/* 4. Chi tiết lý do */}
              <div className="pr-2">
                <p
                  className="text-xs text-foreground/90 line-clamp-2"
                  title={item.reason}
                >
                  {item.reason}
                </p>
              </div>

              {/* 5. Minh chứng */}
              <div>
                {item.evidenceUrl ? (
                  <a
                    href={item.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-main dark:text-cyan-400 hover:underline font-medium"
                  >
                    <FileCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>{t("table.viewEvidence")}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-[11px] text-muted italic">
                    {t("table.noEvidence")}
                  </span>
                )}
              </div>

              {/* 6. Trạng thái */}
              <div>{renderStatusBadge(item.status)}</div>

              {/* 7. Người duyệt & Phản hồi */}
              <div className="space-y-1">
                {item.reviewer ? (
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-foreground block">
                      {item.reviewer.fullName || "Leader"}
                    </span>
                    {item.reviewNote && (
                      <p
                        className="text-[11px] text-muted line-clamp-1 italic"
                        title={item.reviewNote}
                      >
                        &quot;{item.reviewNote}&quot;
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted">—</span>
                )}
              </div>

              {/* 8. Thao tác (Hủy đơn khi còn PENDING) */}
              <div className="flex items-center justify-end">
                {item.status === "PENDING" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelTarget(item)}
                    className="text-rose-500 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-500/40 text-[11px] px-2.5 py-1"
                  >
                    <Ban className="h-3 w-3 mr-1" />
                    {t("table.cancelBtn")}
                  </Button>
                ) : (
                  <span className="text-xs text-muted">—</span>
                )}
              </div>
            </Table.Row>
          )}
        />

        {/* Phân trang URL-first chuẩn (Rule 52-55) */}
        {meta && meta.totalPages > 1 && (
          <Table.Footer>
            <div className="flex items-center justify-between w-full">
              <span className="text-xs sm:text-sm text-muted">
                {t("pagination", {
                  page: meta.page,
                  totalPages: meta.totalPages,
                  total: meta.total,
                })}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="flex items-center justify-center h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                  className="flex items-center justify-center h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </Button>
              </div>
            </div>
          </Table.Footer>
        )}
      </Table>

      {/* Modal Tạo Đơn Xin Nghỉ Phép */}
      <CreateAbsenceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Modal Xác Nhận Hủy Đơn */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        size="sm"
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-start gap-3 pb-3 border-b border-border dark:border-white/10 pr-10">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-500">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {t("modal.cancelConfirmTitle")}
              </h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {t("modal.cancelConfirmDesc")}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelTarget(null)}
              disabled={cancelMutation.isPending}
            >
              {t("modal.actions.cancel")}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending}
              className="flex items-center gap-1.5"
            >
              {cancelMutation.isPending ? (
                <>
                  <RotateCw className="h-3.5 w-3.5 animate-spin" />
                  <span>{t("modal.cancelling")}</span>
                </>
              ) : (
                <>
                  <Ban className="h-3.5 w-3.5" />
                  <span>{t("modal.actions.confirmCancel")}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
