"use client";

import { Search } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import FilterSelect from "@/components/ui/FilterSelect";
import MetalCard from "@/components/ui/MetalCard";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Draft/Inactive" },
];

export default function PolicyFilter() {
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Search Title
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search policy title..."
              defaultValue={searchParams.get("title") ?? ""}
              onChange={(e) => updateParam("title", e.target.value)}
              className="w-full rounded-2xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
            />
          </div>
        </div>

        <FilterSelect
          label="Status"
          filterField="isActive"
          options={STATUS_OPTIONS}
        />
      </div>
    </MetalCard>
  );
}
