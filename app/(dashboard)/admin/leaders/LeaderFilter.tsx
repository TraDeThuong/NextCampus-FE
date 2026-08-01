"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

import FilterSelect from "@/components/ui/FilterSelect";
import MetalCard from "@/components/ui/MetalCard";

const STATUS_OPTIONS = [
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
];

export default function LeaderFilter() {
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                            className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
                        Department
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search department..."
                            defaultValue={searchParams.get("department") ?? ""}
                            onChange={(e) =>
                                updateParam("department", e.target.value)
                            }
                            className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
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
