"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  CalendarRange,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
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
  Ban,
  ShieldCheck,
  Eye,
  CheckSquare,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Table from "@/components/ui/Table";
import MetalCard from "@/components/ui/MetalCard";
import FilterSelect from "@/components/ui/FilterSelect";
import { useAbsences } from "@/hooks/absence/useAbsences";
import { useRBAC } from "@/hooks/rbac/useRBAC";
import ReviewAbsenceModal from "./ReviewAbsenceModal";
import type { Absence, AbsenceStatus, AbsenceDuration, AbsenceReasonType } from "@/types/absence";

const COLUMNS =
  "minmax(190px, 1.8fr) minmax(140px, 1.3fr) minmax(110px, 1fr) minmax(180px, 1.8fr) minmax(120px, 1.1fr) minmax(110px, 1fr) minmax(120px, 1fr) minmax(110px, 1fr)";

export default function LeaderAbsencesContent() {
  const t = useTranslations("absences");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { can } = useRBAC();
  const canReview = can("ABSENCE_REVIEW");

  // URL-first state
  const searchQuery = searchParams.get("search") ?? "";
  const statusParam = searchParams.get("status");
  const statusFilter = statusParam && statusParam !== "ALL" ? (statusParam as AbsenceStatus) : undefined;
  const page = Number(searchParams.get("page") || 1);
  const limit = 10;

  // Modal review state
  const [reviewTarget, setReviewTarget] = useState<Absence | null>(null);

  // Queries
  const { data: response, isLoading, isFetching, refetch } = useAbsences({
    status: statusFilter,
    search: searchQuery.trim() || undefined,
    page,
    limit,
    sortBy: "createdAt",
    order: "desc",
  });

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

  // KPI calculations
  const stats = useMemo(() => {
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    absences.forEach((a) => {
      if (a.status === "PENDING") pendingCount++;
      if (a.status === "APPROVED") approvedCount++;
      if (a.status === "REJECTED") rejectedCount++;
    });

    return {
      total: meta?.total ?? absences.length,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
    };
  }, [absences, meta]);

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
      subtitle: t("leaderTitle"),
      icon: CalendarRange,
      containerClass:
        "border-sky-300 bg-sky-100/80 text-sky-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-sky-500/25 dark:to-cyan-400/10 dark:text-cyan-300",
      accent: "from-sky-400/70",
    },
    {
      title: t("stats.pending"),
      value: stats.pending,
      subtitle: stats.pending > 0 ? t("stats.needAction") : undefined,
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
      title: t("stats.rejected"),
      value: stats.rejected,
      subtitle: undefined,
      icon: XCircle,
      containerClass:
        "border-rose-300 bg-rose-100/80 text-rose-700 dark:border-white/10 dark:bg-gradient-to-br dark:from-rose-500/25 dark:to-pink-400/10 dark:text-rose-300",
      accent: "from-rose-400/70",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Title (Rule 44 Compliant) */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-primary-main dark:text-cyan-400 shadow-sm shadow-cyan-500/10">
            <ShieldCheck className="h-6 w-6 shrink-0" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {t("leaderTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5 max-w-xl">
              {t("leaderSubtitle")}
            </p>
          </div>
        </div>

        {stats.pending > 0 && (
          <Badge variant="warning" size="md" pulse className="px-3 py-1 font-semibold">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{t("pendingBadge", { count: stats.pending })}</span>
          </Badge>
        )}
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
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium truncate hidden sm:block">
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
          <div>{t("table.internName")}</div>
          <div>{t("table.dateRange")}</div>
          <div>{t("table.duration")}</div>
          <div>{t("table.reason")}</div>
          <div>{t("table.evidence")}</div>
          <div>{t("table.status")}</div>
          <div>{t("table.conflict")}</div>
          <Table.ReloadButton
            onReload={refetch}
            isReloading={isFetching}
            title={t("reloadBtn")}
          />
        </Table.Header>

        <Table.Body
          data={absences}
          isLoading={isLoading}
          emptyMessage={t("table.emptyLeader")}
          emptyDescription={t("table.emptyDescriptionLeader")}
          render={(item) => {
            const hasConflict = item.conflictTasks && item.conflictTasks.length > 0;
            return (
              <Table.Row
                key={item.id}
                onClick={() => setReviewTarget(item)}
                className="cursor-pointer group"
              >
                {/* 1. Thực tập sinh */}
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="h-8 w-8 rounded-full bg-primary-main/15 border border-primary-main/30 flex items-center justify-center text-primary-main dark:text-cyan-400 font-bold text-xs shrink-0">
                    {item.user?.fullName
                      ? item.user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "TS"}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate block">
                      {item.user?.fullName || t("table.defaultInternName")}
                    </span>
                    <span className="text-[10px] text-muted truncate block">
                      {item.user?.intern?.internCode || item.user?.email || ""}
                    </span>
                  </div>
                </div>

                {/* 2. Thời gian nghỉ */}
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-foreground block">
                    {item.durationUnit === "MULTI_DAY"
                      ? `${formatDate(item.startDate)} → ${formatDate(item.endDate)}`
                      : formatDate(item.startDate)}
                  </span>
                  <span className="text-[10px] text-muted block">
                    {t("table.submittedAt", { date: formatDate(item.createdAt) })}
                  </span>
                </div>

                {/* 3. Loại thời gian */}
                <div>{renderDurationBadge(item.durationUnit)}</div>

                {/* 4. Lý do & Phân loại */}
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    {renderReasonBadge(item.reasonType)}
                  </div>
                  <p
                    className="text-xs text-foreground/90 line-clamp-1"
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
                      onClick={(e) => e.stopPropagation()}
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

                {/* 7. Xung đột Task */}
                <div>
                  {hasConflict ? (
                    <Badge variant="warning" size="sm" pulse>
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span>{t("table.conflictTasksCount", { count: item.conflictTasks!.length })}</span>
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      <span>{t("table.conflictSafe")}</span>
                    </span>
                  )}
                </div>

                {/* 8. Thao tác */}
                <div className="flex items-center justify-end">
                  <Button
                    variant={item.status === "PENDING" && canReview ? "primary" : "outline"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReviewTarget(item);
                    }}
                    className="text-[11px] px-2.5 py-1 flex items-center gap-1"
                  >
                    {item.status === "PENDING" && canReview ? (
                      <>
                        <CheckSquare className="h-3 w-3" />
                        <span>{t("table.reviewBtn")}</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3" />
                        <span>{t("table.detailBtn")}</span>
                      </>
                    )}
                  </Button>
                </div>
              </Table.Row>
            );
          }}
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

      {/* Modal Duyệt Đơn của Leader */}
      <ReviewAbsenceModal
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        absence={reviewTarget}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
