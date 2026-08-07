"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import FilterSelect from "@/components/ui/FilterSelect";
import MetalCard from "@/components/ui/MetalCard";

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Active" },
    { value: "COMPLETED", label: "Completed" },
    { value: "DROPPED", label: "Dropped" },
];

export default function InternFilters() {
    const t = useTranslations();
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
                <div className="flex flex-col gap-3">
                    <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
                        {t("admin.interns.search")}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t("admin.interns.searchPlaceholder")}
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
                        {t("admin.interns.department")}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t("admin.interns.departmentPlaceholder")}
                            defaultValue={searchParams.get("department") ?? ""}
                            onChange={(e) =>
                                updateParam("department", e.target.value)
                            }
                            className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
                        {t("admin.interns.position")}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t("admin.interns.positionPlaceholder")}
                            defaultValue={searchParams.get("position") ?? ""}
                            onChange={(e) =>
                                updateParam("position", e.target.value)
                            }
                            className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
                        {t("admin.interns.leader")}
                    </label>
                    <input
                        type="text"
                        placeholder={t("admin.interns.leaderPlaceholder")}
                        defaultValue={searchParams.get("leader") ?? ""}
                        onChange={(e) =>
                            updateParam("leader", e.target.value)
                        }
                        className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-primary-light focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
                    />
                </div>

                <FilterSelect
                    label={t("admin.interns.filterStatus")}
                    filterField="status"
                    options={STATUS_OPTIONS}
                />
            </div>
        </MetalCard>
    );
}