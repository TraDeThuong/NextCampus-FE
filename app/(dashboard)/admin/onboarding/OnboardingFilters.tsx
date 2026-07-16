"use client";

import { Search } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import FilterSelect from "@/components/ui/FilterSelect";
import MetalCard from "@/components/ui/MetalCard";

const INVITE_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "USED", label: "Used" },
  { value: "EXPIRED", label: "Expired" },
  { value: "REVOKED", label: "Revoked" },
];

const APPLICATION_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function OnboardingFilters() {
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {/* Email search */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Search
          </label>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="text"
              placeholder="Search email..."
              defaultValue={searchParams.get("email") ?? ""}
              onChange={(e) => updateParam("email", e.target.value)}
              className="w-full rounded-2xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
            />
          </div>
        </div>

        {/* Invite status */}
        <FilterSelect
          label="Invite Status"
          filterField="inviteStatus"
          options={INVITE_STATUS_OPTIONS}
        />

        {/* Application status */}
        <FilterSelect
          label="Application Status"
          filterField="applicationStatus"
          options={APPLICATION_STATUS_OPTIONS}
        />

        {/* Department */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Department
          </label>

          <input
            type="text"
            placeholder="Department..."
            defaultValue={searchParams.get("departmentId") ?? ""}
            onChange={(e) => updateParam("departmentId", e.target.value)}
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
          />
        </div>

        {/* Position */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Position
          </label>

          <input
            type="text"
            placeholder="Position..."
            defaultValue={searchParams.get("positionId") ?? ""}
            onChange={(e) => updateParam("positionId", e.target.value)}
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
          />
        </div>
      </div>
    </MetalCard>
  );
}
