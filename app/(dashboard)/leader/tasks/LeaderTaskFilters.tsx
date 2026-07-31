"use client";


import { useSearchParams, usePathname, useRouter } from "next/navigation";
import FilterSelect from "@/components/ui/FilterSelect";
import SortSelect from "@/components/ui/SortSelect";
import MetalCard from "@/components/ui/MetalCard";



const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "DONE", label: "Done" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
];

const SORT_OPTIONS = [
  { sortBy: "createdAt", order: "desc", label: "Newest First" },
  { sortBy: "createdAt", order: "asc", label: "Oldest First" },
  { sortBy: "title", order: "asc", label: "Title (A-Z)" },
  { sortBy: "title", order: "desc", label: "Title (Z-A)" },
  { sortBy: "deadline", order: "asc", label: "Deadline (Earliest)" },
  { sortBy: "deadline", order: "desc", label: "Deadline (Latest)" },
  { sortBy: "priority", order: "desc", label: "Priority (High-Low)" },
  { sortBy: "priority", order: "asc", label: "Priority (Low-High)" },
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
        {/* Code */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Code
          </label>
          <input
            type="text"
            placeholder="Search code..."
            defaultValue={searchParams.get("code") ?? ""}
            onChange={(e) => updateParam("code", e.target.value)}
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
          />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Title
          </label>
          <input
            type="text"
            placeholder="Search title..."
            defaultValue={searchParams.get("title") ?? ""}
            onChange={(e) => updateParam("title", e.target.value)}
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
          />
        </div>

        {/* Owner */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Owner
          </label>
          <input
            type="text"
            placeholder="Filter by owner..."
            defaultValue={searchParams.get("owner") ?? ""}
            onChange={(e) => updateParam("owner", e.target.value)}
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
          />
        </div>

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

        {/* Sort */}
        <SortSelect
          label="Sort"
          options={SORT_OPTIONS}
        />

        {/* Deadline range — full width on second row */}
        <div className="flex flex-col gap-3 xl:col-span-6">
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
