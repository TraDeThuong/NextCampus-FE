"use client";

import { Search } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import FilterSelect from "@/components/ui/FilterSelect";
import MetalCard from "@/components/ui/MetalCard";

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "DONE", label: "Done" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
];

export default function LeaderTaskFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <MetalCard className="px-6 py-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Title */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search title..."
              defaultValue={searchParams.get("title") ?? ""}
              onChange={(e) => updateParam("title", e.target.value)}
              className="w-full rounded-2xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
            />
          </div>
        </div>

        {/* Priority */}
        <FilterSelect
          label="Priority"
          filterField="priority"
          options={PRIORITY_OPTIONS}
        />

        {/* Status */}
        <FilterSelect
          label="Status"
          filterField="status"
          options={STATUS_OPTIONS}
        />

        {/* Phase */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Phase
          </label>
          <input
            type="text"
            placeholder="Filter by phase..."
            defaultValue={searchParams.get("phase") ?? ""}
            onChange={(e) => updateParam("phase", e.target.value)}
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
          />
        </div>

        {/* Module */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Module
          </label>
          <input
            type="text"
            placeholder="Filter by module..."
            defaultValue={searchParams.get("module") ?? ""}
            onChange={(e) => updateParam("module", e.target.value)}
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
          />
        </div>

        {/* Deadline range */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Deadline
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              defaultValue={searchParams.get("deadlineFrom") ?? ""}
              onChange={(e) => updateParam("deadlineFrom", e.target.value)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)]"
            />
            <span className="shrink-0 text-sm text-muted">-</span>
            <input
              type="date"
              defaultValue={searchParams.get("deadlineTo") ?? ""}
              onChange={(e) => updateParam("deadlineTo", e.target.value)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-2.5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)]"
            />
          </div>
        </div>
      </div>
    </MetalCard>
  );
}
