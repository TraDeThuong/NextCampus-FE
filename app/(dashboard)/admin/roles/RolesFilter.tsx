"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import MetalCard from "@/components/ui/MetalCard";

export default function RolesFilter() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentType = searchParams.get("type") ?? "all";

  return (
    <MetalCard className="px-6 py-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Search Input */}
        <div className="sm:col-span-2 flex flex-col gap-2">
          <label className="metal-text metal-glow text-xs font-semibold uppercase tracking-[0.18em]">
            {t("admin.roles.searchPlaceholder")}
          </label>
          <input
            type="text"
            placeholder={t("admin.roles.searchPlaceholder")}
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => updateParam("search", e.target.value)}
            className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-cyan-400 focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
          />
        </div>

        {/* Role Type Filter */}
        <div className="flex flex-col gap-2">
          <label className="metal-text metal-glow text-xs font-semibold uppercase tracking-[0.18em]">
            {t("admin.roles.table.roleType")}
          </label>
          <select
            value={currentType}
            onChange={(e) => updateParam("type", e.target.value)}
            className="w-full rounded-2xl border border-border bg-card py-3 px-4 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-cyan-400 focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] cursor-pointer"
          >
            <option value="all">{t("admin.roles.filterAll")}</option>
            <option value="system">{t("admin.roles.filterSystem")}</option>
            <option value="custom">{t("admin.roles.filterCustom")}</option>
          </select>
        </div>
      </div>
    </MetalCard>
  );
}
