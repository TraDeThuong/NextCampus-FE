"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import FilterSelect from "@/components/ui/FilterSelect";
import SortSelect from "@/components/ui/SortSelect";
import MetalCard from "@/components/ui/MetalCard";

export default function LeaderTaskFilters() {
  const t = useTranslations("leader.tasks");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const STATUS_OPTIONS = [
    { value: "TODO", label: t("statusTodo") },
    { value: "IN_PROGRESS", label: t("statusInProgress") },
    { value: "REVIEW", label: t("statusReview") },
    { value: "DONE", label: t("statusDone") },
    { value: "BLOCKED", label: t("statusBlocked") },
    { value: "PENDING_APPROVAL", label: t("statusPendingApproval") },
  ];

  const SORT_OPTIONS = [
    { sortBy: "createdAt", order: "desc", label: t("sortNewestFirst") },
    { sortBy: "createdAt", order: "asc", label: t("sortOldestFirst") },
    { sortBy: "title", order: "asc", label: t("sortTitleAZ") },
    { sortBy: "title", order: "desc", label: t("sortTitleZA") },
    { sortBy: "deadline", order: "asc", label: t("sortDeadlineEarliest") },
    { sortBy: "deadline", order: "desc", label: t("sortDeadlineLatest") },
    { sortBy: "priority", order: "desc", label: t("sortPriorityHighLow") },
    { sortBy: "priority", order: "asc", label: t("sortPriorityLowHigh") },
  ];

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) { params.delete(key); } else { params.set(key, value); }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <MetalCard className="px-6 py-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">{t("searchCode")}</label>
          <input type="text" placeholder={t("searchCodePlaceholder")} defaultValue={searchParams.get("code") ?? ""} onChange={(e) => updateParam("code", e.target.value)} className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted" />
        </div>

        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">{t("searchTitle")}</label>
          <input type="text" placeholder={t("searchTitlePlaceholder")} defaultValue={searchParams.get("title") ?? ""} onChange={(e) => updateParam("title", e.target.value)} className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted" />
        </div>

        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">{t("searchOwner")}</label>
          <input type="text" placeholder={t("searchOwnerPlaceholder")} defaultValue={searchParams.get("owner") ?? ""} onChange={(e) => updateParam("owner", e.target.value)} className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted" />
        </div>

        <FilterSelect label={t("status")} filterField="status" options={STATUS_OPTIONS} />

        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">{t("searchPhase")}</label>
          <input type="text" placeholder={t("searchPhasePlaceholder")} defaultValue={searchParams.get("phase") ?? ""} onChange={(e) => updateParam("phase", e.target.value)} className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted" />
        </div>

        <SortSelect label={t("sort")} options={SORT_OPTIONS} />

        <div className="flex flex-col gap-3 xl:col-span-6">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">{t("deadline")}</label>
          <div className="flex items-center gap-2">
            <input type="date" defaultValue={searchParams.get("deadlineFrom") ?? ""} onChange={(e) => updateParam("deadlineFrom", e.target.value)} className="w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)]" />
            <span className="shrink-0 text-sm text-muted">-</span>
            <input type="date" defaultValue={searchParams.get("deadlineTo") ?? ""} onChange={(e) => updateParam("deadlineTo", e.target.value)} className="w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)]" />
          </div>
        </div>
      </div>
    </MetalCard>
  );
}
