"use client";

import { useMemo } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import FilterSelect from "@/components/ui/FilterSelect";
import MetalCard from "@/components/ui/MetalCard";
import { useDepartments } from "@/hooks/department/useDepartments";

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

  const { data: deptData } = useDepartments();
  const departments = useMemo(() => deptData?.data ?? [], [deptData]);

  const positionOptions = useMemo(() => {
    const seen = new Set<string>();
    const result: { value: string; label: string }[] = [];
    for (const dept of departments) {
      for (const pos of dept.positions ?? []) {
        if (!seen.has(pos.id)) {
          seen.add(pos.id);
          result.push({ value: pos.id, label: pos.name });
        }
      }
    }
    return result;
  }, [departments]);

  const departmentOptions = useMemo(
    () => departments.map((d) => ({ value: d.id, label: d.name })),
    [departments],
  );

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
            <input
              type="text"
              placeholder="Search name or email..."
              defaultValue={searchParams.get("email") ?? ""}
              onChange={(e) => updateParam("email", e.target.value)}
              className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
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
        <FilterSelect
          label="Department"
          filterField="departmentId"
          options={departmentOptions}
        />

        {/* Position */}
        <FilterSelect
          label="Position"
          filterField="positionId"
          options={positionOptions}
        />
      </div>
    </MetalCard>
  );
}
