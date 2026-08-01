"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import MetalCard from "@/components/ui/MetalCard";

export default function DepartmentFilter() {
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
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <MetalCard className="px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-3">
                    <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
                        Search Department
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by department name..."
                            defaultValue={searchParams.get("name") ?? ""}
                            onChange={(e) => updateParam("name", e.target.value)}
                            className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
                        Search Leader
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by leader name or email..."
                            defaultValue={searchParams.get("leader") ?? ""}
                            onChange={(e) => updateParam("leader", e.target.value)}
                            className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
                        />
                    </div>
                </div>
            </div>
        </MetalCard>
    );
}
