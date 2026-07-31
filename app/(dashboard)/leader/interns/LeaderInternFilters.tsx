"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { useDepartments } from "@/hooks/department/useDepartments";
import { usePositions } from "@/hooks/department/usePositions";
import FilterSelect from "@/components/ui/FilterSelect";
import MetalCard from "@/components/ui/MetalCard";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DROPPED", label: "Dropped" },
];

export default function LeaderInternFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { data: deptData } = useDepartments();
  const departments = deptData?.data ?? [];

  const selectedDeptId = searchParams.get("departmentId") ?? "";
  const { data: posData } = usePositions(selectedDeptId || undefined);
  const positions = posData?.data ?? [];

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    if (key === "departmentId") {
      params.delete("positionId");
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <MetalCard className="px-6 py-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Search by name */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search name or email..."
              defaultValue={searchParams.get("fullName") ?? ""}
              onChange={(e) =>
                updateParam("fullName", e.target.value)
              }
              className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted cursor-text"
            />
          </div>
        </div>

        {/* Department */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Department
          </label>
          <select
            value={selectedDeptId}
            onChange={(e) =>
              updateParam("departmentId", e.target.value)
            }
            className="appearance-none w-full rounded-2xl border border-border bg-card px-5 py-3 pr-12 text-sm font-medium text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong cursor-pointer"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option
                key={d.id}
                value={d.id}
                className="bg-primary-dark text-foreground"
              >
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Position (cascading) */}
        <div className="flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            Position
          </label>
          <select
            value={searchParams.get("positionId") ?? ""}
            onChange={(e) =>
              updateParam("positionId", e.target.value)
            }
            disabled={!selectedDeptId}
            className="appearance-none w-full rounded-2xl border border-border bg-card px-5 py-3 pr-12 text-sm font-medium text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong disabled:opacity-50 disabled:cursor-default cursor-pointer"
          >
            <option value="">
              {selectedDeptId
                ? "All Positions"
                : "Select department first"}
            </option>
            {positions.map((p) => (
              <option
                key={p.id}
                value={p.id}
                className="bg-primary-dark text-foreground"
              >
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <FilterSelect
          label="Status"
          filterField="status"
          options={STATUS_OPTIONS}
        />
      </div>
    </MetalCard>
  );
}
