"use client";

import { useMemo, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import MetalCard from "@/components/ui/MetalCard";
import FilterSelect from "@/components/ui/FilterSelect";

export default function RolesFilter() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const typeOptions = useMemo(
    () => [
      { value: "system", label: t("admin.roles.filterSystem") },
      { value: "custom", label: t("admin.roles.filterCustom") },
    ],
    [t],
  );

  const hasFilters = Boolean(
    searchParams.get("search") || searchParams.get("type"),
  );

  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value.trim()) {
        params.delete("search");
      } else {
        params.set("search", value.trim());
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("type");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  return (
    <MetalCard className="px-6 py-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
        {/* Search Input */}
        <div className="sm:col-span-2 flex flex-col gap-3">
          <label className="metal-text metal-glow text-sm font-semibold uppercase tracking-[0.18em]">
            {t("admin.roles.search")}
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={t("admin.roles.searchPlaceholder")}
              defaultValue={searchParams.get("search") ?? ""}
              onChange={(e) => updateSearch(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card py-3 px-5 text-sm text-foreground shadow-glass backdrop-blur-xl outline-none transition-all duration-300 hover:border-border-strong focus:border-cyan-400 focus:shadow-[0_0_28px_rgba(21,174,245,0.18)] placeholder:text-muted"
            />
          </div>
        </div>

        {/* Role Type Filter */}
        <div className="flex flex-col gap-3">
          <FilterSelect
            label={t("admin.roles.filterRoleType")}
            filterField="type"
            options={typeOptions}
          />
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4 flex items-center justify-end border-t border-border/40 pt-3">
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted transition hover:bg-card hover:text-foreground active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t("admin.roles.clearFilters")}</span>
          </button>
        </div>
      )}
    </MetalCard>
  );
}
