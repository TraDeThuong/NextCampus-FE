"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import FilterSelect from "@/components/ui/FilterSelect";
import MetalCard from "@/components/ui/MetalCard";

const ACTION_OPTIONS = [
  { value: "LOGIN", label: "Login" },
  { value: "CREATE_USER", label: "Create User" },
  { value: "UPDATE_USER", label: "Update User" },
  { value: "DELETE_USER", label: "Delete User" },
  { value: "CREATE_TASK", label: "Create Task" },
  { value: "UPDATE_TASK", label: "Update Task" },
  { value: "DELETE_TASK", label: "Delete Task" },
  { value: "ASSIGN_TASK", label: "Assign Task" },
  { value: "CREATE_SUBMISSION", label: "Submit Work" },
  { value: "REVIEW_SUBMISSION", label: "Review Submission" },
  { value: "CREATE_DAILY_REPORT", label: "Create Daily Report" },
  { value: "CREATE_EVALUATION", label: "Create Weekly Evaluation" },
  { value: "SUBMIT_APPLICATION", label: "Submit Application" },
];

const ORDER_OPTIONS = [
  { value: "desc", label: "Newest First" },
  { value: "asc", label: "Oldest First" },
];

export default function ActivityLogFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  function updateDateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <MetalCard className="px-6 py-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Filter by date range */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Time Period
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={searchParams.get("createdFrom") ?? ""}
              onChange={(e) => updateDateParam("createdFrom", e.target.value)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)]"
            />
            <span className="shrink-0 text-xs text-muted">-</span>
            <input
              type="date"
              value={searchParams.get("createdTo") ?? ""}
              onChange={(e) => updateDateParam("createdTo", e.target.value)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)]"
            />
          </div>
        </div>

        {/* Filter by action */}
        <FilterSelect
          label="Action"
          filterField="action"
          options={ACTION_OPTIONS}
        />

        {/* Sort order */}
        <FilterSelect
          label="Sort By"
          filterField="order"
          options={ORDER_OPTIONS}
        />
      </div>
    </MetalCard>
  );
}
