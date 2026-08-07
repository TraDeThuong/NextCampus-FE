"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import FilterSelect from "@/components/ui/FilterSelect";
import MetalCard from "@/components/ui/MetalCard";

const ACTION_OPTIONS = [
  { value: "LOGIN", label: "Đăng nhập (Login)" },
  { value: "CREATE_USER", label: "Tạo người dùng" },
  { value: "UPDATE_USER", label: "Cập nhật người dùng" },
  { value: "DELETE_USER", label: "Xóa người dùng" },
  { value: "CREATE_TASK", label: "Tạo nhiệm vụ" },
  { value: "UPDATE_TASK", label: "Cập nhật nhiệm vụ" },
  { value: "DELETE_TASK", label: "Xóa nhiệm vụ" },
  { value: "ASSIGN_TASK", label: "Giao nhiệm vụ" },
  { value: "CREATE_SUBMISSION", label: "Nộp bài" },
  { value: "REVIEW_SUBMISSION", label: "Đánh giá bài nộp" },
  { value: "CREATE_DAILY_REPORT", label: "Tạo báo cáo ngày" },
  { value: "CREATE_EVALUATION", label: "Tạo đánh giá tuần" },
  { value: "SUBMIT_APPLICATION", label: "Nộp đơn ứng tuyển" },
];

export default function ActivityLogFilter() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  function updateDateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) { params.set(key, value); } else { params.delete(key); }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  const ORDER_OPTIONS = [
    { value: "desc", label: t("admin.activityLogs.newestFirst") },
    { value: "asc", label: t("admin.activityLogs.oldestFirst") },
  ];

  return (
    <MetalCard className="px-6 py-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            {t("admin.activityLogs.filterTime")}
          </label>
          <div className="flex items-center gap-2">
            <input type="date" value={searchParams.get("createdFrom") ?? ""} onChange={(e) => updateDateParam("createdFrom", e.target.value)} className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)]" />
            <span className="shrink-0 text-xs text-muted">-</span>
            <input type="date" value={searchParams.get("createdTo") ?? ""} onChange={(e) => updateDateParam("createdTo", e.target.value)} className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)]" />
          </div>
        </div>

        <FilterSelect label={t("admin.activityLogs.filterAction")} filterField="action" options={ACTION_OPTIONS} />
        <FilterSelect label={t("admin.activityLogs.filterOrder")} filterField="order" options={ORDER_OPTIONS} />
      </div>
    </MetalCard>
  );
}
